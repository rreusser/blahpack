# zsytf2_rk: Translation Learnings

## Translation pitfalls

- `zsytf2_rk` is structurally identical to `dsytf2_rk` except all arithmetic
  is complex. The swap loops use plain `zswap` — NOT the Hermitian
  conjugate-swap loop of `zhetf2_rk`.
- `ABSAKK = CABS1(A(k,k)) = |Re| + |Im|` (L1 norm), not the complex
  modulus. Same for `COLMAX`, `ROWMAX`, `DTEMP`.
- The SFMIN guard uses `CABS1(A(k,k)) >= SFMIN` — compare magnitude in
  the L1 norm, not the 2-norm.
- The 2x2 update keeps `D12`, `D22`, `D11`, `T` all complex, and `WK`,
  `WKM1` are complex. The formulas mirror `dsytf2_rk` structurally with
  one complex multiply per factor.
- Diagonal entries of `A` remain fully complex — no imaginary-zeroing
  (that's Hermitian-only).

## Complex number handling

- `D11 = 1 / A(k,k)` uses Smith's formula for numerical stability
  (avoid overflow/underflow in the complex reciprocal). Never inline
  naive complex division `(re+im*i)/(br+bi*i) = ((re*br+im*bi) + i*(im*br-re*bi))/(br*br+bi*bi)`
  — the denominator can overflow or underflow.
- The port uses a module-local `smithDiv` helper writing to scratch
  `cdR`/`cdI` globals (one result at a time). An indexed `cmplx.divAt`
  would overwrite the source before reading it — read `zsytf2`'s
  `cDiv` pattern for the same reason.
- `zsyr` and `zscal` take a `Complex128` scalar (constructed via
  `new Complex128( re, im )`). `zsyr`'s `-D11` is passed as
  `new Complex128( -r1R, -r1I )`.

## Dependency interface surprises

- `zsyr` lives under `lib/lapack/base/zsyr`, not under `lib/blas/base/`.
- `izamax` returns a 0-based index in JS.
