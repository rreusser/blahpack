# zhetri_3x: Translation Learnings

## Translation pitfalls

- The Fortran routine treats the diagonal of `A` (and the 1x1 inverse-D entries) as real scalars via `DBLE(A(k,k))`. The Hermitian matrix's diagonal is assumed to be real on entry; we preserve that assumption by only reading the real part for the `1/A(k,k)` inversion.
- For the 2x2 pivot inverse, the off-diagonal entry of `inv(D)` is complex; its mirror (`WORK(K+1,INVD)`) must be the conjugate of `WORK(K,INVD+1)`, NOT a simple copy. This is the key difference from `zsytri_3x`.
- `T = ABS(WORK(K+1,1))` takes the magnitude of the complex off-diagonal, and the resulting `AK`, `AKP1`, `D` are all real — only `AKKP1` (the normalized off-diagonal) is complex.
- The Fortran `WORK` is a 2D array with logical leading dimension `N+nb+1`. We emulate column-major access with `ldwork = N+nb+1` and compute offsets `iw = offsetWORK*2 + i*sWF + j*ldwork*sWF`.

## Dependency interface surprises

- `ztrtri('upper'/'lower', 'unit', ...)` — called with unit diagonal because the factors `U`/`L` are unit triangular.
- `ztrmm` and `zgemm` take `'conjugate-transpose'` where the real routine takes `'transpose'` — this is the `'C'` vs `'T'` difference in Fortran.
- `zheswapr` is called with 0-based row indices `i`, `ip` (our 0-based JS convention — the existing `zheswapr` already expects 0-based).

## Complex number handling

- `A` and `WORK` are `Complex128Array`. We reinterpret each as a `Float64Array` view for indexed read/write of re/im pairs, while still passing the original `Complex128Array` to dependencies (`ztrtri`, `ztrmm`, `zgemm`, `zheswapr`).
- All inner-loop complex multiplies involving the 2x2 inv-D block are expanded inline — the diagonal entries of inv-D are known to be real (imag=0), which lets us use `invd00R * u01ijR` etc. without full complex multiply.
- The Fortran `ABS(z)` in the 2x2 scalar normalization is implemented with `Math.hypot` on the interleaved re/im view to preserve numerical robustness.
- `Complex128Array` stride and offset arguments passed into dependencies are in complex-element units (matching stdlib BLAS convention); the Float64 view indexing uses `*2` internally.
