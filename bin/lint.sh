#!/bin/bash
# Run ESLint (flat config, local binary) on blahpack module sources.
#
# Uses the pinned local eslint and the flat config in eslint.config.cjs,
# which loads the blahpack rules from tools/eslint/plugin.cjs. Runs
# per-module in batch mode to avoid EMFILE (too many open files) across the
# ~900 modules.
#
# Usage:
#   bin/lint.sh lib/blas/base/daxpy/lib/base.js    # lint specific files
#   bin/lint.sh lib/blas/base/daxpy/lib/           # lint a directory
#   bin/lint.sh --fix lib/blas/base/daxpy/lib/     # auto-fix
#   bin/lint.sh                                     # lint all modules

BLAHPACK_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BLAHPACK_DIR" || exit 2

export ESLINT_USE_FLAT_CONFIG=true
ESLINT="$BLAHPACK_DIR/node_modules/.bin/eslint"
if [ ! -x "$ESLINT" ]; then
	echo "eslint not found at $ESLINT — run 'npm ci' first." >&2
	exit 2
fi

# Split flags (--fix, etc.) from paths.
FLAGS=()
PATHS=()
for arg in "$@"; do
	if [ "${arg:0:1}" = "-" ]; then
		FLAGS+=("$arg")
	else
		PATHS+=("$arg")
	fi
done

if [ ${#PATHS[@]} -eq 0 ]; then
	PATHS=("lib/")
fi

# Direct mode: a specific path was given (not the whole lib/ tree).
BATCH_MODE=false
for p in "${PATHS[@]}"; do
	case "$p" in
		lib/|lib) BATCH_MODE=true ;;
	esac
done

if [ "$BATCH_MODE" != true ]; then
	"$ESLINT" "${FLAGS[@]}" "${PATHS[@]}"
	exit $?
fi

# Batch mode: one module at a time to avoid EMFILE.
TOTAL_ERRORS=0
TOTAL_WARNINGS=0
FAILED=()
MODULES=$(find lib/blas/base lib/lapack/base -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort)
COUNT=$(echo "$MODULES" | wc -l | tr -d ' ')

for mod in $MODULES; do
	# ESLint exits non-zero only on errors (warnings are non-fatal by
	# default). We print any module that has output (errors OR warnings) so
	# signature drift stays visible, but only errors mark the run failed.
	OUTPUT=$("$ESLINT" "${FLAGS[@]}" "$mod/lib" 2>/dev/null)
	RC=$?
	if [ -n "$OUTPUT" ]; then
		echo "── ${mod} ──"
		echo "$OUTPUT"
		echo ""
		SUMMARY=$(echo "$OUTPUT" | grep -E '[0-9]+ problems?' | tail -1)
		ERRS=$(echo "$SUMMARY" | grep -oE '[0-9]+ errors?' | grep -oE '[0-9]+')
		WARNS=$(echo "$SUMMARY" | grep -oE '[0-9]+ warnings?' | grep -oE '[0-9]+')
		TOTAL_ERRORS=$((TOTAL_ERRORS + ${ERRS:-0}))
		TOTAL_WARNINGS=$((TOTAL_WARNINGS + ${WARNS:-0}))
	fi
	if [ "$RC" -ne 0 ]; then
		FAILED+=("$mod")
	fi
done

echo "════════════════════════════════════════"
echo "Linted $COUNT modules ($TOTAL_ERRORS errors, $TOTAL_WARNINGS warnings)"
if [ ${#FAILED[@]} -eq 0 ]; then
	echo "No errors."
	exit 0
fi
echo "${#FAILED[@]} modules with errors."
exit 1
