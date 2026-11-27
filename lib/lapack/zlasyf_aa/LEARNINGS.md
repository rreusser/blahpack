# zlasyf_aa: Translation Learnings

## Translation pitfalls

- **Mostly mechanical d → z port from `dlasyf_aa`.** The structure mirrors the
  real-symmetric sister exactly: the same K1/K/J 1-based bookkeeping, the
  same pivot-swap geometry, the same (J1+I1-1) offsets in the swap calls.
  Only the data type, scalar arithmetic, and BLAS primitives change.
- **Symmetric, NOT Hermitian.** Mirror reads use `A[k,i]` directly — no
  `conj()`. The diagonal is fully complex (no real-only forcing). `alpha`
  is fully complex throughout (`alpha = -A(K-1,J)` is a complex negation,
  not a real-only sign flip).
- **Aasen pivots are plain integers.** No Bunch-Kaufman 2x2 negative-IPIV
  encoding to worry about. Storing 0-based row indices is sufficient.
- **Internal indices kept Fortran 1-based**, matching the reference and
  the `dlasyf_aa` JS port. With deeply intertwined K, K1, J, I1, I2,
  J1+I1-1, etc., converting all to 0-based was more error-prone than
  subtracting 1 at every array access.
- **Caller must pre-initialize `H(:,0)`.** The first column of the H
  workspace (`H(J:M, J)` for J=1) is read by the kernel without ever
  being computed inside the kernel — `dsytrf_aa` would normally seed it.
  Tests that pass `H = zeros` will silently produce all-zero output for
  column 0; the mid-column-pivot test cases must explicitly seed
  `H(:, 0) = A(:, 0)`.
- **The kernel never returns non-zero `info`.** No INFO output in the
  Fortran signature; we return `0` for symmetry with other LAPACK
  base.js functions but it is always zero.

## Dependency interface surprises

- **All BLAS-z dependencies use complex-element strides/offsets.** The
  base routine forwards the original `Complex128Array` plus
  `strideA1, strideA2, offsetA` (in complex elements) to `zgemv`,
  `zswap`, `zaxpy`, `zcopy`, `zscal`, and `izamax` without doubling.
  Internal Float64-view indexing on the same matrix uses
  `sa1 = strideA1*2`, `oA = offsetA*2`.
- **`zlaset('full', M, N, alpha, beta, ...)` accepts both real-sized rows
  (`M=1`) and columns (`N=1`)** and reads `alpha`/`beta` as `Complex128`.
  Same pattern as `dlasyf_aa` calling `dlaset` with `(1, M-J-1)` /
  `(M-J-1, 1)`.

## Complex number handling

- **Single complex division → `cmplx.div`.** The pivot scaling
  `alpha = ONE / A(K, J+1)` (or its lower-case sibling) is the only
  complex division in the algorithm; routed through `cmplx.div` for
  numerical stability per the project rule.
- **Complex zero check uses OR, not AND.** The pivot-skip guard is
  `if (i2 !== 2 && (pivR !== 0.0 || pivI !== 0.0))` — both real and
  imaginary parts must be zero before treating PIV as zero. Using AND
  would skip pivots that have only one zero component.
- **Inlined complex negation.** `alpha = new Complex128(-av[idx], -av[idx+1])`
  for the three places ALPHA = -A(...) is computed. Negation is safe to
  inline (no precision concerns).
- **Float64-view scalar reads/writes** for setting the diagonal/super-
  diagonal entries (`A(K,J) := WORK(1)` etc.) avoid Complex128 object
  allocations in the loop. Two interleaved store statements suffice.
- **Module-scoped Complex128 constants.** ZERO, ONE, NEGONE are allocated
  once at module load; passed by reference to ZGEMV / ZLASET as scalars.

## Coverage gaps

- **100% line / 95.12% branch coverage on `lib/base.js`.** All branches
  except a couple of compound-conditional combinations are exercised by
  the 22 test cases (lower/upper × first/subsequent panel × full/partial
  panel × NB=1/3/4 × pivot/no-pivot × i2=M/i2<M boundary × zero-pivot
  zlaset path).
