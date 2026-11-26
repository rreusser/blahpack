# zhetri2: Translation Learnings

## Routine character

-   `zhetri2` is a trivial dispatcher: it picks between the unblocked
    `zhetri` and the blocked `zhetri2x` based on `ILAENV(1, 'ZHETRF', ...)`
    vs `N`. The entire algorithm lives in those two leaves. The JS port
    is ~10 lines plus the dispatch.

## Translation pitfalls

-   The Fortran source has a workspace-query path (`LWORK = -1` writes
    `MINSIZE` to `WORK(1)`). Per project convention this is dropped — the
    caller sizes `WORK` themselves. The `LWORK` parameter is therefore
    consumed (not exposed in JS), exactly like `LDA` and `INFO`.
-   `ILAENV(1, 'ZHETRF', ...)` is called through the translated `ilaenv` module (64), in
    `lib/base.js`, `lib/ndarray.js` (MINSIZE) and the wrapper's `null` allocation
    (CONVENTIONS X3; ticket 0049). It used to be a hardcoded `NBMAX = 32`, which took the
    blocked `zhetri2x` path for 33 <= N <= 64 where the reference takes `zhetri`.

## Dependency interface surprises

-   `zhetri` and `zhetri2x` accept the *same* ndarray-style argument list
    (`uplo, N, A, sa1, sa2, oA, IPIV, sI, oI, WORK, sW, oW`), except that
    `zhetri2x` has an extra trailing `nb` argument. This made the
    dispatcher essentially mechanical.
-   Both leaves use the same `IPIV` convention (non-negative = 0-based
    row index for 1x1 pivots; negative = bitwise-NOT-encoded for 2x2),
    so the dispatcher passes `IPIV` straight through without
    re-encoding.

## Fortran test notes

-   `deps_zhetri2.txt` from `bin/init_routine.py` was missing the
    transitive deps of `ZHETRF` (`zhetrf`, `zhetf2`, `zlahef`, `zlacgv`,
    `dlamch`, `dlapy2`, `disnan`, `dlaisnan`). Cross-checked against
    `deps_zhetri2x.txt` and merged its dependency set in.
-   The 40x40 case is below `NBMAX = 64`, so it runs the unblocked `zhetri`
    path, as in the reference. The blocked path is exercised by the 70x70
    cases (a separate `NBIG = 70` array in the Fortran test).
    `NMAX = 40` keeps the column padding visible to the JS test as
    `FIXTURE_LDA = 40`.
-   Complex literal gotcha: `(3.0d0 + dble(i), 0.0d0)` is not a valid
    Fortran complex constructor when the components are runtime
    expressions. Use `dcmplx(...)`.

## Coverage

-   With 21 tests covering both dispatch arms, both UPLO branches, 1x1
    and 2x2 pivot configurations, the N=0 quick return, N=1 trivial
    case, the singular-D guard, and all validator failure modes, the
    base+ndarray+wrapper paths are exhaustively exercised.
