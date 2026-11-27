# dgerq2: Translation Learnings

## Translation pitfalls

- Mirror of dgelq2 but iterates BACKWARD (i = K-1 down to 0) instead of forward
- Reflector row is at M-K+i (0-based), unlike dgelq2 which uses row i directly
- dlarfg alpha is at position A(row, N-K+i), and the vector runs from col 0 to col N-K+i-1 with stride strideA2
- dlarf applies from the right to rows ABOVE the current row (0 to row-1), not below

## Dependency interface surprises

- N/A, same deps as dgelq2 (dlarfg, dlarf)

## Missing automation

- N/A

## Coverage gaps

- Quick return paths (M=0, N=0) produce trivially correct output (info=0) with no array mutation
- 1x1 case is degenerate (tau=0, no reflector application)

## Complex number handling

- N/A (real routine)
