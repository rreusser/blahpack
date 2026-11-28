# dlaexc: Translation Learnings

## Translation pitfalls

- j1 is 1-based (Fortran convention). All derived indices (j2=j1+1, j3=j1+2, j4=j1+3) are 1-based.
- The computed GOTO `GO TO (10, 20, 30) K` uses K=N1+N1+N2-3 to select between 3 cases: (N1=1,N2=2), (N1=2,N2=1), (N1=2,N2=2).
- dlartg returns an output array [cs, sn, r], not an object. Must use `out[0]` for cs, `out[1]` for sn.
- The D array is a local 4x4 work matrix stored column-major with leading dim 4. Used for testing the swap before applying to T.
- The X array from dlasy2 is a local 2x2 work matrix stored column-major with leading dim 2.

## Dependency interface surprises

- dlartg: takes `(f, g, out)` where out is a Float64Array of length 3.
- dlasy2: takes scale/xnorm as Float64Array[1] output parameters.

## Automation opportunities

- N/A

## Coverage gaps

- Only the N1=1,N2=1 case is tested directly. The N1=2,N2=2 case (k=2) requires 2x2 complex eigenvalue blocks, which are harder to set up in test fixtures.

## Complex number handling

- N/A: real routine only.
