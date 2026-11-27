# dorgtsqr_row: differences from the reference

## [REFERENCE] WORK minimum

The reference documents `LWORK >= NBLOCAL*MAX(NBLOCAL,N-NBLOCAL)` with
`NBLOCAL = MIN(NB,N)`, but checks only `LWORK >= 1`. Its DLARFB_GETT calls use
`WORK` as an `NBLOCAL`-by-`max(NBLOCAL, N-NBLOCAL)` array whatever `LWORK` is,
so below the documented size the reference writes past `WORK(LWORK)`
(recorded in `data/fortran-lwmin.json`). `ndarray.js` demands the documented
size, `NBLOCAL*max(NBLOCAL, N-NBLOCAL)` (at least 1), rather than the 1 the
reference's check accepts.
