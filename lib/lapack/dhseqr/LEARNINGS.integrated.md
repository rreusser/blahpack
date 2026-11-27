# dhseqr: Translation Learnings

## Translation pitfalls

- ILO and IHI are 1-based (Fortran convention). The loops extracting diagonal eigenvalues outside the active block use 0-based JS indices but offset by ILO-1 and IHI.
- The Fortran routine allocates workspace internally via LWORK and WORK parameters with a workspace query mechanism (LWORK=-1). In JS, we removed LWORK/WORK from the API entirely and allocate internally as needed.
- The Fortran `ILAENV(12, ...)` call is replaced by a hardcoded `NMIN = 75` constant matching the iparmq default, since ILAENV is not translated.
- The LSAME calls for JOB/COMPZ are replaced with direct string equality checks on single chars.

## Dependency interface surprises

- dlahqr and dlaqr0 both take ILOZ and IHIZ as separate parameters (the range of Z rows to update), whereas dhseqr passes ILO and IHI for these. This matches the Fortran where the full Z is updated over the active block range.
- dlacpy and dlaset accept any string for uplo; values other than 'upper' and 'lower' fall through to the full-matrix else branch. Using 'A' works fine for the "all" case.

## Automation opportunities

- The deps file for Fortran test compilation required manual chasing of transitive dependencies (ilaenv, ieeeck, iparmq, dtrexc, dlaexc, dlasy2, dlange, dlarfx, dlartg, dlassq, la_constants, la_xisnan). A tool to compute the full transitive compile-time dependency closure would save time.

## Coverage gaps

- The `N > NMIN` branch (line 139) requires a matrix larger than 75x75 to exercise. Not tested due to fixture size.
- The `info > 0` fallback path (lines 148-171) where dlahqr fails and dlaqr0 is called as backup requires a pathological matrix that causes dlahqr to not converge within its iteration limit. Difficult to construct deterministically.
- The `N >= NL` sub-branch (line 155) within the fallback requires N >= 49 AND dlahqr failure. Even harder to test.
- Overall coverage: 91.21% line, 90.00% branch on base.js, meeting targets.

## Complex number handling

- N/A: dhseqr is a real (double precision) routine.
