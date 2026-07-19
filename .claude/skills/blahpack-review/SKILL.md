---
name: blahpack-review
description: Review a module (or the full codebase) for convention violations, scaffolding remnants, and quality issues. The argument is the module path (e.g. `lib/blas/base/zhpmv`) or empty for full audit.
argument-hint: [module-path]
---

# Module Review

Review `$ARGUMENTS` for convention violations. Fix all errors found.

## Quick start

Run the conformance check — it checks everything (file structure, scaffolding,
implementation, string conventions, complex number conventions, tests, lint,
and JSDoc):
```bash
node bin/conformance.js $ARGUMENTS
```

Auto-fix lint issues:
```bash
bin/lint-fix.sh $ARGUMENTS
```

## Tools

| Tool | Purpose |
|------|---------|
| `node bin/conformance.js <module>` | **The conformance check** — all checks in one command |
| `bin/lint.sh` | ESLint with stdlib + blahpack conformance rules |
| `bin/lint-fix.sh` | Full fix pipeline (codemods + eslint + test verify) |
| `bin/fix_wrapper_docs.py` | Propagate base.js @param to ndarray.js/wrapper files |

---

Each item below has a verification command. A module is not ready for
integration until every applicable check passes.

---

## 1. No scaffolding remnants or stub wrappers

Scaffolded content must be fully replaced with real implementations.
Every file in the module must work — not just base.js.

These are now enforced by ESLint rules (run `bin/lint.sh`):
- **`stdlib/no-stub-wrappers`** — flags "not yet implemented" in wrapper files
- **`stdlib/no-todo-params`** — flags TODO in @param or type annotations
- **`stdlib/no-scaffold-assertions`** — flags assert.fail('TODO:...') in tests

```bash
# Lint catches all of the above:
bin/lint.sh lib/<pkg>/base/<routine>

# Full codebase check for stub wrappers (legacy, also caught by lint):
bash bin/check-stubs.sh
```

---

## 2. String parameters use long-form values

Single-character Fortran flags are categorically forbidden in code AND
docstrings. See CLAUDE.md for the complete mapping table.

These are now enforced by ESLint rules (run `bin/lint.sh`):
- **`stdlib/jsdoc-backtick-params`** — bare `'N'` in @param (fixable with `--fix`)
- **`stdlib/no-dprefix-conjugate-transpose`** — conjugate-transpose in d-prefix (fixable with `--fix`)

```bash
# Auto-fix backtick quoting and d-prefix conjugate-transpose:
bin/lint.sh --fix lib/<pkg>/base/<routine>

# Single-char strings in executable code (not yet an ESLint rule):
grep -n "'[A-Z0-9]'" lib/<pkg>/base/<routine>/lib/base.js | grep -v '//\|^\s*\*\|eslint\|require'
```

**d-prefix routines** must not list `'conjugate-transpose'` as a valid trans
value — it's meaningless for real data. Use `'no-transpose'` or `'transpose'`.

---

## 3. Complex arrays use Complex128Array

All z-prefix (and c-prefix) routines must accept `Complex128Array` at the API
boundary for complex data. `Float64Array` is only acceptable for genuinely real
parameters (RWORK, d, e, eigenvalues, scale factors, etc.).

The **`stdlib/z-prefix-reinterpret`** ESLint rule flags z-prefix base.js files
that index complex arrays without calling `reinterpret()`. Run `bin/lint.sh`
to check.

```bash
# Check base.js @param types (manual — not yet an ESLint rule)
grep "@param {Float64Array}" lib/<pkg>/base/<routine>/lib/base.js

# For z-prefix: every matrix/vector param (A, B, x, y, AP, etc.) must be Complex128Array
# Only these should remain Float64Array: WORK, RWORK, IWORK, d, e, w, S, s, scale,
# CNORM, FERR, BERR, VN1, VN2, ISUPPZ, IFAIL, BWORK, and scalar output arrays
```

The pattern: accept `Complex128Array` in the signature, call
`reinterpret(x, 0)` at function entry, multiply strides/offsets by 2 for
Float64 indexing internally.

---

## 4. Validation layers (routine.js, ndarray.js)

The conformance check's **conventions** check validates the full call chain:

```bash
node bin/conformance.js lib/<pkg>/base/<routine> --check conventions
```

**`<routine>.js` (layout wrapper) must validate:**
- `order` (isLayout)
- String params: uplo, trans, side, diag (stdlib validators), plus nonstandard
  params like job, norm, compq, vect, range, fact (manual whitelist checks)
- Dimensions: M, N, K >= 0
- Leading dimensions: LDA >= max(1, N) etc.

**`ndarray.js` must validate:**
- String params (same as routine.js, minus order)
- For BLAS L2/L3: stride != 0 checks

**`base.js` must NOT validate** — it's the hot-path computation kernel.

