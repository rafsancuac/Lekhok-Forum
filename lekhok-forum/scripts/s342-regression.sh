#!/bin/bash
# s342-regression.sh — full regression runner (s306..s341 + guard:design + audit:views)
set -u
cd /home/z/lekhok-forum/lekhok-forum/lekhok-forum
LOG=/tmp/s342-regression.log
echo "=== s342 regression start $(date +%H:%M:%S) ===" >> "$LOG"
for s in "$@"; do
  if [ -f "tests/$s-suite.sh" ]; then
    R=$(bash "tests/$s-suite.sh" 2>&1 | grep -E "ফলাফল|সর্ব-সবুজ|ব্যর্থতা" | tr '\n' ' ')
    echo "$s: $R" >> "$LOG"
  else
    echo "$s: SUITE-MISSING" >> "$LOG"
  fi
done
echo "=== chunk done $(date +%H:%M:%S) ===" >> "$LOG"
cat "$LOG" | tail -$((${#@} + 2))
