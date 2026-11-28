# dggbal: Translation Learnings

## Translation pitfalls

- dggbal is structurally identical to zggbal but with real (not complex) arithmetic. The translation was straightforward: replace zswap with dswap, zdscal with dscal, izamax with idamax, remove reinterpret() calls, and replace complex zero checks/cabs1 with direct `=== 0` / `Math.abs()`.
- ILO and IHI are output parameters in the Fortran signature but are returned via an object `{ info, ilo, ihi }` in the JS API, following the zggbal pattern. The signature generator (`bin/signature.py`) includes them as params, but the zggbal precedent takes priority.
- The Fortran SIGN(HALF, LSCALE(I)) maps to `(Math.sign(x) || 1.0) * HALF` in JS because `Math.sign(0)` returns 0, not +1 as in Fortran.
- `buildMatrix` helper (column arrays) avoids `no-mixed-operators` lint errors that arise from `A[j*n + i]` indexing in test setup code.

## Dependency interface surprises

- No surprises. All dependencies (ddot, daxpy, dscal, dswap, idamax, dlamch) use the standard stride/offset calling convention.

## Automation opportunities

- The `buildMatrix` helper pattern used in tests could be extracted into a shared test utility to avoid reimplementation across modules.

## Coverage gaps

- Line 375-382 (iteration limit exceeded branch, `it > nrp2`): Not triggered by test cases because the conjugate gradient converges quickly for the test matrices. Reaching this requires a matrix pair where the balancing iteration does not converge within nr+2 steps. This is acceptable as an uncovered branch.
- Line 525-526 (ilo === ihi quick return from scaling within doScaling): Only triggered when permutation isolates all but one element, and job is 'scale' or 'both'. The diagonal/permute tests happen to exercise this in the 'permute' path but not the 'scale' path directly. Coverage is 98.28% line / 97.92% branch, well above targets.

## Complex number handling

- N/A: dggbal is a real-valued routine.
