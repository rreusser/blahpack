# dgebrd: Translation Learnings

## Translation pitfalls

- Direct translation from zgebrd pattern. The real version is simpler since
  there's no complex reinterpretation (no `reinterpret()`, no `*2` stride
  adjustments).
- The ILAENV calls and LWORK workspace query logic from Fortran are removed;
  NB is hardcoded to 32. Workspace is allocated internally if WORK is null or
  too small.
- The Fortran loop `DO 30 I = 1, MINMN - NX, NB` translates to a 0-based
  `while (i < minmn - nx)` with `i += nb` at the end.

## Dependency interface surprises

- dlabrd takes X and Y as separate 2D arrays with (stride1, stride2, offset),
  but in dgebrd they share the WORK buffer. X occupies `WORK[0..ldwrkx*nb-1]`,
  Y occupies `WORK[ldwrkx*nb..]`. Both use stride1=1, stride2=ldwrkx (or ldwrky).
- dgemm for the trailing update uses 'T' (transpose) for real instead of 'C'
  (conjugate transpose) used in zgebrd. Critical difference between real and
  complex versions.
- dgebd2 and dlabrd accept WORK with standard (array, stride, offset) pattern,
  not the 2D (stride1, stride2, offset) used for X/Y in dlabrd.

## Automation opportunities

- The real-to-complex pattern (dgebrd vs zgebrd) is highly mechanical: remove
  `reinterpret()`, remove `*2` stride/offset multipliers, change 'C' to 'T' in
  dgemm trans argument, use Float64Array instead of Complex128Array, remove
  imaginary-part zeroing in the diagonal copy loop. Could be automated for
  future d/z pairs.

## Coverage gaps

- All branches are covered (100% line and branch coverage). The limited-workspace
  paths (nb reduced, nb=1 fallback) were exercised with targeted tests using
  small lwork values.

## Complex number handling

- N/A (real routine, no complex arithmetic)
