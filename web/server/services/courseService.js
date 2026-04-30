import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURSES_DIR = path.join(__dirname, '../../..', 'courses');

export async function listCourses() {
  try {
    if (!fs.existsSync(COURSES_DIR)) {
      return [];
    }

    const folders = fs.readdirSync(COURSES_DIR);
    const courses = [];

    for (const folder of folders) {
      const folderPath = path.join(COURSES_DIR, folder);
      const stat = fs.statSync(folderPath);

      if (!stat.isDirectory()) continue;

      const configPath = path.join(folderPath, 'config', 'course_config.json');
      if (!fs.existsSync(configPath)) continue;

      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        courses.push({
          folder,
          folderPath,
          ...config
        });
      } catch (err) {
        console.error(`Error reading config for ${folder}:`, err.message);
      }
    }

    return courses;
  } catch (err) {
    console.error('Error listing courses:', err);
    return [];
  }
}

export async function getCourse(folder) {
  try {
    const folderPath = path.join(COURSES_DIR, folder);

    if (!fs.existsSync(folderPath)) {
      return null;
    }

    const configPath = path.join(folderPath, 'config', 'course_config.json');
    if (!fs.existsSync(configPath)) {
      return null;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    return {
      folder,
      ...config,
      folderPath
    };
  } catch (err) {
    console.error(`Error reading course ${folder}:`, err);
    return null;
  }
}

export async function createCourse(courseData) {
  try {
    const { course_code, course_name, semester, delivery_language } = courseData;

    // Generate folder name: {CODE}_{NAME}_{SEMESTER}
    const folderName = `${course_code}_${course_name.replace(/\s+/g, '_')}_${semester}`.toLowerCase();
    const folderPath = path.join(COURSES_DIR, folderName);

    // Check if folder already exists
    if (fs.existsSync(folderPath)) {
      throw new Error(`Course folder already exists: ${folderName}`);
    }

    // Create folder structure
    const subdirs = [
      'config',
      'textbook',
      'syllabus',
      'lectures',
      'exams',
      'assignments'
    ];

    for (const subdir of subdirs) {
      fs.mkdirSync(path.join(folderPath, subdir), { recursive: true });
    }

    // Create subdirs for lectures (week01~week15)
    for (let w = 1; w <= 15; w++) {
      const weekDir = path.join(folderPath, 'lectures', `week${String(w).padStart(2, '0')}`);
      fs.mkdirSync(weekDir, { recursive: true });
    }

    // Create course_config.json
    const config = {
      course_name: courseData.course_name,
      course_code: courseData.course_code,
      semester: courseData.semester,
      academic_level: courseData.academic_level || 'Undergraduate Year 3-4',
      student_count: courseData.student_count || '50',
      professor_name: courseData.professor_name || '',
      delivery_language: courseData.delivery_language || 'English',
      language_code: courseData.language_code || 'en',
      course_folder: folderName,
      textbook_filename: '',
      textbook_path: '',
      textbook_extracted_path: '',
      grading_policy: {
        attendance: 20,
        midterm: 30,
        final: 30,
        assignments: 10,
        attitude: 10,
        total: 100
      },
      skip_chapters: courseData.skip_chapters || [],
      emphasized_chapters: courseData.emphasized_chapters || [],
      top_3_outcomes: courseData.top_3_outcomes || [],
      lecture_style: courseData.lecture_style || 'balanced',
      exam_question_types: courseData.exam_question_types || 'a',
      assignment_type: courseData.assignment_type || 'individual',
      real_world_applications: courseData.real_world_applications || '',
      assignment_count: courseData.assignment_count || 1,
      script_detail_level: courseData.script_detail_level || 'beginner',
      professor_language_proficiency: courseData.professor_language_proficiency || 'beginner',
      pronunciation_guide: courseData.pronunciation_guide || false,
      improvisation_tips: courseData.improvisation_tips || true,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      status: {
        syllabus: 'pending',
        lectures_completed: [],
        midterm: 'pending',
        final: 'pending',
        assignments_completed: []
      }
    };

    fs.writeFileSync(
      path.join(folderPath, 'config', 'course_config.json'),
      JSON.stringify(config, null, 2),
      'utf-8'
    );

    // Create MASTER_CONTEXT.md template
    const masterContext = `# MASTER_CONTEXT — ${course_name} (${semester})

진행 상황 추적 표:

| 항목 | 상태 | 완료일 |
|------|------|--------|
| 강의계획서 | ⏳ 대기 중 | — |
| 강의안 Week 1–3 | ⏳ 대기 중 | — |
| 강의안 Week 4–6 | ⏳ 대기 중 | — |
| 강의안 Week 7–9 | ⏳ 대기 중 | — |
| 강의안 Week 10–12 | ⏳ 대기 중 | — |
| 강의안 Week 13–15 | ⏳ 대기 중 | — |
| 중간고사 | ⏳ 대기 중 | — |
| 기말고사 | ⏳ 대기 중 | — |
| 과제물 | ⏳ 대기 중 | — |
| PPT 변환 | ⏳ 대기 중 | — |
`;

    fs.writeFileSync(
      path.join(folderPath, 'config', 'MASTER_CONTEXT.md'),
      masterContext,
      'utf-8'
    );

    // Create README.md
    const readme = `# ${course_name} (${course_code})

**학기:** ${semester}
**교수:** ${courseData.professor_name}
**수강 인원:** ${courseData.student_count}
**강의 언어:** ${courseData.delivery_language}

## 다음 단계

Claude Code에서 orchestrator.md를 실행해주세요:

\`\`\`
_templates/orchestrator.md
\`\`\`

또는 웹 UI에서 "작업 시작" 버튼을 클릭하세요.
`;

    fs.writeFileSync(
      path.join(folderPath, 'config', 'README.md'),
      readme,
      'utf-8'
    );

    return {
      success: true,
      folder: folderName,
      config
    };
  } catch (err) {
    console.error('Error creating course:', err);
    throw err;
  }
}

export async function updateCourseConfig(folder, updates) {
  try {
    const course = await getCourse(folder);
    if (!course) {
      throw new Error(`Course not found: ${folder}`);
    }

    const configPath = path.join(course.folderPath, 'config', 'course_config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Merge updates
    const updated = {
      ...config,
      ...updates,
      last_updated: new Date().toISOString()
    };

    fs.writeFileSync(configPath, JSON.stringify(updated, null, 2), 'utf-8');

    return updated;
  } catch (err) {
    console.error(`Error updating course config for ${folder}:`, err);
    throw err;
  }
}
