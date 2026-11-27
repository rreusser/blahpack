# dgeqrt3: Translation Learnings

## Translation pitfalls

- **dgeqrt3 mirrors dgelqt3 with M/N swapped and trans flags inverted.**
  The structural template is dgelqt3: same recursion (split, recurse on
  first half, apply block reflector, recurse on second half), but the
  splitting axis is N instead of M (`N1 = N/2`, `N2 = N - N1`), V is
  unit-lower-triangular in the strict-lower-triangle of A, and the
  apply-from-left/right combinations are mirrored between the two
  routines. When porting, do NOT just textually swap M↔N — the trans
  arguments to dtrmm/dgemm change too because Q1 is applied as `Q1^T *
  rhs` (left, transpose) here, vs `rhs * Q1^T` (right, transpose) in
  dgelqt3.
- **Recursion is a direct self-call on the exported `base.js`.** No
  trampoline, no helper. The Fortran's `RECURSIVE SUBROUTINE` keyword
  has no JS analog needed.
- **Fortran `IINFO` is dropped.** The reference Fortran assigns the
  recursive return into `IINFO` but then never reads it. With the
  `M >= N` invariant preserved by the recursion (M1 < N1 cannot happen
  since N1 = N/2 ≤ M/2 ≤ M, and the second recursive call passes
  `M-N1, N2` with `M-N1 ≥ N-N1 = N2`), the recursive INFO is always 0
  on valid input — drop the dead branch.
- **`i1 = min(N, M-1)` (not just `N`).** Fortran's `I1 = MIN(N+1, M)` is
  the 1-based start row of the trailing (M-N) block. 0-based, this is
  `min(N, M-1)`. Used as a base offset in `A(i1, ...)` for the dgemm
  step that handles the trailing rows. Even when M = N (so M-N = 0 rows
  contribute, dgemm K=0 is a no-op), the offset must remain in-bounds.
- **N=1 base case calls dlarfg directly.** No recursive call: just
  `dlarfg(M, A(0,0), A(min(1, M-1), 0), 1, T(0,0))`. The
  `min(1, M-1)` guards M=1 (the X pointer would otherwise be out of
  range; dlarfg with N=1 doesn't read X but the index must still be
  computable).
- **No XERBLA / no parameter validation in base.js.** The Fortran
  routine front-loads input validation and calls XERBLA on failure;
  base.js drops both. Validation lives in ndarray.js / dgeqrt3.js. The
  base routine returns 0 unconditionally on success; there's no
  algorithmic failure mode (dgeqrt3 cannot return INFO > 0).

## Dependency interface surprises

- **dlarfg signature: alpha is `(array, offset)`, not a scalar.** In
  the N=1 base case, the call is
  `dlarfg(M, A, offsetA, A, strideA1, offsetX, T, offsetT)` — `(A,
  offsetA)` is the alpha pair, `(T, offsetT)` is where tau is written.
  Easy to miss because dlarfg's JSDoc still describes alpha as "scalar".
- **dgemm/dtrmm chains alias T as both workspace and output.** The
  recursion uses `T(0:N1-1, N1:N-1)` as scratch during the
  apply-Q1^T-to-right-half step and again during T3 construction.
  Multiple back-to-back dtrmm calls write back into the same sub-block.
  Both routines handle the implied aliasing correctly because dtrmm
  reads its triangular operand A first and produces its product into B.
- **`M - N` can be 0 (square case).** The cross-block dgemm in the T3
  build step uses K = M - N. When M = N, the call has K=0 and is a
  no-op (per BLAS contract: still scales C by beta=1). Tested via the
  M=4,N=4 and M=1,N=1 fixtures.
