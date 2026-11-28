# dsycon_3: Translation Learnings

## Translation pitfalls

- Nearly identical to `dsycon`. The only structural change is that the inner solve uses `dsytrs_3` instead of `dsytrs`, which adds an `e` (super-/sub-diagonal of `D`) parameter and uses the bounded Bunch-Kaufman ("rook") factorization from `dsytrf_rk`.
- The reverse-communication loop pattern is unchanged: allocate `KASE`/`EST`/`ISAVE`, loop calling `dlacn2`, breaking when `KASE[0] === 0`, otherwise solve `A*X = WORK[0..N-1]` via the factorization.
- Singular-D guard reads `IPIV[i] >= 0 && A[i,i] === 0`, matching `dsycon`. Fortran source pre-1-based, JS uses 0-based loops.

## Dependency interface surprises

- `dlacn2` argument order: `(N, V, sV, oV, X, sX, oX, ISGN, sI, oI, EST, KASE, ISAVE, sISAVE, oISAVE)`. Pass `WORK` twice with different offsets: `V = WORK[N..2N-1]` (offset `N*sw`), `X = WORK[0..N-1]` (offset `0`).
- `dsytrs_3` solves `A*X = B` where `B` is treated as `N`-by-`nrhs` column-major. For a single RHS in `WORK[0..N-1]`, pass `strideB1=sw`, `strideB2=N*sw`, `offsetB=offsetWORK`.

## Coverage gaps

- `anorm <= 0` early return required a synthetic test (anorm=0 with nonsingular D).
- Singular-D early return requires hand-crafted inputs (real factorizations rarely produce `IPIV[i] >= 0 && D[i,i] == 0`); both upper and lower paths covered with synthetic fixtures.

## Process

- Fortran deps file needed `disnan`, `dlaisnan` (called by `dlansy`) plus the full `dsytrf_rk` factorization chain (`dlasyf_rk`, `dsytf2_rk`) and `la_constants`/`la_xisnan` for the F90 norm modules. `deps.py` does not detect Fortran-only `.f90` modules.
