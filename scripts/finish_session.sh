#!/usr/bin/env bash
# =============================================================
# Professor Assistant — 세션 종료 및 저장
# 작업 마칠 때 실행하는 스크립트
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

cd "$ROOT_DIR"

clear
echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         작업 종료 — 자동 저장 중                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. 변경사항 확인
STATUS=$(git status --short)
if [[ -z "$STATUS" ]]; then
  echo -e "${GREEN}✅ 변경사항이 없습니다. 이미 최신 상태입니다.${NC}"
else
  echo -e "${BOLD}저장할 파일 목록:${NC}"
  echo "$STATUS" | while read line; do
    echo -e "  ${CYAN}$line${NC}"
  done
  echo ""

  # 2. 커밋 메시지 생성
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
  COMMIT_MSG="save: 작업 저장 $TIMESTAMP"

  # 어떤 과목 작업했는지 감지
  CHANGED_COURSE=$(echo "$STATUS" | grep "courses/" | head -1 | sed 's|.*courses/\([^/]*\)/.*|\1|')
  if [[ -n "$CHANGED_COURSE" ]]; then
    COMMIT_MSG="save: $CHANGED_COURSE 작업 저장 $TIMESTAMP"
  fi

  # 3. Git push
  echo -e "${YELLOW}📤 GitHub에 저장 중...${NC}"
  git add -A
  git commit -m "$COMMIT_MSG" --quiet
  git push origin main

  if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ GitHub 저장 완료!${NC}"
    echo -e "   커밋: ${CYAN}$COMMIT_MSG${NC}"
  else
    echo -e "${RED}❌ Push 실패. 인터넷 연결을 확인하세요.${NC}"
    echo -e "   나중에 수동으로: ${YELLOW}bash scripts/sync_github.sh${NC}"
  fi
fi

echo ""

# 4. 오늘 작업 요약 출력
echo -e "${BOLD}📊 오늘 작업 요약:${NC}"
echo -e "${CYAN}─────────────────────────────────────────────────────${NC}"
git log --oneline --since="today 00:00" 2>/dev/null | head -10 | while read line; do
  echo -e "  ${GREEN}•${NC} $line"
done
echo ""

# 5. 다음 세션 시작 명령어 출력
echo -e "${BOLD}🚀 다음에 작업 시작할 때:${NC}"
echo -e "${CYAN}─────────────────────────────────────────────────────${NC}"
echo -e "  ${YELLOW}bash scripts/select_course.sh${NC}"
echo -e "${CYAN}─────────────────────────────────────────────────────${NC}"
echo ""
echo -e "${GREEN}${BOLD}수고하셨습니다! 👋${NC}"
