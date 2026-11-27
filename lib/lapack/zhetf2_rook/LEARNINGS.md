# zhetf2_rook: Translation Learnings

## Translation pitfalls

- Hermitian rook follows the same pattern as `dsytf2_rook` but adds
  conjugation wherever rows/columns are swapped. When swapping columns
  K and KP (and likewise K and P in the "first swap"), the entries
  between KP+1 and KK-1 (or P+1 and K-1) must be swapped AND conjugated:
  `t = conj(A(j,kk)); A(j,kk) = conj(A(kp,j)); A(kp,j) = t;`
  Then conjugate `A(kp,kk)` itself.
- After every swap (and in the `kp == kk` no-swap branch) the diagonal
  entries must be forced real (imaginary part set to zero).
- 2x2 pivot block in Hermitian uses `d = hypot(re, im)` (true modulus)
  for the scaling denominator, NOT `cabs1 = |re|+|im|` which is used
  for pivot-search row/col maxima. Do not mix them.
- `D12 = A(k-1,k)/d` is COMPLEX in the rank-2 update. `WKM1` uses
  `conj(D12)` while `WK` uses `D12`; the trailing update uses
  `conj(WK)` and `conj(WKM1)`.
- Pivot-search `absakk` uses `|real(A(k,k))|` (diagonal is real for
  Hermitian), and the diagonal test for `kp` uses
  `|real(A(imax,imax))|`.
- IPIV 2x2 encoding: `IPIV[k] = ~p`, `IPIV[k-1] = ~kp` (upper) — each
  entry encodes its OWN swap target, unlike `zhetf2` (non-rook).

## Dependency interface surprises

- `izamax` returns 0-based index in complex elements.
- `zher` signature: `(uplo, N, alpha_real, X, sx, offsetX, A, sa1, sa2, offsetA)`.
- `zdscal` scales a complex vector by a real scalar.
- `zswap` takes complex-element strides.

## Complex number handling

- Used raw `Av = reinterpret(A, 0)` with offset-based indexing;
  interleaved re/im with `sa1 = strideA1*2`, `sa2 = strideA2*2`.
- Inline complex multiplications (no `cmplx.mul` calls) for the rank-2
  update because they appear in tight inner loops.
- Inlined `d = hypot(re, im)` as `Math.sqrt(re*re + im*im)` — safe
  because the 2x2 block won't trigger overflow for well-conditioned
  inputs; `dlapy2` would be more robust in edge cases.

## Testing notes

- Fortran fixture print uses LDA-strided storage (NMAX*n*2 reals);
  JS tests extract the n-by-n submatrix via `extractSubmatrix` helper.
- Small diagonals (0.01) combined with larger off-diagonals force 2x2
  pivoting and exercise the most branches.