### Validator strings MUST match what base.js dispatches on

This is the silent-corruption trap that hides behind "tests pass":

```js
// ndarray.js
if ( jobu !== 'all' && jobu !== 'some' && ... ) throw ...;
return base( jobu, ... );    // BUG: passes 'all' through

// base.js
wantua = ( jobu === 'all-columns' );   // never matches; routine takes the no-op path
```

**Rule: ndarray validator strings, wrapper validator strings, and base
dispatch strings MUST be identical.** No translation tables (`*_MAP`),
no aliases. Pick one canonical name per concept and use it everywhere
— base.js, wrappers, ndarray.js, tests, examples, README.

We tried the "friendly external name → specific internal name" pattern
(e.g. `'all'` → `'all-columns'`) and **banished it**: it just creates
two vocabularies to keep in sync and makes validator/base mismatches
silent. Use the more specific name (`'all-columns'`/`'all-rows'`,
`'compute-U'`/`'compute-V'`/`'compute-Q'`, `'compute-vectors'`,
`'apply-Q'`/`'apply-P'`, `'inf-norm'`, etc.) directly.

When reviewing, if you see a `*_MAP` declaration in `lib/*.js` (not
test fixtures), flag it for removal.

**Anti-pattern: single-branch validators that exclude valid values.** A real
example from `dorgbr.js` and `dormbr.js`:

```js
if ( vect !== 'apply-Q' ) {  // BUG: rejects valid 'apply-P'
    throw new TypeError( ... );
}
```

This shows up when a scaffold copy-paste retains only the value that the
first test happened to use. Whenever the Fortran spec lists multiple legal
values for a parameter, the validator must accept all of them — write the
condition as a positive whitelist (`!== a && !== b && !== c`), not a single
inequality.

**Verify the alignment by hand.** For each string parameter, compare the
list of accepted values in the validator against the dispatch keys in
base.js (the `=== '...'` checks):

```bash
# Strings the ndarray validator accepts:
grep -nE "[!=]==.*'[a-z-]+'" lib/<pkg>/base/<routine>/lib/ndarray.js

# Strings base.js dispatches on:
grep -nE "[!=]==.*'[a-z-]+'" lib/<pkg>/base/<routine>/lib/base.js
```

These should print identical sets. If they differ, fix the diverging
file — do NOT add a translation table.

---

## 5. Consistent array parameter conventions

All array parameters follow the `(array, stride, offset)` or
`(array, stride1, stride2, offset)` pattern.

| Array type | Convention | Example |
|-----------|-----------|---------|
| 1D vector | `x, strideX, offsetX` | `daxpy` |
| 2D matrix | `A, strideA1, strideA2, offsetA` | `dgemm` |
| Packed 1D | `AP, strideAP, offsetAP` | `dspmv` |
| Integer vector | `IPIV, strideIPIV, offsetIPIV` | `dgetrf` |
| Scalar output | `Float64Array(1)` or `Int32Array(1)` | `dlacn2` |
| Workspace | `work, strideWork, offsetWork` (also `rwork`, `iwork`) — **caller-provided, never internally allocated** | `dlarf1f` |

Verify naming:

```bash
# Stride names use 1/2 suffix (not 0/1)
grep "strideA0\|strideB0\|strideC0" lib/<pkg>/base/<routine>/lib/base.js

# ndarray.js signature matches base.js
```

### 5a. Workspace (LAPACKE convention)

WORK is a caller-provided strided ndarray parameter on **both** `base.js`
and `ndarray.js`. Never allocated internally. The conformance check's
`bin/conformance/checks/workspace.js` runs four checks the reviewer should
verify by hand:

1. **`workspace.caller-provided`** — Every Fortran `WORK`/`RWORK`/`IWORK`/
   `SWORK`/`BWORK` argument appears as a base.js parameter (lowercased).
2. **`workspace.no-internal-alloc`** — No `new Float64Array(<expr>)`,
   `new Complex128Array(<expr>)`, etc. in `lib/base.js`. Small scalar
   temps (size ≤ 8) are allowed.
3. **`workspace.naming`** — camelCase `strideWork`/`offsetWork`, not
   `strideWORK`/`offsetWORK`. No `LWORK`/`LRWORK` integer-length params.
4. **`workspace.ndarray-parity`** — `lib/ndarray.js` exposes the same
   caller-provided workspace params and does not allocate.

If you find `new Float64Array(nb*nb)` or similar inside `base.js`, that's
the wrong fix even if the conformance check happens to skip it — flag it. Partition
the caller's WORK buffer at a documented offset instead. See the
"Workspace Convention" section of `/blahpack-translate` for the rule.

The LAPACKE-style layout wrapper (`<routine>.js`, e.g. `dgesvd.js`) may
allocate WORK as a documented convenience when the caller passes
`null`/omits it, but the canonical signature is caller-provided.

