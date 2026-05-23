#!/usr/bin/env bash
set -euo pipefail
# Usage: ./scripts/git-commit-push.sh "commit message" [file1 file2 ...]
if [ "$#" -lt 1 ]; then
  echo "Usage: $0 \"commit message\" [files...]"
  exit 1
fi
msg="$1"
shift || true
if [ "$#" -gt 0 ]; then
  git add "$@"
else
  git add -A
fi
git commit -m "$msg"
git push
