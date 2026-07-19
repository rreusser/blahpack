---
name: blahpack-translate
description: Run the full translation checklist for a BLAS/LAPACK routine. The argument is the routine name (e.g. `dpotf2`).
argument-hint: <routine>
---

# Translate a Fortran BLAS/LAPACK Routine to JavaScript

Translate the routine `$ARGUMENTS` following this complete checklist and
reference. Determine the package (blas or lapack) by checking if the source
exists in `data/BLAS-3.12.0/` or `data/lapack-3.12.0/SRC/`.

Also read `docs/complex-numbers.md` for z-prefix routines and
`docs/dependency-conventions.md` before calling unfamiliar dependencies.

## Project Structure

```
bin/                           # Pipeline scripts
  transform.py                 #   Composable code-mod pipeline
  signature.py                 #   Fortran → stdlib-js signature generator
  scaffold.py                  #   Module scaffold generator (stdlib-js structure)
  deps.py                      #   Dependency tree analyzer
  fortran_body.py              #   Strip Fortran to executable body only
  gen_test.py                  #   Generate JS test scaffold from fixtures
  init_routine.py              #   Single command: scaffold + deps + test scaffold
  fortran_to_estree.py         #   Fortran parser → ESTree AST (outputs 1-based JS)
  estree_to_js.js              #   ESTree → formatted JavaScript
  remove_goto.py               #   GOTO restructuring (imported by transform.py)
  instrument.js                #   Module._load profiler (incl/excl time, call trees)
  bench-zggev.js               #   zggev profiling benchmark (multi-size, scaling)
  bench-blas.js                #   Leaf-node BLAS/LAPACK microbenchmarks
  profile-zhgeqz.js            #   V8 CPU profiler with per-line breakdown
data/                          # Reference Fortran source
  BLAS-3.12.0/
  lapack-3.12.0/
lib/                           # Output: stdlib-js conformant modules
  blas/base/<routine>/         #   e.g. lib/blas/base/ddot/
  lapack/base/<routine>/       #   e.g. lib/lapack/base/dpotf2/
test/                          # Fortran tests and fixtures
  fortran/                     #   Test programs (test_<routine>.f90)
  fortran/deps_<routine>.txt   #   LAPACK link dependencies
  fixtures/                    #   Reference outputs from Fortran (JSONL)
pipeline/                      # Intermediate transform files
unused/                        # Deprecated experiments and old files
```

## Commands

```bash
python                          # Use venv python (NOT python3)
gfortran                       # GNU Fortran compiler (Homebrew)
node                            # Node.js v24+ (node:test built-in)
node bin/conformance.js lib/<pkg>/base/<routine>  # THE conformance check (all checks)
bin/lint-fix.sh lib/<pkg>/base/<routine>  # Auto-fix (codemods + eslint + verify)
bin/lint.sh lib/<pkg>/base/<routine>      # Lint only
# DO NOT run `npm test` or `npm run check` — only run the module's own tests
```

---

## Context Efficiency (CRITICAL)

Every byte you read or every command you run dumps output into your context
window. Wasted context means degraded performance and lost capacity for the
actual translation work. Follow these rules strictly:

**Reading files:**
- Do NOT read entire reference files when you only need a section. Use
  `offset` and `limit` parameters on the Read tool.
- When reading a counterpart module for patterns, read only `base.js` first.
  Only read other files (ndarray.js, test.js) if you specifically need them.
- Do NOT read docs you already know. If the agent prompt already covers the
  conventions, skip reading `docs/complex-numbers.md` etc.

**Running commands:**
- **NEVER** run `npm test` — it dumps 12,000+ lines and wastes your context.
- **NEVER** run `npm run check` — same problem.
- **NEVER** run `node --test` on glob patterns like `lib/**/test/*.js`.
- **ALWAYS** pipe test/lint commands through `tail` or `grep`:
  ```bash
  # Tests — ALWAYS use tail:
  node --test lib/<pkg>/base/<routine>/test/test.js lib/<pkg>/base/<routine>/test/test.<routine>.js lib/<pkg>/base/<routine>/test/test.ndarray.js 2>&1 | tail -20

  # If tests fail, use grep to find failures:
  node --test lib/<pkg>/base/<routine>/test/test.ndarray.js 2>&1 | grep '✖' -A5 | head -20

  # Coverage — ALWAYS use tail:
  node --test --experimental-test-coverage lib/<pkg>/base/<routine>/test/test.js lib/<pkg>/base/<routine>/test/test.<routine>.js lib/<pkg>/base/<routine>/test/test.ndarray.js 2>&1 | tail -30

  # Lint — ALWAYS use tail:
  bin/lint-fix.sh lib/<pkg>/base/<routine> 2>&1 | tail -20
  ```
- The conformance check is compact (~40 lines) — run directly:
  ```bash
  node bin/conformance.js lib/<pkg>/base/<routine>
  ```
- When a command fails, read only the relevant error lines, not the full output.
- If you accidentally run a verbose command, DO NOT repeat it. Extract what you
  need from the output already in context.

**Writing code:**
- Do not dump entire generated files into your response. Write them with the
  Write/Edit tools and verify via tests.

---

## Automation-First Mindset

Any manual work that repeats across routines is a bug in the tooling. If you
perform the same mechanical transformation twice, stop and automate it (new
transform in `bin/transform.py` or script in `bin/`) before continuing.
Track repeated manual steps; if any reaches count 2, automate first.

---

## Do NOT Translate: Extended-Precision (XBLAS) Routines

Routines whose names end in `_extended`, or that call XBLAS primitives
(`BLAS_*_X`, `BLAS_*2_X`), are out of scope. If `python bin/deps.py <routine>`
reports `blas_*_x [NOT FOUND]`, or the Fortran source declares any
`BLAS_*_X` external, **stop immediately** and report the routine as blocked
on XBLAS. Do not substitute plain-precision BLAS, add stubs, or fall back
to invariant tests — a proper port requires XBLAS support and is a separate
project.

---

## Checklist: Translating a New Routine

This is the end-to-end process for translating a Fortran routine to JavaScript.
Follow these steps in order. Each step has a verification check.

### Step 0: Check dependencies and generate the expected signature

```bash
# Show full dependency tree
python bin/deps.py <routine>

# Show implementation order (leaves first)
python bin/deps.py <routine> --order
```

Ensure all dependencies are already implemented before starting a new routine.
If not, implement the leaves first.

```bash
python bin/signature.py data/BLAS-3.12.0/<routine>.f
# or
python bin/signature.py data/lapack-3.12.0/SRC/<routine>.f
```

This outputs the target `base.js` function signature in stdlib-js convention.
Save this — it defines the API contract for the final JS implementation.

### Step 1: Initialize the module

```bash
python bin/init_routine.py <package> <routine> -d "<one-line description>"
```

This single command:
- Generates the complete stdlib-js module scaffold (16 files):
  - `lib/base.js` (stub), `lib/ndarray.js` (with stdlib string validation),
    `lib/<routine>.js` (layout wrapper with isLayout, dimension, LD validation),
    `lib/main.js`, `lib/index.js`
  - `test/test.js` (export checks), `test/test.<routine>.js` (layout validation tests),
    `test/test.ndarray.js` (scaffold for computation tests)
  - `benchmark/benchmark.js`, `benchmark/benchmark.ndarray.js`
  - `docs/types/index.d.ts` (dual signatures), `docs/types/test.ts`
  - `docs/repl.txt`, `README.md`, `examples/index.js`, `package.json` (with keywords)
  - `LEARNINGS.md`
- Auto-generates the Fortran deps file from the dependency tree
- Generates a JS test scaffold if a fixture already exists
- Prints a summary with the exact commands for remaining steps

After scaffolding, if the routine has string params not covered by stdlib
validators (job, norm, compq, vect, range, fact, etc.), add manual whitelist
validation to **both** `ndarray.js` and `<routine>.js`. Discover accepted
values from the Fortran source and use descriptive long-form strings (see
the string convention table below).

