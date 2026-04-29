#!/usr/bin/env bash
# =============================================================
# Professor Assistant — 완전 자동 시작
# 실행하면: pull → 과목 선택 → Claude 명령어 자동 복사
# =============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

# ─────────────────────────────────────────
# 종료 시 자동 저장 함수
# ─────────────────────────────────────────
auto_save_on_exit() {
  echo ""
  echo ""
  echo -e "${CYAN}${BOLD}──────────────────────────────────────────────────────${NC}"
  echo -e "${YELLOW}🔄 세션 종료 중... 자동 저장합니다.${NC}"
  echo -e "${CYAN}${BOLD}──────────────────────────────────────────────────────${NC}"
  echo ""

  # 변경사항 확인
  STATUS=$(git status --short)
  if [[ -z "$STATUS" ]]; then
    echo -e "${GREEN}✅ 변경사항이 없습니다.${NC}"
  else
    # 가장 최근 수정된 과목 폴더 감지
    LAST_COURSE=$(echo "$STATUS" | grep "courses/" | head -1 | sed 's|.*courses/\([^/]*\)/.*|\1|')

    echo -e "${YELLOW}💾 변경사항을 저장 중입니다...${NC}"

    # MASTER_CONTEXT.md 업데이트
    if [[ -n "$LAST_COURSE" && -d "courses/$LAST_COURSE" ]]; then
      MASTER_CONTEXT="courses/$LAST_COURSE/config/MASTER_CONTEXT.md"
      if [[ -f "$MASTER_CONTEXT" ]]; then
        TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
        sed -i "s/last_updated: .*/last_updated: $TIMESTAMP/" "$MASTER_CONTEXT"
      fi
    fi

    # 과목명 가져오기
    COURSE_NAME="Unknown"
    if [[ -n "$LAST_COURSE" ]]; then
      CONFIG="courses/$LAST_COURSE/config/course_config.json"
      if [[ -f "$CONFIG" ]]; then
        COURSE_NAME=$(python3 -c "import json; f=open('$CONFIG', encoding='utf-8'); d=json.load(f); f.close(); print(d.get('course_name','Unknown'))" 2>/dev/null | tr -d '\r')
      fi
    fi

    # Git 커밋 및 푸시
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
    COMMIT_MSG="auto-save: $COURSE_NAME 작업 저장 $TIMESTAMP"

    git add -A
    git commit -m "$COMMIT_MSG" --quiet

    if git push origin main 2>/dev/null; then
      echo -e "${GREEN}✅ 저장 완료! GitHub에 업로드되었습니다.${NC}"
    else
      echo -e "${YELLOW}⚠️  온라인 저장 실패. 나중에 push하세요.${NC}"
    fi
  fi

  # 백그라운드 자동 저장 프로세스 종료
  PID_FILE="$ROOT_DIR/.auto_save.pid"
  if [[ -f "$PID_FILE" ]]; then
    AUTO_PID=$(cat "$PID_FILE")
    if kill -0 "$AUTO_PID" 2>/dev/null; then
      kill "$AUTO_PID" 2>/dev/null
      rm "$PID_FILE"
      echo -e "${GREEN}✅ 백그라운드 자동 저장이 종료되었습니다.${NC}"
    fi
  fi

  echo ""
  echo -e "${GREEN}${BOLD}작업 수고하셨습니다! 👋${NC}"
  echo ""
}

trap 'auto_save_on_exit' EXIT

clear
echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         PROFESSOR ASSISTANT                              ║"
echo "║         시작 중...                                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─────────────────────────────────────────
# STEP 1: GitHub에서 최신 파일 자동으로 가져오기
# ─────────────────────────────────────────
echo -e "${BOLD}[1/3] 최신 작업 불러오는 중...${NC}"

PULL_RESULT=$(git pull origin main 2>&1)

if echo "$PULL_RESULT" | grep -q "Already up to date"; then
  echo -e "  ${GREEN}✅ 이미 최신 상태입니다.${NC}"
elif echo "$PULL_RESULT" | grep -q "error\|fatal"; then
  echo -e "  ${YELLOW}⚠️  오프라인 상태. 로컬 파일로 진행합니다.${NC}"
else
  echo -e "  ${GREEN}✅ 최신 파일을 불러왔습니다.${NC}"
fi

# 마지막 작업 정보 표시
LAST_COMMIT=$(git log --oneline -1 2>/dev/null)
LAST_TIME=$(git log -1 --format="%ar" 2>/dev/null)
echo -e "  ${CYAN}마지막 저장: $LAST_TIME${NC}"
echo -e "  ${CYAN}내용: $LAST_COMMIT${NC}"
echo ""

