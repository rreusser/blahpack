# zsytrf_rook: Translation Learnings

## Translation pitfalls

- **Direct mechanical port from `dsytrf_rook`.** The Fortran z- and
  d- variants of this driver are structurally identical (`A = U*D*U^T`
  or `L*D*L^T` with rook pivoting); only the workspace and `A` types
  change from `Float64Array` to `Complex128Array`. The IPIV adjustment
  in the lower path (and the bitwise-NOT re-wrap for negative
  encodings) carries over byte-for-byte. Always start from the
  d-prefix sister when one exists.
- **Drop ILAENV/LWORK entirely.** Hardcode `NB = 32` at module scope;
  do not surface `WORK`/`LWORK` in the JS API. The scaffold leaves
  these in the wrapper signatures (`ndarray.js`, `<routine>.js`,
  README, examples, benchmarks) and they all need scrubbing.
- **Workspace allocation.** `W = new Complex128Array(ldwork * nb)` is
  allocated inside the driver (one per call to `zlasyf_rook`) since
  no caller provides workspace.
- **Negative-IPIV re-wrap formula.** `IPIV[j] = ~((~IPIV[j]) + k)`
  shifts a negative-encoded 0-based pivot by `k` while preserving the
  sign-encoding convention. The existing `dsytrf_rook` implementation
  has the exact same line — copy it verbatim, don't try to derive it.
- **Tied-pivot magnitudes diverge between Fortran and JS.** A 40x40
  matrix with a constant diagonal value (`A(i,i) = 3*N + 0.5i` for
  all i) produces ties in the 2x2-pivot magnitude search; Fortran's
  `IZAMAX` and `cabs1` rounding tie-break differently from JS for
  some columns, leading to divergent IPIV traces even though the
  matrix is diagonally dominant. Vary the diagonal by index
  (`A(i,i) = (3N + i) + (0.5 + 0.1i)*1j`) to avoid this.

## Test scaffold pitfalls (high-impact, easy to miss)

- **Diagonal overwrite bug in `buildBlockedMatrix`.** Iterating
  `for (i = lo; i <= hi; i++)` includes the diagonal entry when
  `lo <= j <= hi`, which silently overwrote my freshly-written
  diagonal with the off-diagonal formula in the upper case. The
  initial symptom was JS picking 2x2 pivots where the matrix was
  actually a zero-diagonal indefinite (because the diagonal write
  never took effect). Fix: write diagonal entries inside the loop
  with an explicit `if (i === j)` branch, OR skip `i === j` in the
  off-diagonal loop. Mirroring the Fortran's structure literally is
  the safest approach.
- **EQUIVALENCE stride mismatch with `NMAX > n`.** Fortran test uses
  `complex*16 :: A(NMAX, NMAX)` with `NMAX=50` even when the test
  matrix is `n=4`. Column stride in memory is `NMAX`, not `n`, so
  printing `2*NMAX*n` doubles is what we want, and the JS comparison
  must pass `lda=50` (NMAX) to `extractSubmatrix`, not `n`. This
  matches the existing `zsytf2_rook` test convention.

## Dependency interface surprises

- **`zlasyf_rook` strides are in complex elements.** The panel kernel
  expects `strideW1`, `strideW2`, `offsetW` in complex (not double)
  elements. Calling with `W=new Complex128Array(N*nb), 1, ldwork, 0`
  passes complex-element strides directly — no `*2` factor in the
  driver. (The kernel internally multiplies by 2 when reinterpreting.)
- **`zsytf2_rook` and `zlasyf_rook` use the same negative-IPIV
  encoding** (`~p`), so no translation table is needed between them
  and the driver. The lower-path adjustment loop preserves the
  encoding correctly.

## Complex number handling

- **No conjugation.** Symmetric (NOT Hermitian) means we never apply
  `conj()` at mirrored reads, and the diagonal may be fully complex.
  This is the key point that distinguishes the `_sy_` family from
  `_he_` (`zhetrf_rook`).
- **Complex128Array workspace allocation** is straightforward — no
  reinterpret needed in the driver because we just pass the
  Complex128Array and complex-element strides through to the panel
  kernel.

## Coverage gaps

- **Lines 133-134 (`info = iinfo + k` in lower path)** are uncovered.
  This branch fires only when the panel/unblocked kernel returns a
  zero-pivot info on the second or later block of a lower-path
  factorization. Constructing a singular matrix that survives the
  first 32-column block but produces a zero pivot in the second is
  awkward; accepted as a small uncovered branch (overall coverage
  98.71% line / 95.24% branch on `base.js`).

## Process notes

- Ran into upper-vs-lower test failures during debugging that turned
  out to be the test scaffold's `buildBlockedMatrix` overwriting the
  diagonal in upper, and skipping it in lower (`lo = j+1, hi = N-1`
  never touches `i = j`). Symmetry made it look like a real algorithm
  bug. Sanity-check input matrices independently (e.g., dump the
  first column) before suspecting the algorithm.
