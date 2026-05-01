# 표준 강의 구조 템플릿 (Standard Course Structure Template)

## 강의 주차별 세션 구조 (Course Structure)

본 템플릿은 모든 새로운 교과목 생성 시 사용할 기본 구조입니다.

### 📊 전체 구조 (Overall Structure)

| 주차 | 유형 | 세션 수 | 설명 |
|------|------|--------|------|
| Week 1 | **Orientation** | 1 session | 강의계획서, 과정 소개, 평가방식, Q&A |
| Weeks 2-7 | Regular Lectures | 3 sessions/week | 일반 강의 (3 × 6주 = 18세션) |
| Week 8 | **Midterm Exam Week** | 1 session | 중간고사 (75분) — 강의 없음 |
| Weeks 9-14 | Regular Lectures | 3 sessions/week | 일반 강의 (3 × 6주 = 18세션) |
| Week 15 | **Final Exam Week** | 1 session | 기말고사 (90분) — 강의 없음 |

**전체 세션 수:** 1 + 18 + 1 + 18 + 1 = **39 sessions**

---

## 각 세션의 구조 (Per Session Structure)

### 일반 강의 세션 (Regular Lecture Session) — 50분

#### SECTION 1: LESSON PLAN (50분 구성)
- **Opening (3분):** 주제 소개, 학습목표 제시
- **Main Content (32분):** 핵심 개념 설명, 예제, 사례 분석
- **Examples & Discussion (13분):** 실제 사례, 학생 상호작용
- **Summary & Q&A (2분):** 핵심 정리

#### SECTION 2: FULL LECTURE SCRIPT (영문)
- 실제 50분 강의에 사용 가능한 상세한 스크립트
- 목표 단어 수: 2,000-3,000 words (상세한 설명)
- 학생 상호작용 표시: [ASK STUDENTS], [PAUSE], [WRITE ON BOARD]
- 실제 2024-2026 데이터 및 사례 통합

#### SECTION 3: PowerPoint SLIDE OUTLINE
- 12-15개 슬라이드 아웃라인
- 각 슬라이드별 발표 노트 포함
- 시각적 요소 설명

#### SECTION 4: KEY NOTES & IMPROVISATION TIPS
- 핵심 개념 정리
- 강사 준비 노트
- 학생들이 자주 하는 질문 예상
- 개선 팁

---

## 강의 계획서 (Syllabus) 구조

### 필수 섹션

1. **Course Information** — 교과목명, 코드, 강사, 시간, 위치
2. **Course Description** — 교과목 소개 (3-4문장)
3. **Learning Objectives** — 학습 목표 (5-7개)
4. **Required Materials** — 교재, 보충자료, 기술 요구사항
5. **Grading Breakdown** — 성적 배분
   - Attendance: 20% (Week 1 포함 전체 15주)
   - Midterm Exam: 30% (Week 8)
   - Final Exam: 30% (Week 15)
   - Assignment(s): 10-15%
   - Participation/Attitude: 10%
6. **15-Week Course Schedule** — 주차별 토픽, 세션 수, 평가 일정
7. **Assignment Overview** — 과제 설명 및 평가 기준
8. **Course Policies** — 출석, 지각, 학업 무결성, 통신, 편의 제공
9. **Weekly Reading Schedule** — 주차별 읽을 교재
10. **Course Expectations** — 전문성, 준비도, 참여도 기대
11. **FAQ** — 자주 묻는 질문
12. **Instructor Information** — 강사 연락처, 사무실시간
13. **University Resources** — 대학 지원 자료

---

## Week 1 오리엔테이션 세션 내용

Week 1 Session 1 (Orientation)은 다음을 포함해야 합니다:

1. **교수 소개** (5분)
   - 이름, 배경, 전문성
   - Office hours
   - 통신 방법

2. **강의계획서 안내** (10분)
   - 학습 목표
   - 교과서 및 자료
   - 평가 방식 설명

3. **과정 개요** (10분)
   - 주제별 주차 안내
   - 주요 주차 (중간고사, 기말고사, 과제)
   - 학습 경로

4. **평가 기준** (8분)
   - 출석: 20%
   - 중간고사: 30%
   - 기말고사: 30%
   - 과제: 10%
   - 참여도: 10%
   - 상세 예제

5. **강의 진행 방식** (10분)
   - 강의-토론-사례 분석 혼합
   - 기대되는 참여 수준
   - 주당 시간 헌신도 (준비, 읽기, 과제)

6. **기술 및 플랫폼** (5분)
   - 학습관리 시스템 (LMS) 사용법
   - 필요한 소프트웨어
   - 온라인 자료 접근

7. **정책 안내** (7분)
   - 출석 정책
   - 지각 및 결석
   - 과제 제출 기한
   - 학업 무결성

8. **Q&A** (5분)
   - 학생 질문 시간
   - 연락처 및 사무실 시간 재확인

---

## 파일 구조 (File Structure)

