#!/bin/sh
# Launch an unattended Claude Code session that works through notes/REMAKE_PLAN.md.
#
#   ./run-remake.sh            interactive session, you can watch and interrupt
#   ./run-remake.sh --headless run with -p (no TUI), log to remake.log, exit when done
#
# Model is pinned to Opus 5.5 here and in .claude/settings.json. Edits are auto-accepted;
# shell commands are limited to the allowlist in .claude/settings.json, anything else prompts
# (interactive) or is refused (headless).

set -e
cd "$(dirname "$0")"

PROMPT='Read CLAUDE.md, then notes/REMAKE_PLAN.md. Work through the plan from the first unticked task, one task at a time, until every box is ticked. For each task: look at its reference screenshot, implement it, write the tests it asks for, run npm run format, npm test, npm run check, npm run lint and npm run build at the repo root, tick the box, commit on the remake branch. Do not stop to ask questions; record assumptions in the plan as CLAUDE.md says. When all tasks are done, print a short summary of what was built and the assumptions made.'

if [ "$1" = "--headless" ]; then
  claude --model claude-opus-5-5 --permission-mode acceptEdits -p "$PROMPT" 2>&1 | tee remake.log
else
  claude --model claude-opus-5-5 --permission-mode acceptEdits "$PROMPT"
fi
