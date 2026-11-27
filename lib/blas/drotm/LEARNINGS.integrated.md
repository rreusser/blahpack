# drotm: Translation Learnings

## Translation pitfalls

- The Fortran has two code paths: a "fast path" when `INCX === INCY && INCX > 0` (using `NSTEPS = N*INCX` to iterate), and a "general path" with separate KX/KY pointers. In JS with the stride/offset API, both paths collapse to a single loop using `ix += strideX; iy += strideY`, so the Fortran fast path is unnecessary. The JS implementation is simpler and handles all stride combinations uniformly.
- `DPARAM` array layout: `DPARAM(1)` = FLAG, `DPARAM(2)` = DH11, `DPARAM(3)` = DH21, `DPARAM(4)` = DH12, `DPARAM(5)` = DH22. Note DH12 and DH21 are NOT adjacent (DH21 at index 2, DH12 at index 3) -- this is easy to mix up.
- The quick-return condition `DFLAG + TWO === ZERO` is exact for IEEE 754 since `DFLAG = -2.0` exactly, so floating-point equality is safe here.

## Dependency interface surprises

- N/A. drotm has no BLAS/LAPACK dependencies.

## Automation opportunities

- The scaffold generator (`init_routine.py`) failed because `scaffold.py` depends on `fparser` which is only in the venv. The `python3` command (system Python) lacks `fparser`. However, a prior run had already created the scaffold files. Consider documenting the required venv activation or making `init_routine.py` use an absolute path to the venv Python.

## Coverage gaps

- All branches are covered (100% line, branch, and function coverage).
- Since we couldn't generate Fortran fixtures (test file creation was blocked), test expected values are hand-computed. This is reliable for drotm since the arithmetic is simple (multiply and add).

## Complex number handling

- N/A. drotm is a real-valued (double precision) BLAS routine.
