# dsyev: Translation Learnings

## Translation pitfalls

- WORK partitioning: Fortran uses 1-based INDE=1, INDTAU=INDE+N, INDWRK=INDTAU+N. In JS with 0-based offsets: inde=offsetWORK, indtau=inde+N*strideWORK, indwrk=indtau+N*strideWORK. The llwork calculation must subtract 2*N from lwork to account for the E and TAU segments.
- Removed all LWORK query logic (LQUERY) and ILAENV calls. WORK is allocated externally; the driver just uses whatever size is provided.
- Removed parameter validation (INFO=-1..-8 checks) per stdlib convention — validation belongs in ndarray.js wrapper.
- The N=1 quick return copies A[offsetA] to W[offsetW] and sets A[offsetA]=1.0 if WANTZ, matching Fortran exactly.

## Dependency interface surprises

- No surprises. All deps (dsytrd, dorgtr, dsterf, dsteqr, dlansy, dlascl, dscal) follow standard stride/offset conventions.
- dsteqr takes WORK for scratch space. In Fortran, WORK(INDTAU) is reused for dsteqr's WORK. This is safe since dorgtr has already consumed TAU before dsteqr is called.
- dlansy also takes WORK as scratch — this is fine since dlansy runs before the WORK array is partitioned for E/TAU segments.

## Automation opportunities

- The Fortran deps file generator (`bin/deps.py`) does not include `la_xisnan`, `la_constants`, `ilaenv`, `ieeeck`, or `iparmq` automatically. These had to be added manually to `test/fortran/deps_dsyev.txt`. This is a recurring issue for any routine that transitively depends on dlassq (via disnan -> la_xisnan) or blocked algorithms (via ilaenv).

## Coverage gaps

- Lines 160-161: The `info > 0` branch inside the rescaling block requires dsteqr to fail to converge (return info > 0) while simultaneously having iscale=1 (matrix needed scaling). This is extremely hard to construct — would need a nearly-singular tridiagonal matrix with elements near underflow/overflow threshold. Coverage: 98.83% line, 94.74% branch.

## Complex number handling

- N/A — dsyev is a real-valued routine, no complex arithmetic involved.
