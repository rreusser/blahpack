#!/bin/bash
# Smoke-run module benchmarks: each file runs under `timeout 3`, 8 in parallel.
# A file fails if its output contains `Error` or `not ok`, or it exits nonzero
# for any reason other than the timeout (124).
#
# Usage:
#   bin/bench-smoke.sh                  # all lib/*/base/*/benchmark/*.js
#   bin/bench-smoke.sh <list-file>      # only files listed (one per line)
#   bin/bench-smoke.sh --changed        # modules changed vs origin/main
#                                       #   (bin/changed-modules.mjs; --base <ref>)
#
# Env: OUT (default: .bench-smoke) receives files.txt, fail.txt and logs/.
cd "$(dirname "$0")/.." || exit 2
OUT=${OUT:-.bench-smoke}
rm -rf "$OUT"; mkdir -p "$OUT/logs"
if [ "$1" = "--changed" ]; then
	shift
	dirs=$(node bin/changed-modules.mjs "$@") || exit 2
	for d in $dirs; do ls "$d"/benchmark/*.js 2>/dev/null; done
elif [ -n "$1" ]; then cat "$1"; else ls lib/*/base/*/benchmark/*.js; fi > "$OUT/files.txt"
run() {
	f=$1; key=$(echo "$f" | tr '/' '_')
	timeout "${SMOKE_TIMEOUT:-3}" node "$f" > "$OUT/logs/$key" 2>&1; rc=$?
	if { [ $rc -ne 0 ] && [ $rc -ne 124 ]; } || grep -qE 'Error|not ok' "$OUT/logs/$key"; then echo "$f"; fi
}
export -f run; export OUT
xargs -r -P "${SMOKE_JOBS:-8}" -n 1 bash -c 'run "$0"' < "$OUT/files.txt" | sort > "$OUT/fail.txt"
echo "failing: $(wc -l < "$OUT/fail.txt" | tr -d ' ') / $(wc -l < "$OUT/files.txt" | tr -d ' ')"
[ ! -s "$OUT/fail.txt" ]
