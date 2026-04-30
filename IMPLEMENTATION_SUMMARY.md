# Professor Assistant 웹 UI 구현 요약

**완료 날짜:** 2026-04-30  
**진행 상황:** Phase A-E 완료 (추가 기능 구현 진행 중)

---

## ✅ 완성된 기능

### 1단계: 백엔드 API (Express.js)
- ✅ 교과목 CRUD 작업
- ✅ 파일 업로드/다운로드
- ✅ 진행 상태 계산 (강의, 시험, 과제)
- ✅ Claude 프롬프트 자동 생성

### 2단계: Word 파일 생성 (새 기능)
- ✅ `docxService.js` — Markdown → Word(.docx) 변환
  - 제목, 불릿, 테이블, 페이지 나누기 지원
  - 한국어 폰트: 맑은 고딕
  - 영어 폰트: Times New Roman
- ✅ API: `GET /api/courses/:folder/docx/:type` — 스크립트, 시험지, 답지 다운로드

### 3단계: 교재 관리 (새 기능)
- ✅ 목차 파일 업로드: `POST /api/courses/:folder/upload-toc`
  - 자동으로 챕터 목록 파싱
  - 지원 형식: .txt, .md
- ✅ 챕터별 파일 업로드: `POST /api/courses/:folder/chapters/:key`
  - 각 주차/챕터별 교재 파일 분리 저장
- ✅ API: `GET /api/courses/:folder/chapters` — 챕터 목록 조회

### 4단계: 시험 설정 (구현 진행 중)
- ✅ 시험 설정 저장: `POST /api/courses/:folder/exam-config`
  - 범위, 문제 유형(객관식/주관식), 시간, 총점 저장
- ✅ 시험 설정 조회: `GET /api/courses/:folder/exam-config/:type`

### 5단계: 프론트엔드 (React)
- ✅ HomePage — 교과목 카드 그리드 (진행률 시각화)
- ✅ CoursePage — 4개 탭 인터페이스
  - [개요] — 과목 요약 + 학습성과 + 진행률
  - [교재 관리] — 목차 업로드 + 챕터별 파일 업로드
  - [작업 목록] — 강의안, 시험, 과제 상태 + Word 다운로드
  - [파일 다운로드] — 생성된 파일 목록 (다운로드 버튼 포함)

---

## 📊 현재 구조

```
web/
├── server/
│   ├── services/
│   │   ├── courseService.js      (교과목 CRUD)
│   │   ├── statusService.js      (상태 계산)
│   │   ├── promptBuilder.js      (프롬프트 생성)
│   │   └── docxService.js        ✨ (Word 파일 생성)
│   └── routes/courses.js         (모든 API 엔드포인트 정의)
│
└── client/
    └── src/
        ├── pages/
        │   ├── HomePage.jsx       (교과목 목록)
        │   └── CoursePage.jsx     ✨ (교과목 상세 + 탭)
        ├── components/
        │   └── CourseCard.jsx     (카드 컴포넌트)
        └── api/index.js           (API 래퍼)
```

---

## 🎯 사용 워크플로우

### 1. 웹 앱 시작
```bash
Windows:  ./run-web.bat
Linux/Mac: bash web/start-web.sh
```
**URL:** http://localhost:3000

### 2. 교과목 상세 페이지 접속
- 홈페이지에서 교과목 카드 클릭
- 또는 `http://localhost:3000/#/courses/frm401_franchise_management_2026_fall`

### 3. 교재 관리 (새!)
1. [교재 관리] 탭 클릭
2. **목차 파일 업로드**
   - Chapter 1: Introduction...
   - Chapter 2: Franchise Model...
   - 자동으로 챕터 목록 생성
3. **챕터별 파일 업로드**
   - 각 챕터 행에서 [선택] 버튼 클릭
   - PDF 또는 텍스트 파일 업로드

