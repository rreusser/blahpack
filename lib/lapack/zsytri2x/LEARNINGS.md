# zsytri2x: Translation Learnings

## Translation pitfalls

- Structurally a mechanical complex-ification of `dsytri2x` and a near-twin of `zsytri_3x`. Difference vs. `_3x`: `_2x` reads the off-diagonal of `D` from `WORK(:,1)` (populated by an internal call to `zsyconv('convert')`) rather than taking a separate `e` array argument. The JS wrapper therefore drops the `e, strideE, offsetE` parameters and the test driver has no `e` to load.
- For complex symmetric (not Hermitian) matrices, the 2x2-pivot `AKKP1 = WORK(k+1,1) / T` term equals exactly `1 + 0i` because `T = WORK(k+1,1)` itself. The Fortran computes it anyway; we preserve the literal `akkp1 = 1.0; 0.0` rather than re-dividing, which avoids one complex division per 2x2 pivot.
- Final permutation loop must follow Fortran's two-step pattern for 2x2 pivots: increment `I` first, then compare `(I-1)` against `IP`. This is identical to `dsytri2x` upper variant and distinct from the simpler `if (ip !== i) swap` pattern used by `zsytri_3x`. For the lower variant the decrement is split across the if/else branches.

## Dependency interface surprises

- `zsyconv` JS API mirrors the convention established by `dsyconv`: takes long-form `'upper'/'lower'` and `'convert'/'revert'` strings, and JS 0-based IPIV (with `~ipiv` encoding 2x2 pivots). Fortran's `zsytrf` produces 1-based IPIV (negative for 2x2). The test driver remaps with `(ipiv > 0) ? ipiv - 1 : ipiv`, which converts both conventions in one pass: `~(-p) === -(p-1)`-conversion of 1-based negatives still leaves them negative-and-equal-to-JS encoding.
- Workspace layout is 2D-via-strides: pass `WORK, strideWORK, offsetWORK` as the `E` parameter triple to `zsyconv`. The first column of WORK becomes the off-diagonal vector. No separate allocation needed.

## Complex number handling

- Used `cmplx.divAt` for the 4 complex divisions per 2x2 pivot (inv-D construction) and inlined `cmul` for the per-element rank-2 update. `cmplx.divAt` handles overflow-safe Smith division; inlining `cdiv` is forbidden per project rules.
- The 2x2 inverse-D matrix is computed only once per pivot, but the inner update loop applies it for every column `j` of WORK. Hoisted `invd00/01/10/11` reads to scratch locals outside the `for j` loop to avoid redundant Float64 array indexing.
- `Av[ia] += Wv[iw]` style direct accumulation on the reinterpreted Float64 view is safe because `A` and `WORK` are distinct buffers (the caller cannot pass `A === WORK` to `zsytri2x`).

## Fortran deps

- `zsytrf` (which the Fortran test calls) brings transitive deps `zlasyf -> zsytf2 -> zsyr` plus `dlamch`, `disnan`, `dlaisnan`, and the ILAENV chain (`ilaenv`, `ieeeck`, `iparmq`). The `deps.py`-generated initial deps file was missing `zsytrf`, `zlasyf`, `zsytf2`, `zsyr`, and the test-driver-only ILAENV/disnan deps. Updated manually.

## Coverage gaps

- The `info > 0` (singular `D`) path is not exercised by fixture tests because `zsytrf` does not produce a zero `1x1` pivot for well-conditioned test matrices.
