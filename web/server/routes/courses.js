import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import * as courseService from '../services/courseService.js';
import * as statusService from '../services/statusService.js';
import * as promptBuilder from '../services/promptBuilder.js';
import * as docxService from '../services/docxService.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, and DOC files are allowed'));
    }
  }
});

// GET /api/courses — List all courses with status summary
router.get('/', async (req, res) => {
  try {
    const courses = await courseService.listCourses();

    const coursesWithStatus = courses.map(course => {
      const status = statusService.calculateCourseStatus(course);
      return {
        folder: course.folder,
        course_name: course.course_name,
        course_code: course.course_code,
        semester: course.semester,
        professor_name: course.professor_name,
        delivery_language: course.delivery_language,
        academic_level: course.academic_level,
        student_count: course.student_count,
        created_at: course.created_at,
        status: status
      };
    });

    res.json(coursesWithStatus);
  } catch (err) {
    console.error('Error listing courses:', err);
    res.status(500).json({ error: 'Failed to list courses' });
  }
});

// GET /api/courses/:folder — Get single course detail
router.get('/:folder', async (req, res) => {
  try {
    const course = await courseService.getCourse(req.params.folder);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const status = statusService.calculateCourseStatus(course);
    const files = statusService.getAllFiles(course.folderPath);

    res.json({
      folder: course.folder,
      ...course,
      status,
      files
    });
  } catch (err) {
    console.error('Error getting course:', err);
    res.status(500).json({ error: 'Failed to get course' });
  }
});

// POST /api/courses — Create new course
router.post('/', async (req, res) => {
  try {
    const courseData = req.body;

    // Validate required fields
    if (!courseData.course_name || !courseData.course_code || !courseData.semester) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await courseService.createCourse(courseData);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: err.message || 'Failed to create course' });
  }
});

