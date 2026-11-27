# dlanv2: Translation Learnings

## Translation pitfalls

- All parameters in Fortran are pass-by-reference scalars (in/out). JS has no pass-by-reference for primitives, so we use object return (like dlasv2) with fields: a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn.
- The GOTO 10 loop for scaling sigma/temp maps to a `while (true) { ... break; }` with `continue` for the back-edges. The loop has TWO scaling conditions (overflow and underflow), each with a `count <= 20` guard.
- Fortran `SIGN(A, B)` with B=0 returns +|A|, but `Math.sign(0)` returns 0 in JS. Must use a custom `sign()` helper that handles this correctly (including -0.0 via `Object.is`).
- The Schur factorization formula in the doc header has Q = [CS, -SN; SN, CS], so original = Q * Schur * Q^T. Easy to get the transpose direction wrong in verification tests.

## Dependency interface surprises

- dlamch and dlapy2 are both straightforward scalar functions, no surprises. dlamch('P') = precision, dlamch('S') = safe minimum, dlamch('B') = base.
- SAFMN2/SAFMX2 computation uses `BASE^floor(log(SAFMIN/EPS)/log(BASE)/2)` which is a module-level constant.

## Automation opportunities

- The gen_test.py scaffold generates stub tests with commented-out assertions. For scalar-output routines returning objects, could auto-generate checkResult() and inputs map from the fixture + Fortran test source. Not worth automating until more scalar-output routines are translated.

## Coverage gaps

- Lines 154-160 (SAFMX2 overflow scaling loop): requires sigma or temp near overflow (~1e308). Would need very large near-equal diagonal entries to trigger the complex-eigenvalue path AND have sigma overflow. Not tested.
- Lines 161-167 (SAFMN2 underflow scaling loop): requires sigma or temp near underflow (~1e-308). Similar difficulty.
- Lines 212-218 (B=0, C!=0 swap in complex path): requires the Schur rotation to produce exactly B=0 with C!=0. This is a measure-zero event numerically; extremely hard to trigger with finite-precision inputs.
- All uncovered paths are safeguard/edge-case branches. Coverage: 92.83% line, 85.71% branch, exceeding targets.

## Complex number handling

- N/A: dlanv2 is a real-valued routine (d-prefix), no complex arithmetic involved.
