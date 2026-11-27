# zheev: Translation Learnings

## Translation pitfalls

- zheev mixes Complex128Array (for A, WORK, TAU) and Float64Array (for W eigenvalues, RWORK off-diagonal and scratch). The workspace partitioning differs from dsyev: RWORK holds E (off-diagonal) and zsteqr scratch (real), while WORK holds TAU (complex) and zhetrd/zungtr scratch (complex).
- For N=1, the eigenvalue is the real part of A(0,0) -- must use `reinterpret()` to read from the complex array.
- INFO/eigenvalue rescaling logic is identical to dsyev.

## Dependency interface surprises

- zheev requires zungtr, which was not implemented. zungtr is a thin wrapper that calls zungql (UPLO='U') or zungqr (UPLO='L') after shuffling reflectors, exactly like dorgtr.
- zungql was not implemented either. It required implementing zung2l (unblocked) and zungql (blocked), both analogous to dorg2l/dorgql.
- zlanhe returns a real value (Float64) despite operating on complex matrices. RWORK parameter is Float64Array.
- zlascl uses complex-element strides/offsets in its API.
- zsteqr's WORK parameter is real (Float64Array) not complex.

## Automation opportunities

- The pattern "implement complex analog of real routine" (dorg2l -> zung2l, dorgql -> zungql, dorgtr -> zungtr) is highly systematic. The changes are: (1) add reinterpret(), (2) multiply strides/offsets by 2 for Float64 indexing, (3) use Complex128 for scalars, (4) zero imag parts where setting real values. A transform could automate this.
- deps.py missed zungtr and its subtree because zheev calls it but the dependency analyzer doesn't follow the zungtr -> zungql -> zung2l chain. The deps file needed manual additions (zungtr, zungql, zung2l, zung2r, zungqr, zlarf, zlarfb, zlarft, zlasr, ilaenv, la_xisnan, ieeeck, iparmq).

## Coverage gaps

- Scaling paths (anrm < rmin, anrm > rmax) at 76.47% branch coverage. Would need matrices with extremely large or small entries to exercise.
- zungql blocked path not exercised (matrices < 32 columns, so NB=32 > K always).
- Error info path (dsterf/zsteqr convergence failure) not tested -- would require a pathological matrix.

## Complex number handling

- No complex arithmetic inlined in zheev itself; all complex operations happen in dependencies.
- zheev's A is Complex128Array but W (eigenvalues) is Float64Array since eigenvalues of Hermitian matrices are real. dscal operates directly on W.
- For the N=1 special case, reinterpret() extracts the real part from the complex A array.
