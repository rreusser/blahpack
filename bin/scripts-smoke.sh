#!/bin/bash
# Run every standalone script and example module outside lib/ (bench/*.js,
# bench/*.mjs, examples/**/*.js) at a small problem size, under a timeout. A
# file fails if it exits nonzero for any reason, a timeout included.
#
# These files import the library by path and call it with literal flag strings
# and argument lists, and nothing else loads them, so a moved file or a changed
# signature used to break them unnoticed (ticket 0109). The scripts call the
# validating ndarray.js entry points where they can, so a stale flag throws
# here instead of timing the wrong thing.
#
# A new file under those globs is picked up automatically. Give it a line in
# args() if it needs arguments to finish quickly.
#
# Usage:
#   bin/scripts-smoke.sh
#
# Env: OUT (default: .scripts-smoke) receives files.txt, fail.txt and logs/.
cd "$(dirname "$0")/.." || exit 2
OUT=${OUT:-.scripts-smoke}
rm -rf "$OUT"; mkdir -p "$OUT/logs"
ls bench/*.js bench/*.mjs $(find examples -name '*.js' | sort) > "$OUT/files.txt"

# Arguments that keep a script's problem small.
args() {
	case "$1" in
		bench/bench-blas.js) echo "--target-ms 5" ;;
		bench/bench-drivers.js) echo "--sizes 20 --target-ms 30" ;;
		bench/bench-laplace.js) echo "--step 0.05" ;;
		bench/bench-opt-candidates.mjs) echo "l1" ;;
		bench/bench-zggev.js) echo "--sizes 10,20 --target-ms 30" ;;
		bench/profile-zhgeqz.js) echo "--size 40 --iters 1" ;;
	esac
}
run() {
	f=$1; key=$(echo "$f" | tr '/' '_')
	# STEP: boundary spacing read by the Laplace example scripts.
	# shellcheck disable=SC2046
	if ! STEP=0.05 EVAL_POINTS=500 timeout "${SMOKE_TIMEOUT:-60}" node "$f" $(args "$f") > "$OUT/logs/$key" 2>&1; then echo "$f"; fi
}
export -f run args; export OUT
xargs -r -P "${SMOKE_JOBS:-4}" -n 1 bash -c 'run "$0"' < "$OUT/files.txt" | sort > "$OUT/fail.txt"
echo "failing: $(wc -l < "$OUT/fail.txt" | tr -d ' ') / $(wc -l < "$OUT/files.txt" | tr -d ' ')"
if [ -s "$OUT/fail.txt" ]; then
	while read -r f; do echo "--- $f"; tail -5 "$OUT/logs/$(echo "$f" | tr '/' '_')"; done < "$OUT/fail.txt"
	exit 1
fi
