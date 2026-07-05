# dsgets: Translation Learnings

## Translation pitfalls

-   **Void routine.** `dsgets` reorders `ritz`/`bounds` in place and writes
    `shifts`; no return value.
-   **`which` includes `'BE'`.** In addition to `'LM'`/`'SM'`/`'LA'`/`'SA'`,
    `dsgets` accepts `'BE'` (both ends): it sorts ascending via `dsortr('LA')`
    then interchanges the low `kev/2` wanted values with the shift block using
    two `dswap`s (`min(kev/2,np)` elements starting at index `max(kev/2,np)`).
    The wrappers validate `which` against all five values with a TypeError.
-   `kev/2` is integer division → `kev >> 1` (kev non-negative).
-   When `ishift === 1 && np > 0`, the `np` smallest-magnitude bounds pick the
    shifts: `dsortr('SM', ..., np, bounds, ritz)` then `dcopy(np, ritz,
    shifts)`.

## Dependency interface surprises

-   Calls `dsortr` (the just-translated ARPACK sort), plus `dswap`/`dcopy`
    (BLAS, auto-linked). The Fortran fixture build must also link the debug
    printers `dvout`/`ivout` (referenced but not executed at `msglvl = 0`).
