export function buildPrompt(course, task) {
  const courseFolder = `courses/${course.course_folder}`;
  const configPath = `${courseFolder}/config/course_config.json`;
  const mastePath = `${courseFolder}/config/MASTER_CONTEXT.md`;
  const syllabusPath = `${courseFolder}/syllabus/syllabus.md`;

  const prompts = {
    syllabus: {
      title: '강의계획서 생성',
      prompt: `다음 파일들을 읽어주세요:
  ${configPath}
  ${mastePath}

그 다음 _templates/syllabus_agent.md를 실행해서 15주 강의계획서를 생성해주세요.
생성된 파일:
  ${courseFolder}/syllabus/syllabus.md
  ${courseFolder}/syllabus/grading_policy.md`
    },

    midterm: {
      title: '중간고사 생성',
      prompt: `다음 파일들을 읽어주세요:
  ${configPath}
  ${mastePath}
  ${syllabusPath}
  ${courseFolder}/textbook/textbook_extracted.txt (if exists)

그 다음 _templates/exam_agent.md를 실행해서 중간고사를 생성해주세요.
생성된 파일:
  ${courseFolder}/exams/midterm_student.md
  ${courseFolder}/exams/midterm_answer_key.md`
    },

    final: {
      title: '기말고사 생성',
      prompt: `다음 파일들을 읽어주세요:
  ${configPath}
  ${mastePath}
  ${syllabusPath}
  ${courseFolder}/textbook/textbook_extracted.txt (if exists)

그 다음 _templates/exam_agent.md를 실행해서 기말고사를 생성해주세요.
생성된 파일:
  ${courseFolder}/exams/final_student.md
  ${courseFolder}/exams/final_answer_key.md`
    }
  };

  // Week-specific lecture prompt
  if (task.startsWith('week')) {
    const match = task.match(/week(\d+)/);
    if (match) {
      const weekNum = parseInt(match[1]);
      const week = String(weekNum).padStart(2, '0');
      return {
        title: `Week ${weekNum} 강의안 생성 (Session 1, 2, 3)`,
        prompt: `다음 파일들을 읽어주세요:
  ${configPath}
  ${mastePath}
  ${syllabusPath}
  ${courseFolder}/textbook/textbook_extracted.txt (if exists)

그 다음 _templates/lecture_agent.md를 실행해서 Week ${weekNum}의 Session 1, 2, 3 강의안을 생성해주세요.
생성된 파일:
  ${courseFolder}/lectures/week${week}/session1.md
  ${courseFolder}/lectures/week${week}/session2.md
  ${courseFolder}/lectures/week${week}/session3.md

생성 후 PPT 변환:
  python3 scripts/generate_ppt.py ${courseFolder}/lectures/week${week}/session1.md
  python3 scripts/generate_ppt.py ${courseFolder}/lectures/week${week}/session2.md
  python3 scripts/generate_ppt.py ${courseFolder}/lectures/week${week}/session3.md`
      };
    }
  }

  // Assignment-specific prompt
  if (task.startsWith('assignment')) {
    const match = task.match(/assignment(\d+)/);
    if (match) {
      const assignNum = parseInt(match[1]);
      return {
        title: `Assignment ${assignNum} 생성`,
        prompt: `다음 파일들을 읽어주세요:
  ${configPath}
  ${mastePath}
  ${syllabusPath}
  ${courseFolder}/textbook/textbook_extracted.txt (if exists)

그 다음 _templates/assignment_agent.md를 실행해서 Assignment ${assignNum}을 생성해주세요.
생성된 파일:
  ${courseFolder}/assignments/assignment${assignNum}.md`
      };
    }
  }

  // All generation
  if (task === 'all') {
    return {
      title: '전체 콘텐츠 생성',
      prompt: `다음 파일들을 읽어주세요:
  ${configPath}
  ${mastePath}

그 다음 orchestrator.md를 실행해서 다음을 모두 생성해주세요:
  1. 강의계획서
  2. 15주 강의안 (주당 3세션)
  3. 중간고사
  4. 기말고사
  5. 과제물
  6. PPT 변환 및 GitHub 동기화`
    };
  }

  return prompts[task] || {
    title: '작업',
    prompt: '작업 지정이 올바르지 않습니다.'
  };
}

export function buildClipboardText(prompt) {
  return prompt.prompt;
}
