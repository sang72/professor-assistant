import fs from 'fs';
import path from 'path';

const FILE_CHECKS = {
  syllabus: 'syllabus/syllabus.md',
  grading: 'syllabus/grading_policy.md',
  midterm_student: 'exams/midterm_student.md',
  midterm_answer: 'exams/midterm_answer_key.md',
  final_student: 'exams/final_student.md',
  final_answer: 'exams/final_answer_key.md'
};

const LECTURE_SESSION_CHECKS = {
  lecture: 'lectures/week{week}/session{session}.md',
  ppt: 'lectures/week{week}/session{session}_slides.pptx'
};

const ASSIGNMENT_CHECKS = {
  assignment: 'assignments/assignment{num}.md'
};

export function calculateCourseStatus(course) {
  const folderPath = course.folderPath;
  const status = {
    syllabus: checkFile(folderPath, FILE_CHECKS.syllabus) ? 'done' : 'pending',
    grading: checkFile(folderPath, FILE_CHECKS.grading) ? 'done' : 'pending',
    midterm: checkFile(folderPath, FILE_CHECKS.midterm_student) ? 'done' : 'pending',
    final: checkFile(folderPath, FILE_CHECKS.final_student) ? 'done' : 'pending',
    lectures: [],
    assignments: []
  };

  // Check lectures (week 1-15, session 1-3)
  for (let w = 1; w <= 15; w++) {
    const week = String(w).padStart(2, '0');
    for (let s = 1; s <= 3; s++) {
      const lecturePath = `lectures/week${week}/session${s}.md`;
      const pptPath = `lectures/week${week}/session${s}_slides.pptx`;
      const hasLecture = checkFile(folderPath, lecturePath);
      const hasPpt = checkFile(folderPath, pptPath);

      status.lectures.push({
        week: parseInt(week),
        session: s,
        label: `Week ${parseInt(week)} · Session ${s}`,
        lecture: hasLecture ? 'done' : 'pending',
        ppt: hasPpt ? 'done' : 'pending',
        status: hasLecture ? 'done' : 'pending'
      });
    }
  }

  // Check assignments
  const assignmentCount = course.status?.assignments_completed?.length || course.assignment_count || 1;
  for (let i = 1; i <= assignmentCount; i++) {
    const assignmentPath = `assignments/assignment${i}.md`;
    const hasAssignment = checkFile(folderPath, assignmentPath);

    status.assignments.push({
      num: i,
      label: `Assignment ${i}`,
      status: hasAssignment ? 'done' : 'pending'
    });
  }

  // Calculate overall progress
  const totalItems = 2 + status.lectures.length + 2 + status.assignments.length; // syllabus + grading + lectures + midterm + final + assignments
  const completedItems =
    (status.syllabus === 'done' ? 1 : 0) +
    (status.grading === 'done' ? 1 : 0) +
    (status.midterm === 'done' ? 1 : 0) +
    (status.final === 'done' ? 1 : 0) +
    status.lectures.filter(l => l.status === 'done').length +
    status.assignments.filter(a => a.status === 'done').length;

  status.progress = {
    total: totalItems,
    completed: completedItems,
    percentage: Math.round((completedItems / totalItems) * 100)
  };

  return status;
}

function checkFile(folderPath, relativePath) {
  const fullPath = path.join(folderPath, relativePath);
  return fs.existsSync(fullPath);
}

export function getAllFiles(folderPath, baseDir = '') {
  const files = [];

  try {
    if (!fs.existsSync(folderPath)) {
      return files;
    }

    const items = fs.readdirSync(folderPath);

    for (const item of items) {
      const fullPath = path.join(folderPath, item);
      const stat = fs.statSync(fullPath);
      const relativePath = path.join(baseDir, item);

      if (stat.isDirectory()) {
        // Skip certain directories
        if (['config', 'uploads'].includes(item)) continue;
        files.push(...getAllFiles(fullPath, relativePath));
      } else if (item.endsWith('.md') || item.endsWith('.pptx') || item.endsWith('.docx') || item.endsWith('.pdf')) {
        files.push({
          name: item,
          path: relativePath.replace(/\\/g, '/'),
          type: item.split('.').pop().toLowerCase(),
          size: stat.size,
          modified: stat.mtime
        });
      }
    }
  } catch (err) {
    console.error(`Error reading files from ${folderPath}:`, err);
  }

  return files;
}

export function getFileIcon(extension) {
  const icons = {
    md: '📄',
    pptx: '🎯',
    docx: '📝',
    pdf: '📕'
  };
  return icons[extension] || '📎';
}

export function getStatusBadge(status) {
  const badges = {
    done: { text: '✅ 완료', color: 'bg-green-100 text-green-800' },
    pending: { text: '⏳ 대기 중', color: 'bg-gray-100 text-gray-800' },
    inprogress: { text: '⚙️ 진행 중', color: 'bg-blue-100 text-blue-800' }
  };
  return badges[status] || badges.pending;
}
