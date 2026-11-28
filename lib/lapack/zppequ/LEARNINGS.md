# zppequ: Translation Learnings

## Translation pitfalls

- The generated signature from `bin/signature.py` included `scond` and `amax` as input parameters, but for ppequ-family routines these are output-only scalars returned via the result object `{ info, scond, amax }`. The signature was corrected to match dppequ's convention.
- The stride/offset for AP must be converted from complex-element units to Float64 units by multiplying by 2 after `reinterpret()`. This is a standard z-prefix pattern but easy to forget for a routine that only reads real parts.

## Dependency interface surprises

- N/A -- zppequ has no BLAS/LAPACK dependencies (leaf routine).

## Automation opportunities

- The scaffold generator (`init_routine.py`) could detect when the d-prefix counterpart already exists and auto-generate a closer initial `base.js` (e.g., pre-fill the reinterpret pattern for z-prefix variants of existing d-prefix routines).
- The `ndarray.js` template should not include `scond`/`amax` as parameters when the return convention is an object. This is a signature.py issue -- it maps all Fortran output scalars as params even when the d-prefix reference returns them in an object.

## Coverage gaps

- N/A -- 100% line, branch, and function coverage achieved. The routine is simple with no hard-to-reach paths.

## Complex number handling

- Only the real parts of diagonal elements are accessed (`DBLE(AP(JJ))` in Fortran). Used `reinterpret()` to get a Float64Array view, then read even-indexed elements (real parts). No complex arithmetic needed -- no cmplx.js import required.
- Added a dedicated test case (`nonzero imaginary parts on diagonal`) to verify that imaginary parts are correctly ignored.
