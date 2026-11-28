# dsbgst: Translation Learnings

## Translation pitfalls

- The GOTO-based control flow uses two main phases with a shared update/non-update pattern. Phase 1 sweeps from i=N downward, phase 2 from i=1 upward. Each phase has upper and lower branches.
- Fortran WORK array is 1-indexed and stores both cosine (WORK(N+j)) and sine (WORK(j)) components in the same array. In JS we use a single 2*N array with careful offset arithmetic.
- The dger call for the lower triangle uses a non-unit stride (LDBB-1 in Fortran, strideBB2-strideBB1 in JS) for the y vector argument, which steps diagonally through the band storage of BB.

## Dependency interface surprises

- dlartg returns [c, s, r] via a 3-element output array, not separate scalar outputs.
- dlar2v, dlargv, dlartv all use strided access patterns with the "inca" stride (LDAB*KA1 in Fortran), which translates to sA2*ka1 as the stride for jumping ka1 columns in band storage.

## Automation opportunities

- The upper/lower and phase1/phase2 branches share nearly identical structure. A code generator could produce both from a single template.

## Coverage gaps

- All major paths tested: upper/lower, none/update, ka=0, ka=kb, ka>kb, larger matrices.
- Phase 2 paths covered by the larger N=8 tests where M < N.

## Complex number handling

- N/A: dsbgst is a real-valued routine. No conjugation or imaginary-part handling needed compared to zhbgst.
