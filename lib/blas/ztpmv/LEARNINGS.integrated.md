# ztpmv: Translation Learnings

## Translation pitfalls

- Packed storage indexing maps directly from dtpmv: upper `kk += (j+1)*sap`, lower `kk -= (N-j)*sap`. The complex version doubles all stride/offset values but the packed advancement formulas stay the same in terms of element count.
- The `!= ZERO` check in Fortran checks both real and imaginary parts. In JS this becomes `xr !== 0.0 || xi !== 0.0` (OR, not AND) -- checking that at least one component is nonzero.
- The conjugate-transpose path is identical to the transpose path except `ai = -APv[ip+1]` instead of `ai = APv[ip+1]`. This is a sign flip on every imaginary part read from AP.

## Dependency interface surprises

- N/A -- ztpmv has no BLAS/LAPACK dependencies beyond lsame/xerbla.

## Automation opportunities

- N/A -- the existing pipeline (fortran_body.py, gen_test.py, run_fortran.sh) worked smoothly for this routine.

## Coverage gaps

- N/A -- 100% line, branch, and function coverage achieved.

## Complex number handling

- Used the standard `reinterpret(AP, 0)` pattern with `sap = strideAP * 2`, `sx = strideX * 2` for Float64 indexing.
- All complex multiplication is inlined since it is safe: `(a+bi)(c+di) = (ac-bd) + (ad+bc)i`.
- No complex division, absolute value, or square root needed in this routine.
- The Fortran `DCONJG` maps to simply negating the imaginary part when reading from AP.
