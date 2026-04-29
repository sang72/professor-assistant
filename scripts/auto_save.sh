#!/usr/bin/env bash
# =============================================================
# Professor Assistant — Auto Save (백그라운드 자동 저장)
# 10분마다 자동으로 GitHub에 push
# =============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$ROOT_DIR/.auto_save.log"
INTERVAL=600  # 10분 (600초)

cd "$ROOT_DIR"

echo -e "${GREEN}✅ 자동 저장 시작 (10분마다 GitHub에 자동 push)${NC}"
echo -e "   중지하려면: ${YELLOW}Ctrl+C${NC}"
echo ""

while true; do
  sleep $INTERVAL

  # 변경사항 확인
  STATUS=$(git status --short 2>/dev/null)

  if [[ -n "$STATUS" ]]; then
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
    COMMIT_MSG="auto-save: 자동 저장 $TIMESTAMP"

    git add -A
    git commit -m "$COMMIT_MSG" --quiet
    git push origin main --quiet

    echo -e "${GREEN}[$TIMESTAMP]${NC} ✅ 자동 저장 완료"
    echo "[$TIMESTAMP] auto-save: success" >> "$LOG_FILE"
  else
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
    echo -e "${CYAN}[$TIMESTAMP]${NC} 변경사항 없음 — 저장 건너뜀"
  fi
done
