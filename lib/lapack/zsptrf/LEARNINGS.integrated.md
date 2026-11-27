# zsptrf: Translation Learnings

## Translation pitfalls

- All internal indexing uses Fortran 1-based conventions. The packed position `pos` (1-based) maps to Float64 indices `(offsetAP + (pos-1)*strideAP)*2` for the real part, `+1` for imaginary.
- IPIV conversion: Fortran uses 1-based positive for 1x1 pivots and negative 1-based for 2x2 pivots. JS uses 0-based and `~(0-based)` (bitwise NOT) for 2x2 pivots.
- The `iupp(i,j)` and `ilow(i,j,N)` helper functions return 0-based packed indices from 1-based row/column arguments, matching the dsptrf pattern exactly.

## Dependency interface surprises

- `zspr` takes a `Complex128` alpha, not separate real/imaginary parts. Must create `new Complex128(-r1R, -r1I)` for each call.
- `zscal` similarly takes a `Complex128` scalar.
- `izamax` returns a 0-based index, so add 1 when converting to 1-based internal conventions.
- All complex BLAS/LAPACK dependencies (izamax, zscal, zspr, zswap) operate on Complex128Array with strides and offsets in complex elements (not Float64 elements).

## Automation opportunities

- The `sap = strideAP * 2` variable pattern from zsytf2 (which uses 2D strides) is not needed for packed storage -- caught by lint as unused variable.

## Coverage gaps

- Upper-path interchange with 1x1 pivot via IMAX (lines ~267-273, 294-303): requires a matrix where `absakk >= ALPHA*colmax*(colmax/rowmax)` is false but `CABS1(AP(IMAX,IMAX)) >= ALPHA*rowmax` is true, plus kp != kk with gap between kp and kk.
- Smith's method else-branch in cDiv (when `|bi| > |br|`): hit only when complex division denominators have larger imaginary than real parts.

## Complex number handling

- Complex division uses Smith's method via a standalone `cDiv` function with module-level output variables (`cdR`, `cdI`), exactly matching the zsytf2 pattern.
- `cabs1(re, im) = |re| + |im|` replaces `Math.abs()` from the real version. This is the LAPACK CABS1 convention.
- All complex arithmetic (multiply, subtract) is done inline with real/imaginary components via the `Av` Float64 view from `reinterpret(AP, 0)`.
- Symmetric (not Hermitian): transpose only, no conjugation anywhere. Diagonal elements remain fully complex (no restriction to real diagonal).
