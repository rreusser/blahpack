# dsyconvf_rook: Translation Learnings

## Translation pitfalls

- Rook pivoting encodes a 2x2 pivot block by making BOTH adjacent IPIV
  entries negative (not just one as in standard Bunch-Kaufman).
  IPIV[i-1] and IPIV[i] for upper, IPIV[i] and IPIV[i+1] for lower.
  Each negative entry stores its own interchange index, and the
  permutation loops apply both swaps (not a single shared swap).
- The inner-swap order in the revert branch is reversed relative to
  the convert branch (Fortran's literal order: convert does row-i then
  row-(i-1); revert does row-(i-1) then row-i). Preserving this order
  is mandatory for round-trip correctness.
- Signature quirk: `dsyconvf_rook(UPLO, WAY, N, A, LDA, E, IPIV, INFO)`
  — E comes BEFORE IPIV, unlike legacy `dsyconv(..., IPIV, E, ...)`.
  The stdlib-js signature generator respects the Fortran ordering.
- Negative IPIV values pass through unchanged from Fortran to JS
  (bitwise NOT convention: Fortran `-p` and JS `~(p-1)` share the same
  raw numeric value). Positive entries need the usual `p-1` 0-based
  conversion.

## Dependency interface surprises

- `dsytrf_rook` is needed to generate a realistic Fortran fixture, so
  the deps file must include `dsytrf_rook`, `dlasyf_rook`, `dsytf2_rook`,
  `dlamch`, `ilaenv`, `ieeeck`, `iparmq`, `disnan`, `dlaisnan`.
- The factored fortran matrices in the fixture leave most of the
  permutation-loop body unexercised (2x2 blocks occur at corners,
  where `i < N-1` or `i > 0` is false). Synthetic round-trip tests with
  IPIV constructed by hand are needed to reach 100% branch coverage
  on the inner swap loops.

## Coverage gaps

- None — 100% line/branch/function on base.js achieved by mixing
  Fortran fixtures with 5 hand-constructed round-trip tests.

## Automation notes

- The init scaffold still produces a broken `examples/index.js` with a
  `TODO` body and a dgemm-style call signature. A future improvement
  would be to skip generating examples entirely until the routine is
  implemented.
