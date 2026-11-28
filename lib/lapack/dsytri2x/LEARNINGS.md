# dsytri2x: Translation Learnings

## Translation pitfalls

- `dsytri2x` is structurally almost identical to `dsytri_3x`. The key difference: `_2x` reads the off-diagonal of `D` from `WORK(:,1)` (populated by an internal call to `dsyconv('convert')`) rather than taking a separate `e` array argument. The JS wrapper therefore drops the `e`, `strideE`, `offsetE` parameters.
- The permutation loop at the end differs from `_3x`: in `_2x` the 2x2-pivot branch advances `i` before testing `(i-1) vs ip`, mirroring the Fortran `IF ( (I-1) .LT. IP)` pattern. For the `upper` case, the increment happens before the comparison; for the `lower` case, the decrement happens after.
- The Fortran `DO INFO = N, 1, -1` singular-diagonal scan is a reverse loop that reuses `INFO` as the loop variable. Translated as a standard `for` loop returning `i+1` on the first zero 1x1 pivot.

## Dependency interface surprises

- `dsyconv` takes string arguments `'upper'/'lower'` and `'convert'/'revert'` — not single-char Fortran flags — and `IPIV` in JS (`0`-based, `~ipiv` for 2x2) convention. The classic `dsytrf` produces Fortran `IPIV` (1-based, negative for 2x2), so the JS test fixture loader maps each entry as `(ipiv > 0) ? ipiv - 1 : ipiv`, which converts both conventions simultaneously (bitwise NOT of `-k` Fortran encoding equals the JS encoding).

## Fortran deps

- `dsytrf` → `dlasyf` → `dsytf2` → `dlaisnan` + `disnan`. `disnan` and `dlaisnan` must both be added to `deps_dsytri2x.txt` or linking fails with undefined `disnan_` references. The scaffolded deps file from `init_routine.py` did not include these.

## Coverage gaps

- The info > 0 (singular `D`) path is not exercised by fixture tests. `dsytrf` does not produce a zero `1x1` pivot for well-conditioned test matrices, so this branch is covered structurally but not numerically.
