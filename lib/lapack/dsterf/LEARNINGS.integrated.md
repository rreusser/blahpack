# dsterf: Translation Learnings

## Translation pitfalls

- Fortran `SIGN(R, SIGMA)` must use `Math.abs(r) * (Math.sign(sigma) || 1.0)` -- the `|| 1.0` is critical because `Math.sign(0)` returns 0, not +1 as Fortran's SIGN function does.
- The outer convergence loop uses a labeled `while (l1 < N)` with `continue` for trivial blocks and the QL/QR while-loops nested inside. Breaking out of the inner while loop falls through to unscaling (label 150). The Fortran `GO TO 10` after label 150 maps naturally to the outer while loop's next iteration.
- The Fortran `DO 110 M = L, LEND+1, -1` loop in the QR path searches for a small superdiagonal element counting backwards. When the loop completes without break, Fortran sets `M = LEND`. In JS `for (m = l; m > lend; m--)`, the natural exit value is already `lend`, so the subsequent `M = LEND` assignment in Fortran is a no-op in JS. The `if (m === lend+1)` guard is dead code.
- dlanst needs d and e subarray views passed via offset arithmetic, not sliced arrays. Same for dlascl: it operates on a 2D view (M x N with strides) over the 1D diagonal/off-diagonal arrays.

## Dependency interface surprises

- dlascl has a 2D matrix interface `(type, kl, ku, cfrom, cto, M, N, A, strideA1, strideA2, offsetA)`. When applied to 1D vectors (d or e), pass `strideA1=1, strideA2=strideD, offsetA=offsetD+l*strideD` to treat the vector as an M-by-1 column.
- dlae2 returns `{rt1, rt2}` as an object, not through output parameters.
- dlasrt signature is `(id, N, d, stride, offset)` -- simple 1D sort.
- dlanst signature is `(norm, N, d, strideD, offsetD, e, strideE, offsetE)`.

## Automation opportunities

- N/A -- the GOTO restructuring for dsterf was routine-specific and not generalizable.

## Coverage gaps

- `c === 0.0` path in both QL and QR inner loops (lines 209-210, 242-243, 366-367): requires exact zero in the Givens rotation denominator, which is numerically rare.
- `jtot === nmaxit` convergence failure (lines 224-225, 334-335, 388-395): would need a pathological non-converging matrix.
- `anorm === 0.0` (lines 166-167): requires an unreduced block with all-zero diagonal and off-diagonal, which doesn't arise in practice.
- Dead code in QR path (lines 299-302): the `if (m === lend+1)` check is unreachable because the for-loop always exits with `m = lend`, not `lend+1`.

## Complex number handling

- N/A -- dsterf is a real-valued routine.
