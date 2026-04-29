#!/usr/bin/env bash
# =============================================================
# Professor Assistant — 영구 메뉴 기반 워크플로우
# 한 번 실행하면 사용자가 [5] 작업 종료를 선택할 때까지 계속 실행됨
# =============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
COURSES_DIR="$ROOT_DIR/courses"

cd "$ROOT_DIR"

# ─────────────────────────────────────────
# 유틸리티 함수들
# ─────────────────────────────────────────

get_course_name() {
  local COURSE_FOLDER="$1"
  local CONFIG="$COURSES_DIR/$COURSE_FOLDER/config/course_config.json"
  if [[ -f "$CONFIG" ]]; then
    CONFIG_REL="courses/$COURSE_FOLDER/config/course_config.json"
    python3 -c "import json; f=open('$CONFIG_REL', encoding='utf-8'); d=json.load(f); f.close(); print(d.get('course_name','Unknown'))" 2>/dev/null | tr -d '\r'
  else
    echo "Unknown"
  fi
}

save_and_commit() {
  local COURSE_FOLDER="$1"
  local COMMIT_TYPE="${2:-save}"

  cd "$ROOT_DIR"

  # git status 확인
  STATUS=$(git status --short)

  if [[ -z "$STATUS" ]]; then
    echo -e "${GREEN}✅ 변경사항이 없습니다.${NC}"
    return 0
  fi

  # 과목명 가져오기
  COURSE_NAME=$(get_course_name "$COURSE_FOLDER")

  # MASTER_CONTEXT.md 업데이트
  if [[ -n "$COURSE_FOLDER" && -d "$COURSES_DIR/$COURSE_FOLDER" ]]; then
    MASTER_CONTEXT="$COURSES_DIR/$COURSE_FOLDER/config/MASTER_CONTEXT.md"
    if [[ -f "$MASTER_CONTEXT" ]]; then
      TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
      sed -i "s/last_updated: .*/last_updated: $TIMESTAMP/" "$MASTER_CONTEXT"
    fi
  fi

  # Git 커밋 및 푸시
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
  if [[ "$COMMIT_TYPE" == "exit" ]]; then
    COMMIT_MSG="save: 작업 종료 저장 $TIMESTAMP - $COURSE_NAME"
  else
    COMMIT_MSG="save: 수동 저장 $TIMESTAMP - $COURSE_NAME"
  fi

  git add -A
  git commit -m "$COMMIT_MSG" --quiet

  if git push origin main 2>/dev/null; then
    echo -e "${GREEN}✅ 저장 완료! GitHub에 업로드되었습니다.${NC}"
    return 0
  else
    echo -e "${YELLOW}⚠️  온라인 저장 실패. 나중에 push하세요.${NC}"
    return 1
  fi
}

show_progress() {
  local SELECTED_FOLDER="$1"

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
}

show_claude_command() {
  local SELECTED_FOLDER="$1"
  local SELECTED_NAME="$2"

  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}Claude Code 명령어:${NC}"
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "다음 파일들을 읽어줘:"
  echo "  courses/$SELECTED_FOLDER/config/course_config.json"
  echo "  courses/$SELECTED_FOLDER/config/MASTER_CONTEXT.md"
  echo "  _templates/orchestrator.md"
  echo ""
  echo "orchestrator.md에 설명된 오케스트레이터 역할을 맡아서"
  echo "$SELECTED_NAME 과목의 강의 제작 워크플로우를 이어서 시작해줘."
  echo "현재까지의 진행 상황을 상태 보고서로 먼저 보여줘."
  echo ""
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

