# dlatbs: Translation Learnings

## Translation pitfalls

- Banded storage has different main diagonal row index: upper uses row KD (0-based), lower uses row 0 (0-based). This is unlike dense dlatrs where diagonal is at `A[j*sa1 + j*sa2]`.
- Off-diagonal elements in upper banded: column j has elements at rows `(kd-jlen)..(kd-1)` in 0-based, where `jlen = min(kd, j)`. The x-vector elements they correspond to are at `x[j-jlen..j-1]`.
- Off-diagonal elements in lower banded: column j has elements at row 1 through `min(kd, N-j-1)` in 0-based.
- Fortran test arrays declared as `ab(10,10)` but passing `LDAB=3` causes silent memory corruption because the leading dimension mismatch. Must declare arrays with exact LDAB or use Fortran `block` constructs.

## Dependency interface surprises

- dtbsv uses same long-form string conventions (`'upper'`, `'no-transpose'`, etc.) as dlatbs, so the call passes through cleanly.
- dasum with stride=1 and offset pointing into the middle of banded storage works correctly for computing column norms of off-diagonal elements.

## Automation opportunities

- Banded storage test matrix construction is tedious and error-prone. A helper `bandedMatrix(ldab, n, entries)` was factored into the test file.
- Fortran deps files frequently need manual additions (dgbtrf, dpotf2, disnan, etc.) when the auto-generated list misses transitive dependencies used in test programs.

## Coverage gaps

- The careful solve path (lines 150-290) is only exercised when the growth bound estimate is very small. Well-conditioned test matrices all go through the dtbsv fast path. Near-overflow testing would require matrices with elements near `BIGNUM` or near-singular diagonal elements.
- The `CNORM` overflow scaling path (tscal != 1) is not exercised by standard test matrices.
- These paths mirror dlatrs exactly, which is already tested for the dense case.

## Complex number handling

- N/A: dlatbs is a real-valued routine.
