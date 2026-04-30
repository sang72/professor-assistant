import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import * as courseService from '../services/courseService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURSES_DIR = path.join(__dirname, '../../..', 'courses');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
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

export default router;