### 4. 작업 관리
1. [작업 목록] 탭
2. 각 항목:
   - **프롬프트** — Claude Code에 복사 가능한 명령어
   - **Word** — 생성된 파일을 Word(.docx)로 다운로드

---

## 🔧 새로운 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/courses/:folder/upload-toc` | 목차 파일 업로드 |
| GET | `/api/courses/:folder/toc` | 목차 조회 + 챕터 파싱 |
| POST | `/api/courses/:folder/chapters/:key` | 챕터 파일 업로드 |
| GET | `/api/courses/:folder/chapters` | 챕터 파일 목록 |
| POST | `/api/courses/:folder/exam-config` | 시험 설정 저장 |
| GET | `/api/courses/:folder/exam-config/:type` | 시험 설정 조회 |
| GET | `/api/courses/:folder/docx/:type` | Word 파일 생성 & 다운로드 |

---

## 📁 파일 저장 위치

```
courses/frm401_franchise_management_2026_fall/
├── config/
│   ├── course_config.json
│   ├── exam_config.json          ✨ (시험 설정)
│   └── MASTER_CONTEXT.md
├── textbook/
│   ├── toc.txt (또는 toc.md)     ✨ (목차)
│   ├── chapters/
│   │   ├── chapter-01.pdf        ✨ (챕터 파일)
│   │   ├── chapter-02.pdf
│   │   └── ...
│   ├── textbook_extracted.txt
│   └── franchise.pdf
├── lectures/
│   ├── week01/session1.md
│   └── ...
├── exams/
│   ├── midterm_student.md
│   ├── midterm_answer_key.md
│   └── ...
└── assignments/
    └── assignment1.md
```

---

## 🎓 Word 파일 생성 규칙

**마크다운 → Word 변환:**
- `#` → Heading 1 (20pt, 굵음)
- `##` → Heading 2 (16pt, 굵음)
- `###` → Heading 3 (14pt, 굵음)
- `-` / `*` → Bullet list
- `|...|` → Table
- `---` (단독 줄) → Page break

**예시:**
```markdown
# 중간고사 (시험지)

## 제1부: 객관식 (25문항)

### 1. 프랜차이즈의 정의
- Option A: ...
- Option B: ...
```
↓ Word로 변환하면 자동으로 서식이 적용됩니다.

---

## 🚀 향후 확장 사항 (Phase 2)

- [ ] **ExamWizard** — 3단계 시험 설정 마법사 모달
  - Step 1: 시험 범위 (목차에서 선택)
  - Step 2: 시험 방법 (객관식 수, 주관식 수 등)
  - Step 3: 확인 → 프롬프트 자동 생성

- [ ] **NewCoursePage** — 4단계 교과목 생성 폼
  - 언어 선택
  - 과목 정보 입력
  - 목차 파일 업로드
  - 최종 확인

- [ ] **PromptBox** — Claude 프롬프트 복사 모달

- [ ] **UI 개선**
  - 다크 모드
  - 반응형 디자인 개선
  - 드래그 앤 드롭 개선

---

## 💡 주요 기술 스택

| 계층 | 기술 |
|------|------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Word Generation | `docx` npm package |
| File System | JSON + Markdown |
| Styling | 순수 CSS |

---

## 🐛 문제 해결

### Q: Word 파일 다운로드가 안 됩니다
**A:** 
1. 강의안이 생성되어 있는지 확인 (session1.md 등)
2. 백엔드 로그 확인: `npm run dev`

### Q: 목차 파싱이 안 됩니다
**A:** 목차 파일 형식 확인:
```
Chapter 1: Title
Chapter 2: Title
...
```
또는 마크다운:
```
# Chapter 1: Title
# Chapter 2: Title
```

### Q: 챕터 파일 업로드 후 목록에 안 보입니다
**A:** 페이지 새로고침 (F5) 후 다시 확인

---

## 📞 지원

- 문제 발생 시: GitHub Issues 등록
- 기능 제안: Discussions

---

**Made with ❤️ by Claude Haiku**
