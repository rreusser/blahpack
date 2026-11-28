# zaxpy: Translation Learnings

## Translation pitfalls

- The signature generator produced `incx`/`incy` parameters, but the stdlib convention already encodes direction via negative `strideX`/`strideY` and starting position via `offsetX`/`offsetY`. Removed `incx`/`incy` to match the daxpy pattern. The ndarray.js wrapper also needed updating to match.
- The Fortran DCABS1 early return (`IF (DCABS1(ZA).EQ.0.0d0) RETURN`) was simplified to `zaR === 0.0 && zaI === 0.0` since DCABS1 computes `|Re| + |Im|`, which is zero iff both parts are zero.

## Dependency interface surprises

- N/A -- leaf routine with no dependencies.

## Automation opportunities

- The signature generator adds redundant `incx`/`incy` params for 1D BLAS routines. These should be suppressed for base.js generation since stride+offset already handles this. This pattern also appears in daxpy. Worth a fix if more BLAS Level 1 complex routines follow.
- The scaffold generator produces `Float64Array` type annotations instead of `Complex128Array` for z-prefix routines. Should be detected from the routine prefix.

## Coverage gaps

- 100% line and branch coverage on base.js achieved.
- The Fortran has a specialized unit-stride path (`INCX.EQ.1 .AND. INCY.EQ.1`) that was not preserved in JS -- the general loop handles all stride cases. This is consistent with the stdlib approach of dropping stride-1 specializations (per CLAUDE.md performance patterns).

## Complex number handling

- Inlined complex multiply: `(zaR + zaI*i) * (xr + xi*i) = (zaR*xr - zaI*xi) + (zaR*xi + zaI*xr)*i`. Safe to inline per docs/complex-numbers.md.
- Used `reinterpret(zx, 0)` / `reinterpret(zy, 0)` for Float64Array views.
- Strides and offsets multiplied by 2 for Float64 indexing (complex-element stride convention).
- Reads `xr`/`xi` into temporaries before accumulating into `yv` to avoid aliasing issues (though x and y should not alias in practice).