### Step 2: Write the Fortran test

Create `test/fortran/test_<routine>.f90` using the `test_utils` module.

**Template:**
```fortran
program test_<routine>
  use test_utils
  implicit none
  ! Declare variables...

  ! Test case 1: basic operation
  ! Set up inputs...
  call <ROUTINE>(args...)
  call begin_test('basic')
  call print_array('result', result_array, n)  ! or print_scalar / print_int
  call end_test()

  ! Test case 2: edge case (n=0)...
  ! Test case 3: edge case (n=1)...
  ! etc.
end program
```

**Required test cases:**
- Basic operation with known inputs/outputs
- Edge cases: n=0 (quick return), n=1
- Scalar edge cases: alpha=0, alpha=1, beta=0, beta=1 (where applicable)
- Non-unit strides: incx=2, incy=-1 (for BLAS with stride params)
- For LAPACK with INFO: test a case that returns INFO > 0

**For complex arrays**, use EQUIVALENCE to print interleaved re/im pairs:
```fortran
double precision :: zx_r(20)
complex*16 :: zx(10)
equivalence (zx, zx_r)
call print_array('zx', zx_r, 2*n)
```

**CRITICAL: Leading dimension vs EQUIVALENCE stride mismatch.** When
printing 2D arrays via EQUIVALENCE, you MUST account for the leading
dimension. If you declare `A(NMAX, NMAX)` with NMAX=10 but your test
matrix is N=4, the memory layout has stride NMAX, not N. Printing
`2*N*N` doubles via EQUIVALENCE will read padding from rows 5-10
instead of the next column. Two safe approaches:

1. **Pack before printing:** Copy the N-by-N submatrix into a
   contiguous array, then print that:
   ```fortran
   do j = 1, n
     do i = 1, n
       Apk(i + (j-1)*n) = A(i, j)
     end do
   end do
   call print_array('A', Apk_r, 2*n*n)  ! Apk equivalenced to Apk_r
   ```

2. **Match declared and used dimensions:** Declare `A(N, N)` instead
   of `A(NMAX, NMAX)` if N is fixed for the test case. Then
   EQUIVALENCE stride matches.

This bug class caused 8+ corrupted fixture files in one session — it
is silent (no compiler warning, no runtime error) and produces plausible
but subtly wrong reference data.

**Gate:** `./test/run_fortran.sh <package> <routine>` compiles and runs.

### Step 3: Generate fixture and JS test scaffold

```bash
./test/run_fortran.sh <package> <routine>
python bin/gen_test.py <package> <routine> > lib/<package>/base/<routine>/test/test.js
```

**Gate:** Fixture exists, JS test scaffold has one stub per case.

### Step 4: Implement base.js

Read the stripped Fortran source and translate to JavaScript:

```bash
python bin/fortran_body.py data/<source-path>/<routine>.f
```

