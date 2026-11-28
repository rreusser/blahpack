#!/usr/bin/env bash
# Check for git-tracked modules whose test files are still scaffolded stubs.
# A stub test has only "is a function" / "has .strided" assertions and no
# real test cases. Exit 1 if any are found.
#
# Detection: a file is a stub if ANY of:
#   - It has <= 2 test()/it() calls AND <= 2 assert.* calls
#     (the scaffold generates exactly 2 type-check tests)
#   - It contains assert.fail('TODO:') calls (explicit scaffold markers)
# Files with >2 test() calls are assumed to have real tests even if
# assertions are in helper functions (assertClose, etc.).

set -euo pipefail

stubs=()
for f in $(git ls-files 'lib/*/*/test/test.js'); do
  dir="${f%/test/test.js}"
  base="$dir/lib/base.js"
  git ls-files --error-unmatch "$base" &>/dev/null || continue

  test_count=$(grep -cE '\b(test|it)\(' "$f" 2>/dev/null || true)
  test_count=${test_count:-0}
  assert_count=$(grep -c 'assert\.' "$f" 2>/dev/null || true)
  assert_count=${assert_count:-0}
  fail_count=$(grep -c 'assert\.fail' "$f" 2>/dev/null || true)
  fail_count=${fail_count:-0}

  if [ "$test_count" -le 2 ] && [ "$assert_count" -le 2 ]; then
    stubs+=("$dir")
  elif [ "$fail_count" -gt 0 ]; then
    stubs+=("$dir")
  fi
done

if [ ${#stubs[@]} -gt 0 ]; then
  echo "ERROR: ${#stubs[@]} modules have scaffold-only tests (no real test cases):"
  for s in "${stubs[@]}"; do
    echo "  $s"
  done
  exit 1
fi

echo "OK: All git-tracked modules have real tests."
