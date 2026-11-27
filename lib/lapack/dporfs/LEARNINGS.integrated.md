# dporfs: Translation Learnings

## Translation pitfalls

- The Fortran WORK array has 3 segments of N elements (indices 1..N, N+1..2N, 2N+1..3N in 1-based). In JS with 0-based indexing, these map to [0..N-1], [N..2N-1], [2N..3N-1]. The offset for WORK segments passed to dcopy/dsymv/dpotrs is simply N (for the second segment).
- The iterative refinement loop uses a backward GOTO (label 20) which maps naturally to a while(true) with break.
- No index off-by-one issues since all loop variables are straightforward 0-based.

## Dependency interface surprises

- dpotrs in this codebase uses full-word strings ('upper'/'lower'), not single chars ('U'/'L'). The dporfs base.js must use the same convention and pass through the uplo string directly to both dpotrs and dsymv.
- dpotrs signature is `(uplo, N, nrhs, A, sa1, sa2, oA, B, sb1, sb2, oB)` - it does NOT have a separate LDB parameter since leading dimension is consumed into strides.
- dlacn2 uses reverse communication with KASE as Int32Array[1] and EST as Float64Array[1], plus ISAVE as Int32Array[3] for state. The caller must manage the EST/FERR transfer manually.

## Automation opportunities

- The dporfs pattern (symmetric iterative refinement) is very similar to dgerfs (general iterative refinement). The only differences are: dsymv instead of dgemv, dpotrs instead of dgetrs, no trans parameter, and the abs(A)*abs(X) computation exploits symmetry. A template-based generator could produce both from a shared skeleton.
- The deps file generation for the Fortran test needs manual augmentation (adding dpotrf and its transitive deps) since the test program calls dpotrf/dpotrs but these are not deps of dporfs itself.

## Coverage gaps

- safe2 fallback paths (lines 173-174, 201-202) require inputs near the underflow threshold to trigger WORK[i] <= safe2. These are systematically hard to cover and represent only 2 branches out of ~30.
- Iterative refinement loop was not triggered by fixture tests (dpotrs gives machine-precision solutions for well-conditioned matrices). Added a separate test that perturbs X by 1e-8 to force refinement, bringing coverage to 98.39% line / 93.55% branch.

## Complex number handling

- N/A: dporfs is a real (double precision) routine with no complex arithmetic.
