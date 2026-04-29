#!/usr/bin/env bash
# =============================================================
# Professor Assistant — 완전한 교수 워크플로우 시스템
# SCREEN 1: 과목 선택
# SCREEN 2: 과목별 교수 작업 메뉴
# SCREEN 3: 새 과목 추가 마법사
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

get_course_code() {
  local COURSE_FOLDER="$1"
  local CONFIG="$COURSES_DIR/$COURSE_FOLDER/config/course_config.json"
  if [[ -f "$CONFIG" ]]; then
    CONFIG_REL="courses/$COURSE_FOLDER/config/course_config.json"
    python3 -c "import json; f=open('$CONFIG_REL', encoding='utf-8'); d=json.load(f); f.close(); print(d.get('course_code',''))" 2>/dev/null | tr -d '\r'
  fi
}

get_course_info() {
  local COURSE_FOLDER="$1"
  local CONFIG="$COURSES_DIR/$COURSE_FOLDER/config/course_config.json"
  if [[ -f "$CONFIG" ]]; then
    CONFIG_REL="courses/$COURSE_FOLDER/config/course_config.json"
    python3 << 'PYEOF' 2>/dev/null | tr -d '\r'
import json
try:
  with open('PLACEHOLDER', encoding='utf-8') as f:
    d = json.load(f)
    print(f"{d.get('course_name','Unknown')}|||{d.get('course_code','')}|||{d.get('semester','')}|||{d.get('delivery_language','')}|||{d.get('professor_name','')}")
except:
  print("Unknown|||||||")
PYEOF
    sed "s|PLACEHOLDER|$CONFIG_REL|" <<< "PLACEHOLDER" | python3 2>/dev/null | tr -d '\r'
  fi
}

get_assignment_count() {
  local COURSE_FOLDER="$1"
  local CONFIG="$COURSES_DIR/$COURSE_FOLDER/config/course_config.json"
  if [[ -f "$CONFIG" ]]; then
    CONFIG_REL="courses/$COURSE_FOLDER/config/course_config.json"
    python3 -c "import json; f=open('$CONFIG_REL', encoding='utf-8'); d=json.load(f); f.close(); print(d.get('assignment_count',0))" 2>/dev/null | tr -d '\r'
  else
    echo "0"
  fi
}

get_grading_policy() {
  local COURSE_FOLDER="$1"
  local CONFIG="$COURSES_DIR/$COURSE_FOLDER/config/course_config.json"
  if [[ -f "$CONFIG" ]]; then
    CONFIG_REL="courses/$COURSE_FOLDER/config/course_config.json"
    python3 << 'PYEOF' 2>/dev/null | tr -d '\r'
import json
try:
  with open('PLACEHOLDER', encoding='utf-8') as f:
    d = json.load(f)
    g = d.get('grading_policy', {})
    print(f"{g.get('attendance',0)}|||{g.get('midterm',0)}|||{g.get('final',0)}|||{g.get('assignments',0)}|||{g.get('attitude',0)}")
except:
  print("20|||30|||30|||10|||10")
PYEOF
    sed "s|PLACEHOLDER|$CONFIG_REL|" <<< "PLACEHOLDER" | python3 2>/dev/null | tr -d '\r'
  fi
}

find_next_incomplete_week() {
  local COURSE_FOLDER="$1"
  for week in $(seq -w 1 15); do
    WEEK_DIR="$COURSES_DIR/$COURSE_FOLDER/lectures/week$week"
    if [[ ! -f "$WEEK_DIR/session3.md" ]]; then
      echo "$week"
      return
    fi
  done
  echo "0"
}

count_completed_weeks() {
  local COURSE_FOLDER="$1"
  local COUNT=0
  for week in $(seq -w 1 15); do
    WEEK_DIR="$COURSES_DIR/$COURSE_FOLDER/lectures/week$week"
    if [[ -f "$WEEK_DIR/session3.md" ]]; then
      ((COUNT++))
    fi
  done
  echo "$COUNT"
}

count_completed_assignments() {
  local COURSE_FOLDER="$1"
  local COUNT=0
  if [[ -d "$COURSES_DIR/$COURSE_FOLDER/assignments" ]]; then
    COUNT=$(find "$COURSES_DIR/$COURSE_FOLDER/assignments" -name "assignment*.md" 2>/dev/null | wc -l)
  fi
  echo "$COUNT"
}

