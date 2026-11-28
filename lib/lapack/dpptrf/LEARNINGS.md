# dpptrf: Translation Learnings

## Translation pitfalls

- Packed storage index tracking requires careful 0-based translation of the Fortran JJ/JC variables. Fortran initializes JJ=0 (before the loop) and uses 1-based positions; the 0-based equivalent for the upper case is `jj = 0; jj += j + 2` per iteration, with `jc = jj - j` to get the column start. Off-by-one errors here are silent -- the wrong diagonal element gets read/written.
- The upper case diagonal position formula is `(j+1)*(j+2)/2 - 1` (0-based), not `j*(j+1)/2`. The latter is the column start, not the diagonal. Confusing these produces completely wrong factorizations that look plausible at first glance.
- The lower case dspr offset `AP(JJ+N-J+1)` in Fortran translates to `AP[jj + N - j]` in 0-based (since Fortran's 1-based JJ and J cancel the +1/-1).

## Dependency interface surprises

- dtpsv takes `(uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX)` -- 10 parameters. The packed matrix AP and the solution vector x share the same array in dpptrf (both point into AP with different offsets).
- dspr takes `(uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP)` -- the packed array AP comes after the vector x, not before.
- ddot returns a scalar value (not modified in-place), and takes `(N, x, strideX, offsetX, y, strideY, offsetY)`.

## Automation opportunities

- The JSDoc list-item-indent and list-item-bullet-indent rules conflict with each other, making markdown list formatting impossible without changing to prose. Future routines should avoid `* - ` list syntax in JSDoc and use prose instead.

## Coverage gaps

- 100% line and branch coverage achieved. No gaps.

## Complex number handling

- N/A: dpptrf is a real-valued routine.
