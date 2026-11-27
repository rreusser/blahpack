#!/bin/bash
# Run every module example (lib/*/*/examples/*.js) under `timeout 10`,
# 8 in parallel (ticket 0041). A file fails if it exits nonzero for any reason,
# a timeout included: an example is a short program a user copies, and it must
# finish.
#
# Usage:
#   bin/examples-smoke.sh                  # all examples
#   bin/examples-smoke.sh <list-file>      # only files listed (one per line)
#
# Env: OUT (default: .examples-smoke) receives files.txt, fail.txt and logs/.
cd "$(dirname "$0")/.." || exit 2
OUT=${OUT:-.examples-smoke}
rm -rf "$OUT"; mkdir -p "$OUT/logs"
if [ -n "$1" ]; then cat "$1"; else ls lib/*/*/examples/*.js; fi > "$OUT/files.txt"
run() {
	f=$1; key=$(echo "$f" | tr '/' '_')
	if ! timeout "${SMOKE_TIMEOUT:-10}" node "$f" > "$OUT/logs/$key" 2>&1; then echo "$f"; fi
}
export -f run; export OUT
xargs -r -P "${SMOKE_JOBS:-8}" -n 1 bash -c 'run "$0"' < "$OUT/files.txt" | sort > "$OUT/fail.txt"
echo "failing: $(wc -l < "$OUT/fail.txt" | tr -d ' ') / $(wc -l < "$OUT/files.txt" | tr -d ' ')"
[ ! -s "$OUT/fail.txt" ]
