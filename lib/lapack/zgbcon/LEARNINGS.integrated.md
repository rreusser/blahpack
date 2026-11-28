# zgbcon: Translation Learnings

## Translation pitfalls

- zaxpy takes a Complex128 scalar, not two floats. Must create `new Complex128(-tr, -ti)` for the negated pivot element.
- zdotc returns a Complex128 object. Must extract real/imag parts with `real(dot)` and `imag(dot)` to subtract from WORK entries.
- WORK array manipulation uses Float64 view (wv) for direct element access (swapping pivot rows), but passes the Complex128Array (WORK) to BLAS/LAPACK routines that expect complex-element strides.
- The `pw = (offsetWORK + jp * sw) * 2` pattern converts complex-element offset to Float64 index.
- izamax returns 0-based index; used directly to index into wv with `(offsetWORK + ix * sw) * 2`.

## Dependency interface surprises

- zdotc returns Complex128 (not void/accumulator pattern). Must use real()/imag() to extract components.
- zlatbs uses 'conjugate-transpose' (not 'transpose') for the complex version.

## Missing automation

- The pattern of complex banded condition estimation (zlacn2 reverse communication + zlatbs + zdrscl) is shared with zpbcon. Could be factored into a shared helper.

## Coverage gaps

- The scale != 1 rescaling branch and the bail-out on overflow are not explicitly tested.

## Complex number handling

- Pivot swaps are done on the Float64 view (swapping two doubles at a time).
- CABS1 function used for overflow check: `|re| + |im|`.
