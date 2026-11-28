# dlamtsqr: differences from the reference

## [REFERENCE] WORK minimum for `side = 'right'`

The reference checks `LWORK >= max(1,LW)` with `LW = MB*NB` for `SIDE = 'R'`
(`dlamtsqr.f:239`), but the `DGEMQRT` and `DTPMQRT` calls it makes on that side
apply blocks to the `M`-row `C` and write `M*NB` elements of `WORK`. At
`LWORK = MB*NB` with `M > MB` the reference writes past its own check
(recorded in `data/fortran-lwmin.json`). `ndarray.js` demands `max(1, M*NB)` for
`side = 'right'` (the extent the callees address), as ZLAMTSQR already checks
(`LW = M*NB`); for `side = 'left'` it demands the reference's `max(1, N*NB)`.
