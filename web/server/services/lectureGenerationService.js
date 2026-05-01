import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generateLectureScript(course, week, session) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
    }

    const isKorean = course.delivery_language === 'Korean' || course.language_code === 'ko';
    const language = course.delivery_language || 'English';

    const prompt = `당신은 대학 강의 전문가입니다. 다음 정보를 바탕으로 ${language === 'Korean' ? '한국어' : language}로 상세한 강의안을 작성하세요.

## 강의 정보
- 과목명: ${course.course_name} (${course.course_code})
- 교수: ${course.professor_name}
- 학기: ${course.semester}
- 학생 수: ${course.student_count}명
- 강의 언어: ${language}
${course.top_3_outcomes && course.top_3_outcomes.length > 0 ? `- 학습 목표: ${course.top_3_outcomes.join(', ')}` : ''}

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
3. Write in clear, academic language suitable for the delivery language
4. Structure for use with PowerPoint slides
5. Ready for immediate classroom use
6. 동시에 한국어 번역도 함께 제공하세요 (#### 한국어 번역 섹션으로 구분)
`}

## 출력 형식
다음 마크다운 형식으로 작성하세요:

\`\`\`markdown
# Week ${week} · Session ${session}: [강의 제목]

## ${course.course_code} — ${course.course_name}
**Professor:** ${course.professor_name}
**Semester:** ${course.semester}
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
| 0:00-0:03 | 3 min | Opening & Agenda | [방법] |
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
- ${course.course_code}

### Slide 2: Learning Objectives
- [학습목표 1]
- [학습목표 2]
- [학습목표 3]

### Slide 3-7: Main Content
[주요 내용별 슬라이드 아웃라인]

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

이제 위 형식에 맞춰 상세한 강의안을 작성하세요.`;

    console.log(`[Lecture Generation] Week ${week} Session ${session} 강의안 생성 중...`);

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const lectureContent = response.content[0].type === 'text' ? response.content[0].text : '';

    if (!lectureContent) {
      throw new Error('Claude에서 생성된 콘텐츠가 없습니다.');
    }

    return lectureContent;
  } catch (err) {
    console.error('강의안 생성 실패:', err.message);
    throw err;
  }
}