# ─────────────────────────────────────────
# STEP 2: 마지막 작업 과목 자동 감지
# ─────────────────────────────────────────
echo -e "${BOLD}[2/3] 마지막 작업 과목 감지 중...${NC}"

COURSES_DIR="$ROOT_DIR/courses"
LAST_COURSE_FOLDER=""
LAST_COURSE_NAME=""
LAST_MODIFIED_TIME=0

while IFS= read -r -d '' folder; do
  FOLDER_NAME=$(basename "$folder")
  CONFIG="$folder/config/course_config.json"

  if [[ -f "$CONFIG" ]]; then
    # 가장 최근에 수정된 파일 찾기
    LATEST=$(find "$folder" -name "*.md" -newer "$COURSES_DIR/.gitkeep" 2>/dev/null | head -1)
    if [[ -n "$LATEST" ]]; then
      MOD_TIME=$(stat -f "%m" "$LATEST" 2>/dev/null || stat -c "%Y" "$LATEST" 2>/dev/null)
      if [[ $MOD_TIME -gt $LAST_MODIFIED_TIME ]]; then
        LAST_MODIFIED_TIME=$MOD_TIME
        LAST_COURSE_FOLDER="$FOLDER_NAME"
        LAST_COURSE_NAME=$(python3 -c "import json; d=json.load(open('$CONFIG')); print(d.get('course_name','Unknown'))" 2>/dev/null)
      fi
    fi
  fi
done < <(find "$COURSES_DIR" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null)

