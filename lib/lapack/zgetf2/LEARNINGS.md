# zgetf2: Translation Learnings

## Translation pitfalls

- IZAMAX returns a 0-based index within the subvector. Adding `j` to the result
  gives the global 0-based row index for the pivot, which matches the 0-based
  IPIV convention. Fortran adds `J-1` (0-based offset) to a 1-based IZAMAX result
  to get a 1-based pivot index.
- ZSWAP swaps entire rows across all N columns. The stride for walking along a
  row in column-major storage is strideA2 (the column stride), not strideA1.
- The Fortran `SFMIN = DLAMCH('S')` is computed but never actually used in the
  algorithm body. ZRSCL handles safe reciprocal scaling internally, so dlamch is
  not needed as a JS dependency.

## Dependency interface surprises

- ZRSCL takes a Complex128 scalar `a` (not Float64 components), plus the vector
  and its stride/offset. It divides the vector by `a` with overflow protection.
- ZGERU signature: `(M, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA)`.
  The rank-1 update is `A := A + alpha * x * y^T`. We pass `-ONE` as alpha.

## Automation opportunities

- None identified. The translation was straightforward with existing tooling.

## Coverage gaps

- None. 100% line and branch coverage achieved. The singular matrix test covers
  the `info > 0` path, and the 10x10 random test verifies correctness via P*L*U
  reconstruction.

## Complex number handling

- The pivot element is read from the Float64Array view `Av` to construct a
  Complex128 for the ZRSCL call. This avoids needing intermediate complex
  arithmetic.
- CNEGONE = Complex128(-1, 0) is used as the alpha for ZGERU. This is a module-
  level constant to avoid repeated allocation.
- No complex division or abs is performed inline; all complex operations go
  through library calls (izamax for abs-based pivot selection, zrscl for
  reciprocal scaling).
