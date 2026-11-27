# zgerqf: Translation Learnings

## Translation pitfalls

- The backward iteration in the blocked path (Fortran: `DO I = K-KK+KI+1, K-KK+1, -NB`) translates to 0-based as `for (i = K-kk+ki; i >= K-kk; i -= nb)`. Getting the loop bounds right required careful tracking of the 1-based to 0-based conversion.
- After the blocked loop exits, `i` has been decremented past the loop bound, so `mu = M - K + i + nb` and `nu = N - K + i + nb` correctly account for the remaining unblocked portion.

## Dependency interface surprises

- zlarft and zlarfb use the same stride conventions as in the QR case. For RQ (backward/rowwise), the `direct` and `storev` strings are 'backward' and 'rowwise' respectively.
- The T matrix workspace is carved from WORK's tail (at offset `iws`), following the same pattern as dgerqf.

## Automation opportunities

- N/A; mirrors dgerqf with complex types.

## Coverage gaps

- The blocked code path (nb >= nbmin && nb < K) requires min(M,N) >= 32 to trigger. All fixture-based tests use small matrices that go through the unblocked path. Would need a 35+ row/column matrix fixture to exercise the blocked path.
- The blocked path is structurally identical to dgerqf which is tested, so the risk is low.

## Complex number handling

- All complex arithmetic handled by sub-routines (zgerq2, zlarft, zlarfb).
- WORK is Complex128Array; T matrix carved from WORK tail.
