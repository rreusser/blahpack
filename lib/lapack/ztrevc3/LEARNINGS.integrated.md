# ztrevc3: Translation Learnings

## Translation pitfalls

- Used NB=1 (non-blocked) path only. The blocked path (NB>1) uses ZGEMM and ZLACPY for batched backtransformation, which would require significantly more workspace management. For correctness, NB=1 is sufficient.
- The diagonal elements of T are saved/restored around each eigenvector solve. Must save to WORK[0..N-1] before the loop and restore after each ki iteration.
- CABS1 function: |re|+|im|, not the usual Euclidean absolute value. Used consistently as in the Fortran reference.

## Dependency interface surprises

- zlatrs accepts long-form strings: `'upper'`, `'no-transpose'`, `'conjugate-transpose'`, `'non-unit'`. NOT short-form.
- zgemv also uses long-form: `'no-transpose'`. Silent failure if wrong strings are passed.
- izamax returns 0-based index in JS.

## Automation opportunities

- N/A (manual implementation was appropriate given the complexity of ztrevc3).

## Coverage gaps

- Only tested indirectly through zgeev, which exercises the `howmny='B'` (backtransform) path with both side='R', side='L', and side='B'.
- The `howmny='A'` (no backtransform) and `howmny='S'` (selected) paths are not tested.
- SOMEV branch (SELECT array filtering) is untested.

## Complex number handling

- Complex work vectors stored in Complex128Array WORK, accessed via reinterpret() for Float64 indexing.
- The RHS setup for left eigenvectors uses conjugation: work[k] = -conj(T(ki,k)).
- Normalization uses izamax + zdscal pattern: find max element, divide by its cabs1 value.
