#!/bin/bash
# ensure QA server on 8094 (sandbox reaps background procs between calls)
if curl -s -o /dev/null -m 2 http://localhost:8094/; then
  exit 0
fi
APP_DIR="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)}"; cd "$APP_DIR/lekhok-forum"
PORT=8094 setsid nohup node server.js > /tmp/qa-server-8094.log 2>&1 < /dev/null &
for i in $(seq 1 30); do
  sleep 0.5
  if curl -s -o /dev/null -m 2 http://localhost:8094/; then
    exit 0
  fi
done
echo "server failed to start"; tail -20 /tmp/qa-server-8094.log; exit 1
