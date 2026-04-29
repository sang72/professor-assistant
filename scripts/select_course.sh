#!/usr/bin/env bash
# =============================================================
# Professor Assistant — Course Selection & Quick Start
# =============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
COURSES_DIR="$ROOT_DIR/courses"

# ─────────────────────────────────────────
# 시작 시 자동으로 GitHub에서 최신 파일 가져오기
# ─────────────────────────────────────────
auto_pull_on_start() {
  cd "$ROOT_DIR"
  echo -e "${YELLOW}📥 시작 중... 최신 작업을 불러오는 중입니다.${NC}"

  # git pull 실행
  PULL_RESULT=$(git pull origin main 2>&1)

  if echo "$PULL_RESULT" | grep -q "Already up to date"; then
    echo -e "${GREEN}✅ 최신 상태입니다.${NC}"
  elif echo "$PULL_RESULT" | grep -q "error\|fatal"; then
    echo -e "${YELLOW}⚠️  오프라인 상태입니다. 로컬 파일로 진행합니다.${NC}"
  else
    # 업데이트된 파일 목록 표시
    UPDATED=$(echo "$PULL_RESULT" | grep "|" | awk '{print $1}')
    if [[ -n "$UPDATED" ]]; then
      echo -e "${GREEN}✅ 업데이트된 파일:${NC}"
      echo "$UPDATED" | while read f; do
        echo -e "   ${CYAN}• $f${NC}"
      done
    else
      echo -e "${GREEN}✅ 최신 파일을 불러왔습니다.${NC}"
    fi
  fi

  # 마지막 작업 과목 감지
  LAST_COURSE=$(git log --oneline -1 2>/dev/null | grep -o "courses/[^/]*" | head -1 | sed 's|courses/||')
  if [[ -n "$LAST_COURSE" ]]; then
    echo -e "${CYAN}📌 마지막 작업 과목: ${BOLD}$LAST_COURSE${NC}"
  fi

  echo ""
  sleep 1
}

auto_pull_on_start

clear

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         PROFESSOR ASSISTANT — 과목 선택 메뉴             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 과목 폴더 목록 수집
COURSE_FOLDERS=()
COURSE_NAMES=()
COURSE_LANGS=()
COURSE_STATUS=()