save_and_commit() {
  local COURSE_FOLDER="$1"
  local COMMIT_TYPE="${2:-save}"

  cd "$ROOT_DIR"
  STATUS=$(git status --short)

  if [[ -z "$STATUS" ]]; then
    echo -e "${GREEN}✅ 변경사항이 없습니다.${NC}"
    return 0
  fi

  COURSE_NAME=$(get_course_name "$COURSE_FOLDER")

  if [[ -n "$COURSE_FOLDER" && -d "$COURSES_DIR/$COURSE_FOLDER" ]]; then
    MASTER_CONTEXT="$COURSES_DIR/$COURSE_FOLDER/config/MASTER_CONTEXT.md"
    if [[ -f "$MASTER_CONTEXT" ]]; then
      TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
      sed -i "s/last_updated: .*/last_updated: $TIMESTAMP/" "$MASTER_CONTEXT"
    fi
  fi

  TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
  COMMIT_MSG="save: 수동 저장 $TIMESTAMP - $COURSE_NAME"

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

  local SYLLABUS_STAT="⏳"
  local MIDTERM_STAT="⏳"
  local FINAL_STAT="⏳"
  local ASSIGN_STAT="⏳"

  [[ -f "$COURSES_DIR/$SELECTED_FOLDER/syllabus/syllabus.md" ]] && SYLLABUS_STAT="✅"
  [[ -f "$COURSES_DIR/$SELECTED_FOLDER/exams/midterm_student.md" ]] && MIDTERM_STAT="✅"
  [[ -f "$COURSES_DIR/$SELECTED_FOLDER/exams/final_student.md" ]] && FINAL_STAT="✅"
  [[ -f "$COURSES_DIR/$SELECTED_FOLDER/assignments/assignment1.md" ]] && ASSIGN_STAT="✅"

  local LECTURE_COUNT=$(count_completed_weeks "$SELECTED_FOLDER")

  echo -e "  진행 현황:"
  echo -e "  $SYLLABUS_STAT 강의계획서"

  if [[ $LECTURE_COUNT -gt 0 ]]; then
    echo -ne "  "
    for ((i=1; i<=LECTURE_COUNT; i++)); do
      printf "%2d주차 " "$i"
    done
    echo ""
  fi

  if [[ $LECTURE_COUNT -lt 15 ]]; then
    echo -e "  ⏳ $((LECTURE_COUNT+1))주차 이후 강의안"
  fi

  echo -e "  $MIDTERM_STAT 중간고사 / $FINAL_STAT 기말고사"
  echo -e "  $ASSIGN_STAT 과제물 / 과제 평가"
}

