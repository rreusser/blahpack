# zsytri_3x: Translation Learnings

## Translation pitfalls

- `zsytri_3x` is structurally identical to `zhetri_3x` and `dsytri_3x` but uses pure (non-Hermitian) symmetry: `A = P*L*D*L^T*P^T` with a complex diagonal on `D`, so every scalar on the 2x2 pivot inversion stays complex. In `zhetri_3x`, the 2x2 normalization `T` is taken as `|WORK(k+1,1)|` (real), which simplifies the resulting `AK`, `AKP1`, `D` to real; in `zsytri_3x`, `T` IS `WORK(k+1,1)` (complex), so everything downstream is complex.
- `AKKP1 = WORK(K+1,1)/T` evaluates to exactly `(1, 0)` because `T == WORK(K+1,1)`. The Fortran code still computes the ratio literally, and we follow suit with `akkp1R = 1.0; akkp1I = 0.0` to match any edge-case behavior (the expression is unused elsewhere since Fortran factors `-AKKP1/D`).
- The mirroring fill `WORK(K+1,INVD) = WORK(K,INVD+1)` is a direct copy, not a conjugate. This is the key distinction from `zhetri_3x`.
- `ZTRMM`/`ZGEMM` use transpose (`'T'` -> `'transpose'`), not conjugate-transpose.

## Dependency interface surprises

- `zsyswapr` replaces `zheswapr`. Both share the same signature.
- `cmplx.divAt` (NOT `cdivAt`) is the indexed complex-division helper. The "plain array" forms `[1.0, 0.0]` and `[tR, tI]` work fine because the helper just reads `a[ai]` and `a[ai+1]`.

## Complex number handling

- The diagonal of `inv(D)` for a 1x1 pivot block is a full complex number (not real as in the Hermitian case), so the inner-loop `invD * U01` scaling must use full complex multiplication via the inlined `cmul` helper.
- Complex scalar divisions (`1/A(k,k)`, `A(k,k)/T`, `AKP1/D`, etc.) all go through `cmplx.divAt` for numerical robustness (Smith's formula); we do NOT inline `(a+bi)/(c+di)` by hand.
- Complex multiplications in hot loops are inlined locally as `cmul(out, aR, aI, bR, bI)` to avoid allocating a new Complex128 per call.