Run the audit with:

```bash
node bin/conformance.js --all --fast --json > /tmp/conformance.json
node -e "const d=require('/tmp/conformance.json'); const g={}; for (const m of d.modules) for (const c of m.checks||[]) if (c.status==='fail' && c.id?.startsWith('workspace.')) (g[c.id] = g[c.id]||[]).push(m.module); for (const [k,v] of Object.entries(g)) console.log(k+': '+v.length); "
```

---

## 6. JSDoc accuracy

Docstrings must match the actual code — not the Fortran source, not the
scaffold, not a previous version.

```bash
# @param types match actual usage
# @param descriptions use long-form strings in backticks
# @returns type matches what the function returns
# @private is on base.js, NOT on ndarray.js
# No stale comments referencing Fortran conventions (LDA, INCX, etc.)
```

For z-prefix routines, verify stride/offset docs say "in complex elements"
(not "in Float64 elements") when the API accepts Complex128Array.

---

## 7. No complex division or absolute value inlined

Complex division and absolute value require numerically stable algorithms.

```bash
# Search for potential inline complex division
# (dividing re+im parts separately without cmplx.div)
grep -n "/ \(.*Re\|.*Im\|.*re\|.*im\)" lib/<pkg>/base/<routine>/lib/base.js | head -20

# Verify cmplx.div or cmplx.abs is used where needed
grep "cmplx\.\|zladiv" lib/<pkg>/base/<routine>/lib/base.js
```

Safe to inline: addition, subtraction, multiplication, conjugate,
real-scalar scaling, CABS1 (`|re|+|im|`), modulus (`sqrt(re^2+im^2)`).

Never inline: complex division, complex absolute value with overflow
protection, complex square root.

---

## 8. Test file structure and coverage

Tests must be split into three files:
- `test/test.js` — export/arity checks (requires `./../lib`)
- `test/test.<routine>.js` — layout wrapper tests (requires `./../lib/<routine>.js`)
- `test/test.ndarray.js` — ndarray-interface tests (requires `./../lib/ndarray.js`)

**Tests target the public surface, not the internal kernel.** A pattern that
has caused multiple silent-correctness bugs in this codebase: tests that
`require( './../lib/base.js' )` bypass the ndarray validator entirely. If the
validator and base.js disagree on accepted strings (e.g. ndarray validates
`'all'` but base dispatches on `'all-columns'`), the bypass hides it — `info`
returns 0 and singular values look right, but output matrices are silently
left untouched. Always require the layer the user calls. If you genuinely
need to drive base.js directly (hot-path benchmarks, paths that bypass
quick-return checks), name the file `test.base.js` and require base.js
explicitly there — don't hide it inside `test.ndarray.js`.

```bash
# Run all test files
node --test lib/<pkg>/base/<routine>/test/test.js lib/<pkg>/base/<routine>/test/test.<routine>.js lib/<pkg>/base/<routine>/test/test.ndarray.js

# Coverage
node --test --experimental-test-coverage lib/<pkg>/base/<routine>/test/test.js lib/<pkg>/base/<routine>/test/test.<routine>.js lib/<pkg>/base/<routine>/test/test.ndarray.js 2>&1 | tail -30
```

Targets: **≥90% line coverage, ≥85% branch coverage** on base.js.

Verify test.ndarray.js has substantive assertions and routes through the
public ndarray interface:

```bash
# Each test file must require the layer it claims to test
grep -nE "require\( '\\./\\./lib/(base|ndarray|<routine>)\\.js'" lib/<pkg>/base/<routine>/test/

# Count real test cases (not just scaffold type checks)
grep -c "^test(" lib/<pkg>/base/<routine>/test/test.ndarray.js

# Verify no scaffold stubs remain
grep "assert.fail\|TODO.*implement" lib/<pkg>/base/<routine>/test/test.ndarray.js
```

---

## 9. Lint passes

```bash
bin/lint.sh lib/<pkg>/base/<routine>
```

This runs all stdlib rules plus blahpack conformance rules (scaffolding,
string conventions, complex arrays, etc.) in a single pass. Fix what you can
with `--fix`, then address the rest manually.

Deferred rules (`max-len`, `max-params`, etc.) must be disabled with a single
`/* eslint-disable */` comment at file top listing only rules that fire.

---

## 10. Hermitian vs. symmetric correctness (z-prefix)

For zh-prefix (Hermitian) routines:
- Diagonal elements forced real (imaginary zeroed)
- Off-diagonal reads use conjugation
- Trans values: `'no-transpose'` / `'conjugate-transpose'`
- Alpha/beta types match Fortran (alpha may be real in rank-k updates)

