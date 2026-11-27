# zhetri_rook: Translation Learnings

## Translation pitfalls

- Structurally identical to `zhetri` (non-rook), with one critical
  difference in the 2x2 pivot interchange step: rook pivoting performs
  TWO sequential pivot swaps per 2x2 block (one for `K` and one for
  `K+1` in upper, or `K` and `K-1` in lower) using two independent
  values from `IPIV`. Each entry of a 2x2 block is encoded as a separate
  bitwise-NOT pivot index in IPIV.
- Hermitian conjugation rules: when reading the mirror element across
  the diagonal during interchange, conjugate it (`A[j,k] = conj(A[kp,j])`,
  `A[kp,j] = conj(temp)`). The Fortran loop `DO J = KP+1, K-1` covers
  the strictly-between rows and is empty when `KP === K-1`.
- Diagonal of inverse is forced to real: when inverting the 1x1 block
  use `1.0 / real(A[k,k])` and explicitly zero the imaginary part. When
  inverting the 2x2 block, `ak`, `akp1` are derived from real parts
  only; only `akkp1` carries imaginary data.
- Singularity check uses `>= 0` on IPIV (1x1 pivot) AND tests the full
  complex value (both real and imag) for zero.

## Dependency interface surprises

- `zdotc` returns a `Complex128` object. Use `real(dotc)` for the
  Hermitian-diagonal updates (the imaginary part is mathematically zero
  but rounding can leave a small residue; Fortran takes `DBLE(...)` to
  drop it). For the off-diagonal `A(k, k+1)` update, use both `real`
  and `imag` directly (no Hermitian symmetry there).
- `zhemv` and `zswap` take complex strides (in complex elements), not
  doubled. The internal Float64 view uses `sa1 = strideA1 * 2`.

## Coverage / test notes

- The fixtures store `2*N*N` doubles (interleaved real/imag), even
  though the Fortran test program declared `A(NMAX, NMAX)` — the
  `print_matrix` helper packs the first `2*N` doubles per column and
  advances by `2*lda` between columns, producing a contiguous fixture.