show_course_action_menu() {
  local SELECTED_FOLDER="$1"
  local SELECTED_NAME="$2"
  local COURSE_CODE="$3"
  local SEMESTER="$4"
  local LANG="$5"
  local PROFESSOR="$6"

  clear
  echo -e "${BLUE}${BOLD}"
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║  📖 $SELECTED_NAME ($COURSE_CODE)                      ║"
  printf "║  학기: %s | 언어: %s | 교수: %s" "$SEMESTER" "$LANG" "$PROFESSOR"
  echo ""
  echo "╠════════════════════════════════════════════════════════╣"
  echo -e "${NC}"

  show_progress "$SELECTED_FOLDER"

  echo -e "${BLUE}${BOLD}"
  echo "╠════════════════════════════════════════════════════════╣"
  echo "║  📝 강의 제작                                           ║"
  echo "║  [1] 강의안 계속 제작 (다음 주차 자동 감지)              ║"
  echo "║  [2] 특정 주차 강의안 제작                               ║"
  echo "╠════════════════════════════════════════════════════════╣"
  echo "║  📋 시험 관리                                           ║"
  echo "║  [3] 중간고사 문제 제작                                  ║"
  echo "║  [4] 기말고사 문제 제작                                  ║"
  echo "║  [5] 시험 답안 채점 기준 보기                            ║"
  echo "╠════════════════════════════════════════════════════════╣"
  echo "║  📌 과제 관리                                           ║"
  echo "║  [6] 과제물 제작                                        ║"
  echo "║  [7] 과제 평가 루브릭 보기/수정                          ║"
  echo "║  [8] 과제 제출 현황 관리                                 ║"
  echo "╠════════════════════════════════════════════════════════╣"
  echo "║  ⚙️  기타                                               ║"
  echo "║  [9] 강의계획서 보기/수정                                ║"
  echo "║  [0] 성적 처리                                          ║"
  echo "║  [S] 지금 즉시 저장 (GitHub push)                       ║"
  echo "║  [B] 이전 메뉴 (과목 목록으로)                           ║"
  echo "║  [Q] 종료 (자동 저장)                                    ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

show_claude_command() {
  local TITLE="$1"
  local COMMAND="$2"

  clear
  echo -e "${CYAN}${BOLD}"
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║  $TITLE"
  echo "╚════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo ""
  echo -e "${YELLOW}Claude Code에 붙여넣으세요:${NC}"
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "$COMMAND"
  echo ""
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e -n "${YELLOW}메뉴로 돌아가려면 Enter를 누르세요: ${NC}"
  read
}

# ─────────────────────────────────────────
# SCREEN 1: 초기화 및 과목 선택
# ─────────────────────────────────────────

clear
echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║         PROFESSOR ASSISTANT                           ║"
echo "║         시작 중...                                    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

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

COURSE_COUNT=$(find "$COURSES_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')

if [[ $COURSE_COUNT -eq 0 ]]; then
  echo -e "${YELLOW}등록된 과목이 없습니다.${NC}"
  exit 0
fi

# ─────────────────────────────────────────
# 메인 루프
# ─────────────────────────────────────────

while true; do
  # SCREEN 1: 과목 선택
  clear
  echo -e "${CYAN}${BOLD}"
  echo "╔══════════════════════════════════════════════════════╗"
  echo "║         과목 선택 — SCREEN 1                          ║"
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
  echo -e "  ${CYAN}[N] 새 과목 추가${NC}"
  echo -e "  ${CYAN}[Q] 종료${NC}"
  echo ""
  echo -e -n "${YELLOW}과목을 선택하세요 (1-$((${#COURSE_FOLDERS[@]})), N, Q): ${NC}"
  read CHOICE

  CHOICE=$(echo "$CHOICE" | tr '[:lower:]' '[:upper:]')

  if [[ "$CHOICE" == "Q" ]]; then
    echo ""
    echo -e "${CYAN}${BOLD}──────────────────────────────────────────────────────${NC}"
    echo -e "${YELLOW}🔄 작업을 종료하고 변경사항을 저장 중입니다...${NC}"
    echo -e "${CYAN}${BOLD}──────────────────────────────────────────────────────${NC}"
    echo ""

    STATUS=$(git status --short)
    if [[ -z "$STATUS" ]]; then
      echo -e "${GREEN}✅ 변경사항이 없습니다.${NC}"
    else
      cd "$ROOT_DIR"
      git add -A
      COURSE_NAME="Professor Assistant"
      TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
      git commit -m "save: 작업 종료 저장 $TIMESTAMP" --quiet
      git push origin main 2>/dev/null
      echo -e "${GREEN}✅ 저장 완료! GitHub에 업로드되었습니다.${NC}"
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
  fi

  if [[ "$CHOICE" == "N" ]]; then
    # SCREEN 3: 새 과목 추가 마법사
    clear
    echo -e "${CYAN}${BOLD}"
    echo "╔══════════════════════════════════╗"
    echo "║  새 과목 추가 - 수업 언어 선택    ║"
    echo "╠══════════════════════════════════╣"
    echo "║  [1] 한국어                      ║"
    echo "║  [2] English                     ║"
    echo "║  [3] 日本語                      ║"
    echo "║  [4] 中文                       ║"
    echo "║  [5] Español                     ║"
    echo "║  [6] Français                    ║"
    echo "║  [7] 기타 (직접 입력)             ║"
    echo "║  [B] 이전  [Q] 종료              ║"
    echo "╚══════════════════════════════════╝"
    echo -e "${NC}"

    echo -e -n "${YELLOW}선택하세요 (1-7, B, Q): ${NC}"
    read LANG_CHOICE

    LANG_CHOICE=$(echo "$LANG_CHOICE" | tr '[:lower:]' '[:upper:]')

    if [[ "$LANG_CHOICE" == "Q" ]]; then
      exit 0
    fi

    if [[ "$LANG_CHOICE" == "B" ]]; then
      continue
    fi

    case "$LANG_CHOICE" in
      1) DELIVERY_LANG="Korean" ;;
      2) DELIVERY_LANG="English" ;;
      3) DELIVERY_LANG="Japanese" ;;
      4) DELIVERY_LANG="Chinese" ;;
      5) DELIVERY_LANG="Spanish" ;;
      6) DELIVERY_LANG="French" ;;
      7)
        echo -e -n "${YELLOW}언어를 입력하세요: ${NC}"
        read DELIVERY_LANG
        ;;
      *)
        echo -e "${RED}잘못된 선택입니다.${NC}"
        sleep 1
        continue
        ;;
    esac

    # 과목 정보 입력
    echo -e -n "${YELLOW}과목명을 입력하세요 (B=이전, Q=종료): ${NC}"
    read COURSE_NAME_INPUT
    COURSE_NAME_INPUT=$(echo "$COURSE_NAME_INPUT" | tr '[:lower:]' '[:upper:]')
    if [[ "$COURSE_NAME_INPUT" == "Q" ]]; then
      exit 0
    fi
    if [[ "$COURSE_NAME_INPUT" == "B" ]]; then
      continue
    fi

    echo -e -n "${YELLOW}과목코드를 입력하세요 (예: CS101): ${NC}"
    read COURSE_CODE_INPUT

    echo -e -n "${YELLOW}학기를 입력하세요 (예: 2026-Fall): ${NC}"
    read SEMESTER_INPUT

    echo -e -n "${YELLOW}교수 이름을 입력하세요: ${NC}"
    read PROFESSOR_INPUT

    echo -e -n "${YELLOW}수강 인원을 입력하세요: ${NC}"
    read STUDENT_COUNT_INPUT

    # 새 과목 폴더 생성
    COURSE_FOLDER="${COURSE_CODE_INPUT}_${COURSE_NAME_INPUT// /_}_${SEMESTER_INPUT//-/_}"
    COURSE_FOLDER=$(echo "$COURSE_FOLDER" | tr '[:upper:]' '[:lower:]' | sed 's/__/_/g')

    mkdir -p "$COURSES_DIR/$COURSE_FOLDER"/{textbook,syllabus,lectures,exams,assignments,config}

    # course_config.json 생성
    cat > "$COURSES_DIR/$COURSE_FOLDER/config/course_config.json" << EOF
{
  "course_name": "$COURSE_NAME_INPUT",
  "course_code": "$COURSE_CODE_INPUT",
  "semester": "$SEMESTER_INPUT",
  "academic_level": "Undergraduate",
  "student_count": "$STUDENT_COUNT_INPUT",
  "professor_name": "$PROFESSOR_INPUT",
  "delivery_language": "$DELIVERY_LANG",
  "language_code": "en",
  "course_folder": "$COURSE_FOLDER",
  "grading_policy": {
    "attendance": 20,
    "midterm": 30,
    "final": 30,
    "assignments": 10,
    "attitude": 10,
    "total": 100
  },
  "assignment_count": 3,
  "created_at": "$(date +"%Y-%m-%dT%H:%M:%SZ")",
  "last_updated": "$(date +"%Y-%m-%dT%H:%M:%SZ")",
  "status": {
    "syllabus": "pending",
    "lectures_completed": [],
    "midterm": "pending",
    "final": "pending",
    "assignments_completed": []
  }
}
EOF

    # MASTER_CONTEXT.md 생성
    cat > "$COURSES_DIR/$COURSE_FOLDER/config/MASTER_CONTEXT.md" << EOF