For zs-prefix (symmetric) routines:
- Diagonal stays fully complex
- No conjugation anywhere
- Trans values: `'no-transpose'` / `'transpose'`
- Alpha and beta are complex

```bash
# Hermitian routines should have conjugation
grep -c "conj\|-.*Im\|- Av\[.*+ 1" lib/<pkg>/base/<routine>/lib/base.js

# Symmetric routines should NOT have conjugation
```

---

## 11. Return convention

| Routine type | Returns |
|-------------|---------|
| BLAS subroutine | Output array (`return y`, `return C`, `return AP`) |
| BLAS function | Scalar (`return dot`) |
| LAPACK with INFO | Integer status (`return info`, 0 = success, >0 = algorithm-specific) |

INFO values are **1-based** (matching Fortran). A 0-based loop finding an
issue at index `j` returns `j + 1`.

---

## 12. Full suite regression

**NEVER run `npm test` or `npm run check` directly** — they produce 12,000+
lines of output that wastes context. Instead:

```bash
# Run the module's own tests (< 50 lines of output):
node --test lib/<pkg>/base/<routine>/test/test.js lib/<pkg>/base/<routine>/test/test.<routine>.js lib/<pkg>/base/<routine>/test/test.ndarray.js 2>&1 | tail -20

# Check for regressions across the full suite (shows ONLY summary + failures):
bin/test-failures.sh

# Fast conformance on all modules (file checks only, manageable output):
node bin/conformance.js --all --fast 2>&1 | tail -30
```

---

## Bulk audit commands

Most of these are now ESLint rules — run `bin/lint.sh` for a full codebase
lint (processes each module individually to avoid OOM).

```bash
# Full lint (all conformance rules included):
bin/lint.sh

# Auto-fix backtick quoting and d-prefix conjugate-transpose:
bin/lint.sh --fix

# Cross-file checks not covered by ESLint:

# ndarray.js files without string validation (requires reading base.js)
for f in lib/*/base/*/lib/ndarray.js; do
  if grep -q "uplo\|trans\|diag\|side" "$(dirname $f)/base.js" 2>/dev/null; then
    grep -qL "throw new TypeError" "$f" 2>/dev/null && echo "$f"
  fi
done

# Full audit (includes cross-file checks):
bash bin/audit.sh
```

---

## Appendix: ndarray.js Conformance Criteria

Every `ndarray.js` must satisfy these requirements (from `docs/ndarray-conformance.md`).

### Validation of string parameters

Each string parameter must be validated using the appropriate stdlib assertion
helper. Throw `TypeError` with `format()` on invalid values.

| Parameter | Validator | Valid values |
|-----------|-----------|-------------|
| `trans`, `transa`, `transb` | `isMatrixTranspose` | `'no-transpose'`, `'transpose'`, `'conjugate-transpose'` |
| `uplo` | `isMatrixTriangle` | `'upper'`, `'lower'` |
| `side` | `isOperationSide` | `'left'`, `'right'` |
| `diag` | `isDiagonalType` | `'unit'`, `'non-unit'` |

For parameters without a stdlib helper (`direct`, `storev`, `job`, `vect`,
`norm`, `compz`, `range`, `fact`, `equed`, `jobz`, `transr`, etc.), validate
manually with a whitelist check. Discover accepted values from `base.js` and
use descriptive long-form strings — NEVER single-character Fortran flags.

| Parameter | Example values |
|-----------|---------------|
| `norm` | `'max'`, `'one-norm'`, `'inf-norm'`, `'frobenius'` |
| `job` | `'none'`, `'permute'`, `'scale'`, `'both'`, `'eigenvalues'` |
| `range` | `'all'`, `'value'`, `'index'` |
| `jobz` | `'compute-vectors'`, `'no-vectors'` |
| `vect` | `'apply-Q'`, `'apply-P'` |
| `transr` | `'no-transpose'`, `'transpose'` |

### Validation of dimensions

All dimension parameters (`M`, `N`, `K`, etc.) must be `>= 0`.

### JSDoc requirements

- Same signature and `@param` types as base.js (no `@private`)
- `@throws` tags for each validation check
- `@returns` tag
- All `@param` descriptions use long-form strings in backticks (never single-char)
- z-prefix: complex arrays typed as `{Complex128Array}`, not `{Float64Array}`
- d-prefix: trans param lists `'no-transpose'` or `'transpose'` only (no `'conjugate-transpose'`)

### Required validator imports

```javascript
var isMatrixTranspose = require( '@stdlib/blas/base/assert/is-transpose-operation' );
var isMatrixTriangle = require( '@stdlib/blas/base/assert/is-matrix-triangle' );
var isOperationSide = require( '@stdlib/blas/base/assert/is-operation-side' );
var isDiagonalType = require( '@stdlib/blas/base/assert/is-diagonal-type' );
var format = require( '@stdlib/string/format' );
```
