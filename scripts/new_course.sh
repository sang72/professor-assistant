#!/usr/bin/env bash
# =============================================================
# Professor Assistant — New Course Creation Script
# =============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

print_banner() {
  echo -e "${CYAN}${BOLD}"
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║                                                          ║"
  echo "║   ██████╗ ██████╗  ██████╗ ███████╗███████╗███████╗    ║"
  echo "║   ██╔══██╗██╔══██╗██╔═══██╗██╔════╝██╔════╝██╔════╝    ║"
  echo "║   ██████╔╝██████╔╝██║   ██║█████╗  ███████╗███████╗    ║"
  echo "║   ██╔═══╝ ██╔══██╗██║   ██║██╔══╝  ╚════██║╚════██║    ║"
  echo "║   ██║     ██║  ██║╚██████╔╝██║     ███████║███████║    ║"
  echo "║   ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚══════╝╚══════╝    ║"
  echo "║                                                          ║"
  echo "║          PROFESSOR ASSISTANT — NEW COURSE                ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

spinner() {
  local pid=$1
  local delay=0.1
  local spinstr='|/-\'
  while ps -p "$pid" > /dev/null 2>&1; do
    local temp=${spinstr#?}
    printf " [%c] " "$spinstr"
    spinstr=$temp${spinstr%"$temp"}
    sleep $delay
    printf "\b\b\b\b\b"
  done
  printf "    \b\b\b\b"
}

sanitize_name() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/_/g' | sed 's/__*/_/g' | sed 's/^_//;s/_$//' | cut -c1-40
}

collect_info() {
  print_banner

  echo -e "${BOLD}[STEP 1/4] Course Language${NC}"
  echo -e "${CYAN}─────────────────────────────────────${NC}"
  echo "What language will this course be taught in?"
  echo ""
  echo "  1) 한국어 (Korean)"
  echo "  2) English"
  echo "  3) 日本語 (Japanese)"
  echo "  4) 中文 (Chinese)"
  echo "  5) Español (Spanish)"
  echo "  6) Français (French)"
  echo "  7) Other (specify)"
  echo ""
  while true; do
    echo -e -n "${YELLOW}Enter number (1-7): ${NC}"
    read LANG_CHOICE
    case $LANG_CHOICE in
      1) COURSE_LANGUAGE="Korean"; LANG_CODE="ko"; break;;
      2) COURSE_LANGUAGE="English"; LANG_CODE="en"; break;;
      3) COURSE_LANGUAGE="Japanese"; LANG_CODE="ja"; break;;
      4) COURSE_LANGUAGE="Chinese"; LANG_CODE="zh"; break;;
      5) COURSE_LANGUAGE="Spanish"; LANG_CODE="es"; break;;
      6) COURSE_LANGUAGE="French"; LANG_CODE="fr"; break;;
      7) echo -e -n "${YELLOW}Enter language name: ${NC}"; read COURSE_LANGUAGE; LANG_CODE="other"; break;;
      *) echo -e "${RED}Invalid choice. Please enter 1-7.${NC}";;
    esac
  done
  echo -e "${GREEN}✓ Language: $COURSE_LANGUAGE${NC}"
  echo ""

  echo -e "${BOLD}[STEP 2/4] Course Information${NC}"
  echo -e "${CYAN}─────────────────────────────────────${NC}"
  echo -e -n "${YELLOW}Course name: ${NC}"; read COURSE_NAME
  echo -e -n "${YELLOW}Course code (e.g. ENG101): ${NC}"; read COURSE_CODE
  echo -e -n "${YELLOW}Semester (e.g. 2026-Spring): ${NC}"; read SEMESTER
  echo ""
  echo "Academic level:"
  echo "  1) Undergraduate Year 1-2"
  echo "  2) Undergraduate Year 3-4"
  echo "  3) Graduate"
  while true; do
    echo -e -n "${YELLOW}Enter number (1-3): ${NC}"
    read LEVEL_CHOICE
    case $LEVEL_CHOICE in
      1) LEVEL="Undergraduate Year 1-2"; break;;
      2) LEVEL="Undergraduate Year 3-4"; break;;
      3) LEVEL="Graduate"; break;;
      *) echo -e "${RED}Invalid choice.${NC}";;
    esac
  done
  echo -e -n "${YELLOW}Expected number of students: ${NC}"; read STUDENT_COUNT
  echo -e -n "${YELLOW}Professor name: ${NC}"; read PROF_NAME
  echo ""

  echo -e "${BOLD}[STEP 3/4] Textbook Upload${NC}"
  echo -e "${CYAN}─────────────────────────────────────${NC}"
  echo -e "Place your textbook (PDF or TXT) in:"
  echo -e "${CYAN}  $ROOT_DIR${NC}"
  echo ""
  while true; do
    echo -e -n "${YELLOW}Textbook filename (or 'skip'): ${NC}"
    read TEXTBOOK_INPUT
    if [[ "$TEXTBOOK_INPUT" == "skip" ]]; then
      TEXTBOOK_PATH="none"
      break
    fi
    FULL_TEXTBOOK_PATH="$ROOT_DIR/$TEXTBOOK_INPUT"
    if [[ -f "$FULL_TEXTBOOK_PATH" ]]; then
      TEXTBOOK_PATH="$TEXTBOOK_INPUT"
      echo -e "${GREEN}✓ Textbook found: $TEXTBOOK_INPUT${NC}"
      break
    else
      echo -e "${RED}✗ File not found: $FULL_TEXTBOOK_PATH${NC}"
      echo -e "  Please place the file in: ${CYAN}$ROOT_DIR${NC}"
    fi
  done
  echo ""

  COURSE_NAME_SAFE=$(sanitize_name "$COURSE_NAME")
  COURSE_CODE_SAFE=$(sanitize_name "$COURSE_CODE")
  SEMESTER_SAFE=$(sanitize_name "$SEMESTER")
  COURSE_FOLDER="${COURSE_CODE_SAFE}_${COURSE_NAME_SAFE}_${SEMESTER_SAFE}"

  echo -e "${BOLD}[STEP 4/4] Confirmation${NC}"
  echo -e "${CYAN}─────────────────────────────────────${NC}"
  echo -e "${BOLD}┌──────────────────────────────────────────┐${NC}"
  echo -e "${BOLD}│           COURSE SUMMARY                 │${NC}"
  echo -e "${BOLD}├──────────────────────────────────────────┤${NC}"
  printf "│ %-12s: %-27s │\n" "Language"  "$COURSE_LANGUAGE"
  printf "│ %-12s: %-27s │\n" "Course"    "$COURSE_NAME"
  printf "│ %-12s: %-27s │\n" "Code"      "$COURSE_CODE"
  printf "│ %-12s: %-27s │\n" "Semester"  "$SEMESTER"
  printf "│ %-12s: %-27s │\n" "Level"     "$LEVEL"
  printf "│ %-12s: %-27s │\n" "Students"  "$STUDENT_COUNT"
  printf "│ %-12s: %-27s │\n" "Professor" "$PROF_NAME"
  printf "│ %-12s: %-27s │\n" "Textbook"  "$TEXTBOOK_PATH"
  printf "│ %-12s: %-27s │\n" "Folder"    "$COURSE_FOLDER"
  echo -e "${BOLD}└──────────────────────────────────────────┘${NC}"
  echo ""
  echo -e -n "${YELLOW}Is this correct? (y/n): ${NC}"
  read CONFIRM
  if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo -e "${YELLOW}Restarting...${NC}"
    collect_info
  fi
}

