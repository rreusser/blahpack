#!/usr/bin/env bash
# Audit the codebase for convention violations.
# Run with no args for full audit, or pass a routine path to audit one module.
#
# Usage:
#   bin/audit.sh                           # audit everything
#   bin/audit.sh lib/blas/zhpmv       # audit one module

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

errors=0
warnings=0

check() {
  local label="$1"
  local count="$2"
  if [ "$count" -gt 0 ]; then
    echo -e "  ${RED}FAIL${NC}  $label ($count)"
    errors=$((errors + count))
  else
    echo -e "  ${GREEN}OK${NC}    $label"
  fi
}

warn() {
  local label="$1"
  local count="$2"
  if [ "$count" -gt 0 ]; then
    echo -e "  ${YELLOW}WARN${NC}  $label ($count)"
    warnings=$((warnings + count))
  else
    echo -e "  ${GREEN}OK${NC}    $label"
  fi
}

if [ "${1:-}" != "" ]; then
  # Single module audit
  dir="$1"
  echo "Auditing $dir"
  echo ""

  base="$dir/lib/base.js"
  strided="$dir/lib/strided.js"
  test="$dir/test/test.js"

  if [ ! -f "$base" ]; then
    echo "  No base.js found"
    exit 1
  fi

  # Scaffolding
  c=$(grep -c "TODO" "$base" 2>/dev/null || true)
  check "base.js TODO remnants" "${c:-0}"

  if [ -f "$test" ]; then
    c=$(grep -c "assert.fail" "$test" 2>/dev/null || true)
    check "test assert.fail stubs" "${c:-0}"
  fi

  # Single-char strings in code
  c=$(grep -n "'[A-Z0-9]'" "$base" | grep -cv '//\|^\s*\*\|eslint\|require' || true)
  check "single-char Fortran flags in code" "${c:-0}"

  # Single-char strings in JSDoc
  c=$(grep "@param.*'[A-Z]'" "$base" 2>/dev/null | grep -cv '`' || true)
  c2=0
  if [ -f "$strided" ]; then
    c2=$(grep "@param.*'[A-Z]'" "$strided" 2>/dev/null | grep -cv '`' || true)
  fi
  check "single-char flags in @param" "$((c + c2))"

  # z-prefix Complex128Array check
  routine=$(basename "$dir")
  if [[ "$routine" == z* ]]; then
    if ! grep -q "reinterpret" "$base" 2>/dev/null; then
      warn "z-prefix base.js missing reinterpret (may use Float64Array API)" 1
    else
      check "z-prefix uses reinterpret" 0
    fi
  fi

  # Validation in strided.js
  if [ -f "$strided" ] && grep -q "uplo\|trans\|diag\|side" "$base" 2>/dev/null; then
    if ! grep -q "throw new TypeError" "$strided" 2>/dev/null; then
      warn "strided.js missing string validation" 1
    else
      check "strided.js validates strings" 0
    fi
  fi

  echo ""
  echo "Errors: $errors, Warnings: $warnings"
  exit $((errors > 0 ? 1 : 0))
fi

# Full codebase audit
echo "=== Full Codebase Audit ==="
echo ""

echo "Scaffolding remnants:"
c=$(grep -rl "@param.*TODO\|{TODO}" lib --include='*.js' 2>/dev/null | wc -l)
check "files with TODO @param" "$c"

c=$(grep -rl "assert\.fail.*TODO\|assert\.fail.*Scaffold\|assert\.fail.*implement" lib/*/*/test/test.js 2>/dev/null | wc -l)
warn "test files with scaffold assert.fail" "$c"

stubcount=0
for dir in lib/blas/*/lib lib/lapack/*/lib; do
  [ -d "$dir" ] || continue
  for f in "$dir"/*.js; do
    [ -f "$f" ] || continue
    [ "$(basename "$f")" = "base.js" ] && continue
    grep -q "not yet implemented" "$f" 2>/dev/null && stubcount=$((stubcount + 1))
  done
done
check "wrapper files with 'not yet implemented'" "$stubcount"

echo ""
echo "String conventions:"
c=$(grep -rn "@param.*'[A-Z]'" lib --include='*.js' 2>/dev/null | grep -cv '`' || true)
check "single-char flags in @param JSDoc" "${c:-0}"

c=$(grep -rl "conjugate-transpose" lib/blas/d*/lib/ lib/lapack/d*/lib/ 2>/dev/null | wc -l)
check "d-prefix files with conjugate-transpose" "$c"

echo ""
echo "Complex128Array conventions:"
zcount=0
for f in lib/blas/z*/lib/base.js lib/lapack/z*/lib/base.js; do
  [ -f "$f" ] || continue
  if ! grep -q "reinterpret" "$f" 2>/dev/null; then
    # Check if it indexes Complex128Array params directly (not just real arrays)
    # Real arrays: IPIV, RWORK, WORK, SCALE, d, e, S, rot, JPVT, rank, LSCALE, RSCALE, BWORK
    if grep -qE "(Av|Bv|Cv|Hv|Zv|Qv|Tv|Uv|Xv|VTv|VLv|VRv)\[" "$f" 2>/dev/null; then
      zcount=$((zcount + 1))
    fi
  fi
done
check "z-prefix indexing Complex128Array without reinterpret" "$zcount"

echo ""
echo "Validation:"
vcount=0
for f in lib/*/*/lib/strided.js; do
  [ -f "$f" ] || continue
  grep -q "throw new TypeError" "$f" 2>/dev/null && continue
  base="$(dirname "$f")/base.js"
  [ -f "$base" ] || continue
  # Check if base.js has string @params (not just string references in code)
  if grep -q "@param {string}" "$base" 2>/dev/null; then
    vcount=$((vcount + 1))
  fi
done
warn "strided.js with string params but no validation" "$vcount"

echo ""
echo "Tests:"
bin/check-stub-tests.sh 2>/dev/null || true

echo ""
echo "================================"
echo -e "Errors: ${RED}$errors${NC}, Warnings: ${YELLOW}$warnings${NC}"
exit $((errors > 0 ? 1 : 0))