show_main_menu() {
  echo -e "${BLUE}${BOLD}"
  echo "╔══════════════════════════════════════════════════════╗"
  echo "║         Professor Assistant — 메인 메뉴              ║"
  echo "╠══════════════════════════════════════════════════════╣"
  echo "║  [1] Claude Code 명령어 다시 보기                   ║"
  echo "║  [2] 지금 즉시 저장 (GitHub push)                   ║"
  echo "║  [3] 다른 과목으로 전환                             ║"
  echo "║  [4] 새 과목 추가                                   ║"
  echo "║  [5] 작업 종료 (저장 후 종료)                       ║"
  echo "╚══════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

# ─────────────────────────────────────────
# 초기화 및 과목 선택
# ─────────────────────────────────────────

clear
echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║         PROFESSOR ASSISTANT                           ║"
echo "║         시작 중...                                    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Git pull
echo -e "${BOLD}📥 GitHub에서 최신 파일을 불러오는 중...${NC}"
PULL_RESULT=$(git pull origin main 2>&1)

if echo "$PULL_RESULT" | grep -q "Already up to date"; then
  echo -e "  ${GREEN}✅ 이미 최신 상태입니다.${NC}"
elif echo "$PULL_RESULT" | grep -q "error\|fatal"; then
  echo -e "  ${YELLOW}⚠️  오프라인 상태. 로컬 파일로 진행합니다.${NC}"
else
  echo -e "  ${GREEN}✅ 최신 파일을 불러왔습니다.${NC}"
fi

LAST_COMMIT=$(git log --oneline -1 2>/dev/null)
LAST_TIME=$(git log -1 --format="%ar" 2>/dev/null)
echo -e "  ${CYAN}마지막 저장: $LAST_TIME${NC}"
echo -e "  ${CYAN}내용: $LAST_COMMIT${NC}"
echo ""

# 과목 수 확인
COURSE_COUNT=$(find "$COURSES_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')

if [[ $COURSE_COUNT -eq 0 ]]; then
  echo -e "${YELLOW}등록된 과목이 없습니다.${NC}"
  echo -e -n "${YELLOW}새 과목을 만들까요? (y/n): ${NC}"
  read MAKE_NEW
  if [[ "$MAKE_NEW" == "y" || "$MAKE_NEW" == "Y" ]]; then
    bash "$SCRIPT_DIR/new_course.sh"
  fi
  exit 0
fi

# ─────────────────────────────────────────
# 과목 선택 루프
# ─────────────────────────────────────────

show_course_menu=true

while true; do
  if [[ "$show_course_menu" == "true" ]]; then
    clear
    echo -e "${CYAN}${BOLD}"
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║         과목 선택                                    ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    COURSE_FOLDERS=()
    COURSE_NAMES=()
    IDX=1

    while IFS= read -r -d '' folder; do
      FOLDER_NAME=$(basename "$folder")
      COURSE_NAME=$(get_course_name "$FOLDER_NAME")
      COURSE_FOLDERS+=("$FOLDER_NAME")
      COURSE_NAMES+=("$COURSE_NAME")

      echo -e "  ${CYAN}${BOLD}[$IDX]${NC} ${BOLD}$COURSE_NAME${NC}"
      ((IDX++))
    done < <(find "$COURSES_DIR" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null | sort -z)

    echo ""
    echo -e -n "${YELLOW}과목을 선택하세요 (1-$((${#COURSE_FOLDERS[@]})): ${NC}"
    read CHOICE

    if ! [[ "$CHOICE" =~ ^[0-9]+$ ]]; then
      echo -e "${RED}잘못된 입력입니다.${NC}"
      sleep 1
      continue
    fi

    IDX=$((CHOICE - 1))
    if [[ $IDX -lt 0 || $IDX -ge ${#COURSE_FOLDERS[@]} ]]; then
      echo -e "${RED}잘못된 선택입니다.${NC}"
      sleep 1
      continue
    fi

    SELECTED_FOLDER="${COURSE_FOLDERS[$IDX]}"
    SELECTED_NAME="${COURSE_NAMES[$IDX]}"
    show_course_menu=false
  fi

  # 과목 정보 표시
  clear
  echo -e "${GREEN}${BOLD}"
  echo "╔══════════════════════════════════════════════════════╗"
  echo "║              ✅ 과목 선택 완료!                       ║"
  echo "╚══════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo -e "  ${BOLD}과목:${NC} $SELECTED_NAME"
  echo -e "  ${BOLD}폴더:${NC} $SELECTED_FOLDER"
  echo ""

  show_progress "$SELECTED_FOLDER"
  show_claude_command "$SELECTED_FOLDER" "$SELECTED_NAME"

  # 메인 메뉴 루프
  while true; do
    show_main_menu

    echo -e -n "${YELLOW}선택하세요 (1-5): ${NC}"
    read MENU_CHOICE

    case "$MENU_CHOICE" in
      1)
        # Claude Code 명령어 다시 보기
        clear
        show_claude_command "$SELECTED_FOLDER" "$SELECTED_NAME"
        echo -e -n "${YELLOW}메뉴로 돌아가려면 Enter를 누르세요: ${NC}"
        read
        clear
        show_progress "$SELECTED_FOLDER"
        show_claude_command "$SELECTED_FOLDER" "$SELECTED_NAME"
        ;;

      2)
        # 즉시 저장
        echo ""
        echo -e "${YELLOW}💾 변경사항을 저장 중입니다...${NC}"
        save_and_commit "$SELECTED_FOLDER"
        echo ""
        echo -e -n "${YELLOW}메뉴로 돌아가려면 Enter를 누르세요: ${NC}"
        read
        clear
        show_progress "$SELECTED_FOLDER"
        show_claude_command "$SELECTED_FOLDER" "$SELECTED_NAME"
        ;;

      3)
        # 다른 과목으로 전환
        show_course_menu=true
        break
        ;;

      4)
        # 새 과목 추가
        bash "$SCRIPT_DIR/new_course.sh"
        show_course_menu=true
        break
        ;;

      5)
        # 작업 종료
        echo ""
        echo -e "${CYAN}${BOLD}──────────────────────────────────────────────────────${NC}"
        echo -e "${YELLOW}🔄 작업을 종료하고 변경사항을 저장 중입니다...${NC}"
        echo -e "${CYAN}${BOLD}──────────────────────────────────────────────────────${NC}"
        echo ""

        # 변경사항 확인 및 저장
        STATUS=$(git status --short)
        if [[ -z "$STATUS" ]]; then
          echo -e "${GREEN}✅ 변경사항이 없습니다.${NC}"
        else
          save_and_commit "$SELECTED_FOLDER" "exit"
        fi

        echo ""
        echo -e "${BOLD}📊 오늘 작업 요약:${NC}"
        echo -e "${CYAN}─────────────────────────────────────────────────────${NC}"
        git log --oneline --since="today 00:00" 2>/dev/null | head -5 | while read line; do
          echo -e "  ${GREEN}•${NC} $line"
        done
        echo ""

        echo -e "${GREEN}${BOLD}✅ 저장 완료! 수고하셨습니다 👨‍🏫${NC}"
        echo ""

        exit 0
        ;;

      *)
        echo -e "${RED}잘못된 선택입니다.${NC}"
        sleep 1
        clear
        show_progress "$SELECTED_FOLDER"
        show_claude_command "$SELECTED_FOLDER" "$SELECTED_NAME"
        ;;
    esac
  done
done