collect_info

COURSE_DIR="$ROOT_DIR/courses/$COURSE_FOLDER"

echo ""
echo -e "${BOLD}Creating course structure...${NC}"
mkdir -p "$COURSE_DIR"/{textbook,syllabus,lectures,exams,assignments,config}
echo -e "${GREEN}✓ Directory structure created${NC}"

if [[ "$TEXTBOOK_PATH" != "none" ]]; then
  cp "$ROOT_DIR/$TEXTBOOK_PATH" "$COURSE_DIR/textbook/"
  echo -e "${GREEN}✓ Textbook copied to course folder${NC}"
fi

CREATED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > "$COURSE_DIR/config/course_config.json" <<EOF
{
  "course_name": "$COURSE_NAME",
  "course_code": "$COURSE_CODE",
  "semester": "$SEMESTER",
  "academic_level": "$LEVEL",
  "student_count": "$STUDENT_COUNT",
  "professor_name": "$PROF_NAME",
  "delivery_language": "$COURSE_LANGUAGE",
  "language_code": "$LANG_CODE",
  "course_folder": "$COURSE_FOLDER",
  "textbook_filename": "$TEXTBOOK_PATH",
  "textbook_path": "courses/$COURSE_FOLDER/textbook/$TEXTBOOK_PATH",
  "textbook_extracted_path": "courses/$COURSE_FOLDER/textbook/textbook_extracted.txt",
  "grading_policy": {
    "attendance": 20,
    "midterm": 30,
    "final": 30,
    "assignments": 10,
    "attitude": 10,
    "total": 100
  },
  "skip_chapters": [],
  "emphasized_chapters": [],
  "top_3_outcomes": [],
  "lecture_style": "",
  "exam_question_types": "",
  "assignment_type": "",
  "real_world_applications": "",
  "assignment_count": 0,
  "script_detail_level": "",
  "professor_language_proficiency": "",
  "created_at": "$CREATED_AT",
  "last_updated": "$CREATED_AT",
  "status": {
    "syllabus": "pending",
    "lectures_completed": [],
    "midterm": "pending",
    "final": "pending",
    "assignments_completed": []
  }
}
EOF
echo -e "${GREEN}✓ course_config.json created${NC}"

cat > "$COURSE_DIR/config/README.md" <<EOF
# $COURSE_NAME ($COURSE_CODE)

| Field | Value |
|-------|-------|
| Semester | $SEMESTER |
| Language | $COURSE_LANGUAGE |
| Level | $LEVEL |
| Students | $STUDENT_COUNT |
| Professor | $PROF_NAME |

