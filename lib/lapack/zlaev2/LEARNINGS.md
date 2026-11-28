# zlaev2: Translation Learnings

## Translation pitfalls

- Fortran signature declares A, B, C as COMPLEX*16 but A and C are Hermitian diagonal elements, so only their real parts are used. The routine internally calls `DBLE(A)` and `DBLE(C)`. In JS, we extract via `real(a)` and `real(c)`, ignoring imaginary parts.
- The Fortran outputs RT1, RT2, CS1 as `DOUBLE PRECISION` and SN1 as `COMPLEX*16`. In JS, the object-return pattern splits SN1 into `sn1r` and `sn1i` fields.

## Dependency interface surprises

- `dlaev2` uses the object-return pattern `{ rt1, rt2, cs1, sn1 }`. The `sn1` field from dlaev2 is a real number (the rotation sine before phase correction), which we multiply by the complex phase factor W.

## Automation opportunities

- N/A. This routine is very simple (wrapper around dlaev2 with phase correction).

## Coverage gaps

- N/A. 100% line and branch coverage achieved. Both branches (B=0 and B!=0) are exercised by the test suite.

## Complex number handling

- `conj(B) / |B|` is division of a complex number by a real scalar, safe to inline (no numerical stability concerns).
- `W * T` is multiplication of a complex number by a real scalar, safe to inline.
- `|B| = sqrt(br^2 + bi^2)` is safe to inline per project conventions (complex modulus without division).
- No use of `cmplx.div` or `cmplx.abs` was needed since all operations are either real-scalar division or real-scalar multiplication.
