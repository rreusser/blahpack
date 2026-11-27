# dgesvd: Translation Learnings

## Translation pitfalls

- dgesvd is a massive driver routine (~2500 lines Fortran) with 20+ code paths based on JOBU/JOBVT combinations and M vs N. The real-valued version is structurally identical to zgesvd but much larger because it implements all the "sufficient workspace" QR/LQ optimization paths, whereas the zgesvd JS implementation only uses direct bidiagonal paths.
- The workspace computation section (lines 67-360 of Fortran) including LWORK queries and ILAENV calls was completely removed. Instead, workspace is allocated internally as a large Float64Array sized to accommodate all paths.
- The `MNTHR` crossover threshold was hardcoded as `floor(1.6 * min(M,N))` rather than calling `ILAENV(6, ...)`. The Fortran reference defaults this to about 1.6x as well.
- The workspace-branching within each path (e.g., "if LWORK >= WRKBL + LDA*N then LDWRKR=LDA else LDWRKR=N") was simplified to always use the minimum leading dimension (N for M>=N paths, M for M<N paths), since we allocate enough workspace anyway.
- For the chunked DGEMM loops (used when overwriting A with U in paths 2, 3, 8), the chunk size was set to N (or M for transpose paths) since we have ample workspace.
- The Fortran `DUM(1)` dummy array for unused outputs maps to a `DUM = new Float64Array(1)` allocated once.

## Dependency interface surprises

- `dormbr` is only used in the "not enough workspace" fallback paths, which we do not exercise in this implementation since we always allocate sufficient workspace. However, it is still imported for completeness.
- `dbdsqr` takes a DUM array for unused VT/U/C parameters, but it still needs valid stride parameters. Using `DUM, 1, 1, 0` (stride1=1, stride2=1, offset=0) works for all dummy cases.
- `dorgbr` and `dorgqr` accept `lwork=-1` for workspace query mode, which we use as a signal to "use internal workspace" rather than computing optimal workspace.
- `dgelqf` and `dorglq` also use `lwork=-1` for the same purpose.

## Automation opportunities

- The pattern of translating Fortran driver routines that have workspace-computation preambles followed by multiple code paths could be systematized: strip the LWORK computation entirely, compute a single wsz that covers all paths, allocate internally.
- The mapping from JOBU/JOBVT combinations to specific code paths is mechanical and could potentially be table-driven.

## Coverage gaps

- Lines 171-176 (scaling for near-underflow/overflow matrix norms) require extreme input values to trigger; not tested.
- Lines 1560-1576 (undo-scaling code) same as above.
- All 20+ JOBU/JOBVT path combinations are covered, including both the QR/LQ paths (M or N "much larger") and the direct bidiag paths (M, N comparable).
- Final coverage: 98.61% line, 96.74% branch, 100% function.

## Complex number handling

- N/A — dgesvd is the real-valued analog of zgesvd. No complex arithmetic involved.