// PUT /api/courses/:folder/config — Update course config
router.put('/:folder/config', async (req, res) => {
  try {
    const updates = req.body;
    const updated = await courseService.updateCourseConfig(req.params.folder, updates);
    res.json(updated);
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// GET /api/courses/:folder/files — List all files
router.get('/:folder/files', async (req, res) => {
  try {
    const course = await courseService.getCourse(req.params.folder);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const files = statusService.getAllFiles(course.folderPath);
    const filesWithIcons = files.map(f => ({
      ...f,
      icon: statusService.getFileIcon(f.type)
    }));

    res.json(filesWithIcons);
  } catch (err) {
    console.error('Error listing files:', err);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// GET /api/courses/:folder/prompt/:task — Get Claude prompt
router.get('/:folder/prompt/:task', async (req, res) => {
  try {
    const course = await courseService.getCourse(req.params.folder);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const prompt = promptBuilder.buildPrompt(course, req.params.task);

    res.json({
      task: req.params.task,
      title: prompt.title,
      prompt: prompt.prompt,
      clipboard: promptBuilder.buildClipboardText(prompt)
    });
  } catch (err) {
    console.error('Error building prompt:', err);
    res.status(500).json({ error: 'Failed to build prompt' });
  }
});

// POST /api/courses/:folder/upload-textbook — Upload textbook
router.post('/:folder/upload-textbook', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const course = await courseService.getCourse(req.params.folder);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const textbookDir = path.join(course.folderPath, 'textbook');
    if (!fs.existsSync(textbookDir)) {
      fs.mkdirSync(textbookDir, { recursive: true });
    }

    // Move file from uploads to textbook directory
    const targetPath = path.join(textbookDir, req.file.originalname);
    fs.copyFileSync(req.file.path, targetPath);
    fs.unlinkSync(req.file.path);

    // Update course config
    await courseService.updateCourseConfig(req.params.folder, {
      textbook_filename: req.file.originalname,
      textbook_path: `courses/${course.course_folder}/textbook/${req.file.originalname}`
    });

    res.json({
      success: true,
      filename: req.file.originalname,
      path: targetPath
    });
  } catch (err) {
    console.error('Error uploading textbook:', err);
    res.status(500).json({ error: 'Failed to upload textbook' });
  }
});

// GET /api/courses/:folder/download — Download file
router.get('/:folder/download', async (req, res) => {
  try {
    const { path: filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    const course = await courseService.getCourse(req.params.folder);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Sanitize path to prevent directory traversal
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
    const fullPath = path.join(course.folderPath, normalizedPath);

    // Verify the file is within the course directory
    if (!fullPath.startsWith(course.folderPath)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(fullPath);
  } catch (err) {
    console.error('Error downloading file:', err);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// POST /api/courses/:folder/upload-toc — Upload TOC file
router.post('/:folder/upload-toc', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const course = await courseService.getCourse(req.params.folder);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const textbookDir = path.join(course.folderPath, 'textbook');
    if (!fs.existsSync(textbookDir)) {
      fs.mkdirSync(textbookDir, { recursive: true });
    }

    // Save as toc.txt or toc.md
    const ext = path.extname(req.file.originalname).toLowerCase();
    const tocFilename = `toc${ext === '.txt' || ext === '.md' ? ext : '.txt'}`;
    const tocPath = path.join(textbookDir, tocFilename);
    fs.copyFileSync(req.file.path, tocPath);
    fs.unlinkSync(req.file.path);

    // Parse chapters from TOC
    const tocText = fs.readFileSync(tocPath, 'utf-8');
    const chapters = docxService.parseTOC(tocText);

    res.json({
      success: true,
      filename: tocFilename,
      chapters: chapters
    });
  } catch (err) {
    console.error('Error uploading TOC:', err);
    res.status(500).json({ error: 'Failed to upload TOC' });
  }
});

// GET /api/courses/:folder/toc — Get TOC content
router.get('/:folder/toc', async (req, res) => {
  try {
    const course = await courseService.getCourse(req.params.folder);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const tocTxt = path.join(course.folderPath, 'textbook', 'toc.txt');
    const tocMd = path.join(course.folderPath, 'textbook', 'toc.md');
    let tocPath = fs.existsSync(tocTxt) ? tocTxt : (fs.existsSync(tocMd) ? tocMd : null);

    if (!tocPath) {
      return res.json({ chapters: [] });
    }

    const tocText = fs.readFileSync(tocPath, 'utf-8');
    const chapters = docxService.parseTOC(tocText);

    res.json({ chapters, content: tocText });
  } catch (err) {
    console.error('Error reading TOC:', err);
    res.status(500).json({ error: 'Failed to read TOC' });
  }
});

// POST /api/courses/:folder/chapters/:key — Upload chapter file
router.post('/:folder/chapters/:key', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const course = await courseService.getCourse(req.params.folder);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const chapterDir = path.join(course.folderPath, 'textbook', 'chapters');
    if (!fs.existsSync(chapterDir)) {
      fs.mkdirSync(chapterDir, { recursive: true });
    }

    // Save as chapter-{key}.{ext}
    const ext = path.extname(req.file.originalname).toLowerCase();
    const chapterFilename = `chapter-${req.params.key}${ext}`;
    const chapterPath = path.join(chapterDir, chapterFilename);
    fs.copyFileSync(req.file.path, chapterPath);
    fs.unlinkSync(req.file.path);

    res.json({ success: true, filename: chapterFilename });
  } catch (err) {
    console.error('Error uploading chapter:', err);
    res.status(500).json({ error: 'Failed to upload chapter' });
  }
});

// GET /api/courses/:folder/chapters — List chapter files
router.get('/:folder/chapters', async (req, res) => {
  try {
    const course = await courseService.getCourse(req.params.folder);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const chapterDir = path.join(course.folderPath, 'textbook', 'chapters');
    const chapters = [];

    if (fs.existsSync(chapterDir)) {
      const files = fs.readdirSync(chapterDir);
      files.forEach(file => {
        const stat = fs.statSync(path.join(chapterDir, file));
        chapters.push({
          filename: file,
          size: stat.size,
          modified: stat.mtime
        });
      });
    }

    res.json(chapters);
  } catch (err) {
    console.error('Error listing chapters:', err);
    res.status(500).json({ error: 'Failed to list chapters' });
  }
});

// POST /api/courses/:folder/exam-config — Save exam configuration
router.post('/:folder/exam-config', async (req, res) => {
  try {
    const { type, scope, method, mcqCount, essayCount, time, points } = req.body;

    const course = await courseService.getCourse(req.params.folder);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Load or create exam_config.json
    const examConfigPath = path.join(course.folderPath, 'config', 'exam_config.json');
    let examConfig = {};

    if (fs.existsSync(examConfigPath)) {
      examConfig = JSON.parse(fs.readFileSync(examConfigPath, 'utf-8'));
    }

    // Save configuration for this exam type
    examConfig[type] = {
      scope: scope,
      method: method,
      mcq_count: mcqCount,
      essay_count: essayCount,
      time: time,
      points: points,
      created_at: new Date().toISOString()
    };

    fs.writeFileSync(examConfigPath, JSON.stringify(examConfig, null, 2), 'utf-8');

    res.json({ success: true, config: examConfig[type] });
  } catch (err) {
    console.error('Error saving exam config:', err);
    res.status(500).json({ error: 'Failed to save exam config' });
  }
});

// GET /api/courses/:folder/exam-config/:type — Get exam configuration
router.get('/:folder/exam-config/:type', async (req, res) => {
  try {
    const course = await courseService.getCourse(req.params.folder);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const examConfigPath = path.join(course.folderPath, 'config', 'exam_config.json');
    if (!fs.existsSync(examConfigPath)) {
      return res.json({ config: null });
    }

    const examConfig = JSON.parse(fs.readFileSync(examConfigPath, 'utf-8'));
    res.json({ config: examConfig[req.params.type] || null });
  } catch (err) {
    console.error('Error reading exam config:', err);
    res.status(500).json({ error: 'Failed to read exam config' });
  }
});

// GET /api/courses/:folder/docx/:type — Generate and download Word file
router.get('/:folder/docx/:type', async (req, res) => {
  try {
    const course = await courseService.getCourse(req.params.folder);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const { type } = req.params;

    // Determine file path based on type
    let mdPath = null;

    // script-week{N}-session{S}
    if (type.startsWith('script-week')) {
      const match = type.match(/script-week(\d+)-session(\d+)/);
      if (match) {
        const [, week, session] = match;
        mdPath = path.join(course.folderPath, 'lectures', `week${week}`, `session${session}.md`);
      }
    }
    // {exam-type}_student, {exam-type}_answer
    else if (type.includes('-')) {
      const [examType, variant] = type.split('-');
      if (examType === 'midterm' || examType === 'final') {
        const suffix = variant === 'answer' ? 'answer_key' : 'student';
        mdPath = path.join(course.folderPath, 'exams', `${examType}_${suffix}.md`);
      }
    }
    // assignment{N}
    else if (type.startsWith('assignment')) {
      const num = type.replace('assignment', '');
      mdPath = path.join(course.folderPath, 'assignments', `assignment${num}.md`);
    }

    if (!mdPath || !fs.existsSync(mdPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const docxBuffer = await docxService.mdFileToDocxStream(mdPath);
    const filename = `${type}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (err) {
    console.error('Error generating docx:', err);
    res.status(500).json({ error: 'Failed to generate Word file' });
  }
});

export default router;
