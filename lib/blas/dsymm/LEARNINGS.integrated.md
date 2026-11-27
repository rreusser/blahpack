# dsymm: Translation Learnings

## Translation pitfalls

- The SIDE='R' branch in Fortran uses two separate K loops (k < j and k > j) to access off-diagonal elements of A. The upper/lower triangle selection happens inside each loop via conditional reads of A(K,J) vs A(J,K). This pattern is straightforward to translate but easy to get wrong if you confuse which index is the symmetric-mirrored one.
- For SIDE='L', the Fortran iterates i from M down to 1 in the lower case. This reverse iteration order is load-bearing since C(K,J) is updated in the inner loop for k > i.

## Dependency interface surprises

- N/A -- dsymm is a leaf-level BLAS-3 routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- N/A -- direct Fortran-to-JS translation was sufficient.

## Coverage gaps

- The alpha=0 + beta=0 path (zeroing C) is not separately tested but shares code with the alpha=0 + beta!=0 path. Combined coverage is 92.8% line / 90.9% branch.

## Complex number handling

- N/A -- real-only routine.
