# dpocon: Translation Learnings

## Translation pitfalls

- RCOND is an output parameter: must be passed as Float64Array[1].
- dpocon is structurally almost identical to dgecon, but the triangular solves
  differ: dgecon uses L (unit) + U (non-unit) from LU, while dpocon uses
  U^T + U (or L + L^T) from Cholesky. Both are always non-unit diagonal.
- WORK is partitioned as [x(N), v(N), cnorm(N)]. Only 3N workspace needed
  (vs 4N for dgecon which needs separate cnorm for lower and upper).
- The normin flag starts as 'N' and flips to 'Y' after the first dlatrs call
  within each iteration. Placement matters: it's set between the two dlatrs
  calls, not after both.

## Dependency interface surprises

- dlatrs takes CNORM at a workspace offset. For dpocon, both upper and lower
  Cholesky factors use the same CNORM workspace (WORK[2N..3N-1]) since we
  always solve with the same triangle type.
- dlansy (used in tests) handles the 'U'/'L' properly for symmetric matrices.

## Automation opportunities

- dgecon and dpocon share 80%+ structure. Could be factored into a shared
  helper with the triangular solve pattern as a callback.

## Coverage gaps

- Lines 122-129 (scale overflow bail-out): same as dgecon — requires dlatrs
  to return scale=0 or very tiny scale.
- Overall: 94.44% line / 93.33% branch.

## Complex number handling

- N/A — real-only routine.
