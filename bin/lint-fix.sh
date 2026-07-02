#!/bin/bash
# Full lint-fix pipeline: codemods + eslint --fix + test verification.
#
# Usage:
#   bin/lint-fix.sh lib/blas/base/daxpy     # Fix one module
#   bin/lint-fix.sh lib/blas/base/d*        # Fix multiple modules
#   bin/lint-fix.sh                          # Fix all BLAS + LAPACK modules

set -uo pipefail

BLAHPACK_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BLAHPACK_DIR"

export ESLINT_USE_FLAT_CONFIG=true
ESLINT="$BLAHPACK_DIR/node_modules/.bin/eslint"

# Per-invocation backup path so concurrent runs (multiple parallel agents)
# do not race on the test.js revert path. Cleaned up on exit.
BACKUP_FILE=$(mktemp -t lint_fix_backup.XXXXXX.js)
trap 'rm -f "$BACKUP_FILE"' EXIT

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Collect module paths
MODULES=()
if [ $# -eq 0 ]; then
    for d in lib/blas/base/*/test/test.js lib/lapack/base/*/test/test.js; do
        [ -f "$d" ] && MODULES+=("$(dirname "$(dirname "$d")")")
    done
else
    for arg in "$@"; do
        # Normalize: strip trailing slashes
        arg="${arg%/}"
        if [ -d "$arg/test" ]; then
            MODULES+=("$arg")
        elif [ -d "$arg" ]; then
            # Maybe a glob of module dirs
            for d in "$arg"/*/test/test.js; do
                [ -f "$d" ] && MODULES+=("$(dirname "$(dirname "$d")")")
            done
        fi
    done
fi

if [ ${#MODULES[@]} -eq 0 ]; then
    echo "No modules found."
    exit 1
fi

echo "Processing ${#MODULES[@]} modules..."
echo ""

FIXED=0
BROKEN=0
CLEAN=0

for mod in "${MODULES[@]}"; do
    name=$(basename "$mod")
    test_file="$mod/test/test.js"
    index_file="$mod/lib/index.js"

    [ -f "$test_file" ] || continue

    # Step 1: Apply test codemod
    node bin/codemod-tests.js "$test_file" > /dev/null 2>&1

    # Step 2: Apply index.js codemod
    [ -f "$index_file" ] && node bin/codemod-index.js "$index_file" > /dev/null 2>&1

    # Step 3a: eslint --fix on lib and examples files (no backup needed)
    for f in "$mod"/lib/*.js "$mod"/examples/index.js; do
        [ -f "$f" ] || continue
        "$ESLINT" --fix "$f" 2>/dev/null
    done

    # Step 3b: eslint --fix on test.js with backup. The vars-order rule can
    # break test files (use-before-define), so we keep the original to revert.
    # Backup is per-invocation (see BACKUP_FILE at top); pulled out of the
    # file loop so it preserves test.js content, not the last-iterated file.
    cp "$test_file" "$BACKUP_FILE"
    "$ESLINT" --fix "$test_file" 2>/dev/null

    # Step 4: Verify tests still pass
    FAILS=$(node --test "$test_file" 2>&1 | grep -c '✖')
    if [ "$FAILS" -gt 1 ]; then
        # Revert test file and retry without vars-order (known to break some files)
        cp "$BACKUP_FILE" "$test_file"
        node bin/codemod-tests.js "$test_file" > /dev/null 2>&1
        "$ESLINT" --fix "$test_file" 2>/dev/null
        FAILS=$(node --test "$test_file" 2>&1 | grep -c '✖')
        if [ "$FAILS" -gt 1 ]; then
            # Still broken — revert to codemod-only
            cp "$BACKUP_FILE" "$test_file"
            node bin/codemod-tests.js "$test_file" > /dev/null 2>&1
            BROKEN=$((BROKEN + 1))
            echo -e "  ${RED}REVERTED${NC}  $name (eslint --fix broke tests)"
        else
            FIXED=$((FIXED + 1))
            echo -e "  ${GREEN}FIXED${NC}     $name (retry without vars-order)"
        fi
    else
        # Check remaining errors
        ERRS=$("$ESLINT" "$mod" 2>&1 | grep -cE '^\s+\d+:\d+\s+error')
        if [ "$ERRS" -eq 0 ]; then
            CLEAN=$((CLEAN + 1))
            echo -e "  ${GREEN}CLEAN${NC}     $name"
        else
            FIXED=$((FIXED + 1))
            echo -e "  ${GREEN}FIXED${NC}     $name ($ERRS remaining)"
        fi
    fi
done

echo ""
echo "════════════════════════════════════════"
echo "Clean: $CLEAN, Fixed: $FIXED, Reverted: $BROKEN"
echo "Total: ${#MODULES[@]} modules"
