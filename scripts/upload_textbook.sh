#!/usr/bin/env bash
# =============================================================
# Professor Assistant — Textbook Upload Script
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

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════╗"
echo "║   PROFESSOR ASSISTANT                ║"
echo "║   Textbook Upload Tool               ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

COURSE_FOLDERS=($(ls -d "$COURSES_DIR"/*/  2>/dev/null | grep -v '.gitkeep' | xargs -I{} basename {}))

if [[ ${#COURSE_FOLDERS[@]} -eq 0 ]]; then
  echo -e "${RED}No courses found. Run scripts/new_course.sh first.${NC}"
  exit 1
fi

echo -e "${BOLD}Available Courses:${NC}"
for i in "${!COURSE_FOLDERS[@]}"; do
  echo "  $((i+1))) ${COURSE_FOLDERS[$i]}"
done
echo ""
echo -e -n "${YELLOW}Select course number: ${NC}"
read COURSE_CHOICE

COURSE_IDX=$((COURSE_CHOICE-1))
if [[ $COURSE_IDX -lt 0 || $COURSE_IDX -ge ${#COURSE_FOLDERS[@]} ]]; then
  echo -e "${RED}Invalid selection.${NC}"; exit 1
fi
SELECTED_COURSE="${COURSE_FOLDERS[$COURSE_IDX]}"
COURSE_DIR="$COURSES_DIR/$SELECTED_COURSE"
echo -e "${GREEN}✓ Selected: $SELECTED_COURSE${NC}"
echo ""

echo -e -n "${YELLOW}Enter full path to textbook file: ${NC}"
read TEXTBOOK_FILE

if [[ ! -f "$TEXTBOOK_FILE" ]]; then
  echo -e "${RED}✗ File not found: $TEXTBOOK_FILE${NC}"; exit 1
fi

EXT="${TEXTBOOK_FILE##*.}"
EXT_LOWER=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')
if [[ "$EXT_LOWER" != "pdf" && "$EXT_LOWER" != "txt" ]]; then
  echo -e "${RED}✗ Only PDF and TXT files are supported.${NC}"; exit 1
fi

TEXTBOOK_DEST="$COURSE_DIR/textbook/"
cp "$TEXTBOOK_FILE" "$TEXTBOOK_DEST"
echo -e "${GREEN}✓ Textbook copied to $TEXTBOOK_DEST${NC}"

FILENAME=$(basename "$TEXTBOOK_FILE")
EXTRACTED_PATH="$COURSE_DIR/textbook/textbook_extracted.txt"

if [[ "$EXT_LOWER" == "pdf" ]]; then
  echo -e "${YELLOW}Extracting text from PDF...${NC}"
  python3 - <<PYEOF
import sys
output_path = "$EXTRACTED_PATH"
pdf_path = "$TEXTBOOK_DEST$FILENAME"

def extract_with_pypdf2(path):
    import PyPDF2
    with open(path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        total = len(reader.pages)
        print(f"  PyPDF2: Found {total} pages")
        lines = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            lines.append(f"\n--- PAGE {i+1} ---\n{text}")
            if (i+1) % 10 == 0:
                print(f"  Extracted {i+1}/{total} pages...")
        return "\n".join(lines), total

def extract_with_pypdf(path):
    from pypdf import PdfReader
    reader = PdfReader(path)
    total = len(reader.pages)
    print(f"  pypdf: Found {total} pages")
    lines = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        lines.append(f"\n--- PAGE {i+1} ---\n{text}")
        if (i+1) % 10 == 0:
            print(f"  Extracted {i+1}/{total} pages...")
    return "\n".join(lines), total

text = ""
total_pages = 0
try:
    text, total_pages = extract_with_pypdf2(pdf_path)
    print(f"  ✓ Extracted with PyPDF2")
except Exception as e:
    print(f"  PyPDF2 failed: {e}. Trying pypdf...")
    try:
        text, total_pages = extract_with_pypdf(pdf_path)
        print(f"  ✓ Extracted with pypdf")
    except Exception as e2:
        print(f"  ✗ Both libraries failed: {e2}")
        sys.exit(1)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(f"# Extracted Textbook Content\n")
    f.write(f"# Source: {pdf_path}\n")
    f.write(f"# Total Pages: {total_pages}\n\n")
    f.write(text)

print(f"  ✓ Saved to: {output_path}")
print(f"  ✓ Total pages extracted: {total_pages}")
PYEOF

  if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ PDF text extracted successfully${NC}"
  else
    echo -e "${RED}✗ PDF extraction failed. Please convert to TXT manually.${NC}"
    exit 1
  fi
else
  cp "$TEXTBOOK_FILE" "$EXTRACTED_PATH"
  echo -e "${GREEN}✓ TXT file copied as extracted text${NC}"
fi

CONFIG_FILE="$COURSE_DIR/config/course_config.json"
if [[ -f "$CONFIG_FILE" ]]; then
  python3 - <<PYEOF
import json
config_path = "$CONFIG_FILE"
with open(config_path, 'r') as f:
    config = json.load(f)
config['textbook_filename'] = "$FILENAME"
config['textbook_path'] = "courses/$SELECTED_COURSE/textbook/$FILENAME"
config['textbook_extracted_path'] = "courses/$SELECTED_COURSE/textbook/textbook_extracted.txt"
from datetime import datetime, timezone
config['last_updated'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
with open(config_path, 'w') as f:
    json.dump(config, f, indent=2, ensure_ascii=False)
print("  ✓ course_config.json updated")
PYEOF
fi

cd "$ROOT_DIR"
git add -A
git commit -m "feat: Add textbook for $SELECTED_COURSE"
git push origin main && echo -e "${GREEN}✓ Pushed to GitHub${NC}" || echo -e "${RED}✗ Push failed${NC}"

echo ""
echo -e "${GREEN}${BOLD}✅ Textbook upload complete!${NC}"
echo ""
echo -e "${BOLD}Use this in Claude Code:${NC}"
echo -e "${YELLOW}Read courses/$SELECTED_COURSE/textbook/textbook_extracted.txt"
echo -e "and courses/$SELECTED_COURSE/config/course_config.json"
echo -e "then continue as the Orchestrator.${NC}"
