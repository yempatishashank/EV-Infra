#!/usr/bin/env bash
set -euo pipefail

# Token passed via environment variable — never echoed
if [ -z "${GH_PAT:-}" ]; then
  echo "ERROR: GH_PAT not set" >&2
  exit 1
fi

REPO_URL="https://${GITHUB_USER}:${GH_PAT}@github.com/yempatishashank/EV-Infra.git"

# Remove any existing github remote silently
git remote remove github 2>/dev/null || true

# Add the remote (URL contains token — never printed)
git remote add github "$REPO_URL"

echo "Remote added."

# Make sure we're on main
git checkout main 2>/dev/null || true

# Stage any uncommitted changes (the .gitignore update)
git add -A

# Commit only if there's something new
if ! git diff --cached --quiet; then
  git commit -m "Add .env to .gitignore and prepare for GitHub push"
fi

echo "Pushing to GitHub..."

# Push — suppress output that might contain token fragments
git push github main --force 2>&1 | grep -v "${GH_PAT}" || true

echo "Push complete."

# Clean up remote (removes token from git config)
git remote remove github

echo "Remote cleaned up."