# MASTER CONTEXT — $COURSE_NAME_INPUT ($COURSE_CODE_INPUT)

## Course Information
- Course Name: $COURSE_NAME_INPUT
- Course Code: $COURSE_CODE_INPUT
- Semester: $SEMESTER_INPUT
- Professor: $PROFESSOR_INPUT
- Student Count: $STUDENT_COUNT_INPUT
- Delivery Language: $DELIVERY_LANG

## Status
- Syllabus: pending
- Lectures: 0/15 weeks complete
- Midterm Exam: pending
- Final Exam: pending
- Assignments: 0/3 complete

## Last Updated
last_updated: $(date +"%Y-%m-%d %H:%M:%S")
EOF

    # Git에 추가
    cd "$ROOT_DIR"
    git add -A
    git commit -m "feat: Add new course $COURSE_NAME_INPUT" --quiet
    git push origin main 2>/dev/null

    echo -e "${GREEN}✅ 새 과목 '$COURSE_NAME_INPUT'이 생성되었습니다!${NC}"
    sleep 2
    continue
  fi

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

  # SCREEN 2 정보 가져오기
  COURSE_CODE=$(get_course_code "$SELECTED_FOLDER")
  CONFIG_REL="courses/$SELECTED_FOLDER/config/course_config.json"
  COURSE_INFO=$(python3 << 'PYEOF' 2>/dev/null | tr -d '\r'
import json
try:
  with open('PLACEHOLDER', encoding='utf-8') as f:
    d = json.load(f)
    semester = d.get('semester','')
    lang = d.get('delivery_language','')
    prof = d.get('professor_name','')
    print(f"{semester}|||{lang}|||{prof}")
except:
  print("|||")
PYEOF
  )
  sed -i "s|PLACEHOLDER|$CONFIG_REL|" <<< "PLACEHOLDER" 2>/dev/null

  SEMESTER=$(echo "$COURSE_INFO" | cut -d'|' -f1)
  DELIVERY_LANG=$(echo "$COURSE_INFO" | cut -d'|' -f2)
  PROFESSOR=$(echo "$COURSE_INFO" | cut -d'|' -f3)

  # SCREEN 2: 과목별 교수 작업 메뉴
  while true; do
    show_course_action_menu "$SELECTED_FOLDER" "$SELECTED_NAME" "$COURSE_CODE" "$SEMESTER" "$DELIVERY_LANG" "$PROFESSOR"

    echo -e -n "${YELLOW}선택하세요 (0-9, S, B, Q): ${NC}"
    read MENU_CHOICE

    MENU_CHOICE=$(echo "$MENU_CHOICE" | tr '[:lower:]' '[:upper:]')

    case "$MENU_CHOICE" in
      1)
        # 강의안 계속 제작
        NEXT_WEEK=$(find_next_incomplete_week "$SELECTED_FOLDER")
        if [[ "$NEXT_WEEK" == "0" ]]; then
          echo -e "${GREEN}✅ 모든 주차 강의안이 완성되었습니다!${NC}"
          sleep 2
        else
          CLAUDE_CMD="다음 파일들을 읽어줘:
  courses/$SELECTED_FOLDER/config/course_config.json
  courses/$SELECTED_FOLDER/config/MASTER_CONTEXT.md
  _templates/lecture_agent.md

