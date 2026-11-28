# zpocon: Translation Learnings

## Translation pitfalls

- zpocon uses zlatrs (triangular solve) directly on the Cholesky factor, NOT zpotrs. This matches the Fortran reference which also uses zlatrs for the condition estimation loop, giving better overflow control.
- The upper/lower branches differ in solve order: upper does U^H then U, lower does L then L^H. This matches the factorization A = U^H*U or A = L*L^H.

## Dependency interface surprises

- zpotrf and zlanhe both use long-form strings ('upper'/'lower') consistently with zlatrs. No string mapping needed, unlike ztrcon.
- The Fortran test needs zlacgv as a dependency for zpotf2, which is not obvious from the zpocon dep tree itself.

## Missing automation

- N/A. Pattern well-established from dpocon and the previous condition number routines.

## Coverage gaps

- The bail-out path (scale overflow) is hard to trigger with HPD matrices since condition numbers are finite. Would need a very ill-conditioned HPD matrix.

## Complex number handling

- Only uses cabs1 inline (safe). All complex triangular solves delegated to zlatrs.
