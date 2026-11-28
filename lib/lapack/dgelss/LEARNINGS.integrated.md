# dgelss: Translation Learnings

## Translation pitfalls

- RANK is an output integer parameter in Fortran. In JS, integers can't be passed by reference, so `rank` is passed as `[0]` (a 1-element array) and set via `rank[0] = value`.
- LWORK/WORK workspace queries (LWORK=-1 path) were removed entirely. Workspace is auto-allocated internally with generous sizing. The WORK/lwork parameters are retained in the API for callers who want to provide pre-allocated workspace, but `null` triggers auto-allocation.
- The MNTHR threshold uses `ILAENV(6, 'DGELSS', ...)` in Fortran. Hardcoded as `MNTHR_RATIO = 1.6` (typical LAPACK value), so `mnthr = round(1.6 * min(M,N))`.
- The Fortran uses 1-based WORK indexing (ITAU, IE, ITAUQ, ITAUP, IWORK). In JS these become 0-based offsets into the WORK array. Each workspace segment is accessed via `WORK, 1, <offset>` (stride=1, offset=segment_start).
- drscl is called with `B(I,1), LDB` — this scales row I of B using stride=LDB. In JS: `drscl(nrhs, S[i], B, strideB2, offsetB + i*strideB1)` where strideB2 is the column stride (=LDB in column-major).
- The `GO TO 70` pattern is a forward jump to the cleanup/exit section. Translated by restructuring: each path either returns early or falls through to the scaling undo section at the end.
- Three distinct code paths for N > M: Path 2a (LQ + workspace copy for N >> M with sufficient workspace), Path 2b (direct bidiag for N > M with insufficient workspace). The path selection depends on both the M/N ratio AND the available workspace size.

## Dependency interface surprises

- dgeqrf does NOT have a lwork parameter (allocates internally), while dormqr, dormbr, dorgbr, dgelqf, and dormlq all take lwork. This inconsistency requires attention when passing workspace.
- dlascl signature uses `(type, kl, ku, cfrom, cto, M, N, A, strideA1, strideA2, offsetA)` — the kl/ku are only for band types, pass 0 for 'G' (general).
- dlaset uses `(uplo, M, N, alpha, beta, A, strideA1, strideA2, offsetA)` — alpha fills off-diagonal, beta fills diagonal.
- dlange returns a scalar (the norm value), unlike most LAPACK routines that modify output arrays.

## Automation opportunities

- The three repeated blocks for rank thresholding + drscl/dlaset (one for each code path) are identical and could be extracted into a helper function. Not automated since it's within a single file.

## Coverage gaps

- **Scaling paths** (iascl/ibscl != 0): require matrices with norms near underflow/overflow thresholds (~1e-308 or ~1e308). These are hard to construct as realistic test cases.
- **dbdsqr convergence failure** (info != 0 returns): requires a bidiagonal matrix that fails to converge in the SVD iteration. Essentially impossible to trigger with well-formed inputs.
- **Chunked GEMM paths** (nrhs > 1 with workspace < LDB*nrhs): only triggered when caller provides artificially small workspace with multiple RHS. Covered by the auto-allocation path in practice.
- **Path 2b** (N > M, insufficient workspace for LQ copy): tested by providing small explicit WORK array. In auto-allocation mode, Path 2a is always taken.
- Overall: 85.5% line coverage, 66.7% branch coverage on base.js.

## Complex number handling

- N/A — this is a real-valued routine. The complex variant (zgelss) would need separate implementation.
