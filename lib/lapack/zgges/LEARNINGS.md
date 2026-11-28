# zgges: Translation Learnings

## Translation pitfalls

- zgges simplifies the Fortran signature substantially: sdim, WORK, LWORK, RWORK, BWORK are all managed internally in base.js. The public API only takes the essential inputs/outputs.
- The Fortran SELCTG callback receives COMPLEX*16 alpha and beta. In JS, we decompose these into `(alphaRe, alphaIm, betaRe, betaIm)` using the Float64 reinterpreted view.
- All z-prefix deps use 1-based ilo/ihi, unlike d-prefix dhgeqz which uses 0-based. This is a critical difference from the dgges reference — do NOT subtract 1 when passing ilo/ihi to zhgeqz.

## Dependency interface surprises

- zlaset takes Complex128 objects (CZERO, CONE), not plain numbers.
- zlascl for type 'general' with a 1D array (ALPHA/BETA vectors) needs stride2=1.
- The finalize function must call zlascl on the Complex128Array ALPHA/BETA (not Float64 views) because zlascl expects Complex128Array with complex-element strides.

## Complex number handling

- All strides/offsets at the API boundary are in complex elements. The `*2` conversion happens inside base.js only for direct Float64Array access via `reinterpret()`.
- zlaset needs CZERO/CONE as Complex128 objects, requiring `@stdlib/complex/float64/ctor`.
- SELCTG decomposition: access ALPHAv/BETAv (Float64 views) at `oAL + i*sAL` for real, `+1` for imag.

## Fortran test notes

- Deps file needs many transitive deps: zlacn2->dzsum1/izmax1, ztgsy2->zgetc2/zgesc2/zlatdf->zgecon/zdrscl/zlatrs/zlatbs. Recursive resolver would help.
- Complex arrays packed with EQUIVALENCE-like pattern: nested loops extracting DBLE/DIMAG into double precision arrays for printing.
