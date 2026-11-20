---
name: blahpack-translate
description: Run the full translation checklist for a BLAS/LAPACK routine. The argument is the routine name (e.g. `dpotf2`).
argument-hint: <routine>
---

# Translate a Fortran BLAS/LAPACK Routine to JavaScript

Translate the routine `$ARGUMENTS` with the checklist below, then use the
judgment reference that follows it. Determine the package (blas or lapack)
by checking whether the source exists in `data/BLAS-3.12.0/` or
`data/lapack-3.12.0/SRC/`.

The rules live in [CONVENTIONS.md](../../../CONVENTIONS.md) (IDs S*, D*, W*,
V*, N*, C*, F*, J*, T*, X*, Appendix A). This skill cites them; it does not
restate them. The gates enforce them, so the loop is: write code, run the
gates, fix what they report.

Also read `docs/complex-numbers.md` for z-prefix routines and
`docs/dependency-conventions.md` before calling unfamiliar dependencies.

Context efficiency (never `npm test`/`npm run check`, pipe through `tail`):
see CLAUDE.md.

## Do NOT Translate: Extended-Precision (XBLAS) Routines

Routines whose names end in `_extended`, or that call XBLAS primitives
(`BLAS_*_X`, `BLAS_*2_X`), are out of scope. If `python bin/deps.py <routine>`
reports `blas_*_x [NOT FOUND]`, or the Fortran source declares any
`BLAS_*_X` external, **stop immediately** and report the routine as blocked
on XBLAS. Do not substitute plain-precision BLAS, add stubs, or fall back
to invariant tests — a proper port requires XBLAS support and is a separate
project.

## Automation-First Mindset

Any manual work that repeats across routines is a bug in the tooling. If you
perform the same mechanical transformation twice, stop and automate it (new
transform in `bin/transform.py` or script in `bin/`) before continuing.

---

## Checklist

### Step 0: Dependencies and signature

```bash
python bin/deps.py <routine>            # full dependency tree
python bin/deps.py <routine> --order    # implementation order (leaves first)
python bin/signature.py data/lapack-3.12.0/SRC/<routine>.f   # or data/BLAS-3.12.0/<routine>.f
```

All dependencies must already be implemented; if not, implement the leaves
first. **Never scaffold stub modules that throw "not yet implemented"** —
report the missing dependency and stop. The signature output is the `base.js`
contract (S1).

### Step 1: Initialize the module

```bash
python bin/init_routine.py <package> <routine> -d "<one-line description>"
```

This scaffolds the full file set (F1), generates `test/fortran/deps_<routine>.txt`,
generates a `test.ndarray.js` scaffold if a fixture already exists, and prints
the remaining commands. Option params need validators that accept exactly the
reference's values (V3, N1, N8, Appendix A). For a flag not in Appendix A,
adopt the sister module's canonical values (real ↔ complex pair).
The benchmarks start as throwing stubs until `lib/base.js` exists; generate
them after implementing (see Benchmarks below).

### Step 2: Fortran test and fixtures

Create `test/fortran/test_<routine>.f90` using the `test_utils` module:

```fortran
program test_<routine>
  use test_utils
  implicit none
  ! Declare variables...

  ! Test case 1: basic operation
  call <ROUTINE>(args...)
  call begin_test('basic')
  call print_array('result', result_array, n)  ! or print_scalar / print_int
  call end_test()

  ! Test case 2: edge case (n=0)...
end program
```

**Required cases:** basic operation; N=0 (quick return) and N=1; alpha/beta
∈ {0, 1, other} where applicable; non-unit and negative strides (BLAS); a
case that returns INFO > 0 (LAPACK).

**Complex arrays:** print interleaved re/im via EQUIVALENCE:
```fortran
double precision :: zx_r(20)
complex*16 :: zx(10)
equivalence (zx, zx_r)
call print_array('zx', zx_r, 2*n)
```

