# zhetf2_rk: Translation Learnings

## Translation pitfalls

- Hermitian `_rk` mirrors `dsytf2_rk` structurally but with Hermitian-specific
  semantics that silently produce wrong numerics if ignored:
  1. `ABSAKK = |Re(A(k,k))|` — diagonal pivot comparison uses only the real
     part.
  2. `COLMAX`, `ROWMAX`, `DTEMP` use `CABS1 = |re| + |im|` (L1 norm), NOT
     the complex modulus.
  3. After every swap and at the end of each pivot step, imaginary parts
     of newly-diagonal entries are explicitly zeroed.
  4. The swap loop between `KP+1..KK-1` also conjugates (Fortran `DCONJG`).
     It is NOT a plain `zswap` — the JS port inlines an element-wise
     conjugate-swap loop.
  5. `A(P,K)` / `A(KP,KK)` gets conjugated after the swap loop completes.
- `D` in the 2x2 update is `|A(k-1,k)|` computed via
  `dlapy2(re,im) = sqrt(re^2 + im^2)` — the true complex modulus, not
  `CABS1`. Getting this wrong produces plausible-looking results that
  are numerically incorrect.
- The 2x2 update uses `conj(WK)` and `conj(WKM1)` in the rank-2 update;
  the sign of each imaginary term differs from pure-symmetric `dsytf2_rk`.
- The port divides by `D` at both the store site (for `A(j,k) = WK/D`)
  and inside the update loop (`(A(i,k)/D)*conj(WK)`). This is literally
  faithful to Fortran and numerically safe.

## Dependency interface surprises

- `zher` takes a real scalar `alpha` (matches Fortran `ZHER`).
- `zdscal` takes a real scalar — do not confuse with `zscal` (complex).
- `izamax` returns a 0-based index in JS.

## Complex number handling

- Uses the `reinterpret(A, 0)` pattern with doubled `strideA1*2`,
  `strideA2*2`, `offsetA*2` for Float64 indexing inside hot loops.
- All complex arithmetic is inlined (multiplication, conjugate,
  subtraction) — no `cmplx.*` helper calls in the pivot update.
- `dlapy2(re,im)` is inlined as `Math.sqrt(re*re + im*im)` since the
  inputs are not at risk of overflow in the pivot context.
