# dlaed2: Translation Learnings

## Translation pitfalls

- Complex GOTO restructuring: The Fortran has a DO loop (70) that breaks out to a while loop (80) with backward GOTOs. The pattern is: initial scan finds the first non-deflated eigenvalue, then a while loop processes the rest. Restructured as: `for` loop with `break` when first non-deflated found, then `while (j <= N)` for the rest.
- 1-based index arrays throughout: All index arrays (INDXQ, INDX, INDXC, INDXP) use 1-based values because `dlamrg` outputs 1-based indices and these arrays are passed between dlaed1/dlaed2/dlaed3 in the D&C chain. Array accesses use `(idx - 1) * stride` pattern consistently.
- K and RHO are output parameters: K (non-deflated count) and RHO (modified rho) are Fortran output parameters. In JS, they are returned as part of an object `{ info, K, rho }`. The generated signature included K as an input parameter but it is output-only, so it was removed from the function parameters.
- COLTYP dual use: COLTYP is first used as a per-column label (1=upper, 2=dense, 3=lower, 4=deflated) indexed by 1-based column numbers, then overwritten on exit with the 4 type counts in positions 0-3. The caller must allocate at least max(N, 4) elements.
- idamax returns 0-based in JS: The Fortran IDAMAX returns 1-based, but our JS idamax returns 0-based. No adjustment needed for the tolerance calculation since we use the 0-based index directly with `offsetZ + imax * strideZ`.

## Dependency interface surprises

- dlamrg outputs 1-based indices: This is critical and documented in its JSDoc. The entire D&C chain uses 1-based index conventions internally.
- dlacpy uplo parameter uses long-form string: `'full'` not `'A'`.

## Automation opportunities

- N/A -- the init_routine.py scaffold worked well. The signature generator correctly identified the consumed parameters (INFO, LDQ).

## Coverage gaps

- The insertion sort path within the close-eigenvalue deflation (lines 270-279) requires the deflated eigenvalue to be smaller than existing deflated entries for the "shift down" branch to execute.
- The "all deflated in initial scan" branch (K=0 via the initial for-loop) requires all z components to be tiny BUT not so tiny that the global `rho*abs(z[imax]) <= tol` early return fires first. This is a narrow window.
- Coverage: 94.21% line, 93.48% branch -- above thresholds.

## Complex number handling

- N/A: dlaed2 is a real-valued routine.