```
courses/[COURSE_CODE]_[COURSE_NAME]_[SEMESTER]/
├── syllabus/
│   ├── syllabus.md
│   └── grading_policy.md
├── lectures/
│   ├── week01/
│   │   └── session1.md (Orientation only)
│   ├── week02/
│   │   ├── session1.md
│   │   ├── session2.md
│   │   └── session3.md
│   ├── week03/
│   │   ├── session1.md
│   │   ├── session2.md
│   │   └── session3.md
│   ├── ... (Weeks 4-7 similar structure)
│   ├── week08/
│   │   └── midterm.md (Exam only)
│   ├── ... (Weeks 9-14 same as 2-7)
│   └── week15/
│       └── final.md (Exam only)
├── exams/
│   ├── midterm_student.md
│   ├── midterm_answer_key.md
│   ├── final_student.md
│   └── final_answer_key.md
├── assignments/
│   └── assignment1.md
├── config/
│   ├── course_config.json
│   ├── MASTER_CONTEXT.md
│   └── grading_rubrics/
│       └── assignment1_rubric.md
└── textbook/
    └── chapters/
        ├── chapter1.md
        ├── chapter2.md
        └── ... (all chapters)
```

---

## 새로운 교과목 생성 체크리스트 (New Course Creation Checklist)

### Phase 1: 설정 및 계획 (Setup & Planning)
- [ ] Course code, name, semester 정의
- [ ] Instructor 정보 수집
- [ ] 교재/보충자료 확보
- [ ] 학습 목표 정의
- [ ] 15주차 주제 및 내용 계획

### Phase 2: 강의계획서 작성 (Syllabus Creation)
- [ ] Course Information 섹션 작성
- [ ] Learning Objectives 5-7개 정의
- [ ] Grading breakdown 설정 (기본: 20% + 30% + 30% + 10% + 10%)
- [ ] 15-week schedule 완성
- [ ] Assignment 개요 작성
- [ ] Course policies 작성

### Phase 3: 강의안 생성 (Lecture Creation)
- [ ] **Week 1 (Orientation):** Session 1만 작성
- [ ] **Weeks 2-7:** 각 주마다 3개 세션 (총 18세션)
  - SECTION 1: LESSON PLAN
  - SECTION 2: FULL LECTURE SCRIPT (2,000-3,000 words)
  - SECTION 3: PowerPoint SLIDE OUTLINE
  - SECTION 4: KEY NOTES
- [ ] **Week 8:** Midterm exam 안내만 (강의 없음)
- [ ] **Weeks 9-14:** 각 주마다 3개 세션 (총 18세션) — Weeks 2-7과 동일 형식
- [ ] **Week 15:** Final exam 안내만 (강의 없음)

### Phase 4: 시험 및 과제 생성 (Exams & Assignments)
- [ ] Midterm exam (객관식 80% + 단답형 20%)
- [ ] Midterm answer key
- [ ] Final exam (객관식 80% + 단답형 20%)
- [ ] Final answer key
- [ ] Assignment #1 상세 설명 및 평가 기준

### Phase 5: 마무리 (Finalization)
- [ ] MASTER_CONTEXT.md 작성 (상태 추적)
- [ ] GitHub에 모든 파일 커밋 및 푸시
- [ ] 강의안 검토 및 개선

---

## 생성 자동화 명령어 (Automation Commands)

```bash
# 새 교과목 생성
python3 scripts/create_course.py --code FRM401 --name "Franchise Management" --semester "2026-Fall"

# 강의계획서 생성
python3 scripts/generate_syllabus.py [COURSE_FOLDER]

# Week 1 오리엔테이션 생성
python3 scripts/generate_orientation.py [COURSE_FOLDER]

# Weeks 2-7 강의안 생성
python3 scripts/generate_lectures.py [COURSE_FOLDER] --weeks 2-7 --sessions 3

# Weeks 9-14 강의안 생성
python3 scripts/generate_lectures.py [COURSE_FOLDER] --weeks 9-14 --sessions 3

# 시험 생성
python3 scripts/generate_exams.py [COURSE_FOLDER]

# 과제 생성
python3 scripts/generate_assignments.py [COURSE_FOLDER]

# 전체 PPT 변환
python3 scripts/generate_all_ppts.py [COURSE_FOLDER]
```

---

## 참고 사항 (Notes)

1. **Week 1은 항상 오리엔테이션**: 강의 내용이 아닌 과정 소개, 평가 방식, 기대 사항만 포함
2. **Week 8과 15는 시험 주간**: 정규 강의는 없고, 시험 안내 및 복습만 진행
3. **총 강의 세션**: 39개 (1 + 18 + 0 + 18 + 0 = 37 regular sessions + 2 exam sessions)
4. **각 정규 세션은 50분**: Opening 3분 + Main 32분 + Examples 13분 + Summary 2분
5. **한국어 번역**: 모든 영문 강의안에 한국어 번역 포함
6. **2024-2026 현실 사례**: 최신 사례 및 통계 통합
7. **학생 상호작용**: 매 세션마다 최소 2-3개의 토론/질문 기회 포함

---

**마지막 업데이트:** 2026-05-01
