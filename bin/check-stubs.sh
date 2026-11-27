#!/usr/bin/env bash
# Check for modules with stub wrapper files (throw "not yet implemented").
#
# Every module's JS files (index.js, <routine>.js, ndarray.js)
# must have real implementations, not scaffold stubs. base.js is the core
# algorithm; everything else is a wrapper that must actually work.
#
# Exit 1 if any stubs are found.

set -uo pipefail

stubs=()
for dir in lib/blas/base/*/lib lib/lapack/base/*/lib; do
  [ -d "$dir" ] || continue
  routine=$(echo "$dir" | sed 's|.*/base/||' | sed 's|/lib||')

  for f in "$dir"/*.js; do
    [ -f "$f" ] || continue
    fname=$(basename "$f")

    # base.js stubs are caught by check-stub-tests.sh; skip here
    [ "$fname" = "base.js" ] && continue

    if grep -q "not yet implemented" "$f" 2>/dev/null; then
      stubs+=("$routine/$fname")
    fi
  done
done

if [ ${#stubs[@]} -gt 0 ]; then
  echo "ERROR: ${#stubs[@]} wrapper files are stubs (throw 'not yet implemented'):"
  for s in "${stubs[@]}"; do
    echo "  $s"
  done
  echo ""
  echo "Every wrapper file must have a real implementation."
  echo "Run 'python bin/fix_wrapper_docs.py' to propagate signatures,"
  echo "then implement the wrapper logic."
  exit 1
fi

echo "OK: No stub wrapper files found."