The base.js must:
- Match the signature from Step 0 exactly
- Use 0-based indexing for loop variables and array access (see "Index
  Strategy" below for when to keep 1-based internals)
- Use stride/offset parameters for all array access
- Use `require()` for BLAS/LAPACK dependencies — NEVER inline them (see below)
- Use `Complex128Array` for complex array parameters, `Complex128` for complex scalars
- Use `reinterpret()` at function entry for Float64Array views
- Use `lib/cmplx.js` for complex arithmetic (scalar ops + indexed ops)
- Follow CommonJS format with stdlib-js section comments
- NOT include parameter validation (that goes in ndarray.js)
- **Implement ALL parameter combinations and code paths** (see below)

**CRITICAL: Complete implementations, not partial ones.**

Every routine must implement ALL valid parameter combinations from the
Fortran reference — not just the subset needed by the current caller.
Each module is a standalone, reusable building block. If the Fortran has
branches for SIDE='L'/'R', TRANS='N'/'T'/'C', UPLO='U'/'L',
STOREV='C'/'R', DIRECT='F'/'B', JOB='N'/'P'/'S'/'B', etc., implement
ALL of them. Do not stub out branches with `throw new Error('not yet
implemented')` just because the immediate dependency tree only exercises
one path.

Similarly, tests must cover all parameter combinations:
- If a routine has SIDE×TRANS×DIRECT×STOREV = 2×2×2×2 = 16 cases,
  test all 16 (or at minimum, every distinct code path).
- If a routine handles both M≥N and M<N, test both.
- Edge cases (N=0, M=0, alpha=0) are required regardless of whether
  any current caller triggers them.

The cost of a partial implementation is high: a future routine that calls
the incomplete path will silently fail or throw at runtime, far from the
root cause. A complete implementation is verified once and trusted forever.

**Do not inline standard LAPACK/BLAS routines.** If a helper function
corresponds to a named Fortran routine (has its own source file in the
reference LAPACK), check how many callers it has:

- **Multiple callers in reference LAPACK** → create a standalone module
  with its own `lib/`, `test/`, `package.json`. The parent routine
  `require()`s it. This is the common case.
- **Single caller only** → MAY be inlined in the parent's `base.js` as
  a local function. But it MUST still have unit tests (test it via the
  parent's test file with targeted test cases).

To check callers: `grep -rl "CALL ZFOO" data/lapack-3.12.0/SRC/`

Never duplicate a routine. If a standalone module already exists (e.g.,
`zunmqr`), always `require()` it — do not copy the implementation into
a parent routine's base.js.

**Complex arithmetic rules:** Comment all inlined complex operations with the
math they represent. **NEVER** inline complex division (`cmplx.div`), absolute
value (`cmplx.abs`), or square root — these require numerical stability
algorithms. Addition, subtraction, multiplication, conjugate, and real-scalar
scaling are safe to inline. See [docs/complex-numbers.md](docs/complex-numbers.md).

**GOTO restructuring:** See [docs/goto-patterns.md](docs/goto-patterns.md)
for the full pattern table. Common cases: `GO TO` inside DO → `continue`,
backward `GO TO` → `while`/`do-while`, forward `GO TO` → `if/else`.

### Step 5: Fill in JS tests and verify

Fill in `test/test.ndarray.js` with actual computation tests using fixture
data from Step 3. The scaffold already has `test/test.js` (export checks) and
`test/test.<routine>.js` (layout wrapper validation) — those should work
without modification. Run all three:

```bash
node --test lib/<package>/base/<routine>/test/test.js lib/<package>/base/<routine>/test/test.<routine>.js lib/<package>/base/<routine>/test/test.ndarray.js 2>&1 | tail -20
```

**Testing pitfalls (from experience):**

- **Pivoting routines (dgetrf, dgetrs, dgesv, zgeqp3):** Do NOT compare
  exact solution vectors against fixtures — pivoting tie-breaks differ
  between JS (0-based IPIV) and Fortran (1-based IPIV). Instead, verify
  the mathematical property (e.g., A*x ≈ b, or P*L*U ≈ A).
- **Blocked code paths (NB=32/64):** Require large matrices for fixtures.
  Workaround: use NB=2 for testing to exercise blocked paths with small
  matrices (dtrtri successfully used this approach).
- **Always test alpha != 1.0:** Initial tests often miss non-trivial
  scaling branches. Routines with alpha/beta parameters need explicit tests
  with e.g. alpha=2.0, beta=0.5.
- **Use well-conditioned matrices:** Near-singular or rank-deficient
  matrices cause floating-point rounding differences between blocked and
  unblocked paths. Use diagonally dominant matrices for fixture-based tests.
- **Reverse-pivot mode (dlaswp with incx<0):** Had a known bug — verify
  that backward iteration applies swaps in reverse order.
- **Pivot tie-breaking (dgeqp3, zgeqp3):** Column norms with identical
  values cause divergent pivot orders between JS and Fortran (idamax
  tie-breaking differs). Use transcendental functions (sin/cos) or
  irregular patterns for test matrices to avoid tied norms.
- **Fortran test array reuse:** Fortran tests may reuse arrays across
  test cases without re-zeroing (e.g., SR/SI in dlaqr2). Either zero
  arrays between cases in Fortran, or account for stale values in JS
  fixture comparison.
- **Non-unique decompositions:** Decompositions (GSVD, eigenvalues with
  tied norms, rank-deficient QR) are not unique. Test mathematical
  properties (`A*x ≈ b`, orthogonality) rather than exact element values.
- **Round-trip testing for solve/multiply pairs:** Multiply then solve
  and check recovery of the original vector. This validates both routines
  simultaneously and avoids fragile fixture comparisons.

**Gate:** All tests pass against Fortran fixtures. The test file MUST have
more than 2 `assert.*` calls — the scaffolded "is a function" checks do
NOT count as tests. The `stdlib/no-scaffold-assertions` ESLint rule catches
scaffold `assert.fail('TODO:...')` remnants automatically during linting.
**Do not commit a test file that only has the scaffolded type-check assertions.**

**Use stdlib assertion utilities — don't roll your own tolerance loops.**

| Need | Use |
|------|-----|
| Fuzzy equality of typed arrays | `@stdlib/assert/is-almost-equal-float64array` or `@stdlib/assert-is-almost-same-float64array` |
| Element-wise tolerance check | `@stdlib/math/base/special/abs` + a single ULP/relative comparison helper, NOT a hand-rolled `for` loop with `Math.abs(a-b) < tol` everywhere |

Writing custom `for (i=0; i<n; i++) { t.ok(Math.abs(a[i]-b[i])<tol, ...) }`
loops makes tests harder to read and easier to silently weaken. Prefer the
stdlib helpers; they produce one assertion with a meaningful message.

**Orthogonality / diagonality checks:** Utilities for these are
work-in-progress at stdlib. For now, write a small local helper inside
the test file (`Q^T Q ≈ I` for orthogonality, `|A_ij| < tol for i≠j` for
diagonal), but keep it small and readable rather than spreading raw
tolerance arithmetic across tests. Watch the stdlib repo for the official
utilities and switch over when they land.

### Step 6: Verify test coverage

```bash
node --test --experimental-test-coverage lib/<package>/base/<routine>/test/test.js lib/<package>/base/<routine>/test/test.<routine>.js lib/<package>/base/<routine>/test/test.ndarray.js 2>&1 | tail -30
```

Target: **≥90% line coverage, ≥85% branch coverage** on `base.js`.

**This is a HARD GATE — not aspirational.** A module is NOT complete until it
meets these targets. Do not move to LEARNINGS.md or declare the routine done
if coverage is below threshold. Keep adding tests until the targets are met.
The only acceptable exceptions are specific branches documented with inline
TODO comments explaining why they are unreachable (e.g., IEEE 754 limits,
convergence failures requiring pathological inputs).

**NEVER scaffold stub modules that throw "not yet implemented".** If a
dependency is not ready, do not create a stub — report the missing dependency
and stop. Empty stubs pollute the test suite and create false progress.

If coverage is low, add targeted test cases:
- For `uplo`/`trans`/`side`/`diag` params: test ALL valid combinations
- Edge cases: N=0, M=0, alpha=0
- Overflow/underflow: test with 1e300 and 1e-300 values
- Non-unit and negative strides

**Systematically hard-to-cover paths:**
- Exceptional shifts in QZ iteration (require slow convergence)
- sfmin rescaling paths (require inputs near underflow threshold)
- STOREV='R' / backward direction in dlarfb/dlarft
- Iteration-limit-exceeded branches
- **safe2/SAFE1 underflow guard branches** in iterative refinement routines
  (dgerfs, dsyrfs, dporfs, dptrfs, dtrrfs, zptrfs): require WORK values
  near machine underflow (~1e-308) to trigger. Accept these as uncovered.
- **Collapsed/underflowed bulges** in multi-shift QR (dlaqr5): require
  all three bulge elements to be simultaneously zero
- **Compound quick-return conditions** (`alpha=0 && beta=1`): the
  identity short-circuit in Level-3 routines is hard to isolate.
- **Convergence failure paths (info > 0):** Require matrices that defeat
  iterative convergence. Accept as uncovered with inline TODO comment.

### Step 7: Lint the module

```bash
bin/lint-fix.sh lib/<package>/base/<routine> 2>&1 | tail -20
bin/lint.sh lib/<package>/base/<routine> 2>&1 | tail -20
```

`bin/lint-fix.sh` runs the full pipeline: test codemods (var hoisting, Array.from
→ toArray, require-globals, JSDoc, section headers), then eslint --fix for
formatting, with automatic test verification and rollback if anything breaks.

This runs stdlib ESLint rules plus blahpack conformance rules (scaffold
remnants, backtick quoting, d-prefix conjugate-transpose, z-prefix reinterpret,
etc.).

**IMPORTANT: Follow linter rules, do not silence them.** The goal is to write
code that conforms to stdlib conventions, not to disable rules until lint
passes. Every `eslint-disable` must be justified — there must be no way to
satisfy the rule while keeping correct code.

Fix lint errors by actually conforming to the rule:

| Rule | Fix |
|------|-----|
| `no-plusplus` | `x++` → `x += 1` |
| `no-unused-vars` | Delete unused `var` declarations and unused requires |
| `stdlib/vars-order` | Reorder `var` declarations by name length (longest first) |
| `stdlib/require-globals` | Add `var Float64Array = require( '@stdlib/array/float64' );` etc. |
| `indent` | Fix tab indentation to match surrounding code |
| `no-lonely-if` | `else { if (...) }` → `else if (...)` |
| `no-negated-condition` | Swap if/else branches |
| `operator-assignment` | `x = x + y` → `x += y` |
| `stdlib/empty-line-before-comment` | Add blank line before comment blocks |
| `no-restricted-syntax` (toUpperCase) | Use `require( '@stdlib/string/base/uppercase' )` |
| `no-restricted-syntax` (labels) | Replace labeled statements with boolean flags |
| `node/no-unsupported-features/es-builtins` | Require globals from @stdlib (see `require-globals`) |
| `no-use-before-define` | Declare all `var` before first use |
| `func-names` | All functions must be named: `function name()` not `function()` |
| `require-jsdoc` | All functions need JSDoc (`@private`, `@param`, `@returns`) |
| `function-paren-newline` | All args on one line; use `eslint-disable-line max-len` if needed |
| `function-call-argument-newline` | All args on one line |
| JSDoc rules | Fix formatting per stdlib conventions (see below) |

**JSDoc conventions (stdlib):**
- Math formulas use backticks: `` `C = α*op(A)*op(B) + β*C` `` (Unicode Greek letters)
- Emphasis uses `_underscores_`, not `*asterisks*`
- List items: blank `*` line between multi-line items; tight spacing for single-line items
- Bracket notation in text: wrap in backticks (`` `A[i,j]` ``) to avoid markdown link parsing
- All functions need `@private` annotation and `@param`/`@returns` tags
- Fenced code blocks need a language flag (e.g., ` ```text `)
- Description must start uppercase and end with period

**Legitimate disables** (only these rules may be disabled at file level):
- `max-depth`, `max-statements`, `max-lines-per-function`, `max-lines`, `max-params` — complex BLAS/LAPACK routines inherently exceed these thresholds
- `max-len` — inline `eslint-disable-line` on individual long lines (fixture paths, assertions, etc.)

For complexity rules, add a single eslint-disable comment after `'use strict';`:

```javascript
/* eslint-disable max-depth, max-statements */
```

**Test file conventions** — the only file-level disables allowed in tests:
- `no-restricted-syntax` — `node:test` requires FunctionExpression callbacks
- `stdlib/first-unit-test` — tape-specific first-test pattern

All other rules must be followed. See `lib/blas/base/daxpy/test/test.js` for
the reference template. Key patterns:
- Require all globals: `var Float64Array = require( '@stdlib/array/float64' );`
- Section headers: `// MODULES //`, `// VARIABLES //`, `// FUNCTIONS //`, `// TESTS //`
- Helper functions need `@private` JSDoc
- Declare all vars at function top, longest first (`stdlib/vars-order`)
- Use `eslint-disable-line max-len` on long assertion lines
- Use `eslint-disable-line node/no-sync` on `readFileSync` calls
- Use `toArray()` helper instead of `Array.from()` (node compatibility)

**Gate:** Zero errors on `bin/lint.sh lib/<pkg>/base/<routine>`.

### Step 8: Write LEARNINGS.md (MANDATORY — DO NOT SKIP)

**This step is NOT optional.** Every translation MUST produce a `LEARNINGS.md`
file in the module directory (`lib/<package>/base/<routine>/LEARNINGS.md`).
A translation is not complete without it.

**Verification:** `grep -c "TODO: Fill in" lib/<package>/base/<routine>/LEARNINGS.md`
must return `0`. Replace every template placeholder with a real finding or `N/A`.
Write at least one concrete bullet per section.

This file captures anything that would help translate the NEXT routine faster.
Include:

- **Translation pitfalls**: Index off-by-ones, stride convention confusion,
  places where the Fortran semantics were non-obvious.
- **Dependency interface surprises**: If a dependency's calling convention
  was unexpected, document it here AND add it to
  [docs/dependency-conventions.md](docs/dependency-conventions.md).
- **Missing automation**: If you performed a mechanical step that should
  be automated, note it here (the automation-first rules apply).
- **Coverage gaps**: If certain code paths were hard to test and why.
- **Complex number handling**: Any subtleties in how complex arithmetic
  was handled (e.g., "inlined cmplx.mul to avoid allocation in hot loop").

**CRITICAL: Document ALL known issues as TODO comments in the code itself,**
at the exact location where the issue is realized. This ensures issues are
discovered inline when reading or working on the code. Examples:

```javascript
// TODO: JS izmax1 selects a different pivot than Fortran here, producing
// a less-tight norm estimate (4.563 vs 5.842 on dense 3x3). The estimate
// is still a valid lower bound but affects condition number accuracy.

// TODO: This branch (knt >= 20 safmin scaling bailout) is unreachable in
// IEEE 754 double precision — safmin ~ 2e-292, so a single scaling always
// exceeds the threshold.
```

Do NOT put code issues in LEARNINGS.md. LEARNINGS.md is strictly for
**process improvements** — what to do differently when translating the
next routine. If a test fails or a branch diverges from Fortran, the
TODO goes in `base.js` at the relevant line, not in LEARNINGS.md.

Keep it concise — bullet points, not prose. This file is read by future
sessions to avoid repeating mistakes.

### Step 9: Verify conformance

```bash
node bin/conformance.js lib/<package>/base/<routine>    # THE conformance check — all checks
```

The conformance check covers everything in one command: file structure, scaffolding
remnants, implementation completeness (ndarray validation, @private),
string conventions, complex number conventions, test quality, lint,
eslint-disable whitelist, and JSDoc.

A module is **complete** only when the conformance check reports category `complete`.
Do not declare a translation done until this passes.

**This is the MANDATORY final conformance check.** Do not declare a translation complete
until `node bin/conformance.js` shows all checks passing.

**Do NOT run `npm test` or `npm run check`** — they dump 12,000+ lines.
If you need to check for regressions in dependent modules, use:
```bash
bin/test-failures.sh    # Full suite — shows ONLY summary + failures
```

---

## Common Translation Pitfalls (from 500+ translated routines)

These are hard-won lessons extracted from LEARNINGS.md across all completed
translations. Read before starting any new routine.

### Fortran Test Compilation

**`deps.py` misses transitive Fortran module dependencies.** Routines that
transitively depend on `dlassq.f90` (via norm routines like dlansb, dlansp,
dlantb, dlantp, zlassq, etc.) require `la_constants` and `la_xisnan` in
their `deps_<routine>.txt` file. These are Fortran `.f90` modules, not
subroutines, so `deps.py` cannot detect them. **Always add these two to
the deps file when the routine (or any dependency) calls a norm or
sum-of-squares function.** Similarly, routines using `zladiv` transitively
need `dladiv` in the deps file.

### Packed Storage Indexing

Packed storage is the #1 source of translation bugs. Key formulas (0-based):

| Operation | Upper | Lower |
|-----------|-------|-------|
| Diagonal of column j | `(j+1)*(j+2)/2 - 1` | `j*(2*N-j+1)/2` |
| Column pointer advance | `jc += j + 1` | `jc += N - j` |
| IP update (non-transpose) | `ip -= (j+1)` | `ip += (N-j)` |

When operating on Complex128Array via reinterpret, multiply all packed
indices by 2 for Float64 access. The helpers `iupp(i,j)` and `ilow(i,j,N)`
should return Float64 offsets (×2) for complex routines but element offsets
for real routines — getting this wrong is silent and produces plausible
but incorrect results.

### Band Storage Indexing

Band storage maps `A(i,j)` to `AB(KU+1+i-j, j)` (Fortran 1-based) or
`AB[offsetAB + (ku+i-j)*strideAB1 + j*strideAB2]` (JS 0-based). Key
derived strides:
- `INCA = KD1 * strideAB2` (not `KD1 * strideAB1`)
- `INCX = strideAB2 - strideAB1` (diagonal-like traversal)

### Expert Driver Patterns

Expert drivers (dppsvx, dpbsvx, zgbsvx, etc.) share a common structure:
1. Optionally compute equilibration (dppequ/dlaqsp or band equivalents)
2. Copy matrix to factored storage
3. Factor (dpptrf, dpbtrf, etc.)
4. Compute norm for condition estimation
5. Estimate condition (dppcon, dpbcon, etc.)
6. Solve (dpptrs, dpbtrs, etc.)
7. Iterative refinement with error bounds (dpprfs, dpbrfs, etc.)

The `equed` parameter is an in/out string — pass as a single-element
array (`['none']`) when it needs to be both read and written. The `fact`
parameter maps: `'not-factored'`/`'factored'`/`'equilibrate'`.

### RFP (Rectangular Full Packed) Routines

RFP routines have 8 dispatch paths: 2 (odd/even N) × 2 (transr) × 2 (uplo).
Each path maps sub-blocks of the 1D RFP array to 2D matrix operations
(dtrsm, dsyrk, zherk, etc.) with different offsets and leading dimensions.
The Fortran `A(offset)` with `LDA` maps to
`A, sa, sa*LDA, offsetA + sa*offset` in ndarray convention.

### Eigenvalue Driver Patterns

Eigenvalue drivers (dspev, dsbev, zhbev, etc.) share:
1. Compute matrix norm for scaling (dlansp, dlansb, zlanhb, etc.)
2. Scale if near underflow/overflow (dlascl)
3. Reduce to tridiagonal (dsptrd, dsbtrd, zhbtrd, etc.)
4. For eigenvectors: generate Q (dopgtr) or use identity from reduction
5. Compute eigenvalues: dsterf (values only) or dsteqr('update', ...)
6. Unscale eigenvalues if scaling was applied

Key string mappings: dsbtrd vect=`'initialize'` (builds Q from identity),
dsteqr compz=`'update'` (Z already contains Q from reduction step).

### Compact-WY Block Reflector Routines

The compact-WY family (`dgeqrt`/`dgeqrt2`/`dgeqrt3`, `dgelqt`/`dgelqt3`,
`dtpqrt`/`dtpqrt2`, `dtplqt`/`dtplqt2`, `dgemqrt`, `dtpmqrt`, `dgemlqt`,
`dtpmlqt`, plus z-prefix counterparts) produces V (Householder vectors)
*and* the block triangular factor T directly — eliminating the need to
call `dlarft` after a `dgeqrf`-style factorization. Several conventions
recur and have repeatedly bitten translators:

- **τ storage trick.** The unblocked leaf kernels write each reflector's
  τ into `T(:,0)` first (using it as scratch), then the T-construction
  loop overwrites `T(i,i)` with τ in-place. Don't rewrite this — preserve
  the Fortran's two-pass structure.
- **Last column of T as workspace.** During reflector application in the
  inner loop, T's last column doubles as scratch. The construction loop
  must guard `if (i < N-1)` on writes that would overwrite a reflector
  not yet processed. Without this guard, you silently corrupt the T
  factor and produce subtly wrong factorizations.
- **`mb` is exposed as an explicit JS parameter.** The Fortran blocked
  drivers (`dgeqrt`, `dgelqt`, `dtpqrt`, `dtplqt`) call ILAENV to pick a
  block size. In JS, drop the ILAENV query and surface `mb` as an input
  parameter (callers can pass `32` if they don't care). This matches the
  rest of the project's "no ILAENV" convention.
- **Recursive variants (`dgelqt3`, `dgeqrt3`).** Implement recursion as
  a direct self-call on the exported `base.js` function — no harness,
  no trampoline, no ES6 named function expressions. The Fortran's
  recursive `IINFO` is silently dropped when the recursion preserves an
  invariant that makes failure unreachable (e.g., M ≤ N for `dgelqt3`).
- **Appliers (`dgemqrt`, `dtpmqrt`, `dgemlqt`, `dtpmlqt`).** Implement
  ALL four SIDE×TRANS combinations even if the immediate caller only
  uses one. Block-iteration direction depends on SIDE×TRANS: forward for
  (left, transpose) and (right, no-transpose); backward for the other
  two. The block-application kernels (`dlarfb`, `dtprfb`) treat WORK as
  logically 2D — see [docs/dependency-conventions.md](docs/dependency-conventions.md).
- **Scaffold can't infer matrix shapes for compact-WY.** `scaffold.py`
  guesses A is M-by-N from `A(LDA,*)`, but in `dtpqrt2`/`dtplqt2` A is
  N-by-N (triangular block) and B is M-by-N (pentagonal block). Audit
  the LDA/LDB/LDT validators in the generated `dxxx.js` against the
  Fortran spec and fix them by hand if wrong.

### zrot Sine Convention

`zrot` expects its complex sine parameter `s` as a `Float64Array(2)`
containing `[re, im]`, NOT a Complex128 or Complex128Array. When extracting
sine values from a reinterpreted WORK array, copy to a scratch
`Float64Array(2)` before passing to zrot.

### Fortran Idioms → JavaScript

| Fortran | JavaScript | Gotcha |
|---------|-----------|--------|
| `SIGN(A, B)` | `Math.abs(a) * (Math.sign(b) \|\| 1.0)` | `Math.sign(0)` returns 0, not +1. Fortran's `SIGN(A,0)` returns `+|A|`. The `\|\| 1.0` fallback is **critical** — omitting it caused a real NaN bug in zlarfg. |
| `DISNAN(X)` | `x !== x` (or `Number.isNaN(x)`) | Self-comparison NaN test |
| `DLAMCH('S')` | `Number.MIN_VALUE` or stdlib constant | Replace DLAMCH constants with direct numeric literals |
| `DLAMCH('E')` | `Number.EPSILON / 2` | Machine epsilon (half-precision) |
| `DLAMCH('P')` / `DLAMCH('Precision')` | `Number.EPSILON` | Precision = epsilon * base (full-precision). Distinct from `'E'`. |
| `ILAENV(1, ...)` | `NB = 32` (hardcoded) | Remove ILAENV/LWORK workspace queries entirely. WORK is a **caller-provided strided-array parameter** (LAPACKE convention) — see "Workspace Convention" below. **Defaults vary by query:** `ILAENV(1)` → NB=32, `ILAENV(3)` → NX=128 (crossover), `ILAENV(12)` → NMIN=12 (dlaqr3 threshold). Check the Fortran source for which query is used. |
| Integer division | `(expr)\|0` | Fortran integer division truncates toward zero (like JS `\|0`), NOT `Math.floor`. For negative dividends, `Math.floor(-3/2) = -2` but Fortran gives `-1`. Always use `\|0` for integer division of expressions that can be negative. |
| `ABS(z)` (complex) | `Math.sqrt(re*re + im*im)` | Complex modulus. Safe to inline (no division). |
| `CABS1(z)` | `Math.abs(re) + Math.abs(im)` | NOT the same as `ABS`. Used for backward error norms. `ABS` is the true modulus — do not confuse them. |
| Complex `X.NE.ZERO` | `xr !== 0.0 \|\| xi !== 0.0` | Must use OR, not AND. Fortran checks both real and imaginary parts are zero. Using AND would skip updates when only one part is zero. |
| `safmin` / `safmax` | `require('@stdlib/constants/float64/smallest-normal')` / `1.0/safmin` | Use stdlib constants, not magic numbers. Hoist to module scope — never call `dlamch()` inside a function body. |

### Hermitian vs. Symmetric: Silent Differences

Hermitian and symmetric routines look structurally identical but differ in
critical details. Getting these wrong produces plausible but incorrect results:

| Aspect | Hermitian (zh\*) | Symmetric (zs\*) |
|--------|-----------------|-------------------|
| Diagonal | Real-only; imaginary forced to zero | Fully complex |
| Off-diagonal | `conj(A[k,i])` when reading mirror | `A[k,i]` directly (no conjugation) |
| Alpha type (rank-k) | Real scalar | Complex scalar |
| Beta type (rank-2k) | Real scalar | Complex scalar |
| Trans values | `'no-transpose'` / `'conjugate-transpose'` | `'no-transpose'` / `'transpose'` |

### In-Place Complex Update Aliasing

When computing `C[i,j] = beta*C[i,j] + ...` with complex beta, save both
real and imaginary parts to temporaries before overwriting. The real-part
write clobbers data needed for the imaginary-part computation:
```javascript
cR = Cv[ic]; cI = Cv[ic+1];
Cv[ic] = betaR*cR - betaI*cI + ...;
Cv[ic+1] = betaR*cI + betaI*cR + ...;
```

### Index Convention Landmines

- **IPIV arrays are 0-based in base.js.** Fortran IPIV is 1-based. If
  comparing against fixtures, subtract 1 from Fortran values. The ndarray.js
  wrapper handles conversion from 1-based Fortran convention.
- **Negative IPIV (Bunch-Kaufman) — variant-dependent.** The Bunch-Kaufman
  family (`dsytrf`, `dsytrf_rk`, `dsytrf_rook`, plus z-prefix and `_3`
  variants) encodes 2x2 pivot rows as negative 1-based values (`-p`). In
  JS with bitwise NOT convention, `~(p-1) = -p`, so the raw numeric value
  is preserved between Fortran and JS. Extract with `~IPIV[i]` (bitwise
  NOT), not `-IPIV[i] - 1`. **Aasen's algorithm uses plain integer
  pivots** (`dlasyf_aa`, `zlasyf_aa`, `dsytrf_aa`, `zsytrf_aa`) — store
  0-based row indices directly, no negative encoding, no bitwise NOT
  decoding. Two agents got this wrong by analogy with `_rk`/`_rook` —
  always check the Fortran source.
- **INFO return values remain 1-based** (matching Fortran): 0 = success,
  k > 0 = algorithmic outcome at position k. In implementation, this means
  `return j + 1` when the 0-based loop variable finds the problem.
- **Recursive/blocked INFO offset:** When a recursive or blocked call on a
  submatrix starting at column j fails, offset the returned info:
  `if (iinfo > 0) return iinfo + j`.
- **idamax, iladlc, iladlr** return 0-based indices in JS vs 1-based in
  Fortran. Tests must subtract 1 from fixture values.

### Index Strategy: When to Keep 1-Based Internals

For simple routines, use 0-based loop variables throughout — this is the
default. But for routines with deeply nested, complex index arithmetic
(dlaqr5, dlahqr, dlaqr2/3), **keeping internal loop variables 1-based**
(matching Fortran) has proven less error-prone than converting every
expression. The tradeoff: a `(I-1)` at each array access vs. risk of
subtle off-by-ones in expressions like `(KTOP-KRCOL)/2+1`.

Strategy: `var KTOP = ktop + 1;` at function entry (API is 0-based,
internals are 1-based), then use `A[oA + (I-1)*sA1 + (J-1)*sA2]`
directly at every array access. Do NOT hide the `(I-1)` behind helper
functions like `get2d`/`set2d` — the explicit offset keeps the index
arithmetic visible and auditable.

### Multi-Output Return Conventions

Fortran pass-by-reference outputs map to different JS patterns:

| Pattern | Example | Convention |
|---------|---------|------------|
| Object return | `dlanv2` → `{ a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn }` | For routines returning many scalars |
| Object return | `dtrexc` → `{ info, ifst, ilst }` | When in/out params are modified |
| Output array | `dlartg(f, g, out)` → `out[0]=cs, out[1]=sn, out[2]=r` | For small fixed-count outputs |
| Float64Array(1) | `dlasy2(scale, xnorm)` | For scalar output parameters |

Check [docs/dependency-conventions.md](docs/dependency-conventions.md) for
specific routines before calling them.

### Quick-Return Conditions Are Subtle

Quick returns are more complex than simple dimension checks:
```javascript
// WRONG: if (M === 0 || N === 0) return 0;
// RIGHT (dgemm): also check compound conditions
if (M === 0 || N === 0 || ((alpha === 0.0 || K === 0) && beta === 1.0)) return 0;
```
When `beta !== 1`, you **must still scale C** even when `alpha === 0` or
`K === 0`. This pattern applies to dgemm, dsyrk, and similar routines.

### Preserve Fortran Operation Order

Do NOT let linters or formatters reorder statements. In dtrmm, a linter
moved the diagonal multiply before the off-diagonal loop, causing incorrect
results. The Fortran operation order is load-bearing — preserve it exactly.

### Workspace Convention (LAPACKE — STRICT)

**WORK is a caller-provided strided-array parameter, never internally
allocated.** This follows the LAPACKE convention and is enforced by the
`workspace.no-internal-alloc` conformance check on `lib/base.js` and
`lib/ndarray.js`. Reasons:

- Avoids JS allocation churn — mirrors how C/Fortran callers pre-size buffers.
- Enables batching: the layer above `ndarray.js` allocates ONE workspace
  and reuses it across every matrix in a stack.
- Keeps the JS surface aligned with eventual C interop.

**Hard rules:**

1. **`lib/base.js` and `lib/ndarray.js` MUST NOT call `new Float64Array`,
   `new Complex128Array`, `new Int32Array`, `Array.from`, etc. for
   workspace** — even small NB×NB block-reflector scratch. Pass it in as
   a caller-provided WORK segment instead.
2. **Auxiliary scratches (T for block reflectors, S1/S2 for panel
   reductions, RWORK for complex) MUST be partitioned out of the
   caller-provided WORK array** at known offsets, just like the Fortran
   reference does. Document the required WORK size + partition layout in
   the JSDoc `@param` for WORK and in README.md.
3. **The LAPACKE-style layout wrapper (e.g., `dgesvd.js`)** is the
   highest level that may, as a documented convenience, allocate WORK
   when the caller passes `null`/omitted. Prefer requiring caller-provided
   WORK; if you do offer convenience allocation, gate it on `WORK == null`
   and use the same partition formula the routine documents.
4. **`LWORK` parameters are removed.** The Fortran `LWORK=-1`
   workspace-query pattern is not exposed. The required size is fixed by
   the algorithm + parameters and documented in the JSDoc.
5. **TAU and WORK must NEVER alias** — they are separate caller-provided
   strided arrays. Same for ZTGEVC's RWORK vs LSCALE/RSCALE. If two
   regions inside WORK would overlap, that's a bug — partition with
   non-overlapping offsets.

**WORK as ndarray-style parameter:** Expose `work, strideWork, offsetWork`
(snake-cased like other stdlib strided params). The conformance check also warns on
the uppercase Fortran-style `strideWORK`/`offsetWORK` form — fix those
to `strideWork`/`offsetWork`.

**If you find yourself writing `new Float64Array(nb*nb)` for a block
reflector inside a base.js — stop.** That's an algorithmic dependency
on storage you don't control, and it permanently locks the routine out
of zero-allocation batching. Make the caller pass the buffer.

### Dependency Calling Convention Surprises

Before calling a dependency for the first time, check
[docs/dependency-conventions.md](docs/dependency-conventions.md) for known
gotchas (e.g., dlarfg takes alpha as array+offset, not scalar; dlarf vs
zlarf differ in tau parameter type; zlarfb vs zgeqr2 differ in WORK strides).

Additional common gotchas:

- **d-prefix vs z-prefix API differences:** The complex analog of a
  routine may differ in subtle ways. dlacn2 has an ISGN parameter that
  zlacn2 lacks. zdscal takes a real scalar; zscal takes Complex128.
  Always check the actual signature, not just the d-prefix equivalent.
- **LWORK is removed in JS.** WORK is a caller-provided strided-array
  parameter (LAPACKE convention) — see the "Workspace Convention" section.
  The Fortran workspace-query pattern (`LWORK=-1`) is not exposed.
- **Always verify the callee's string convention.** Some JSDoc comments
  may still reference single-char Fortran flags even when the code uses
  long-form strings. Trust the actual `===` comparisons, not the docs.

### Common Patterns

**WORK array partitioning:** Many routines (dgerfs, dsyrfs, dporfs, dptrfs,
dtrrfs, zptrfs) partition a single WORK array into 2-3 segments of N
elements: `WORK[0..N-1]` for abs values, `WORK[N..2N-1]` for residuals,
`WORK[2N..3N-1]` for dlacn2's v vector. Use offset `N*strideWORK` for
each segment.

**Caller-initialized scratch arrays.** Some panel kernels expect the
caller to pre-populate part of an "input" buffer. The clearest example
is Aasen's `dlasyf_aa`/`zlasyf_aa`: the H workspace's first column
(`H(:,0)`) must be initialized by the caller before the panel kernel
is invoked. If the caller passes `H = zeros`, the panel silently
produces zero output for column 0 — no error, no NaN, just wrong
results. The blocked driver (`dsytrf_aa`/`zsytrf_aa`) handles this by
running a `dcopy` of the first row/column of A into `H(:,0)` at the
top of the routine and at the bottom of each main-loop iteration.
When testing a panel kernel in isolation, replicate this initialization
or you'll get correct behavior on column 1+ and zeros on column 0.

**dlacn2 reverse communication:** Used by all iterative refinement routines
for condition estimation. Requires `KASE` as `Int32Array(1)`, `EST` as
`Float64Array(1)`, and `ISAVE` as `Int32Array(3)`. Initialize all to 0
at the start of each RHS column. Loop with `while (true)`, call dlacn2,
break when `KASE[0] === 0`. KASE=1 means multiply by A, KASE=2 means
multiply by A^T.

**Real-to-complex porting:** Translating d-prefix to z-prefix routines is
mostly mechanical: replace dswap→zswap, dscal→zdscal, dnrm2→dznrm2,
idamax→izamax; add `reinterpret()` for zero checks; change `ABS` to
complex modulus. The Fortran test is also mechanical (same structure +
EQUIVALENCE for printing). **Symmetric-to-Hermitian** (e.g., dsymm→zhemm,
dsyrk→zherk) additionally requires adding conjugation at mirror reads,
forcing diagonal imaginary parts to zero, and changing `'transpose'` to
`'conjugate-transpose'`. See the Hermitian vs. Symmetric table above.

---

## stdlib-js API Conventions Reference

### Array Parameters: stride + offset

Every array parameter uses `(array, stride, offset)`:
- Vectors: `(x, strideX, offsetX)`
- Matrices: `(A, strideA1, strideA2, offsetA)`

### Naming Rules

| Fortran | JS (base.js) | Rule |
|---------|-------------|------|
| `N, M, K` | `N, M, K` | Primary dimensions uppercase |
| `k1, k2` | `k1, k2` | Secondary dimensions lowercase |
| `DA` | `alpha` | Conventional scalar renames |
| `DX(*)` + `INCX` | `x, strideX, offsetX` | 1D array: strip D prefix, INC→stride, add offset |
| `A(LDA,*)` + `LDA` | `A, strideA1, strideA2, offsetA` | 2D array: LDA consumed into strides |
| `DL(*)` | `DL, strideDL, offsetDL` | Multi-char array names stay uppercase |
| `IPIV(*)` | `IPIV, strideIPIV, offsetIPIV` | Integer arrays stay uppercase |
| `INFO` | return value | Removed from params, returned as integer |

Use `python bin/signature.py <file.f>` to generate the correct signature.

### Return Values

- BLAS subroutines: `return y` (return the output array)
- BLAS functions (ddot, dasum): `return <scalar>`
- LAPACK with INFO: `return info` (0=success, >0=algorithmic outcome)

### Module Files

| File | Role |
|------|------|
| `base.js` | Core algorithm. No validation. stride/offset API. CommonJS. |
| `ndarray.js` | Validation wrapper → calls base.js. Throws TypeError/RangeError. |
| `index.js` | Entry point. Tries native, falls back to JS. Exports `.ndarray`. |
| `main.js` | Attaches `.ndarray` property to the BLAS-style entry point. |
| `<routine>.js` | BLAS-style API wrapper (layout, no strides/offsets). |

For initial translation, only `base.js` and `test/test.js` are required.
The wrapper files (`ndarray.js`, `index.js`, `main.js`, `<routine>.js`) can be
added later following the stdlib-js patterns in the reference clone.

### Element Access Formula

`A(i, j)` in Fortran (1-based) → `A[offsetA + (i-1)*strideA1 + (j-1)*strideA2]`

With 0-based loop variables: `A[offsetA + i*strideA1 + j*strideA2]`

For column-major: `strideA1 = 1, strideA2 = LDA`
For row-major: `strideA1 = N, strideA2 = 1`

### Performance Patterns

Use incremental pointers (one add per element, not two multiplies). Drop
Fortran stride-1 specializations. Preserve zero-element guards. For `uplo`
routines, use layout-aware stride remapping. See
[docs/performance-patterns.md](docs/performance-patterns.md) for code examples.

**Key optimizations (see [docs/performance-patterns.md](docs/performance-patterns.md)
for code examples):**

1. **Hoist `dlamch()` and constant expressions to module scope.** Never call
   `dlamch()` inside a function body — compute once at module level.
2. **Cache typed-array reads into locals** in hot inner loops (eliminates
   V8 aliasing concerns, reduces bounds checks).
3. **Avoid redundant `reinterpret()` calls** when `cx === cy`.
4. **Document the required WORK size in the JSDoc + README.** WORK is
   caller-provided (LAPACKE convention) — see the "Workspace Convention"
   section. If you find yourself reaching for `new Float64Array` inside
   base.js to "just allocate it", that's the wrong fix — partition the
   caller's WORK instead and document the size formula.

**Profiling:** `bin/instrument.js` for subroutine-level, `bin/profile-zhgeqz.js`
for per-line V8 CPU profiling, `bin/bench-blas.js` for leaf-node throughput.

### uplo/trans String Convention

**ALL string parameters in `base.js` MUST use lowercase long-form strings.
Single-character Fortran flags (`'U'`, `'L'`, `'N'`, `'T'`, `'C'`, `'M'`,
`'F'`, `'E'`, `'V'`, `'S'`, `'I'`, etc.) are CATEGORICALLY FORBIDDEN.**

This is the #1 source of bugs in this codebase. A short-form string like
`'M'` silently fails to match `=== 'max'` and takes the wrong branch,
producing subtly wrong results or zeros that propagate as NaN. We have
found and fixed this bug class **over 20 times** across the codebase.

**The complete mapping (memorize this):**

| Fortran | JavaScript | Parameter type |
|---------|-----------|---------------|
| `'U'` | `'upper'` | UPLO |
| `'L'` | `'lower'` | UPLO |
| `'N'` | `'no-transpose'` | TRANS |
| `'T'` | `'transpose'` | TRANS |
| `'C'` | `'conjugate-transpose'` | TRANS |
| `'L'` | `'left'` | SIDE |
| `'R'` | `'right'` | SIDE |
| `'U'` | `'unit'` | DIAG |
| `'N'` | `'non-unit'` | DIAG |
| `'M'` | `'max'` | NORM |
| `'1'`/`'O'` | `'one-norm'` | NORM |
| `'I'` | `'inf-norm'` | NORM |
| `'F'`/`'E'` | `'frobenius'` | NORM |
| `'F'` | `'forward'` | DIRECT |
| `'B'` | `'backward'` | DIRECT |
| `'C'` | `'columnwise'` | STOREV |
| `'R'` | `'rowwise'` | STOREV |
| `'N'` | `'none'` | COMPZ/JOB |
| `'I'` | `'initialize'` | COMPZ |
| `'V'` | `'update'` | COMPZ |
| `'E'` | `'eigenvalues'` | JOB (hseqr/ddisna) |
| `'S'` | `'schur'` | JOB (hseqr) |
| `'L'` | `'left-vectors'` | JOB (ddisna) |
| `'R'` | `'right-vectors'` | JOB (ddisna) |
| `'N'`/`'P'`/`'S'`/`'B'` | `'none'`/`'permute'`/`'scale'`/`'both'` | JOB (gebal) |
| `'N'` | `'not-factored'` | FACT |
| `'E'` | `'equilibrate'` | FACT |
| `'F'` | `'factored'` | FACT |
| `'N'` | `'no-vectors'` | JOBZ/JOBVL/JOBVR |
| `'V'` | `'compute-vectors'` | JOBZ/JOBVL/JOBVR |
| `'A'` | `'all'` | RANGE/HOWMNY |
| `'V'` | `'value'` | RANGE |
| `'I'` | `'index'` | RANGE |
| `'B'` | `'backtransform'` | HOWMNY |
| `'S'` | `'selected'` | HOWMNY |
| `'Y'` | `'yes'` | NORMIN |
| `'N'` | `'no'` | NORMIN |
| `'Q'` | `'apply-Q'` | VECT |
| `'P'` | `'apply-P'` | VECT |
| `'C'` | `'convert'` | WAY |
| `'R'` | `'revert'` | WAY |
| `'A'`/`'F'`/`'G'` | `'full'` | dlacpy/dlaset TYPE |

**VERIFICATION STEP (mandatory after every translation):**

```bash
# In executable code (not yet an ESLint rule):
grep -n "'[A-Z0-9]'" lib/<pkg>/base/<routine>/lib/base.js | grep -v '//\|^\s*\*\|eslint\|require'

# In @param JSDoc (caught by stdlib/jsdoc-backtick-params, fixable with --fix):
bin/lint.sh lib/<pkg>/base/<routine>
```

If this produces ANY output, you have unconverted Fortran strings. Fix them
before proceeding. This grep MUST return empty for every new module.

For `job`-style parameters with many values, **always invent descriptive
long-form equivalents** — single chars are NEVER acceptable. Examples:
`'N'` → `'none'`, `'P'` → `'permute'`, `'S'` → `'schur'`, `'B'` → `'both'`,
`'E'` → `'eigenvalues'`, `'L'` → `'left-vectors'`, `'R'` → `'right-vectors'`.
If a mapping isn't in the table above, create one that is self-documenting.
Check existing modules for established conventions before inventing new ones.

### Validator strings MUST match base.js dispatch keys

Single-char short forms aren't the only string trap. **Long-form strings
that don't match between the validator and base.js cause silent
correctness bugs** — the validator passes, base never sees a string it
recognizes, and the routine takes a no-op or wrong-mode branch while still
returning `info=0`. This bug class has been seen in dgesvd, dorgbr, dormbr,
and dlascl.

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

**Picking the canonical name.** When choosing between competing forms:
- Prefer the more semantically specific one (`'all-columns'` over `'all'`,
  since `'all'` is ambiguous between rows and columns).
- Match the project's existing canonical for the same concept — see
  the "Canonical string flag values" table later in this section. For
  jobz/jobvs/jobvl/jobvr the canonical is `'no-vectors'`/`'compute-vectors'`.
- Avoid single-letter forms (`'q'`, `'p'`, `'V'`, `'N'`) — they're the
  Fortran shorthand we're translating away from.

**Anti-pattern: single-branch validators.** Real example from `dorgbr.js`:

```js
if ( vect !== 'apply-Q' ) {     // BUG: rejects valid 'apply-P'
    throw new TypeError( ... );
}
```

When the Fortran spec lists multiple legal values, the validator must be a
positive whitelist (`!== a && !== b && !== c`), not a single inequality.
This bug shows up when a scaffold copy-paste retains only the value the
first test happened to use.

**Verification (mandatory after every translation):**

```bash
# Strings ndarray validator accepts:
grep -nE "[!=]==.*'[a-z-]+'" lib/<pkg>/base/<routine>/lib/ndarray.js

# Strings base.js dispatches on:
grep -nE "[!=]==.*'[a-z-]+'" lib/<pkg>/base/<routine>/lib/base.js

# These should print identical sets. If they differ, fix base.js or the
# wrapper — do NOT add a translation table.
```

### Canonical string flag values

Use these exact long-form strings end-to-end (base.js dispatch, wrapper
validators, ndarray.js validators, tests, examples, README). Never
abbreviate, never alias.

| Param family | Canonical values |
|--------------|------------------|
| `order` | `'row-major'`, `'column-major'` |
| `uplo` | `'upper'`, `'lower'` |
| `trans`, `transa`, `transb`, `transr` | `'no-transpose'`, `'transpose'`, `'conjugate-transpose'` |
| `side` | `'left'`, `'right'` |
| `diag` | `'unit'`, `'non-unit'` |
| `direct` | `'forward'`, `'backward'` |
| `storev` | `'columnwise'`, `'rowwise'` |
| `norm` | `'max'`, `'one-norm'`, `'inf-norm'`, `'frobenius'` |
| `compz`, `compq` | `'none'`, `'initialize'`, `'update'` |
| `jobz`, `jobvl`, `jobvr`, `jobvs`, `jobvsl`, `jobvsr` | `'no-vectors'`, `'compute-vectors'` |
| `jobu` (gesvd family) | `'all-columns'`, `'economy'`, `'overwrite'`, `'none'` |
| `jobvt` (gesvd family) | `'all-rows'`, `'economy'`, `'overwrite'`, `'none'` |
| `jobu`, `jobv`, `jobq` (ggsvd3/ggsvp3 family) | `'compute-U'`/`'compute-V'`/`'compute-Q'`, `'none'` |
| `jobu`, `jobv`, `jobq` (tgsja family) | `'compute-vectors'`, `'initialize'`, `'none'` |
| `vect` (orgbr/ormbr/ungbr/unmbr) | `'apply-Q'`, `'apply-P'` |
| `vect` (sbtrd/hbtrd) | `'none'`, `'initialize'`, `'update'` |
| `vect` (gbbrd) | `'no-vectors'`, `'q-only'`, `'p-only'`, `'both'` |
| `range` (eigenvalue selection) | `'all'`, `'value'`, `'index'` |
| `howmny` | `'all'`, `'backtransform'`, `'selected'` |
| `range` (dlarrd, dstebz block selection — not the eigenvalue range) | `'all'`, `'value'`, `'index'` |
| `order` (dlarrd, dstebz — block ordering, NOT the layout `order`) | `'block'`, `'entire'` |
| `fact` (svx family) | `'not-factored'`, `'equilibrate'`, `'factored'` |
| `equed` (gesvx/gbsvx/laqge/laqsy family) | `'none'`, `'row'`, `'column'`, `'both'` |
| `equed` (pbsvx/ppsvx/posvx family) | `'yes'`, `'none'` |
| `sort` | `'none'`, `'sort'` |
| `normin` | `'no'`, `'yes'` |
| `signs` | `'no-signs'`, `'compute-signs'` |
| `way` | `'convert'`, `'revert'` |
| `job` (gebal) | `'none'`, `'permute'`, `'scale'`, `'both'` |
| `job` (hseqr) | `'eigenvalues'`, `'schur'` |
| `job` (ddisna) | `'eigenvalues'`, `'left-vectors'`, `'right-vectors'` |
| `cmach` (dlamch) | `'epsilon'`, `'safe-minimum'`, `'precision'`, `'base'`, `'digits'`, `'rounding'`, `'min-exponent'`, `'underflow'`, `'max-exponent'`, `'overflow'` |

When translating a routine whose flag isn't in this table, search for
the same flag name in already-translated sister modules (e.g. real ↔
complex pair) and adopt their canonical. Don't invent a new vocabulary
unless no precedent exists. If you DO invent one, prefer the more
semantically specific form (`'all-columns'` over `'all'`, since a single
word may be ambiguous when paired with an analogous flag like jobvt).

### Recurring scaffold-emitted noise to scrub

The scaffold leaves predictable artifacts that have shown up in nearly
every translated module. None of these get caught by tests, so check by
hand or by the conformance check:

- **Description trailing comma+period: `"...matrix A,."`** — sed-fixable.
- **`@returns {*} result`** in `<routine>.js` — replace with the real type
  (usually `{integer} info` or `{Float64Array}`).
- **Orphan top-of-file JSDoc in `ndarray.js`** with no `@license` block,
  followed by a second real JSDoc above the function. Drop the orphan,
  add the license header.
- **Stray `// Copyright (c) 2025 Ricky Reusser. Apache-2.0 License.`**
  comment beneath the proper Apache-2.0 license block. Delete it.
- **`examples/index.js` and `benchmark/*.js` using single-char Fortran
  flags** (`'A'`, `'N'`, `'T'`) — these get past the conformance check because they're
  not in `lib/base.js` but they DO break example execution under the new
  validators. Convert to the long-form strings the validator accepts.
- **`test.ndarray.js` requiring `lib/base.js`** — bypasses the validator.
  Should require `lib/ndarray.js` (use base.js only in a separate
  `test.base.js` if you genuinely need to bypass validation).

### Complex Number Support

For z-prefix (complex) routines, see [docs/complex-numbers.md](docs/complex-numbers.md)
for the full reference (reinterpret pattern, arithmetic APIs, test patterns).

Key rules (always in effect):
- API boundary uses `Complex128Array` (strides/offsets in complex elements)
  and `Complex128` scalars. Inside routines, `reinterpret(x, 0)` for Float64
  views, multiply strides/offsets by 2 for Float64 indexing.
- **NEVER** inline complex division or absolute value — use `cmplx.div`/`cmplx.abs`.
- **Stride convention mismatch** — Two conventions coexist and mixing them
  causes silent corruption. If a routine's source does `sa1 = strideA1 * 2`,
  it expects complex-element strides. If it directly indexes
  `offset + i*strideA1`, it expects double-based strides. See the doc for
  which routines use which convention.

---

## Known Limitations

- Fortran `.f90` files that use modules (`USE la_constants`) cannot be
  compiled by `run_fortran.sh` without module compilation ordering.
  Work around: write JS tests with hand-computed expected values.
- **`deps.py` misses transitive Fortran-only dependencies.** Routines
  that call `ILAENV` transitively need `ilaenv`, `ieeeck`, `iparmq` in
  their Fortran deps file for test compilation. These are not JS
  dependencies (ILAENV is replaced with hardcoded constants), but
  `deps_<routine>.txt` must include them for `run_fortran.sh` to link.
  Check the deps files of similar routines when compilation fails with
  undefined references.
