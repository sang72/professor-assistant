# Professor Assistant 웹 애플리케이션 가이드

## 🚀 빠른 시작

### Windows
```bash
# 프로젝트 루트에서:
./run-web.bat
```

또는 PowerShell:
```powershell
cd web/server
node server.js
```

### macOS / Linux
```bash
bash web/start-web.sh
```

웹 브라우저에서 **http://localhost:3000** 을 방문합니다.

---

## 📋 기능

### 1. 대시보드 (홈)
- 등록된 모든 교과목을 카드로 표시
- 각 교과목의 진행률 시각화
- 새 교과목 생성 버튼

### 2. 교과목 생성 (준비 중)
- 4단계 멀티스텝 폼
  - Step 1: 강의 언어 선택
  - Step 2: 과목 정보 입력
  - Step 3: 교재 파일 업로드 (선택)
  - Step 4: 확인 및 생성

### 3. 교과목 상세 페이지 (준비 중)
- 교과목 정보 표시
- 후속 작업 관리 (강의안, 시험, 과제)
- Claude 프롬프트 복사 기능
- 생성된 파일 다운로드

---

## 🏗️ 기술 스택

### 백엔드
- **Node.js + Express** — REST API 서버
- **multer** — 파일 업로드 처리
- **File System** — JSON + Markdown 기반 스토리지

### 프론트엔드
- **React 18** — UI 프레임워크
- **Vite** — 고속 번들러
- **순수 CSS** — 스타일링

---

## 📁 프로젝트 구조

```
professor-assistant/
├── web/
│   ├── server/                  # Node.js + Express 백엔드
│   │   ├── package.json
│   │   ├── server.js            # 진입점
│   │   ├── routes/
│   │   │   ├── courses.js       # 교과목 CRUD + 파일
│   │   │   └── files.js         # 파일 업로드/다운로드
│   │   └── services/
│   │       ├── courseService.js    # 파일시스템 읽기/쓰기
│   │       ├── statusService.js    # 진행 상태 계산
│   │       └── promptBuilder.js    # Claude 프롬프트 조립
│   │
│   ├── client/                  # React 프론트엔드
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── dist/                # 빌드 결과물
│   │   └── src/
│   │       ├── App.jsx
│   │       ├── api/             # API 래퍼
│   │       ├── pages/           # 페이지 컴포넌트
│   │       └── components/      # UI 컴포넌트
│   │
│   ├── start-web.sh             # Linux/Mac 시작 스크립트
│   └── run-web.bat              # Windows 시작 스크립트
│
├── courses/                      # 교과목 데이터
├── scripts/                      # CLI 스크립트
└── _templates/                   # Claude 에이전트 템플릿
```

---

## 🔌 API 엔드포인트

### 교과목 관리

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/courses` | 모든 교과목 목록 + 상태 |
| GET | `/api/courses/:folder` | 단일 교과목 상세 정보 |
| POST | `/api/courses` | 새 교과목 생성 |
| PUT | `/api/courses/:folder/config` | 교과목 설정 업데이트 |

### 파일 관리

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/courses/:folder/files` | 파일 목록 |
| GET | `/api/courses/:folder/download` | 파일 다운로드 (query: `path`) |
| POST | `/api/courses/:folder/upload-textbook` | 교재 업로드 |

### Claude 프롬프트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/courses/:folder/prompt/:task` | task별 Claude 프롬프트 생성 |

**task 예시:** `syllabus`, `week01`, `midterm`, `final`, `assignment1`

---

## 🎯 사용 워크플로우

### 1. 새 교과목 생성
1. 대시보드에서 "새 교과목" 버튼 클릭
2. 4단계 폼 완료
3. 자동으로 폴더 구조 + `course_config.json` 생성

### 2. 콘텐츠 생성
1. 교과목 상세 페이지에서 "강의계획서 생성" 버튼 클릭
2. 프롬프트 모달 열림
3. "클립보드 복사" 클릭
4. Claude Code 대화창에 붙여넣기
5. 기존 에이전트가 콘텐츠 자동 생성

### 3. 파일 다운로드
1. 생성된 파일이 FileList에 표시
2. 다운로드 버튼 클릭
3. .md, .pptx, .docx 파일 다운로드

---

## 🔧 개발자 가이드

### 새 컴포넌트 추가

```jsx
// web/client/src/components/MyComponent.jsx
export function MyComponent({ prop }) {
  return <div>...</div>;
}
```

### API 호출

```javascript
import { courseApi } from '../api/index.js';

// 교과목 목록 조회
const courses = await courseApi.listCourses();

// 파일 다운로드
courseApi.downloadFile(folder, filePath);
```

---

## 🐛 문제 해결

### 포트 3000이 이미 사용 중인 경우
```bash
# 포트 변경
PORT=3001 node server.js
```

### API 연결 불가
- 백엔드 서버가 실행 중인지 확인 (http://localhost:3000/health)
- 방화벽 설정 확인
- 브라우저 콘솔 확인 (F12)

### 빌드 실패
```bash
cd web/client
npm install
npm run build
```

---

## 📝 다음 단계

- [ ] CoursePage 페이지 완성
- [ ] NewCoursePage 페이지 완성
- [ ] TaskPanel, PromptBox, FileList 컴포넌트 구현
- [ ] 다크 모드 지원
- [ ] 프론트엔드 상태 관리 개선 (Redux 등)
- [ ] 로그인/권한 관리
- [ ] 배포 설정

---

## 💡 팁

- 백엔드 개발 시: 매번 서버를 재시작해야 변경 사항이 반영됩니다
- 프론트엔드 개발 시: `npm run dev`로 실시간 개발 모드 실행 가능
- 프로덕션 배포: `npm run build` 후 `dist` 폴더 배포

---

질문이 있으면 이슈를 등록하세요!
