# zlaesy: Translation Learnings

## Translation pitfalls

- Fortran ZLAESY leaves EVSCAL uninitialized in the B=0 (diagonal) branch.
  The Fortran fixture shows garbage/carry-over values. In JS we explicitly
  set evscalr=evscali=0 for this branch, which is semantically correct
  (EVSCAL=0 means "eigenvectors were trivially computed" in the diagonal case).
- Similarly, when evnorm < THRESH, Fortran only sets EVSCAL=0 but leaves CS1
  and SN1 with their partial (pre-normalization) values. In JS we zero all
  three outputs for defensive clarity. The convention "EVSCAL=0 means ignore
  CS1/SN1" makes this safe.
- Object return pattern was used instead of output-parameter pattern since all
  outputs are complex scalars with no natural array representation. The
  signature conformance lint rule warns about 3 vs 8 params, but this is the
  correct design for JS.

## Dependency interface surprises

- N/A. ZLAESY is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The scaffold generator assumes all Complex128 params are pass-through
  (input+output). For routines like ZLAESY where outputs are returned via
  object, the generated signature has too many parameters. A heuristic to
  detect output-only complex scalars (based on Fortran intent) could skip
  them in the JS signature.

## Coverage gaps

- The csqrt(0,0) branch (lines 64-67) is unreachable via ZLAESY because
  when both T and B are zero, the Z=0 guard prevents calling csqrt. The
  only way to reach it is if the matrix has A=C and B=0, which is handled
  by the diagonal branch before csqrt is ever called.
- The evnorm < THRESH branch required a carefully constructed input
  (A=i, B=1, C=-i) that produces SN1=-i, making 1+SN1^2=0 exactly.

## Complex number handling

- Complex square root (csqrt) implemented as a local helper function
  following the pattern from zhgeqz/zlahqr. Cannot be inlined.
- Complex division (cdiv) implemented as a local helper using Smith's
  formula, following the pattern from cmplx.js. Cannot be inlined.
- Complex modulus (cabs) is safe to inline: sqrt(re^2 + im^2).
- All complex multiplication was inlined with comments showing the math.
- Complex-by-real division (T/Z, B/Z) is safe to inline as simple scaling.
