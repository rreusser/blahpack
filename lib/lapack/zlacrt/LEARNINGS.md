# zlacrt: Translation Learnings

## Translation pitfalls

- The Fortran source has two code paths: one for unit strides (INCX=1 AND INCY=1) and one for general strides. In the JS translation, the general stride path handles all cases correctly (including unit strides), so the two-path optimization was dropped. This is consistent with how zdrot and other BLAS routines handle it.
- The signature generator produced both `strideX` and `incx` parameters, but existing codebase convention (zdrot, zswap) uses only `strideX`/`offsetX` -- the offset replaces the negative-stride starting position calculation. Dropped `incx`/`incy` from the base.js signature.

## Dependency interface surprises

- N/A -- zlacrt has no BLAS/LAPACK dependencies.

## Automation opportunities

- The `--fix` flag on the linter reorders `var` declarations by name length but also reorders function calls above their variable declarations, breaking the code. Must manually fix after auto-fix, or avoid `--fix` on test files entirely.

## Coverage gaps

- N/A -- 100% line and branch coverage on base.js achieved with 9 fixture-based test cases plus edge cases.

## Complex number handling

- All complex arithmetic (c*x, s*y, addition, subtraction) is inlined since only multiplication/addition/subtraction are involved -- no division, abs, or sqrt needed.
- Complex128 scalars are extracted via `real(c)`/`imag(c)` at function entry, then all loop operations use Float64 arithmetic on the reinterpreted arrays.
- Each complex multiply `(a+bi)(c+di)` expands to `(ac-bd) + (ad+bc)i`, with each product parenthesized to satisfy the `no-mixed-operators` lint rule.