# 과목이 1개면 자동 선택, 여러 개면 메뉴 표시
COURSE_COUNT=$(find "$COURSES_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')

if [[ $COURSE_COUNT -eq 0 ]]; then
  echo -e "  ${YELLOW}등록된 과목이 없습니다.${NC}"
  echo ""
  echo -e -n "${YELLOW}새 과목을 만들까요? (y/n): ${NC}"
  read MAKE_NEW
  if [[ "$MAKE_NEW" == "y" || "$MAKE_NEW" == "Y" ]]; then
    bash "$SCRIPT_DIR/new_course.sh"
  fi
  exit 0

elif [[ $COURSE_COUNT -eq 1 ]]; then
  # 과목이 1개면 자동 선택
  SELECTED_FOLDER="$LAST_COURSE_FOLDER"
  SELECTED_NAME="$LAST_COURSE_NAME"
  echo -e "  ${GREEN}✅ 과목이 1개입니다. 자동 선택: ${BOLD}$SELECTED_NAME${NC}"
  echo ""

else
  # 여러 과목이면 선택 메뉴
  echo ""
  echo -e "  ${CYAN}최근 작업 과목: ${BOLD}$LAST_COURSE_NAME${NC}"
  echo ""
  echo -e -n "${YELLOW}이 과목으로 계속할까요? (y/n): ${NC}"
  read CONTINUE_LAST

  if [[ "$CONTINUE_LAST" == "y" || "$CONTINUE_LAST" == "Y" ]]; then
    SELECTED_FOLDER="$LAST_COURSE_FOLDER"
    SELECTED_NAME="$LAST_COURSE_NAME"
  else
    # 다른 과목 선택 메뉴
    bash "$SCRIPT_DIR/select_course.sh"
    exit 0
  fi
fi

# ─────────────────────────────────────────
# STEP 3: Claude Code 명령어 자동 생성 + 복사
# ─────────────────────────────────────────
echo -e "${BOLD}[3/3] Claude Code 명령어 준비 중...${NC}"

CONFIG_FILE="$COURSES_DIR/$SELECTED_FOLDER/config/course_config.json"
MASTER_CONTEXT="$COURSES_DIR/$SELECTED_FOLDER/config/MASTER_CONTEXT.md"

# 진행 상황 빠르게 표시
echo ""
echo -e "${CYAN}${BOLD}── 현재 진행 상황 ──────────────────────────────────────${NC}"

SYLLABUS_FILE="$COURSES_DIR/$SELECTED_FOLDER/syllabus/syllabus.md"
MIDTERM_FILE="$COURSES_DIR/$SELECTED_FOLDER/exams/midterm_student.md"
FINAL_FILE="$COURSES_DIR/$SELECTED_FOLDER/exams/final_student.md"

[[ -f "$SYLLABUS_FILE" ]] && echo -e "  ${GREEN}✅${NC} 강의계획서 완성" || echo -e "  ${YELLOW}⏳${NC} 강의계획서 미완성"
[[ -f "$MIDTERM_FILE" ]] && echo -e "  ${GREEN}✅${NC} 중간고사 완성" || echo -e "  ${YELLOW}⏳${NC} 중간고사 미완성"
[[ -f "$FINAL_FILE" ]] && echo -e "  ${GREEN}✅${NC} 기말고사 완성" || echo -e "  ${YELLOW}⏳${NC} 기말고사 미완성"

LECTURE_COUNT=0
for week in $(seq -w 1 15); do
  WEEK_DIR="$COURSES_DIR/$SELECTED_FOLDER/lectures/week$week"
  [[ -f "$WEEK_DIR/session1.md" ]] && ((LECTURE_COUNT++))
done
echo -e "  ${CYAN}📖${NC} 강의안: ${LECTURE_COUNT}/15주 완성"
echo ""

# Claude Code 명령어 생성
CLAUDE_COMMAND="다음 파일들을 읽어줘:
  courses/$SELECTED_FOLDER/config/course_config.json
  courses/$SELECTED_FOLDER/config/MASTER_CONTEXT.md
  _templates/orchestrator.md

orchestrator.md에 설명된 오케스트레이터 역할을 맡아서
$SELECTED_NAME 과목의 강의 제작 워크플로우를 이어서 시작해줘.
현재까지의 진행 상황을 상태 보고서로 먼저 보여줘."

# 클립보드 자동 복사
if command -v pbcopy &>/dev/null; then
  echo "$CLAUDE_COMMAND" | pbcopy
  COPIED=true
elif command -v xclip &>/dev/null; then
  echo "$CLAUDE_COMMAND" | xclip -selection clipboard
  COPIED=true
else
  COPIED=false
fi

clear
echo -e "${GREEN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              ✅ 준비 완료!                                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  ${BOLD}과목:${NC} $SELECTED_NAME"
echo -e "  ${BOLD}폴더:${NC} $SELECTED_FOLDER"
echo ""

if [[ "$COPIED" == true ]]; then
  echo -e "${GREEN}${BOLD}✅ Claude Code 명령어가 클립보드에 복사되었습니다!${NC}"
  echo ""
  echo -e "  지금 Claude Code를 열고 ${BOLD}Cmd+V${NC} (또는 Ctrl+V) 를 누르세요."
else
  echo -e "${YELLOW}아래 명령어를 Claude Code에 붙여넣으세요:${NC}"
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo "$CLAUDE_COMMAND"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

echo ""
echo -e "${CYAN}─────────────────────────────────────────────────────────${NC}"
echo -e "  작업 마칠 때: ${YELLOW}bash scripts/finish_session.sh${NC}"
echo -e "  과목 변경:    ${YELLOW}bash scripts/select_course.sh${NC}"
echo -e "${CYAN}─────────────────────────────────────────────────────────${NC}"

# 백그라운드 자동 저장 시작 여부 묻기
echo ""
echo -e -n "${YELLOW}백그라운드 자동 저장을 시작할까요? (y/n): ${NC}"
read START_AUTO_SAVE

if [[ "$START_AUTO_SAVE" == "y" || "$START_AUTO_SAVE" == "Y" ]]; then
  bash "$SCRIPT_DIR/auto_save.sh" &
  AUTO_SAVE_PID=$!
  echo -e "${GREEN}✅ 자동 저장 시작 (PID: $AUTO_SAVE_PID) — 10분마다 자동 push${NC}"
  echo $AUTO_SAVE_PID > "$ROOT_DIR/.auto_save.pid"
fi

echo ""
echo -e "${CYAN}${BOLD}──────────────────────────────────────────────────────${NC}"
echo -e "${GREEN}Claude Code에 위 명령어를 붙여넣어 작업을 시작하세요.${NC}"
echo -e "${CYAN}작업이 끝나면 다음을 실행하세요: ${YELLOW}bash scripts/finish_session.sh${NC}"
echo -e "${CYAN}${BOLD}──────────────────────────────────────────────────────${NC}"
echo ""
echo -e -n "${YELLOW}과목 선택 메뉴로 돌아갈까요? (y/n): ${NC}"
read RETURN_MENU

if [[ "$RETURN_MENU" == "y" || "$RETURN_MENU" == "Y" ]]; then
  bash "$SCRIPT_DIR/select_course.sh"
else
  echo ""
  echo -e "${GREEN}터미널을 열린 상태로 유지합니다.${NC}"
  echo -e "${CYAN}작업을 마치려면 ${YELLOW}exit${NC} 또는 ${YELLOW}Ctrl+D${NC}를 입력하세요.${NC}"
  echo ""
  exec bash
fi
