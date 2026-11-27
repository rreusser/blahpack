# zhbev: Translation Learnings

## Translation pitfalls

- The N=1 case extracts the real part of a complex diagonal element using `reinterpret()` on the Complex128Array. For upper storage, the diagonal sits at `AB(KD+1, 1)` which in the ndarray convention is `offsetAB + kd * strideAB1`.
- The Fortran `Z(1,1) = ONE` (where ONE is double precision 1.0) becomes setting the real part to 1.0 and imaginary to 0.0 via the Float64Array view of Z.

## Dependency interface surprises

- `zlanhb` takes a Float64Array WORK (real workspace), not Complex128Array. In the Fortran, this is the RWORK argument. The RWORK array serves double duty for zlanhb workspace and for the E (off-diagonal) array from zhbtrd.
- `zhbtrd` outputs diagonal into W (Float64Array) and off-diagonal into RWORK(INDE) (Float64Array), but takes WORK as Complex128Array for internal complex workspace.
- `zsteqr` takes Float64Array for d, e, and WORK, but Complex128Array for Z.

## Automation opportunities

- The Fortran test EQUIVALENCE pattern for complex arrays (printing as double-precision pairs) is now standard for all complex routines.

## Coverage gaps

- Scaling branch (ISCALE=1) is not exercised by the current test suite since all test matrices have norms well within [RMIN, RMAX]. This is the same limitation as dsbev.

## Complex number handling

- No inline complex arithmetic needed. zhbev is a driver routine that delegates to zhbtrd/zsteqr. The only complex-aware operation is extracting the real part of a diagonal element for the N=1 case via `reinterpret()`.
