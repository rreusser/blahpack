# dtgsen: Translation Learnings

## Translation pitfalls

- dtgexc uses 0-based IFST/ILST indices. The Fortran dtgsen uses 1-based KK/KS with dtgexc, but the JS dtgexc already expects 0-based. Needed `kk = k` and `ks - 1` (not `kk = k + 1` and `ks` as the Fortran does).

- The eigenvalue computation at the end uses a temporary 2x2 workspace passed to dlag2. The Fortran stores this in WORK(1..8) with LDA=2 (column-major). The JS translation uses WORK at offsetWORK with stride1=1, stride2=2 to match.

- The `SIGN(ONE, B(K,K)) < ZERO` check simplifies to `B[k,k] < 0` since SIGN(1,x) returns 1 for x>=0 and -1 for x<0.

## Dependency interface surprises

- dtgsyl takes `scale` and `dif` as Float64Array output parameters (writing to index 0), not as return values. The return value is just `info` (integer).

- dlassq returns `{ scl, sumsq }` object. Must destructure and pass updated values to subsequent calls in the DIF/Frobenius norm loop.

- dtgexc returns `{ info, ifst, ilst }` object. Only need `info` for the error check.

- dlacn2 modifies its arrays in place and returns void. KASE, EST, and ISAVE are all modified between calls in the estimation loop.

## Fortran test compilation

- dtgsen has a deep transitive dependency chain through dtgsyl -> dtgsy2 -> dgetc2/dlatdf -> dgecon -> dlatrs/drscl. The deps file needed many additional entries beyond what deps.py generates (dgetc2, dlatdf, dgecon, dlatrs, drscl, dorg2r, dorgr2, dorm2r, dormr2, la_xisnan, la_constants).