**CRITICAL: leading dimension vs EQUIVALENCE stride.** If you declare
`A(NMAX, NMAX)` but use an N-by-N matrix, printing `2*N*N` doubles through
EQUIVALENCE reads padding instead of the next column. Either pack the
submatrix into a contiguous array before printing, or declare `A(N, N)`.
This silently corrupted 8+ fixture files in one session.

**Fortran deps the dependency tree misses** (add to `deps_<routine>.txt`):
- `la_constants`, `la_xisnan` — for anything reaching `dlassq.f90` (norm
  routines: dlansb, dlansp, dlantb, dlantp, zlassq, …). `run_fortran.sh`
  builds these modules.
- `dladiv` — for anything reaching `zladiv`.
- `ilaenv`, `ieeeck`, `iparmq` — for anything calling `ILAENV` transitively.
Check similar routines' deps files when linking fails with undefined references.

Generate the fixture and the JS test scaffold:

```bash
./test/run_fortran.sh <package> <routine>
python bin/gen_test.py <package> <routine> > lib/<package>/base/<routine>/test/test.ndarray.js
```

### Step 3: Translate base.js (judgment)

```bash
python bin/fortran_body.py data/<source-path>/<routine>.f
```

Translate the stripped body following the reference sections below:
[Faithfulness](#faithfulness), [GOTO restructuring](#goto-restructuring),
[Complex arithmetic](#complex-arithmetic), [Fortran idioms](#fortran-idioms),
[Index landmines](#index-landmines), the storage/driver sections,
[Dependencies](#dependencies), and [Naming and comments](#naming-and-comments).
Signature, workspace, validation, and import style are owned by S*, D*/W*, V*,
and N4.

### Step 4: JS tests

Fill in `test/test.ndarray.js` with computation tests from the fixture; the
scaffolded `test.js` and `test.<routine>.js` cover exports and the wrapper.
Requirements: T1–T4. Test-design advice is in [Test design](#test-design).

```bash
node --test lib/<package>/base/<routine>/test/test*.js 2>&1 | tail -20
node --test --experimental-test-coverage lib/<package>/base/<routine>/test/test*.js 2>&1 | tail -30
```

### Step 5: Lint and conformance loop (until clean)

```bash
bin/lint-fix.sh lib/<package>/base/<routine> 2>&1 | tail -20   # codemods + eslint --fix + test verify
bin/lint.sh lib/<package>/base/<routine> 2>&1 | tail -20
node bin/conformance.js lib/<package>/base/<routine>
bin/spec xcheck <routine>
```

Repeat until all four are clean and conformance reports `complete`. **Fix the
code, don't silence the rule** (T5); if a rule is genuinely wrong, the rule
gets fixed. To check dependents for regressions, run
`bin/test-failures.sh 2>&1 | tail -30`.

### Step 6: LEARNINGS.md (mandatory)

Fill in `lib/<package>/base/<routine>/LEARNINGS.md`: no `TODO: Fill in`
placeholder may remain; at least one concrete bullet (or `N/A`) per section.
It captures what would make the NEXT translation faster:

- **Translation pitfalls**: off-by-ones, stride confusion, non-obvious Fortran semantics.
- **Dependency interface surprises**: also add them to
  [docs/dependency-conventions.md](../../../docs/dependency-conventions.md).
- **Missing automation**: mechanical steps that should be scripted.
- **Coverage gaps**: paths that were hard to test, and why.
- **Complex number handling**: subtleties in the arithmetic.

LEARNINGS.md is for process, not code issues. A known divergence from the
reference goes in `DIFFERENCES.md` or a ticket; an uncoverable branch gets a
plain comment in `base.js` saying why (J5, X6). Bullets, not prose.

**Benchmarks.** After lint passes, generate them. `bin/gen-benchmark.mjs`
probes the implemented routine for a working argument list and overwrites the
scaffold stubs (conformance check `scaffold-noise.benchmark-generated` fails
until it has run):

```bash
node bin/gen-benchmark.mjs lib/<package>/base/<routine> --write
ls lib/<package>/base/<routine>/benchmark/*.js > /tmp/bench-list.txt && bin/bench-smoke.sh /tmp/bench-list.txt
```

Arrays that repeated in-place calls would grow to Inf/NaN are restored before
each call automatically. If the smoke run still fails, fix the inputs in
`bin/gen-benchmark.mjs`, not by hand-editing the generated file.

### Step 7: Validate

Run `/blahpack-validate <routine>` to raise the routine to L3 (T7). Every bug
the harness catches gets a `test/harness/LEARNINGS.md` entry (T8).

---

## Faithfulness

`base.js` is a faithful translation of the reference (X1, X3).

**Complete implementations, not partial ones.** Implement ALL valid parameter
combinations from the Fortran — every SIDE/TRANS/UPLO/STOREV/DIRECT/JOB
branch — not just the subset the current caller needs. Each module is a
standalone building block: a future caller of an unimplemented path fails far
from the root cause. Never stub a branch with `throw new Error('not yet implemented')`.

**Preserve Fortran operation order.** Don't let linters or formatters reorder
statements. In dtrmm, a linter moved the diagonal multiply before the
off-diagonal loop and broke results. The order is load-bearing.

**Quick-return conditions are subtle.** They're often compound:
```javascript
// WRONG: if (M === 0 || N === 0) return 0;
// RIGHT (dgemm):
if (M === 0 || N === 0 || ((alpha === 0.0 || K === 0) && beta === 1.0)) return 0;
```
When `beta !== 1` you must still scale C even when `alpha === 0` or `K === 0`
(dgemm, dsyrk, and similar).

**Recursive variants (`dgelqt3`, `dgeqrt3`, …).** Implement recursion as a
direct self-call on the exported `base.js` function — no trampoline, no named
function expressions. The recursive `IINFO` can be dropped when the recursion
preserves an invariant that makes failure unreachable (e.g. M ≤ N for `dgelqt3`).

## GOTO restructuring

Restructure without changing control flow (X2). See
[docs/goto-patterns.md](../../../docs/goto-patterns.md) for the full pattern
table. Common cases: `GO TO` inside DO → `continue`; backward `GO TO` →
`while`/`do-while`; forward `GO TO` → `if/else`.

## Complex arithmetic

Rules: C1–C5. Reference: [docs/complex-numbers.md](../../../docs/complex-numbers.md).
Division, `abs`, and `sqrt` always go through `lib/cmplx.js` (C3); comment
every inlined operation with the math it represents.

**Hermitian vs. symmetric: silent differences.** Structurally identical,
critically different:

| Aspect | Hermitian (zh\*) | Symmetric (zs\*) |
|--------|-----------------|-------------------|
| Diagonal | Real-only; imaginary forced to zero | Fully complex |
| Off-diagonal | `conj(A[k,i])` when reading mirror | `A[k,i]` directly (no conjugation) |
| Alpha type (rank-k) | Real scalar | Complex scalar |
| Beta type (rank-2k) | Real scalar | Complex scalar |
| Trans values | `'no-transpose'` / `'conjugate-transpose'` | `'no-transpose'` / `'transpose'` |

**In-place update aliasing.** When computing `C[i,j] = beta*C[i,j] + ...`
with complex beta, save both parts first; the real-part write clobbers data
the imaginary part needs:
```javascript
cR = Cv[ic]; cI = Cv[ic+1];
Cv[ic] = betaR*cR - betaI*cI + ...;
Cv[ic+1] = betaR*cI + betaI*cR + ...;
```

**Complex `X.NE.ZERO`** is `xr !== 0.0 || xi !== 0.0` — OR, not AND.

**`CABS1(z)`** is `Math.abs(re) + Math.abs(im)` (used for backward error
norms). It is NOT `ABS(z)`, the true modulus (`cmplx.abs`).

**zrot sine.** `zrot` takes its complex sine `s` as a `Float64Array(2)`
`[re, im]`, not a `Complex128`/`Complex128Array`. When the sine comes from a
reinterpreted WORK array, copy it to a scratch `Float64Array(2)` first.

**Real-to-complex porting.** Mostly mechanical: dswap→zswap, dscal→zdscal,
dnrm2→dznrm2, idamax→izamax; add `reinterpret()` for zero checks; `ABS` becomes
the complex modulus. The Fortran test is the same structure plus EQUIVALENCE.
**Symmetric-to-Hermitian** (dsymm→zhemm, dsyrk→zherk) also needs conjugation at
mirror reads, zeroed diagonal imaginary parts, and `'transpose'` →
`'conjugate-transpose'`.

## Fortran idioms

| Fortran | JavaScript | Gotcha |
|---------|-----------|--------|
| `SIGN(A, B)` | `Math.abs(a) * (Math.sign(b) \|\| 1.0)` | `Math.sign(0)` is 0, but Fortran's `SIGN(A,0)` is `+|A|`. The `\|\| 1.0` is **critical** — omitting it caused a real NaN bug in zlarfg. |
| `DISNAN(X)` | `x !== x` (or `Number.isNaN(x)`) | Self-comparison NaN test |
| `DLAMCH('S')` | smallest normal (`2.2e-308`) | X4. Never `Number.MIN_VALUE` (subnormal `5e-324`). |
| `DLAMCH('E')` | `Number.EPSILON / 2` | Machine epsilon (half-precision) |
| `DLAMCH('P')` | `Number.EPSILON` | Precision = epsilon × base. Distinct from `'E'`. |
| `safmin` / `safmax` | `import FLOAT64_SMALLEST_NORMAL from '@stdlib/constants/float64/smallest-normal/lib/index.js'` (or module-scope `dlamch( 'safe-minimum' )`) / `1.0 / safmin` | Hoist to module scope (X4). |
| `ILAENV(1, ...)` | `NB = 32` (hardcoded) | X3. Defaults vary by query: `ILAENV(1)` → NB=32, `ILAENV(3)` → NX=128 (crossover), `ILAENV(12)` → NMIN=12 (dlaqr3 threshold). Check which query the source uses. |
| Integer division | `(expr)\|0` | Fortran truncates toward zero, like `\|0`, NOT `Math.floor`: `Math.floor(-3/2) = -2`, Fortran gives `-1`. |
| `ABS(z)` (complex) | `cmplx.abs` | C3: never inline (overflows). |

## Index landmines

**Element access.** `A(i, j)` (1-based) → `A[offsetA + (i-1)*strideA1 + (j-1)*strideA2]`;
with 0-based loop variables, `A[offsetA + i*strideA1 + j*strideA2]`.

- **IPIV is 0-based at the API** (S12). Fortran's 1-based values are converted
  inside `base.js`; `ndarray.js` passes them through. Subtract 1 from Fortran
  fixture values when comparing.
- **Negative IPIV (Bunch-Kaufman) is variant-dependent.** The `dsytrf`,
  `dsytrf_rk`, `dsytrf_rook` family (plus z and `_3` variants) encodes 2x2
  pivots as negative 1-based values (`-p`). With the bitwise-NOT convention,
  `~(p-1) = -p`, so the raw value matches Fortran. Decode with `~IPIV[i]`, not
  `-IPIV[i] - 1`. **Aasen's algorithm uses plain integer pivots**
  (`dlasyf_aa`, `zlasyf_aa`, `dsytrf_aa`, `zsytrf_aa`): 0-based row indices,
  no negative encoding. Two agents got this wrong by analogy — check the source.
- **INFO stays 1-based**: 0 = success, k > 0 = outcome at position k, so
  `return j + 1` from a 0-based loop.
- **Recursive/blocked INFO offset**: a failing call on a submatrix starting at
  column j returns `iinfo + j`.
- **idamax, iladlc, iladlr** return 0-based indices; subtract 1 from fixtures.

**When to keep 1-based internals.** 0-based loop variables are the default.
For routines with deeply nested index arithmetic (dlaqr5, dlahqr, dlaqr2/3),
keeping internals 1-based has proven less error-prone than converting
expressions like `(KTOP-KRCOL)/2+1`. Convert at entry (`const KTOP = ktop + 1;`),
then write `A[oA + (I-1)*sA1 + (J-1)*sA2]` at each access. Don't hide the
`(I-1)` behind `get2d`/`set2d` helpers — keep the arithmetic visible.

## Storage indexing

### Packed storage

Packed storage is the #1 source of translation bugs. Key formulas (0-based):

| Operation | Upper | Lower |
|-----------|-------|-------|
| Diagonal of column j | `(j+1)*(j+2)/2 - 1` | `j*(2*N-j+1)/2` |
| Column pointer advance | `jc += j + 1` | `jc += N - j` |
| IP update (non-transpose) | `ip -= (j+1)` | `ip += (N-j)` |

For Complex128Array via reinterpret, multiply packed indices by 2. Helpers
like `iupp(i,j)` and `ilow(i,j,N)` return Float64 offsets (×2) for complex
routines but element offsets for real ones — getting this wrong is silent.

### Band storage

`A(i,j)` maps to `AB(KU+1+i-j, j)` (Fortran) or
`AB[offsetAB + (ku+i-j)*strideAB1 + j*strideAB2]` (JS 0-based). Derived strides:
- `INCA = KD1 * strideAB2` (not `KD1 * strideAB1`)
- `INCX = strideAB2 - strideAB1` (diagonal-like traversal)

### RFP (Rectangular Full Packed)

RFP routines have 8 dispatch paths: 2 (odd/even N) × 2 (transr) × 2 (uplo).
Each maps sub-blocks of the 1D RFP array to 2D operations (dtrsm, dsyrk,
zherk, …) with different offsets and leading dimensions. The Fortran
`A(offset)` with `LDA` maps to `A, sa, sa*LDA, offsetA + sa*offset`.

## Driver patterns

### Expert drivers

Expert drivers (dppsvx, dpbsvx, zgbsvx, …) share a structure: optional
equilibration (dppequ/dlaqsp or band equivalents) → copy to factored storage →
factor → norm → condition estimate → solve → iterative refinement with error
bounds. `equed` is an in/out string: pass a single-element array (`['none']`)
when it's both read and written.

### Eigenvalue drivers

Eigenvalue drivers (dspev, dsbev, zhbev, …) share: norm for scaling (dlansp,
dlansb, zlanhb) → scale if near under/overflow (dlascl) → reduce to
tridiagonal (dsptrd, dsbtrd, zhbtrd) → for vectors, generate Q (dopgtr) or
take it from the reduction → eigenvalues via dsterf (values only) or
`dsteqr('update', ...)` → unscale. dsbtrd `vect='initialize'` builds Q from
identity; dsteqr `compz='update'` means Z already holds Q.

### Compact-WY block reflectors

The compact-WY family (`dgeqrt`/`dgeqrt2`/`dgeqrt3`, `dgelqt`/`dgelqt3`,
`dtpqrt`/`dtpqrt2`, `dtplqt`/`dtplqt2`, `dgemqrt`, `dtpmqrt`, `dgemlqt`,
`dtpmlqt`, plus z counterparts) produces V *and* the triangular factor T
directly, with no separate `dlarft` call.

- **τ storage trick.** The leaf kernels write each τ into `T(:,0)` first
  (scratch), then the T-construction loop overwrites `T(i,i)` in place.
  Preserve the two-pass structure.
- **Last column of T as workspace.** During reflector application T's last
  column is scratch; the construction loop must guard `if (i < N-1)` on
  writes that would clobber an unprocessed reflector. Without it T is
  silently corrupted.
- **Appliers (`dgemqrt`, `dtpmqrt`, `dgemlqt`, `dtpmlqt`).** Block iteration
  is forward for (left, transpose) and (right, no-transpose), backward for
  the other two. `dlarfb`/`dtprfb` treat WORK as logically 2D — see
  [docs/dependency-conventions.md](../../../docs/dependency-conventions.md).
- **Scaffold can't infer compact-WY shapes.** `scaffold.py` guesses A is
  M-by-N from `A(LDA,*)`, but in `dtpqrt2`/`dtplqt2` A is N-by-N and B is
  M-by-N. Audit the generated LD validators against the Fortran (V5).

### Workspace partitioning and scratch

Workspace rules: D4, D5, W1–W5.

**WORK partitioning.** Refinement routines (dgerfs, dsyrfs, dporfs, dptrfs,
dtrrfs, zptrfs) split WORK into N-sized segments: `[0, N)` for abs values,
`[N, 2N)` for residuals, `[2N, 3N)` for dlacn2's v. Segment k starts at
`offsetWork + k*N*strideWork`. Scratches the reference carves out of WORK
(block-reflector T, panel S1/S2) stay partitioned the same way, with
non-overlapping offsets; TAU and WORK never alias.

**Caller-initialized scratch.** Aasen's `dlasyf_aa`/`zlasyf_aa` expect the
caller to fill `H(:,0)` before the panel runs; with `H = zeros`, column 0
silently comes out zero. The blocked driver (`dsytrf_aa`/`zsytrf_aa`) does a
`dcopy` of A's first row/column into `H(:,0)` at the top and at the end of each
iteration. Replicate that when testing the panel in isolation.

**dlacn2 reverse communication.** Used by all refinement routines for
condition estimation. `KASE` is `Int32Array(1)`, `EST` is `Float64Array(1)`,
`ISAVE` is `Int32Array(3)`; zero them at the start of each RHS column. Loop
with `while (true)`, call dlacn2, break when `KASE[0] === 0`. KASE=1 multiplies
by A, KASE=2 by Aᵀ.

## Dependencies

Call dependencies through their `base.js` (X7). Before calling one for the
first time, check [docs/dependency-conventions.md](../../../docs/dependency-conventions.md)
(e.g. dlarfg takes alpha as array+offset; dlarf vs zlarf differ in tau type;
zlarfb vs zgeqr2 differ in WORK strides).

**Don't inline standard routines.** If a helper corresponds to a named
reference routine:
- **Multiple callers in reference LAPACK** → its own module; the parent imports it.
- **Single caller only** → may be a local function in the parent's `base.js`,
  but it still needs targeted tests through the parent.

Check callers with `grep -rl "CALL ZFOO" data/lapack-3.12.0/SRC/`. Never
duplicate a module that already exists (e.g. `zunmqr`): import it.

**d vs z APIs differ.** dlacn2 has ISGN; zlacn2 doesn't. zdscal takes a real
scalar; zscal takes `Complex128`. Check the actual signature.

**Trust the callee's code, not its JSDoc.** Comments may still mention
single-char flags; the `===` comparisons are what count.

**Multi-output returns.** Callees return outputs in different shapes (S10, S11):

| Pattern | Example |
|---------|---------|
| Object return | `dlanv2` → `{ a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn }`; `dtrexc` → `{ info, ifst, ilst }` |
| Output array | `dlartg(f, g, out)` → `out[0]=cs, out[1]=sn, out[2]=r` |
| Float64Array(1) | `dlasy2(scale, xnorm)` |

## Naming and comments

- Local names mirror the Fortran variables (`KTOP`, `safmin`, `iinfo`) so the
  code can be reviewed line-by-line against the reference (N6).
- Comment every inlined complex operation with the math it represents.
- Keep index arithmetic explicit (`(I-1)`) rather than hidden in helpers.
- An uncoverable branch gets a plain comment saying why (e.g.
  `// Unreachable in IEEE 754 double: …`); no `TODO` (J5).
- Single-char Fortran flags were historically the #1 bug class (`'M'` silently
  fails `=== 'max'`); use the Appendix A strings everywhere (N1, N8).

## Performance

Optimizations follow X5 and [docs/optimization-policy.md](../../../docs/optimization-policy.md);
code examples are in [docs/performance-patterns.md](../../../docs/performance-patterns.md).

- Use incremental pointers (one add per element, not two multiplies).
- Preserve the Fortran's zero-element guards.
- For `uplo` routines, use layout-aware stride remapping.
- Hoist `dlamch()` and constant expressions to module scope.
- Cache typed-array reads into locals in hot inner loops.
- Avoid redundant `reinterpret()` calls when `cx === cy`.

## Test design

Fixtures must match the Fortran exactly, pivots and tie-breaks included (T1).
A mismatch is a bug in the port, not a tolerance problem. Mathematical
properties (`A*x ≈ b`, `PLU ≈ A`, orthogonality) are added through the harness
(`/blahpack-validate`), not used in place of fixtures.

The one exception is an output the problem leaves non-unique *and* that is
ill-conditioned, so last-bit rounding (e.g. gfortran contracting to FMA) picks
a different valid answer. Examples: rank-deficient QR, GSVD, and eigenvectors of
nearly tied eigenvalues. Compare the invariant there (subspace, residual,
orthogonality) and say in the test why the elements can't be compared. Prefer
fixture inputs that avoid the ambiguity (well-separated values, no tied norms).

- **Blocked paths (NB=32/64)** need large matrices. Use NB=2 in tests to
  exercise blocked paths with small matrices (dtrtri did this).
- **Always test alpha ≠ 1** (e.g. alpha=2.0, beta=0.5); first drafts miss
  scaling branches.
- **Use well-conditioned (diagonally dominant) matrices** for fixtures;
  near-singular inputs amplify rounding differences between paths.
- **Reverse-pivot mode (dlaswp with incx<0)** had a real bug: verify swaps
  apply in reverse order.
- **Pivot ties (dgeqp3, zgeqp3).** idamax must match Fortran (first maximum),
  so ties are not an excuse for divergence. As fixture hygiene, still prefer
  irregular inputs (sin/cos) so pivot order isn't decided by rounding.
- **Fortran array reuse:** Fortran tests may reuse arrays across cases
  without re-zeroing (SR/SI in dlaqr2). Zero them in Fortran or account for
  stale values.
- **Round-trip solve/multiply pairs:** multiply, then solve, and check the
  original is recovered; this validates both routines.
- **Orthogonality/diagonality helpers:** a small local helper in the test file
  (`QᵀQ ≈ I`, `|A_ij| < tol` off-diagonal) is fine; keep it readable.

**Coverage** (T4). If it's low: test every `uplo`/`trans`/`side`/`diag`
combination, N=0/M=0/alpha=0, 1e300/1e-300 values, non-unit and negative
strides. Systematically hard-to-cover paths, acceptable with a plain comment
(J5):
- Exceptional shifts in QZ iteration (slow convergence)
- sfmin rescaling (inputs near underflow)
- STOREV='R' / backward direction in dlarfb/dlarft
- Iteration-limit and convergence-failure (info > 0) branches
- safe2/SAFE1 underflow guards in refinement routines (dgerfs, dsyrfs, dporfs,
  dptrfs, dtrrfs, zptrfs): need WORK values near 1e-308
- Collapsed/underflowed bulges in dlaqr5 (all three bulge elements zero)
- Compound quick returns (`alpha=0 && beta=1`) in Level-3 routines
