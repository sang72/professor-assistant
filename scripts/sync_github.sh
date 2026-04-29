#!/usr/bin/env bash
# =============================================================
# Professor Assistant — GitHub Sync Script
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

echo -e "${CYAN}${BOLD}═══════════════════════════════════${NC}"
echo -e "${CYAN}${BOLD}   GitHub Sync — Professor Assistant${NC}"
echo -e "${CYAN}${BOLD}═══════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}⬇  Pulling latest changes...${NC}"
PULL_OUTPUT=$(git pull origin main 2>&1)
echo "$PULL_OUTPUT"
if echo "$PULL_OUTPUT" | grep -q "Already up to date"; then
  echo -e "${GREEN}✓ Already up to date${NC}"
elif echo "$PULL_OUTPUT" | grep -q "error"; then
  echo -e "${RED}✗ Pull failed. Resolve conflicts manually.${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Pulled new changes${NC}"
fi
echo ""

STATUS=$(git status --short)
if [[ -z "$STATUS" ]]; then
  echo -e "${GREEN}✓ Nothing to commit. All synced.${NC}"
  exit 0
fi

echo -e "${BOLD}Changed files:${NC}"
echo "$STATUS" | while read line; do
  echo -e "  ${CYAN}$line${NC}"
done
echo ""

TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
COMMIT_MSG="sync: Auto-save $TIMESTAMP"

git add -A
git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✓ Committed: $COMMIT_MSG${NC}"

echo -e "${YELLOW}⬆  Pushing to GitHub...${NC}"
git push origin main && echo -e "${GREEN}✓ Pushed successfully${NC}" || echo -e "${RED}✗ Push failed${NC}"

echo ""
echo -e "${GREEN}${BOLD}✅ Sync complete!${NC}"
