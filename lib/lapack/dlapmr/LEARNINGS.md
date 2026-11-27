# dlapmr: Translation Learnings

## Translation pitfalls

- dlapmr is the row-permutation analog of dlapmt (column permutation). The key
  structural difference: the inner swap loop iterates over columns (jj = 0..N-1)
  and accesses rows via strideX1, whereas dlapmt iterates over rows and accesses
  columns via strideX2.
- The 0-based K encoding uses -(k+1) rather than simple negation, since -0 === 0
  in JavaScript (same pattern as dlapmt). This is a well-known pitfall.
- Fortran fixture output includes MMAX padding rows in each column block. The test
  must use extractMatrix with MMAX as the leading dimension to skip padding.

## Dependency interface surprises

- N/A: dlapmr has no dependencies.

## Automation opportunities

- dlapmr and dlapmt share identical cycle-following logic with only the swap axis
  differing. A template or code generator could produce both from a single source.

## Coverage gaps

- 100% line, branch, and function coverage achieved. No gaps.

## Complex number handling

- N/A: dlapmr is a real-valued routine.
