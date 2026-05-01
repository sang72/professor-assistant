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

  // Lecture session specific prompt
  if (task.startsWith('lecture-')) {
    const match = task.match(/lecture-(\d+)-(\d+)/);
    if (match) {
      const week = parseInt(match[1]);
      const session = parseInt(match[2]);
      const isKorean = task.includes('-ko');
      const language = isKorean ? 'Korean' : 'English';

      return {
        title: `Week ${week} Session ${session} 강의안 생성`,
        prompt: `당신은 대학 강의 전문가입니다. 다음 정보를 바탕으로 ${language === 'Korean' ? '한국어' : language}로 상세한 강의안을 작성하세요.

## 강의 정보
- 과목명: [강의 과목명]
- 코드: [강의 코드]
- 교수: [교수명]
- 학기: [학기]
- 강의 언어: ${language}
- 학습 목표: [학습 목표들]

## 강의 주차 정보
- Week: ${week}
- Session: ${session}
- 강의 시간: 50분

## 작성 요구사항
${isKorean ? `
1. 한국어로 50분 강의를 진행할 수 있는 상세한 스크립트를 작성하세요
2. 강의 구조:
   - 도입 (3분): 주제 소개, 학습목표
   - 주요 내용 (32분): 핵심 개념 설명, 예시, 사례
   - 사례 및 토론 (13분): 실제 예제, 학생 상호작용
   - 요약 (2분): 핵심 정리
3. 학생들이 이해하기 쉽게 작성하되 학문적 수준 유지
4. PPT 슬라이드와 함께 진행할 수 있도록 구성
5. 실제 교실 상황에서 즉시 사용 가능한 내용
` : `
1. ${language}로 50분 강의를 진행할 수 있는 상세한 스크립트를 작성하세요
2. 강의 구조:
   - Opening (3분): Topic introduction, Learning objectives
   - Main Content (32분): Key concepts, Examples, Case studies
   - Examples & Discussion (13분): Real-world examples, Student interaction
   - Summary & Q&A (2분): Key takeaways
3. Write in clear, academic language suitable for ${language}
4. Structure for use with PowerPoint slides
5. Ready for immediate classroom use
6. 동시에 한국어 번역도 함께 제공하세요 (#### 한국어 번역 섹션으로 구분)
`}

## 출력 형식
다음 마크다운 형식으로 정확하게 작성하세요:

\`\`\`markdown
# Week ${week} · Session ${session}: [강의 제목]

## [강의 코드] — [강의 과목명]
**Professor:** [교수명]
**Semester:** [학기]
**Delivery Language:** ${language}

---

## SECTION 1: LESSON PLAN (50 minutes)

### Session Learning Objectives

By the end of this session, students will be able to:
1. [구체적인 학습목표 1]
2. [구체적인 학습목표 2]
3. [구체적인 학습목표 3]

### Time Breakdown

| Time | Duration | Activity | Method |
|------|----------|----------|--------|
| 0:00-0:03 | 3 min | Opening & Agenda | Direct instruction |
| 0:03-0:35 | 32 min | Main Content | Lecture + PowerPoint slides |
| 0:35-0:48 | 13 min | Examples & Case Studies | Interactive discussion |
| 0:48-0:50 | 2 min | Summary & Q&A | Wrap-up |

---

## SECTION 2: FULL LECTURE SCRIPT (${language})

### Opening (3 minutes)
[구체적인 오프닝 스크립트 - 실제 말하는 내용]

### Main Content (32 minutes)
[상세한 강의 내용 - PPT 슬라이드와 함께 진행할 수 있는 전체 스크립트]

### Examples & Case Studies (13 minutes)
[실제 사례와 예제 - 학생들과 함께 논의할 수 있는 내용]

### Summary & Q&A (2 minutes)
[요약 및 질의응답 - 핵심 정리]

${!isKorean ? `
---

## 한국어 번역

### 도입 (3분)
[도입 스크립트의 한국어 번역]

### 주요 내용 (32분)
[주요 내용의 한국어 번역]

### 사례 및 토론 (13분)
[사례와 토론 내용의 한국어 번역]

### 요약 및 질의응답 (2분)
[요약의 한국어 번역]
` : ''}

---

## SECTION 3: PowerPoint SLIDE OUTLINE

### Slide 1: Title
- Week ${week} Session ${session}
- [강의 제목]
- [강의 코드]

### Slide 2: Learning Objectives
- [학습목표 1]
- [학습목표 2]
- [학습목표 3]

### Slide 3-7: Main Content
[주요 내용별 슬라이드 아웃라인 - 각 슬라이드당 하나의 주요 개념]

### Slide 8: Key Takeaways
- [핵심 포인트 1]
- [핵심 포인트 2]
- [핵심 포인트 3]

### Slide 9: Q&A
- Questions?

---

## SECTION 4: KEY NOTES

- [핵심 포인트 1]
- [핵심 포인트 2]
- [핵심 포인트 3]

### Preparation Notes
- [필요한 자료]
- [선수 지식]
- [학생들이 자주 헷갈리는 부분]
\`\`\`

## 저장 위치
이 강의안을 다음 경로에 저장하세요:
\`courses/[과목폴더]/lectures/week${String(week).padStart(2, '0')}/session${session}.md\``
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