${NEXT_WEEK}주차 강의안 3개 세션을 모두 작성해줘.
각 세션은 50분 분량으로 작성하고
영어 스크립트, 한국어 번역, PPT 슬라이드 내용을 모두 포함해줘."
          show_claude_command "강의안 계속 제작 (${NEXT_WEEK}주차)" "$CLAUDE_CMD"
        fi
        ;;

      2)
        # 특정 주차 강의안 제작
        echo -e -n "${YELLOW}몇 주차 강의안을 제작할까요? (1-15, B=이전): ${NC}"
        read WEEK_CHOICE
        WEEK_CHOICE=$(echo "$WEEK_CHOICE" | tr '[:lower:]' '[:upper:]')

        if [[ "$WEEK_CHOICE" == "B" ]]; then
          continue
        fi

        if [[ "$WEEK_CHOICE" =~ ^[0-9]+$ && "$WEEK_CHOICE" -ge 1 && "$WEEK_CHOICE" -le 15 ]]; then
          CLAUDE_CMD="다음 파일들을 읽어줘:
  courses/$SELECTED_FOLDER/config/course_config.json
  courses/$SELECTED_FOLDER/config/MASTER_CONTEXT.md
  _templates/lecture_agent.md

$(printf "%02d" $WEEK_CHOICE)주차 강의안 3개 세션을 모두 작성해줘.
각 세션은 50분 분량으로 작성하고
영어 스크립트, 한국어 번역, PPT 슬라이드 내용을 모두 포함해줘."
          show_claude_command "특정 주차 강의안 제작 ($(printf "%02d" $WEEK_CHOICE)주차)" "$CLAUDE_CMD"
        else
          echo -e "${RED}잘못된 입력입니다.${NC}"
          sleep 1
        fi
        ;;

      3)
        # 중간고사 문제 제작
        if [[ -f "$COURSES_DIR/$SELECTED_FOLDER/exams/midterm_student.md" ]]; then
          echo -e -n "${YELLOW}중간고사가 이미 있습니다. 덮어쓸까요? (y/n): ${NC}"
          read OVERWRITE
          if [[ "$OVERWRITE" != "y" && "$OVERWRITE" != "Y" ]]; then
            sleep 1
            continue
          fi
        fi

        CLAUDE_CMD="다음 파일들을 읽어줘:
  courses/$SELECTED_FOLDER/config/course_config.json
  courses/$SELECTED_FOLDER/syllabus/syllabus.md
  _templates/exam_agent.md