while IFS= read -r -d '' folder; do
  FOLDER_NAME=$(basename "$folder")
  CONFIG="$folder/config/course_config.json"

  if [[ -f "$CONFIG" ]]; then
    # Read all JSON fields in one call with proper encoding
    read COURSE_NAME COURSE_CODE LANG SEMESTER PROF ASSIGNMENT_COUNT < <(
      python3 -c "
import json
try:
  with open('$CONFIG', encoding='utf-8') as f:
    d = json.load(f)
    print(d.get('course_name', 'Unknown'), d.get('course_code', 'Unknown'), d.get('delivery_language', 'Unknown'), d.get('semester', 'Unknown'), d.get('professor_name', 'Unknown'), d.get('assignment_count', 0))
except Exception as e:
  print('Unknown Unknown Unknown Unknown Unknown 0')
"
    )

    # 진행 상황 계산 - 실제 파일 확인
    SYLLABUS_FILE="$folder/syllabus/syllabus.md"
    MIDTERM_FILE="$folder/exams/midterm_student.md"
    FINAL_FILE="$folder/exams/final_student.md"

    [[ -f "$SYLLABUS_FILE" ]] && SYLLABUS_STATUS="done" || SYLLABUS_STATUS="pending"
    [[ -f "$MIDTERM_FILE" ]] && MIDTERM_STATUS="done" || MIDTERM_STATUS="pending"
    [[ -f "$FINAL_FILE" ]] && FINAL_STATUS="done" || FINAL_STATUS="pending"

    # Count actual lecture sessions
    LECTURES_DONE=0
    for week in $(seq -w 1 15); do
      WEEK_DIR="$folder/lectures/week$week"
      if [[ -f "$WEEK_DIR/session1.md" && -f "$WEEK_DIR/session2.md" && -f "$WEEK_DIR/session3.md" ]]; then
        ((LECTURES_DONE++))
      fi
    done

    # Count actual assignment files
    ASSIGNMENTS_DONE=0
    if [[ -d "$folder/assignments" ]]; then
      ASSIGNMENTS_DONE=$(find "$folder/assignments" -name "*.md" -o -name "*.txt" -o -name "*.pdf" | wc -l)
    fi

    # 완성도 계산 (총 5점: 강의계획서, 중간고사, 기말고사, 강의안, 과제)
    TOTAL=5
    DONE=0
    [[ "$SYLLABUS_STATUS" == "done" ]] && ((DONE++))
    [[ "$MIDTERM_STATUS" == "done" ]] && ((DONE++))
    [[ "$FINAL_STATUS" == "done" ]] && ((DONE++))
    [[ $LECTURES_DONE -gt 0 ]] && ((DONE++))
    [[ $ASSIGNMENTS_DONE -gt 0 ]] && ((DONE++))
    PROGRESS=$((DONE * 100 / TOTAL))

    COURSE_FOLDERS+=("$FOLDER_NAME")
    COURSE_NAMES+=("$COURSE_NAME")
    COURSE_LANGS+=("$LANG")
    COURSE_STATUS+=("$PROGRESS%")

    IDX=${#COURSE_FOLDERS[@]}

    echo -e "  ${CYAN}${BOLD}[$IDX]${NC} ${BOLD}$COURSE_NAME${NC} (${COURSE_CODE})"
    echo -e "      학기: $SEMESTER | 언어: $LANG | 교수: $PROF"
    echo -e "      진행률: ${GREEN}$PROGRESS% 완료${NC} | 강의안: ${LECTURES_DONE}주 완성"
    echo ""
  fi
done < <(find "$COURSES_DIR" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null)

if [[ ${#COURSE_FOLDERS[@]} -eq 0 ]]; then
  echo -e "${YELLOW}등록된 과목이 없습니다.${NC}"
  echo -e "새 과목을 만들려면: ${CYAN}bash scripts/new_course.sh${NC}"
  exit 0
fi

echo -e "${CYAN}─────────────────────────────────────────────────────────${NC}"
echo -e "  ${BOLD}[N]${NC} 과목 선택"
echo -e "  ${BOLD}[0]${NC} 새 과목 추가"
echo -e "  ${BOLD}[Q]${NC} 종료"
echo -e "${CYAN}─────────────────────────────────────────────────────────${NC}"
echo ""
echo -e -n "${YELLOW}선택하세요: ${NC}"
read CHOICE

if [[ "$CHOICE" == "0" ]]; then
  bash "$SCRIPT_DIR/new_course.sh"
  exit 0
fi

if [[ "$CHOICE" == "q" || "$CHOICE" == "Q" ]]; then
  echo -e "${GREEN}종료합니다.${NC}"
  exit 0
fi

IDX=$((CHOICE - 1))
if [[ $IDX -lt 0 || $IDX -ge ${#COURSE_FOLDERS[@]} ]]; then
  echo -e "${RED}잘못된 선택입니다.${NC}"
  exit 1
fi

SELECTED_FOLDER="${COURSE_FOLDERS[$IDX]}"
SELECTED_NAME="${COURSE_NAMES[$IDX]}"
SELECTED_LANG="${COURSE_LANGS[$IDX]}"
COURSE_DIR="$COURSES_DIR/$SELECTED_FOLDER"
CONFIG_FILE="$COURSE_DIR/config/course_config.json"

clear
echo -e "${GREEN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              선택된 과목 정보                             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  ${BOLD}과목명:${NC}   $SELECTED_NAME"
echo -e "  ${BOLD}언어:${NC}     $SELECTED_LANG"
echo -e "  ${BOLD}폴더:${NC}     $SELECTED_FOLDER"
echo ""

# 진행 상황 상세 표시
echo -e "${CYAN}${BOLD}── 현재 진행 상황 ──────────────────────────────────────${NC}"

SYLLABUS_FILE="$COURSE_DIR/syllabus/syllabus.md"
MIDTERM_FILE="$COURSE_DIR/exams/midterm_student.md"
FINAL_FILE="$COURSE_DIR/exams/final_student.md"

[[ -f "$SYLLABUS_FILE" ]] && echo -e "  ${GREEN}✅${NC} 강의계획서" || echo -e "  ${YELLOW}⏳${NC} 강의계획서"
[[ -f "$MIDTERM_FILE" ]] && echo -e "  ${GREEN}✅${NC} 중간고사" || echo -e "  ${YELLOW}⏳${NC} 중간고사"
[[ -f "$FINAL_FILE" ]] && echo -e "  ${GREEN}✅${NC} 기말고사" || echo -e "  ${YELLOW}⏳${NC} 기말고사"

echo ""
echo -e "${CYAN}${BOLD}── 강의안 완성 현황 ────────────────────────────────────${NC}"
for week in $(seq -w 1 15); do
  WEEK_DIR="$COURSE_DIR/lectures/week$week"
  S1="$WEEK_DIR/session1.md"
  S2="$WEEK_DIR/session2.md"
  S3="$WEEK_DIR/session3.md"

  if [[ -f "$S1" && -f "$S2" && -f "$S3" ]]; then
    echo -e "  ${GREEN}✅${NC} ${week}주차 (3세션 완성)"
  elif [[ -f "$S1" || -f "$S2" || -f "$S3" ]]; then
    COUNT=0
    [[ -f "$S1" ]] && ((COUNT++))
    [[ -f "$S2" ]] && ((COUNT++))
    [[ -f "$S3" ]] && ((COUNT++))
    echo -e "  ${YELLOW}🔄${NC} ${week}주차 (${COUNT}/3 세션)"
  fi
done
echo ""

# git pull 실행
echo -e "${YELLOW}📥 GitHub에서 최신 파일을 가져오는 중...${NC}"
cd "$ROOT_DIR"
git pull origin main --quiet && echo -e "${GREEN}✅ 최신 상태로 업데이트 완료${NC}" || echo -e "${YELLOW}⚠️  Pull 실패. 오프라인 상태일 수 있습니다.${NC}"
echo ""

# Claude Code 명령어 자동 생성 및 출력
echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║        Claude Code에 아래를 붙여넣으세요                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
cat << CLAUDE_CMD
다음 파일들을 읽어줘:
  courses/$SELECTED_FOLDER/config/course_config.json
  courses/$SELECTED_FOLDER/config/MASTER_CONTEXT.md
  _templates/orchestrator.md

orchestrator.md에 설명된 오케스트레이터 역할을 맡아서
$SELECTED_NAME 과목의 강의 제작 워크플로우를 이어서 시작해줘.
CLAUDE_CMD
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 클립보드에 자동 복사 (macOS)
CLAUDE_COMMAND="다음 파일들을 읽어줘:
  courses/$SELECTED_FOLDER/config/course_config.json
  courses/$SELECTED_FOLDER/config/MASTER_CONTEXT.md
  _templates/orchestrator.md

orchestrator.md에 설명된 오케스트레이터 역할을 맡아서
$SELECTED_NAME 과목의 강의 제작 워크플로우를 이어서 시작해줘."

if command -v pbcopy &>/dev/null; then
  echo "$CLAUDE_COMMAND" | pbcopy
  echo -e "${GREEN}✅ 위 명령어가 클립보드에 자동 복사되었습니다!${NC}"
  echo -e "   Claude Code에서 그냥 ${BOLD}Ctrl+V${NC} (Mac: ${BOLD}Cmd+V${NC}) 하시면 됩니다."
elif command -v xclip &>/dev/null; then
  echo "$CLAUDE_COMMAND" | xclip -selection clipboard
  echo -e "${GREEN}✅ 위 명령어가 클립보드에 자동 복사되었습니다!${NC}"
fi

echo ""
echo -e "${CYAN}─────────────────────────────────────────────────────────${NC}"
echo -e "  다른 작업:"
echo -e "  새 과목 추가:     ${YELLOW}bash scripts/new_course.sh${NC}"
echo -e "  GitHub 동기화:    ${YELLOW}bash scripts/sync_github.sh${NC}"
echo -e "  교재 업로드:      ${YELLOW}bash scripts/upload_textbook.sh${NC}"
echo -e "${CYAN}─────────────────────────────────────────────────────────${NC}"
