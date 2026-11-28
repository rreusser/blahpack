# dgeev: Translation Learnings

## Translation pitfalls

- dgeev removes LWORK/workspace query from the API. JS version allocates workspace internally (SCALE, TAU, WORK, TREVC_WORK) instead of exposing the LWORK=-1 query pattern.
- The Fortran code's IBAL/ITAU/IWRK workspace partitioning (WORK(IBAL), WORK(ITAU), WORK(IWRK)) is replaced by separate allocations (SCALE, TAU, WORK arrays), which simplifies the code but means the workspace layout doesn't match Fortran.
- dlascl for 1D vectors (WR, WI) requires treating them as M-by-1 matrices with appropriate strides. strideA2 is irrelevant when N=1 column.
- The `info > 0` branch (dhseqr failure) scaling path uses `WR(INFO+1)` in Fortran (1-based), which maps to `offsetWR + info * strideWR` (0-based) in JS.

## Dependency interface surprises

- dgebal returns `{ info, ilo, ihi }` object (not integer). ilo/ihi are 1-based.
- dhseqr takes single-char strings ('S', 'E', 'V', 'N') for job/compz. Does NOT accept long-form strings.
- dgebak takes single-char strings ('B', 'L', 'R') for job/side.
- dlascl takes long-form strings ('general', 'lower', etc.) for type.
- dlacpy takes long-form strings ('lower', 'upper', 'full') for uplo.
- dlange takes long-form strings ('max', 'one-norm', 'inf-norm', 'frobenius') for norm.
- dhseqr allocates its own workspace internally (no WORK parameter in JS signature).
- dlartg returns output via a Float64Array `out`: out[0]=c, out[1]=s, out[2]=r.
- dtrevc3 signature has SELECT as a boolean array, but in the 'B' (backtransform) howmny mode it is unused. Still must be passed.
- idamax returns 0-based index in JS (the Fortran version returns 1-based).

## Automation opportunities

- The Fortran deps file generation (deps_dgeev.txt) missed many transitive dependencies (dorghr, dtrevc3, ilaenv, dtrexc, dlaexc, dlasy2, dlarfx, dorgqr, dorg2r, ieeeck, iparmq, la_xisnan). This should be auto-generated from the full dependency tree.

## Coverage gaps

- The `scalea` branch (lines 153-161) for matrices needing scaling was not exercised by tests. Adding a test with very large or very small matrix elements would cover it, but the path is a straightforward dlascl call.
- The `info > 0` path (dhseqr failure) at lines 209-219 was not tested. This would require a matrix that causes QR convergence failure, which is hard to construct.
- The `info > 0` scaling undo path (lines 312-318) was also not covered for the same reason.

## Complex number handling

- N/A for dgeev (real routine). Complex eigenvalue pairs are represented via consecutive columns in VR/VL with the convention v_j = VR(:,j) + i*VR(:,j+1) for WI(j) > 0.
- Tests verify complex eigenvectors using the mathematical property A*(vr + i*vi) = (wr + i*wi)*(vr + i*vi) rather than comparing exact values against fixtures (sign/phase ambiguity).
