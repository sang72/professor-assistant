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

export async function initializeLectureFile(folder, week, session) {
  try {
    const course = await getCourse(folder);
    if (!course) {
      throw new Error(`Course not found: ${folder}`);
    }

    const weekStr = String(week).padStart(2, '0');
    const lecturePath = path.join(course.folderPath, 'lectures', `week${weekStr}`, `session${session}.md`);

    if (fs.existsSync(lecturePath)) {
      return { exists: true, message: 'File already exists' };
    }

    const template = `# Week ${week} · Session ${session}: [Title]
## ${course.course_code} — ${course.course_name}

---

## SECTION 1: LESSON PLAN

### Session Learning Objectives

By the end of this session, students will be able to:
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

### Time Breakdown

| Time | Duration | Activity | Method |
|------|----------|----------|--------|
| 0:00 | 5 min | Opening | Direct instruction |
| 0:05 | 40 min | Main Content | Lecture + slides |
| 0:45 | 5 min | Q&A | Interactive |

---

## SECTION 2: FULL LECTURE SCRIPT

[Add your lecture script here]

---

## SECTION 3: KEY POINTS

- [Key point 1]
- [Key point 2]
- [Key point 3]
`;

    fs.writeFileSync(lecturePath, template, 'utf-8');
    return { success: true, message: 'Lecture file created', path: lecturePath };
  } catch (err) {
    console.error(`Error initializing lecture file:`, err);
    throw err;
  }
}

export async function initializeExamFile(folder, type) {
  try {
    const course = await getCourse(folder);
    if (!course) {
      throw new Error(`Course not found: ${folder}`);
    }

    const suffix = type === 'midterm' || type === 'final' ? 'student' : 'questions';
    const examPath = path.join(course.folderPath, 'exams', `${type}_${suffix}.md`);

    if (fs.existsSync(examPath)) {
      return { exists: true, message: 'File already exists' };
    }

    const template = `# ${type === 'midterm' ? 'Midterm' : 'Final'} Exam — ${course.course_code}

**Course:** ${course.course_name}
**Professor:** ${course.professor_name}
**Semester:** ${course.semester}

---

## Exam Information

- **Duration:** ${type === 'midterm' ? '75 minutes' : '90 minutes'}
- **Total Points:** 100
- **Format:**
  - Part A: Multiple Choice (45 points)
  - Part B: Short Answer (40 points)
  - Part C: Essay (15 points)

---

## Part A: Multiple Choice Questions

[30 multiple choice questions, 1.5 points each]

1. Question...
   a) Option A
   b) Option B
   c) Option C
   d) Option D

---

## Part B: Short Answer Questions

[5 short answer questions, 8 points each]

1. Question...

---

## Part C: Essay Question

[1 essay question, 15 points]

Write an essay answering the following question...
`;

    fs.writeFileSync(examPath, template, 'utf-8');
    return { success: true, message: 'Exam file created', path: examPath };
  } catch (err) {
    console.error(`Error initializing exam file:`, err);
    throw err;
  }
}

export async function initializeAssignmentFile(folder, assignmentNum) {
  try {
    const course = await getCourse(folder);
    if (!course) {
      throw new Error(`Course not found: ${folder}`);
    }

    const assignmentPath = path.join(course.folderPath, 'assignments', `assignment${assignmentNum}.md`);

    if (fs.existsSync(assignmentPath)) {
      return { exists: true, message: 'File already exists' };
    }

    const template = `# Assignment ${assignmentNum} — ${course.course_name}

**Course:** ${course.course_code}
**Professor:** ${course.professor_name}
**Semester:** ${course.semester}

---

## Assignment Objective

By completing this assignment, you will be able to:
- [Learning outcome 1]
- [Learning outcome 2]
- [Learning outcome 3]

---

## Instructions

1. [Instruction 1]
2. [Instruction 2]
3. [Instruction 3]

---

## Submission Requirements

- **Format:** [Specify format]
- **Length:** [Specify length]
- **Due Date:** [Specify date]
- **Submission Method:** [Specify method]

---

## Grading Rubric

| Criteria | Points | Description |
|----------|--------|-------------|
| Content | 40 | [Description] |
| Analysis | 30 | [Description] |
| Writing Quality | 20 | [Description] |
| Formatting | 10 | [Description] |
| **Total** | **100** | |

---

## Tips for Success

- [Tip 1]
- [Tip 2]
- [Tip 3]
`;

    fs.writeFileSync(assignmentPath, template, 'utf-8');
    return { success: true, message: 'Assignment file created', path: assignmentPath };
  } catch (err) {
    console.error(`Error initializing assignment file:`, err);
    throw err;
  }
}

export async function deleteCourse(folder) {
  try {
    const course = await getCourse(folder);
    if (!course) {
      throw new Error(`Course not found: ${folder}`);
    }

    const folderPath = course.folderPath;

    if (!fs.existsSync(folderPath)) {
      throw new Error(`Course folder not found: ${folderPath}`);
    }

    // Recursively delete folder
    const rmSync = (dirPath) => {
      if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
          const curPath = path.join(dirPath, file);
          if (fs.lstatSync(curPath).isDirectory()) {
            rmSync(curPath);
          } else {
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(dirPath);
      }
    };

    rmSync(folderPath);
    return { success: true, message: 'Course deleted successfully' };
  } catch (err) {
    console.error(`Error deleting course ${folder}:`, err);
    throw err;
  }
}
