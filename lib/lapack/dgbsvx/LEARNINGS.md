# dgbsvx: Translation Learnings

## Translation pitfalls

- The Fortran EQUED/FACT/TRANS are single characters; the JS versions use stdlib string constants ('not-factored', 'equilibrate', 'factored', 'none', 'row', 'column', 'both', 'no-transpose', 'transpose').
- The Fortran routine uses SMLNUM/BIGNUM for input validation of R/C when FACT='F', but the JS version delegates input validation to callers and does not replicate those checks. The SMLNUM variable is still needed for EPS comparison.
- BIGNUM was unused in the JS implementation because the input validation of R/C scale factors is not performed (matching zgbsvx pattern).
- The `rcond` parameter in the Fortran signature is a scalar output; in JS it's returned as part of the result object (not passed as Float64Array(1)). Internally, a temporary Float64Array(1) is used for the dgbcon call.
- WORK(1) is set to rpvgrw on output, matching Fortran convention.

## Dependency interface surprises

- dgbequ returns `{ info, rowcnd, colcnd, amax }` (object), not an integer.
- dlaqgb returns the equed string directly (not an integer or object).
- dgbcon takes rcond as a Float64Array(1) output parameter, not a scalar return.
- dgbtrf, dgbtrs, dgbrfs all return integer info codes.

## Automation opportunities

- The Fortran test scaffold generator should warn when `B(NMAX, NRHSMAX)` arrays are passed with `LDB = N` instead of `LDB = NMAX` (leading dimension mismatch caused incorrect multi-RHS fixture data).
- The `init_routine.py` deps generator missed dlaqgb, dlacpy, la_xisnan, and xerbla from the Fortran link deps. These were added manually.

## Coverage gaps

- The FACT='factored' with EQUED='row'/'column'/'both' paths are not directly tested with Fortran fixtures (would require pre-equilibrated input). The code paths are exercised indirectly through the equilibrate flow.
- The singular early-return path (dgbtrf returns info > 0) exercises computeSingularAnorm and the rpvgrw calculation via the singular_matrix test case.

## Complex number handling

- N/A: dgbsvx is a real-valued routine. The zgbsvx complex counterpart was used as reference but all complex arithmetic (reinterpret, cmplx.absAt, etc.) was removed.
