# zgelss: Translation Learnings

## Translation pitfalls

- The Fortran zgelss uses 1-based WORK indexing (ITAU=1, IWORK=ITAU+N). In JS, all offsets are 0-based (ITAU=0, IWORK=ITAU+N).
- The Fortran WORK is Complex*16 (complex), and RWORK is DOUBLE PRECISION (real). The workspace layout is fundamentally different from dgelss where everything is in one real WORK array.
- In the complex version, zgebrd outputs d/e as Float64Array (real bidiagonal) but TAUQ/TAUP as Complex128Array. Both share WORK (complex) and RWORK (real) separately.
- The Fortran uses 'C' for conjugate-transpose; the JS long-form is 'conjugate-transpose'. This differs from dgelss which uses 'T'/'transpose'.
- The workspace size computation uses complex elements (not doubles), so the formula changes from dgelss: 3*N becomes 2*N for bidiag workspace since TAUQ+TAUP are N complex each (2*N complex total vs 3*N real in dgelss).
- The deps.py tool did not detect all transitive dependencies because EXTERNAL-declared routines in the Fortran source are not found by simple grep. Had to manually add ~40 deps to the deps file (zgeqrf, zunmqr, zgebrd, zunmbr, zungbr, zgelqf, zunmlq, zlacpy, zlascl, zlarf, zlarfb, zlarfg, zlarft, etc.).

## Dependency interface surprises

- zlange returns a real number (double) even though it operates on Complex128Array. This is consistent with the Fortran: ZLANGE returns DOUBLE PRECISION.
- zlaset takes Complex128 alpha/beta, while dlaset takes plain doubles. The complex constants CZERO/CONE must be pre-allocated Complex128 objects.
- zbdsqr takes Complex128Array for VT/U/C matrices but Float64Array for d/e/RWORK. The DUM dummy array must be Complex128Array, not Float64Array (unlike dgelss where DUM is Float64Array).
- zdrscl takes Complex128Array x with complex-element strides. When scaling a row of B, the stride is strideB2 (column stride), not strideB1.
- zgemm/zgemv take Complex128 alpha/beta scalars, while dgemm/dgemv take plain doubles.
- zlascl operates on Complex128Array but takes real cfrom/cto scalars (not complex).
- dlascl and dlaset are still used for the real S array (singular values).

## Automation opportunities

- The deps.py tool should be enhanced to find EXTERNAL-declared routines transitively. Currently it misses routines that are only referenced via EXTERNAL statements, requiring manual deps file creation.
- The mechanical mapping from dgelss to zgelss (real -> complex types, 'transpose' -> 'conjugate-transpose', Float64Array -> Complex128Array for A/B/WORK, separate RWORK, workspace size formula adjustment) could potentially be templated.

## Coverage gaps

- Chunk-processing paths for multi-RHS with constrained workspace (lines 256-258, 290-300, 456-497): These require very specific workspace sizes that are below the auto-allocated generous amounts. Would need explicit WORK arrays sized to force the chunk loop.
- B-norm scaling undo paths (ibscl=1 or ibscl=2): Would need B with entries near underflow or overflow thresholds.
- Path 2a (LQ path) chunk paths: Same as above but for the LQ workspace copy variant.
- Final coverage: 91.47% line, 85.48% branch, 100% function.

## Complex number handling

- Complex constants (CZERO, CONE) are pre-allocated at module scope as Complex128 objects to avoid per-call allocation.
- No complex arithmetic is inlined in zgelss itself. All complex operations are delegated to subroutines (zgemm, zgemv, zdrscl, etc.).
- The Float64Array reinterpret pattern is not needed in zgelss because it only passes arrays through to subroutines; it never directly accesses individual complex elements.
- RWORK (Float64Array) holds the real off-diagonal of the bidiagonal matrix and the real workspace for zbdsqr. S (Float64Array) holds the real singular values. These real arrays coexist with the complex WORK array.
