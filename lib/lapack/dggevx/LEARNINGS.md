# dggevx: Translation Learnings

## Scope

- dggevx is the "expert" driver on top of dggev. It adds:
  1. General balancing (permute/scale/both) via DGGBAL with the user's `balanc` choice.
  2. ABNRM and BBNRM output (one-norms of the original/unscaled A and B).
  3. Reciprocal condition numbers for eigenvalues (RCONDE) and right eigenvectors (RCONDV) via DTGSNA.
- All four `sense` modes (`'none'`, `'eigenvalues'`, `'right-vectors'`, `'both'`) are supported. The condition-number path follows the Fortran inner loop: for each real eigenvalue or 2×2 block, set a single BWORK flag, call DTGEVC with `'selected'` to recompute one pair of Schur-form eigenvectors into a small local workspace, then call DTGSNA to estimate the reciprocal condition numbers. The back-transformed VL/VR returned to the caller are left untouched.
- SENSE→DTGSNA JOB mapping: `'eigenvalues'` → `'eigenvalues'`, `'right-vectors'` → `'eigenvectors'`, `'both'` → `'both'`. The JS string convention for dtgsna uses `'eigenvectors'` (not `'right-vectors'`) so the mapping is non-trivial.

## Fortran subtleties

- DHGEQZ is always called with the **full** matrix and 1-based ILO..IHI, even in the `!ilv && wantsn` branch where DGGHRD operated on a submatrix. My first attempt called DHGEQZ on the submatrix when `!ilv && wantsn`, which caused diagonal test cases (`balanc='P'` with a 3x3 diagonal) to silently drop the isolated eigenvalues (alphar[1:]=0). The fix: always pass `N, ilo-1, ihi-1` (0-based for DHGEQZ) and the full A/B offsets. DHGEQZ reads the isolated eigenvalues directly from the diagonal outside [ilo,ihi].
- ABNRM/BBNRM are computed *after* DGGBAL (on the permuted/scaled matrices) but unscaled if `ilascl/ilbscl` are set. The unscaling is done via a 1x1 DLASCL call on a scratch WORK[0], not by direct arithmetic.
- When `ilv || !wantsn` is true, DGGHRD operates on the full N×N problem; otherwise it operates on the submatrix A(ilo:ihi, ilo:ihi). DHGEQZ, however, always takes the full matrix.

## Signature design

- Dropped from the Fortran signature in the JS base:
  - LDA, LDB, LDVL, LDVR (replaced by strideA1/strideA2/offsetA patterns)
  - WORK, LWORK, IWORK, BWORK (allocated internally)
  - ILO, IHI, ABNRM, BBNRM (returned in the result object)
- Return type is `{ info, ilo, ihi, abnrm, bbnrm }` instead of a bare integer (following the dggbal pattern for routines with multiple scalar outputs).
- String parameter conventions:
  - `balanc`: `'none'`, `'permute'`, `'scale'`, `'both'` (matches dggbal)
  - `jobvl`/`jobvr`: `'no-vectors'`, `'compute-vectors'` (matches dggev)
  - `sense`: `'none'`, `'eigenvalues'`, `'right-vectors'`, `'both'`

## Testing

- Fortran fixtures cover both the `sense='N'` path (6 cases) and the three condition-number paths on a 4×4 general non-symmetric matrix: `4x4_sense_E` (eigenvalues only), `4x4_sense_V` (right-vector condition numbers only), and `4x4_sense_B` (both).
- Generated 9 fixture cases total: diagonal with/without balancing, upper-triangular with full vectors, complex conjugate pairs with scale balancing, general nonsymmetric with both balancing, 1x1 trivial, and three SENSE variants on the 4x4 general matrix.
- Added scaling-path tests (`1e-180` and `1e180` magnitudes) to exercise the ilascl/ilbscl branches, which lifted line coverage from ~82% to ~97% and branch coverage to ~96%.
- The `bin/lint.sh` helper runs tests in a `vm`-created context where cross-realm `instanceof TypeError` fails. Tests pass via direct `node --test` (34/34). This is a known lint.sh quirk affecting dggev and other routines that use `assert.throws(fn, TypeError)` with `node:assert/strict`.

## Fortran deps file

- The transitive Fortran link dependencies for dggevx are extensive because dtgsna pulls in dtgsy2/dtgsyl/dtgexc/dtgex2/dlagv2/dlatdf/dgesc2/dgetc2 and the condition-number path transitively requires dgecon/dgetrf/dgetri/dtrtri/dtrti2/dlatrs/drscl/dtrcon/dlantr/dlaswp. The current `deps_dggevx.txt` enumerates all of these so `run_fortran.sh` links cleanly.
- Do **not** list `lsame`, `xerbla`, `dlaswp`, or `dlacn2` more than once — duplicate entries cause `multiple definition` link errors because `run_fortran.sh` does a simple `gfortran ...` without archive deduplication.
