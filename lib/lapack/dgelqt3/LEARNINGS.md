# dgelqt3: Translation Learnings

## Translation pitfalls

- **Recursion is the natural translation idiom.** dgelqt3 calls itself on
  sub-blocks. JS handles this with no special harness — just call the
  module's exported function recursively from inside `base.js`. No
  workspace argument, no manual recursion stack. Fortran's
  `RECURSIVE SUBROUTINE` keyword has no analog needed.
- **Fortran `IINFO` from the recursive call is dropped.** The reference
  Fortran assigns the recursive return into `IINFO` but then never reads
  it. Replicating that here as `if (iinfo !== 0) return ...` produced
  unreachable code (never hit by valid arguments — the recursion
  preserves `M <= N`). I removed the dead branches and call the recursive
  function for side effects only, matching Fortran behavior bit-for-bit.
- **The Fortran spec is internally inconsistent on T's leading
  dimension.** The doc text says T is "N-by-N" but the LDT validation is
  `LDT >= max(1, M)`. The algorithm only ever writes to T(1:M, 1:M), so
  M is the binding constraint. The wrapper's `dgelqt3.js` validates
  against M, not N (matches Fortran error code `-6`).
- **0-based `i1 = M1` (not `M1+1`).** In Fortran, `I1 = MIN(M1+1, M)` is
  the 1-based row index of the start of the bottom block. With 0-based
  loops, that becomes simply `i1 = M1`. The `MIN(..., M)` clamp is
  unnecessary: when M >= 2 (the only case M1 is computed in), `M1 < M`
  always.
- **Fixture print width must be M*N for A, M*M for T.** Fortran
  `print_matrix('A', A, LDA, m, n)` prints `m*n` doubles in column-major
  order. I initially printed A as M-by-M (the L portion) for some cases,
  causing JS test length mismatches against fixture data. Always print
  the full M-by-N for A so that the implicit V part is also captured.

## Dependency interface surprises

- **dlarfg signature: alpha is `(array, offset)`, not a scalar.** In the
  M=1 base case, the call is
  `dlarfg(N, A, offsetA, A, strideA2, offsetX, T, offsetT)`, where
  `(A, offsetA)` is the alpha pair. Easy to miss because the dlarfg JSDoc
  describes alpha as "scalar".
- **dgemm/dtrmm chain works with overlapping aliases.** The recursion
  uses `T` both as workspace and as the output factor; multiple back-to-
  back `dtrmm` calls write back to the same T sub-block. Both routines
  handle the implied aliasing correctly because dtrmm reads its
  triangular A first and produces its product into B.
- **N-M can be 0.** When M == N, the recursive sub-call has `N-M1 > 0`
  for M1 < M but the cross-block `dgemm( ..., M1, M2, N-M, ... )` has
  K=0. dgemm handles K=0 as a no-op (per BLAS contract: still scales C
  by beta). Tested with the M=4, N=4 fixture.
