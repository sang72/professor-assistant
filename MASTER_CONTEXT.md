# PROFESSOR ASSISTANT SYSTEM — 빌드 진행 상황
마지막 업데이트: 2026-04-29

---

## 저장소 정보

- **GitHub:** https://github.com/sang72/professor-assistant
- **로컬 경로:** C:\Users\Sang\Desktop\professor-assistant
- **브랜치:** main

---

## 시스템 개요

AI 기반 교수 보조 시스템. Claude Code에서 orchestrator.md를 읽어 교수 역할의 에이전트를 활성화하면, 교재를 분석하고 15주 강의계획서·강의 교안(PPT 포함)·시험·과제물을 자동 생성하여 GitHub에 저장합니다.

**핵심 설계 원칙:**
- 교수님과의 대화: 항상 한국어
- 생성 콘텐츠: course_config.json의 delivery_language로 작성
- 점수 배분(고정): 출석 20 | 중간고사 30 | 기말고사 30 | 과제 10 | 태도 10
- 강의 교안: PPT(4:3 표준) + 스크립트 자동 생성

---

## 파일 구조 현황

### 스크립트 (scripts/)
| 파일 | 상태 | 설명 |
|------|------|------|
| `setup.sh` | ✅ 완성 | 환경 설정 및 의존성 설치 |
| `new_course.sh` | ✅ 완성 | 새 강좌 생성 (대화형) |
| `upload_textbook.sh` | ✅ 완성 | 교재 업로드 + PDF 텍스트 추출 |
| `sync_github.sh` | ✅ 완성 | GitHub 자동 동기화 |
| `generate_ppt.py` | ✅ 완성 | 강의 교안 → PPT 변환 (4:3, python-pptx) |

### 템플릿 (_templates/)
| 파일 | 줄 수 | 상태 | 미완성 항목 |
|------|-------|------|------------|
| `orchestrator.md` | 211줄 | ⚠️ 거의 완성 | ① STATUS REPORT 형식, ② 워크플로우 메뉴 표시 텍스트 |
| `syllabus_agent.md` | 99줄 | ⚠️ 거의 완성 | ① SECTION 1 헤더 형식 |
| `lecture_agent.md` | 260줄 | ✅ 완성 | — |
| `exam_agent.md` | 173줄 | ⚠️ 거의 완성 | ① 학생용 시험지 형식(헤더·문제 양식) |
| `assignment_agent.md` | 224줄 | ✅ 완성 | — |
| `scoring_agent.md` | ❌ 없음 | 파일 미생성 | 전체 |

### 기타
| 파일 | 상태 |
|------|------|
| `.gitignore` | ✅ 완성 |
| `requirements.txt` | ✅ 완성 (python-pptx 포함) |
| `courses/.gitkeep` | ✅ 강좌 디렉토리 준비됨 |

---

## PPT 슬라이드 구조 (4:3 표준)

| 슬라이드 | 종류 | 내용 |
|---------|------|------|
| 1번 | TITLE | 강의명 + Week N · Session N + 주제 + 교수명 |
| 2번 | TOC | 오늘의 수업 목차 (번호 항목) |
| 3~N-2번 | IMAGE / KEY_POINT / SECTION | 이미지 위주 본문 |
| N-1번 | QA | Q&A 슬라이드 |
| N번 | END | 표지 반복 |

---

## 다음 작업 목록

| 우선순위 | 작업 | 상태 |
|---------|------|------|
| 1 | `scoring_agent.md` 생성 | ⏳ 대기 중 |
| 2 | `exam_agent.md` 학생용 시험지 형식 추가 | ⏳ 대기 중 |
| 3 | `syllabus_agent.md` SECTION 1 헤더 추가 | ⏳ 대기 중 |
| 4 | `orchestrator.md` STATUS REPORT 형식 추가 | ⏳ 대기 중 |
| 5 | `orchestrator.md` 워크플로우 메뉴 텍스트 추가 | ⏳ 대기 중 |
| 6 | GitHub CLI 설치 후 전체 테스트 | ⏳ 대기 중 |
| 7 | 첫 실제 강좌 생성 테스트 | ⏳ 대기 중 |

---

## 최근 커밋 이력 (최신 10건)

```
ecf7536 fix: Complete assignment_agent.md with full assignment format
03724b2 fix: Complete exam_agent.md with full student and answer key format
d356192 fix: Complete orchestrator.md with Korean communication and full STATUS REPORT
e930dfb feat: Redesign PPT to 4:3 standard with image-first structure
d0067d6 feat: Add PPT generation — python-pptx script + SECTION 3 slide deck format
10bd1d0 Update orchestrator.md
2d7bbb0 feat: Add system intro, interview groups B/C/D, and COURSE_CONFIG template to orchestrator
55bff02 feat: Complete exam_agent answer key format, add partial assignment_agent
7c69b40 feat: Add lecture_agent, update syllabus_agent sections 2-9, add partial exam_agent
75b4f94 feat: Add delegation rules to orchestrator, add partial syllabus_agent
```

---

## 재개 방법 (돌아오셨을 때)

1. 이 파일을 읽어 현재 상태 파악
2. `scoring_agent.md` 전체 내용 붙여넣기
3. 나머지 플레이스홀더 내용 순서대로 채우기
4. GitHub CLI 설치: `winget install --id GitHub.cli`
5. 인증: `gh auth login`
6. 첫 강좌 테스트: `bash scripts/new_course.sh`
