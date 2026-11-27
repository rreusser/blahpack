# zla_syrcond_c: Translation Learnings

## Translation pitfalls

- The Fortran source has a dead-code N==0 quick return placed _after_ the
  row-sum loop over `1..N`. The JS implementation hoists the `N===0 -> 1.0`
  check to the top (matching the semantic expected by callers) since the
  Fortran row-sum loop is a no-op for N=0 anyway.
- Unlike `zla_hercond_c`, this routine is for complex _symmetric_ matrices:
  the mirror-triangle reads `A(j,i) = A(i,j)` with **no conjugation**. The
  `up/cmode` access pattern from `dla_syrcond` applies almost verbatim —
  only `CABS1` replaces `abs`.
- For UPLO='U', the `j = 1..i` loop uses `A(j,i)` (stored column, row ≤ i)
  and `j = i+1..n` uses `A(i,j)` (stored row, col > i). Lower triangle
  swaps these access patterns. The `<= i` bound is important: for the
  diagonal element we read `A(i,i)` from the stored triangle.

## Dependency interface surprises

- `zsytrs` expects 0-based `IPIV` entries (Fortran 1-based values are
  decremented, and negative entries use `~IPIV` rather than `-IPIV - 1`).
  Tests compute the factorization with the JS `zsytrf` to avoid having to
  translate the fixture's Fortran 1-based IPIV.
- `zlacn2` uses reverse-communication with a `KASE`/`ISAVE`/`EST` state
  triple (Int32Array / Float64Array / Int32Array of length 1/1/3). Same
  pattern as used in `zla_gercond_c`.

## Complex number handling

- Complex arrays are accessed via `reinterpret( A, 0 )` float views with
  doubled strides/offsets (`sa1 = strideA1 * 2`, etc.).
- `CABS1(z) = |Re(z)| + |Im(z)|` is inlined — no dedicated helper needed.
- Real-scalar multiplies/divides on complex WORK entries are done on the
  two float components separately (`WORKv[ir] *= c; WORKv[ir+1] *= c`).
- The `anorm === 0` early-return branch and the `ainvnm === 0` tail branch
  are dead in practice — kept for faithfulness to Fortran, covered only by
  the explicit zero-matrix test case.
