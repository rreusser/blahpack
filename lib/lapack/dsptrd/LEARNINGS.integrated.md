# dsptrd: Translation Learnings

## Translation pitfalls

- Packed storage 1-based to 0-based index conversion: Fortran's `I1 = N*(N-1)/2 + 1` becomes `i1 = N*(N-1)/2` in 0-based JS. The Fortran loop variable `I` maps to JS `i` where `Fortran_I = i + 1`. All packed array offsets must account for this shift.
- The `strideAP` parameter must be factored into all index arithmetic. E.g., `i1 = (N*(N-1)/2) * strideAP` not just `N*(N-1)/2`.
- In the lower triangle case, `I1I1 = II + (N-I+1)` in Fortran 1-based becomes `i1i1 = ii + (N-i) * strideAP` in 0-based JS.

## Dependency interface surprises

- `dlarfg(N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau)` takes alpha as an array+offset pair (in-out parameter), not as a scalar. The alpha value is read and overwritten in-place.
- `dspr2(uplo, N, alpha, x, strideX, offsetX, y, strideY, offsetY, AP, strideAP, offsetAP)` puts AP at the end (after x and y), unlike DSYMV/DSPMV which put the matrix first.
- `dspmv` takes `strideAP` and `offsetAP` for the packed array, unlike `dsymv` which takes 2D strides.

## Automation opportunities

- None identified for this routine. The packed storage indexing is unique enough to require manual translation.

## Coverage gaps

- 100% line and branch coverage achieved. Both upper and lower paths exercised with non-trivial matrices (3x3, 4x4), edge cases (N=0, N=1), and diagonal matrices (tau=0 path).

## Complex number handling

- N/A: dsptrd is a real-valued routine.
