# dlapmt: Translation Learnings

## Translation pitfalls

- **Critical: forward permutation cycle tracking.** The Fortran forward path uses a moving cursor `J` that advances along the cycle: `swap X(:,J) and X(:,IN)`, then `J = IN`. An initial incorrect implementation always swapped with column `I` (the cycle start), which produces wrong results. The key insight: swaps happen between the *current* cursor and the *next* element in the chain, not between the start and next.
- **0-based K indexing.** Fortran K is 1-based; JS base.js uses 0-based. The negate-and-restore marker trick needs adjustment: since `-0 === 0` in JavaScript, we use `-(k+1)` for negation and `-(k+1) => original` for restoration, unlike Fortran which simply negates.
- **K is mutated then restored.** The algorithm negates K entries as "visited" markers during processing. Both forward and backward paths restore K to its original values by the end. Tests verify this.

## Dependency interface surprises

- N/A: dlapmt has no LAPACK/BLAS dependencies.

## Automation opportunities

- N/A: straightforward utility routine with no mechanical transforms needed.

## Coverage gaps

- 100% line, branch, and function coverage achieved.
- Tests cover: forward and backward permutations, identity permutation, reverse permutation, cyclic permutation, N=0 and N=1 quick returns, non-unit strides, non-zero offsets, and K restoration verification.

## Complex number handling

- N/A: dlapmt is a real-valued routine.
