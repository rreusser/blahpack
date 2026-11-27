# dgetsqrhrt: Translation Learnings

## Translation pitfalls

- The Fortran `WORK` array is partitioned into three logical segments:
  (a) the TSQR `T` array of length `LWT = num_all_row_blocks * N * nb1local`
  with leading dimension `nb1local`, (b) an `N`-by-`N` scratch `R` matrix
  of length `N*N`, and (c) workspace shared between `dorgtsqr_row`
  (length `nb1local * max(nb1local, N - nb1local)`) and the diagonal sign
  vector `D` for `dorhr_col` (length `N`). The third segment is reused
  sequentially — `dorgtsqr_row` writes scratch, then `dorhr_col` overwrites
  it with the sign vector. Document this layout in the JSDoc so callers
  size `WORK` correctly.
- Step (5)+(6) in the Fortran fuses copying `R_tsqr` back into the upper
  triangle of `A` with applying the sign flip from `D`. The `else` branch
  (D[i] != -1) uses `DCOPY( N-I+1, WORK(LWT+N*(I-1)+I), N, A(I,I), LDA )`
  to copy a row stride-N from the column-major scratch buffer (so
  source-stride is `N`, not `1`). Translating this with a `for` loop is
  clearer than calling `dcopy` with `strideX = N`, since the outer index
  walks columns.
- The `MB1` Fortran constraint is `MB1 > N` (strict). Both the wrapper
  and ndarray validators must reject `mb1 == N`. `dlatsqr` itself has
  a `mb <= N` fall-through to `dgeqrt`, but `dgetsqrhrt`'s contract is
  stricter because `dorgtsqr_row` requires `mb > N`.
- Rounding-up convention for `T`'s column count: the public `T` is
  logically `nb2local`-by-`N`, but tests must allocate
  `nb2local * tcols` where `tcols = ceil(N / nb2local) * nb2local`. The
  Fortran test prints the rounded-up `tcols` columns; mismatched sizing
  silently truncates fixture comparisons.

## Dependency interface surprises

- `dorhr_col`'s `D` parameter is a strided 1D array (`d, strideD, offsetD`),
  not a Float64Array(N) buffer. When the caller wants `D` to live inside
  `WORK`, pass `WORK, strideWORK, offsetWORK + (LWT + N*N) * strideWORK`.
- `dlatsqr`'s `T` array is logically `nb1local`-by-`(N * num_all_row_blocks)`
  with leading dimension `nb1local`. When `T` is embedded in `WORK`, the
  call needs `strideT1 = strideWORK`, `strideT2 = nb1local * strideWORK`.
- `dorgtsqr_row` requires its `WORK` parameter with `strideWORK = 1`
  (treated as 2D `nblocal`-by-* with leading dimension `nblocal`). Pass
  through cleanly when `dgetsqrhrt`'s caller also uses `strideWORK = 1`.

## Coverage gaps

- All branches in `base.js` are reachable with the chosen test cases;
  100% line/branch coverage. Quick-return (M=0 or N=0), single-block
  TSQR (mb1 >= M square case), partial trailing block, and sign-flip
  branches are all exercised.
- `dgetsqrhrt.js` (layout wrapper) sits at 96% branch — the missing
  branch is the `M < N` row-major variant, which is uninteresting since
  the validator catches it before the LDA/LDT branches matter.

## Scaffolded-file cleanup

- The scaffolded `dgetsqrhrt.js` had 12 parameters because it included
  `strideWORK`. The wrapper signature should be 11 parameters
  (`order, M, N, mb1, nb1, nb2, A, LDA, T, LDT, WORK`) — the workspace
  is consumed contiguously with stride 1.
- The scaffolded `dgetsqrhrt.js` validated `LDT >= max(1, M)` because
  the scaffold guesses T's first dimension from M. For this routine, T
  is `nb2`-by-`N` — column-major LDT must be `>= max(1, min(nb2, N))`,
  not `>= M`. Always audit scaffold-emitted LDT validators when T isn't
  shaped like A.
- The scaffolded `benchmark.js` allocated arrays of size `N * N` with
  N up to `10^max = 1000`, and called `dgetsqrhrt` with M=N=mb1=N, which
  violates both `M >= N` (fine) and `mb1 > N` (fails). Replaced with
  M=2N, mb1=N+4, plus correct LWORK formula.