## Course Structure
- \`textbook/\` — Uploaded textbook files
- \`syllabus/\` — Course syllabus and grading policy
- \`lectures/\` — Weekly lecture plans and scripts
- \`exams/\` — Midterm and final exams
- \`assignments/\` — Assignment documents
- \`config/\` — Configuration and session logs

## Grading Policy
| Component | Points |
|-----------|--------|
| Attendance | 20 |
| Midterm Exam | 30 |
| Final Exam | 30 |
| Assignments | 10 |
| Attitude | 10 |
| **Total** | **100** |

## Session Log
See \`config/MASTER_CONTEXT.md\` for work progress tracking.
EOF
echo -e "${GREEN}✓ README.md created${NC}"

cat > "$COURSE_DIR/config/MASTER_CONTEXT.md" <<EOF
# MASTER CONTEXT — $COURSE_NAME
Last Updated: $CREATED_AT

## Course Identity
- Name: $COURSE_NAME
- Code: $COURSE_CODE
- Language: $COURSE_LANGUAGE
- Semester: $SEMESTER
- Professor: $PROF_NAME
- Textbook: $TEXTBOOK_PATH

## Agent Configuration
See course_config.json for full COURSE_CONFIG.

## Content Generation Status
| Item | Status | File Path | Notes |
|------|--------|-----------|-------|
| Syllabus | ⏳ Pending | syllabus/syllabus.md | |
| Grading Policy | ⏳ Pending | syllabus/grading_policy.md | |
| Week 01 Lecture | ⏳ Pending | lectures/week01/ | |
| Week 02 Lecture | ⏳ Pending | lectures/week02/ | |
| Week 03 Lecture | ⏳ Pending | lectures/week03/ | |
| Week 04 Lecture | ⏳ Pending | lectures/week04/ | |
| Week 05 Lecture | ⏳ Pending | lectures/week05/ | |
| Week 06 Lecture | ⏳ Pending | lectures/week06/ | |
| Week 07 Midterm Review | ⏳ Pending | lectures/week07/ | |
| Week 08 Lecture | ⏳ Pending | lectures/week08/ | |
| Week 09 Lecture | ⏳ Pending | lectures/week09/ | |
| Week 10 Lecture | ⏳ Pending | lectures/week10/ | |
| Week 11 Lecture | ⏳ Pending | lectures/week11/ | |
| Week 12 Lecture | ⏳ Pending | lectures/week12/ | |
| Week 13 Lecture | ⏳ Pending | lectures/week13/ | |
| Week 14 Lecture | ⏳ Pending | lectures/week14/ | |
| Week 15 Final Review | ⏳ Pending | lectures/week15/ | |
| Midterm Exam | ⏳ Pending | exams/midterm_student.md | |
| Midterm Answer Key | ⏳ Pending | exams/midterm_answer_key.md | |
| Final Exam | ⏳ Pending | exams/final_student.md | |
| Final Answer Key | ⏳ Pending | exams/final_answer_key.md | |
| Assignment 1 | ⏳ Pending | assignments/assignment1.md | |
| Assignment 2 | ⏳ Pending | assignments/assignment2.md | |
| Assignment 3 | ⏳ Pending | assignments/assignment3.md | |

## Key Decisions & Customizations
_To be filled during Orchestrator interview_

## Next Session TODO
1. Run Orchestrator interview (Group B, C, D questions)
2. Generate Syllabus
3. Begin Week 01 Lectures
EOF
echo -e "${GREEN}✓ MASTER_CONTEXT.md created${NC}"

touch "$COURSE_DIR/textbook/.gitkeep"
touch "$COURSE_DIR/syllabus/.gitkeep"
touch "$COURSE_DIR/lectures/.gitkeep"
touch "$COURSE_DIR/exams/.gitkeep"
touch "$COURSE_DIR/assignments/.gitkeep"

cd "$ROOT_DIR"
git add -A
git commit -m "feat: Initialize course $COURSE_CODE - $COURSE_NAME ($SEMESTER)"
echo -e "${GREEN}✓ Changes committed${NC}"

echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push origin main && echo -e "${GREEN}✓ Pushed to GitHub${NC}" || echo -e "${RED}✗ Push failed. Run: git push origin main${NC}"

echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║           ✅ COURSE CREATED SUCCESSFULLY!                ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Course folder:${NC} ${CYAN}courses/$COURSE_FOLDER/${NC}"
echo ""
echo -e "${BOLD}Next step — paste this into Claude Code:${NC}"
echo ""
echo -e "${YELLOW}┌──────────────────────────────────────────────────────────┐${NC}"
echo -e "${YELLOW}│${NC} Read the following files:                              ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC}   courses/$COURSE_FOLDER/config/course_config.json  ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC}   courses/$COURSE_FOLDER/config/MASTER_CONTEXT.md   ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC}   _templates/orchestrator.md                         ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC}                                                       ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC} Then act as the Orchestrator and begin the course     ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC} creation workflow for this course.                    ${YELLOW}│${NC}"
echo -e "${YELLOW}└──────────────────────────────────────────────────────────┘${NC}"
echo ""
