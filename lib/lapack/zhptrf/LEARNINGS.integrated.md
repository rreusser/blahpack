# zhptrf: Translation Learnings

## Translation pitfalls

- The packed indexing helpers (`iupp`, `ilow`) must return Float64 offsets (multiplied by 2) since we operate on the reinterpreted Float64Array view of Complex128Array. This differs from `dsptrf` where they return element indices directly.
- In the upper branch, `kpc` is only computed inside the `else` block (when `absakk < ALPHA * colmax`), but it's referenced in the swap code. Must ensure `kpc` is in scope when the swap path is reached. In practice this is safe because `kp !== kk` implies we entered that branch.
- Fortran's `DCONJG` translates to negating the imaginary part. During pivot swaps, elements between kp and kk must be conjugated, and the element at `A(kp,kk)` itself gets conjugated. Easy to miss.
- The `dlapy2` dependency for computing `|A(k-1,k)|` in the 2x2 pivot block is not a JS dependency of dsptrf but IS needed here because complex absolute value must not be inlined.

## Dependency interface surprises

- `dlapy2` is called with the real and imaginary parts separately (two doubles), not with a complex value. This matches the Fortran `DLAPY2(DBLE(z), DIMAG(z))` pattern.
- `dlapy2` Fortran source transitively depends on `dlamch`, which is not a JS dependency but must be in the Fortran `deps_zhptrf.txt` for test compilation.
- `izamax` returns 0-based index. Adding 1 to convert to 1-based for the Fortran-style internal indexing.
- `zhpr` and `zdscal` take complex-element strides and offsets, matching the Complex128Array convention.

## Automation opportunities

- The `deps.py` script missed `dlamch` as a transitive dependency needed for Fortran test compilation (dlapy2 -> dlamch). Had to add manually.

## Coverage gaps

- Upper branch: the `kp !== kk` swap path for 2x2 pivots (lines ~245-289) was not covered because the 4x4 indefinite upper test matrix produces `kp === kk` for its 2x2 pivot. Would need a carefully constructed matrix where `imax < k-1` in the upper triangle to trigger the swap.
- Lower branch: `imax === N` prevents the `if (imax < N)` rowmax scan from executing (line 453-456). Also `kp === N` prevents `zswap` of trailing elements (line 474-476).
- The `absakk >= ALPHA * colmax * (colmax / rowmax)` and `abs(diag(imax)) >= ALPHA * rowmax` secondary pivot selection branches had partial coverage.

## Complex number handling

- All complex arithmetic is done through the reinterpreted Float64Array view (`APv`). Real part at even indices, imaginary part at odd indices.
- Diagonal elements of Hermitian matrices are forced real by zeroing the imaginary part (`APv[p+1] = 0.0`) at every point where Fortran does `DBLE(AP(...))` or `DCMPLX(DBLE(...), 0)`.
- Complex conjugation during swaps: `conj(z) = (re, -im)`. Applied to off-diagonal elements between pivot rows and to the element at position `A(kp,kk)`.
- The 2x2 pivot update uses `conj(D12)` and `conj(WK)` / `conj(WKM1)` / `conj(WKP1)`. These are expanded inline as `(a*c + b*d, b*c - a*d)` for `z * conj(w)`.
- No complex division or complex absolute value is inlined; `dlapy2` is used for `|z|` and real division handles the 1/D scaling.
