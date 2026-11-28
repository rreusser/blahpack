# dlasyf_aa: Translation Learnings

## Translation pitfalls

- **Internal indices kept Fortran 1-based.** The panel kernel mixes the
  caller-provided `J1` (Fortran value, 1 or 2), the Fortran 1-based panel
  column index `K = J1 + J - 1`, and the algorithm-internal `K1 = (2-J1)+1`.
  Keeping `J`, `K`, `K1`, `I1`, `I2` 1-based and explicitly subtracting 1
  at every array access (`A[offset + (K-1)*sa1 + (J-1)*sa2]`) was much less
  error-prone than converting every expression to 0-based, mirroring the
  approach the project takes for dlaqr5 and friends.
- **`H` is partially caller-initialized.** Per the Fortran docstring the
  caller is responsible for initializing `H(J:M, J)` for the FIRST panel
  column; subsequent columns are populated by the kernel via the
  `DCOPY( M-J, A(K+1, J+1), LDA, H(J+1, J+1), 1 )` at the bottom of each
  iteration. Tests that pass `H = zeros` will produce all-zero output for
  column 0 — silent and confusing. To exercise paths that depend on
  realistic residuals (mid-column pivot swap with `i2 != 2 && i2 < M`),
  the test must seed `H(:, 0)` itself; this is what dsytrf_aa would do.
- **IPIV stored 0-based, fixture is Fortran 1-based.** Following the
  project convention, base.js stores 0-based pivot indices; the JSONL
  fixture records what the Fortran routine wrote (Fortran 1-based). Tests
  use a `convertIPIV` helper that subtracts 1 from positive entries and
  passes through zeros (uninitialized rows the algorithm never touched).
- **Aasen's algorithm uses standard pivots (no Bunch-Kaufman 2x2 encoding).**
  Unlike dlasyf / dlasyf_rk / dlasyf_rook, dlasyf_aa never writes negative
  IPIV entries to mark a 2x2 pivot block. The pivot bookkeeping is plain
  integer row swaps; no `~kp` decoding is required.
- **The kernel never returns a non-zero `info`.** dlasyf_aa is a panel
  kernel called inside dsytrf_aa's outer loop. There is no INFO output
  parameter in the Fortran signature; we return `0` for symmetry with
  other LAPACK base.js functions but it is always zero.

## Dependency interface surprises

- **dlaset for row/column zero-fills.** dlasyf_aa calls
  `DLASET('Full', 1, M-J-1, 0, 0, A(K, J+2), LDA)` with `M=1, N=M-J-1` for
  the upper case (zeroing a row of `A`) and `DLASET('Full', M-J-1, 1, 0, 0, A(J+2,K), LDA)`
  for the lower case (zeroing a column). The leading-dimension stride
  matters: passing `sa1, sa2` (both strides) lets dlaset fill correctly
  whether the target slice is a single row or a single column.
- **All BLAS dependencies use 0-based offsets.** No surprises with
  `daxpy, dcopy, dscal, dswap, dgemv, idamax` — straightforward translation
  of Fortran 1-based pointers via `offset + (i-1)*stride1 + (j-1)*stride2`.

## Coverage gaps

- The mid-column-pivot path (`i2 != 2 && i2 < M`) is only reachable when
  the residual `WORK(2:M-J+1)` has its largest absolute value at an
  interior index. This required custom test inputs that pre-initialize
  `H(:,0)` so that the residual computation produces meaningful values.
  All 100% line / 100% branch coverage on `lib/base.js` was achieved.
