# zpotrf: Translation Learnings

## Translation pitfalls

- The blocked algorithm calls zgemm with Complex128 scalars (CONE and MCONE = -1+0i), unlike zherk which takes real scalars. This means two different scalar types are needed: `new Complex128(1.0, 0.0)` for zgemm/ztrsm and plain `1.0` / `-1.0` for zherk.
- The GOTO pattern in Fortran (label 30 for error, label 40 for normal exit) translates cleanly to early returns: `return info + j` replaces the `GO TO 30; ... INFO = INFO + J - 1` pattern.
- The Fortran uses ILAENV to determine the block size; the JS version hardcodes NB=64 (same as dpotrf).

## Dependency interface surprises

- zgemm takes Complex128 scalars for both alpha and beta, while zherk takes real numbers for both. ztrsm takes Complex128 for alpha. This means zpotrf must maintain two forms of "one" and "minus-one": `CONE` as Complex128 and `1.0`/`-1.0` as plain numbers.
- The submatrix offset calculations are identical to dpotrf, just with complex element counts rather than float counts. The stride/offset conversion (x2 for Float64) happens inside each callee, not in zpotrf.

## Automation opportunities

- The translation from dpotrf to zpotrf is very mechanical: replace dpotrf2->zpotrf2, dsyrk->zherk, dgemm->zgemm, dtrsm->ztrsm, change scalar types from real to Complex128 where needed, and change 'T' to 'C' for conjugate transpose. This pattern would apply to any blocked real->complex LAPACK routine.

## Coverage gaps

- 100% line, 100% branch on zpotrf/lib/base.js. The blocked path is exercised by the N=80 tests. Error return from the blocked path is tested via the "large not-posdef" tests.

## Complex number handling

- zpotrf itself does no direct complex arithmetic -- it delegates entirely to zpotrf2, zherk, zgemm, and ztrsm. The only complex objects it creates are the constant scalars CONE and MCONE at module scope.
- Module-level constant allocation (CONE, MCONE) avoids per-call Complex128 construction.
