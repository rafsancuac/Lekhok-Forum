#!/bin/bash
# ensure lekhok-forum-next QA server on 3100 (sandbox reaps background procs between calls)
if curl -s -o /dev/null -m 2 http://localhost:3100/api/session; then
  exit 0
fi
cd /home/z/lekhok-forum/lekhok-forum-next
setsid nohup ./node_modules/.bin/next dev -p 3100 > /tmp/lfnext-dev.log 2>&1 < /dev/null &
for i in $(seq 1 40); do
  sleep 0.5
  if curl -s -o /dev/null -m 2 http://localhost:3100/api/session; then
    exit 0
  fi
done
echo "server failed to start"; tail -20 /tmp/lfnext-dev.log; exit 1
