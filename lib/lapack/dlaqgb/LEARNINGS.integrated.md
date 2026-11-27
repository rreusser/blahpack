# dlaqgb: Translation Learnings

## Translation pitfalls

- Band storage indexing: Fortran `AB(KU+1+I-J, J)` maps to `offsetAB + ((ku+i-j)*strideAB1) + (j*strideAB2)` in JS. The key insight is that `i` and `j` are 0-based in JS, and the KU+1 offset in Fortran becomes just `ku` in 0-based indexing (Fortran's `KU+1+I-J` with 1-based I,J becomes `ku+(i)-(j)` with 0-based i,j).
- Loop bounds: Fortran `MAX(1, J-KU)` to `MIN(M, J+KL)` become `max(0, j-ku)` to `min(M-1, j+kl)` in 0-based JS.
- EQUED output: Fortran returns single chars ('N','R','C','B'), JS returns full words ('none','row','column','both') per stdlib convention, matching dlaqge.

## Dependency interface surprises

- No JS dependencies beyond dlamch (used for SMALL/LARGE threshold computation at module load time).
- EQUED is an output parameter in Fortran but is returned as a string in JS (same as dlaqge).

## Automation opportunities

- Band matrix equilibration routines (dlaqgb, dlaqsb) share the same threshold logic and EQUED return convention. Could template the outer structure.

## Coverage gaps

- All four EQUED branches covered (none, row, column, both).
- Edge cases (M=0, N=0) covered.
- Extreme amax values (very large, very small) trigger row scaling branch.

## Complex number handling

- N/A: dlaqgb is a real-valued routine.
