# dspgst: Translation Learnings

## Translation pitfalls

- Packed storage index tracking requires careful 1-to-0-based conversion.
  The Fortran code uses 1-based indices JJ, KK, J1, K1, etc. into the packed
  array. In JS, these become 0-based, so Fortran `AP(JJ)` maps to
  `AP[oap + (jj-1)*sap]` for the upper/itype=1 branch where JJ accumulates
  via `JJ = JJ + J` (1-based), and `AP[oap + jj*sap]` for the lower/itype=1
  branch where KK starts at 1 in Fortran (0 in JS).
- The upper/itype=1 branch uses DTPSV then DSPMV then DSCAL then DDOT on the
  same column, which is a different pattern from dsygs2 (which uses DTRSV,
  DSYMV). The packed versions take stride/offset for the packed matrix itself
  rather than two strides for rows/columns.

## Dependency interface surprises

- dspmv takes `(uplo, N, alpha, AP, sAP, oAP, x, sx, ox, beta, y, sy, oy)` --
  13 parameters. The packed matrix AP comes before x and y.
- dspr2 takes `(uplo, N, alpha, x, sx, ox, y, sy, oy, AP, sAP, oAP)` --
  12 parameters. The packed matrix AP comes AFTER x and y. This is the opposite
  ordering from dspmv.
- dtpmv and dtpsv both take `(uplo, trans, diag, N, AP, sAP, oAP, x, sx, ox)`.

## Automation opportunities

- None identified; the packed-storage pattern is routine-specific enough that
  automation would not generalize easily.

## Coverage gaps

- 100% line, branch, and function coverage achieved.
- All six itype/uplo combinations tested at both 3x3 and 4x4 sizes.
- Edge cases N=0 and N=1 covered for all itypes.

## Complex number handling

- N/A: dspgst is a real-valued routine.
