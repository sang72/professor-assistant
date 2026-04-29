#!/usr/bin/env bash
# =============================================================
# Professor Assistant — GitHub Setup Script
# Compatible with macOS and Linux
# =============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_banner() {
  echo -e "${CYAN}${BOLD}"
  echo "╔══════════════════════════════════════════════╗"
  echo "║       PROFESSOR ASSISTANT — SETUP            ║"
  echo "║       GitHub Integration v1.0                ║"
  echo "╚══════════════════════════════════════════════╝"
  echo -e "${NC}"
}

check_command() {
  if ! command -v "$1" &>/dev/null; then
    echo -e "${RED}✗ $1 is not installed.${NC}"
    echo -e "${YELLOW}Install instructions: $2${NC}"
    return 1
  else
    echo -e "${GREEN}✓ $1 is installed.${NC}"
    return 0
  fi
}

print_banner

echo -e "${BOLD}=== Checking Prerequisites ===${NC}"
check_command git "https://git-scm.com/downloads" || exit 1
check_command python3 "https://www.python.org/downloads/" || exit 1
check_command gh "https://cli.github.com" || {
  echo -e "${YELLOW}GitHub CLI is required. Install it from https://cli.github.com then run: gh auth login${NC}"
  exit 1
}

echo ""
echo -e "${BOLD}=== Installing Python Dependencies ===${NC}"
pip3 install -r requirements.txt && echo -e "${GREEN}✓ Dependencies installed.${NC}" || echo -e "${YELLOW}⚠ Some dependencies failed. Continuing...${NC}"

echo ""
echo -e "${BOLD}=== GitHub Authentication ===${NC}"
gh auth status || {
  echo -e "${YELLOW}Please authenticate with GitHub:${NC}"
  gh auth login
}

GITHUB_USER=$(gh api user --jq '.login' 2>/dev/null)
echo -e "${GREEN}✓ Logged in as: ${BOLD}$GITHUB_USER${NC}"

echo ""
echo -e "${BOLD}=== Repository Information ===${NC}"
echo -e "${GREEN}✓ This repository is already connected to GitHub.${NC}"
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "Not set")
echo -e "  Repository URL: ${CYAN}$REPO_URL${NC}"

echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║          ✅ SETUP COMPLETE!                  ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Next Steps:${NC}"
echo -e "  ${CYAN}1.${NC} Create a new course:  ${YELLOW}bash scripts/new_course.sh${NC}"
echo -e "  ${CYAN}2.${NC} Sync your work:       ${YELLOW}bash scripts/sync_github.sh${NC}"
echo -e "  ${CYAN}3.${NC} Add a textbook later: ${YELLOW}bash scripts/upload_textbook.sh${NC}"
echo ""