중간고사 시험 문제를 작성해줘.
시험 범위: 1-6주차
시험 시간: 75분, 100점 만점
학생용 시험지와 답안지를 모두 작성해줘."
        show_claude_command "중간고사 문제 제작" "$CLAUDE_CMD"
        ;;

      4)
        # 기말고사 문제 제작
        if [[ -f "$COURSES_DIR/$SELECTED_FOLDER/exams/final_student.md" ]]; then
          echo -e -n "${YELLOW}기말고사가 이미 있습니다. 덮어쓸까요? (y/n): ${NC}"
          read OVERWRITE
          if [[ "$OVERWRITE" != "y" && "$OVERWRITE" != "Y" ]]; then
            sleep 1
            continue
          fi
        fi

        CLAUDE_CMD="다음 파일들을 읽어줘:
  courses/$SELECTED_FOLDER/config/course_config.json
  courses/$SELECTED_FOLDER/syllabus/syllabus.md
  _templates/exam_agent.md

기말고사 시험 문제를 작성해줘.
시험 범위: 8-14주차
시험 시간: 90분, 100점 만점
학생용 시험지와 답안지를 모두 작성해줘."
        show_claude_command "기말고사 문제 제작" "$CLAUDE_CMD"
        ;;

      5)
        # 시험 답안 채점 기준 보기
        if [[ -f "$COURSES_DIR/$SELECTED_FOLDER/exams/midterm_answer_key.md" || -f "$COURSES_DIR/$SELECTED_FOLDER/exams/final_answer_key.md" ]]; then
          clear
          echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
          if [[ -f "$COURSES_DIR/$SELECTED_FOLDER/exams/midterm_answer_key.md" ]]; then
            echo -e "${YELLOW}📋 중간고사 채점 기준:${NC}"
            head -30 "$COURSES_DIR/$SELECTED_FOLDER/exams/midterm_answer_key.md"
          fi
          if [[ -f "$COURSES_DIR/$SELECTED_FOLDER/exams/final_answer_key.md" ]]; then
            echo ""
            echo -e "${YELLOW}📋 기말고사 채점 기준:${NC}"
            head -30 "$COURSES_DIR/$SELECTED_FOLDER/exams/final_answer_key.md"
          fi
          echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
          echo ""
          echo -e -n "${YELLOW}메뉴로 돌아가려면 Enter를 누르세요: ${NC}"
          read
        else
          echo -e "${YELLOW}아직 시험이 제작되지 않았습니다.${NC}"
          sleep 2
        fi
        ;;

      6)
        # 과제물 제작
        ASSIGN_COUNT=$(get_assignment_count "$SELECTED_FOLDER")
        ASSIGN_DONE=$(count_completed_assignments "$SELECTED_FOLDER")

        echo -e "${CYAN}총 $ASSIGN_COUNT개 과제 중 $ASSIGN_DONE개 완성${NC}"
        echo -e -n "${YELLOW}몇 번 과제를 제작할까요? (1-$ASSIGN_COUNT, B=이전): ${NC}"
        read ASSIGN_NUM
        ASSIGN_NUM=$(echo "$ASSIGN_NUM" | tr '[:lower:]' '[:upper:]')

        if [[ "$ASSIGN_NUM" == "B" ]]; then
          continue
        fi

        if [[ "$ASSIGN_NUM" =~ ^[0-9]+$ && "$ASSIGN_NUM" -ge 1 && "$ASSIGN_NUM" -le "$ASSIGN_COUNT" ]]; then
          CLAUDE_CMD="다음 파일들을 읽어줘:
  courses/$SELECTED_FOLDER/config/course_config.json
  courses/$SELECTED_FOLDER/syllabus/syllabus.md
  _templates/assignment_agent.md

$ASSIGN_NUM번 과제물을 작성해줘.
course_config.json의 assignment_type, real_world_applications,
top_3_outcomes를 반영해서 작성해줘."
          show_claude_command "과제물 제작 ($ASSIGN_NUM번)" "$CLAUDE_CMD"
        fi
        ;;

      7)
        # 과제 평가 루브릭
        echo -e "${YELLOW}과제 평가 루브릭 기능${NC}"
        sleep 2
        ;;

      8)
        # 과제 제출 현황 관리
        echo -e "${YELLOW}과제 제출 현황 관리 기능${NC}"
        sleep 2
        ;;

      9)
        # 강의계획서 보기/수정
        if [[ -f "$COURSES_DIR/$SELECTED_FOLDER/syllabus/syllabus.md" ]]; then
          clear
          head -50 "$COURSES_DIR/$SELECTED_FOLDER/syllabus/syllabus.md"
          echo ""
          echo -e "${CYAN}[1] 전체 보기  [2] Claude Code로 수정  [B] 이전${NC}"
          echo -e -n "${YELLOW}선택하세요: ${NC}"
          read SYLL_CHOICE
        else
          CLAUDE_CMD="다음 파일들을 읽어줘:
  courses/$SELECTED_FOLDER/config/course_config.json
  _templates/syllabus_agent.md

15주 강의계획서를 작성해줘.
성적 배분: 출석20점, 중간고사30점, 기말고사30점, 과제10점, 태도10점"
          show_claude_command "강의계획서 작성" "$CLAUDE_CMD"
        fi
        ;;

      0)
        # 성적 처리
        GRADING=$(get_grading_policy "$SELECTED_FOLDER")
        ATT=$(echo "$GRADING" | cut -d'|' -f1)
        MID=$(echo "$GRADING" | cut -d'|' -f2)
        FIN=$(echo "$GRADING" | cut -d'|' -f3)
        ASN=$(echo "$GRADING" | cut -d'|' -f4)
        ATT_SCORE=$(echo "$GRADING" | cut -d'|' -f5)

        echo -e "${CYAN}성적 배분:${NC}"
        echo -e "  출석: $ATT점 | 중간고사: $MID점 | 기말고사: $FIN점 | 과제: $ASN점 | 태도: $ATT_SCORE점"
        sleep 3
        ;;

      S)
        # 즉시 저장
        echo ""
        echo -e "${YELLOW}💾 변경사항을 저장 중입니다...${NC}"
        save_and_commit "$SELECTED_FOLDER"
        echo ""
        echo -e -n "${YELLOW}메뉴로 돌아가려면 Enter를 누르세요: ${NC}"
        read
        ;;

      B)
        # 이전 메뉴
        break
        ;;

      Q)
        # 종료
        echo ""
        echo -e "${CYAN}${BOLD}──────────────────────────────────────────────────────${NC}"
        echo -e "${YELLOW}🔄 작업을 종료하고 변경사항을 저장 중입니다...${NC}"
        echo -e "${CYAN}${BOLD}──────────────────────────────────────────────────────${NC}"
        echo ""

        STATUS=$(git status --short)
        if [[ -z "$STATUS" ]]; then
          echo -e "${GREEN}✅ 변경사항이 없습니다.${NC}"
        else
          cd "$ROOT_DIR"
          git add -A
          TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
          git commit -m "save: 작업 종료 저장 $TIMESTAMP - $SELECTED_NAME" --quiet
          git push origin main 2>/dev/null
          echo -e "${GREEN}✅ 저장 완료! GitHub에 업로드되었습니다.${NC}"
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
        ;;
    esac
  done
done
