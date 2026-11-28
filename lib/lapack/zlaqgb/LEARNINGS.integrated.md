# zlaqgb: Translation Learnings

## Translation pitfalls

- Band storage indexing: Fortran `AB(KU+1+I-J, J)` maps to `offsetAB + ((ku+i-j)*strideAB1) + (j*strideAB2)` in JS. With 0-based indexing, Fortran's `KU+1+I-J` becomes `ku+i-j`.
- Loop bounds: Fortran `MAX(1, J-KU)` to `MIN(M, J+KL)` become `max(0, j-ku)` to `min(M-1, j+kl)` in 0-based JS, implemented as `imax = min(M, j+kl+1)` with exclusive upper bound.
- EQUED output: Fortran returns single chars ('N','R','C','B'), JS returns full words ('none','row','column','both') per stdlib convention.

## Dependency interface surprises

- No JS dependencies beyond dlamch (used for SMALL/LARGE threshold computation at module load time).
- EQUED is an output parameter in Fortran but returned as a string in JS (same pattern as dlaqgb, zlaqge).

## Automation opportunities

- Complex band matrix equilibration is a direct mirror of dlaqgb with the addition of reinterpret and doubling strides for the Float64 view. The same template could generate both real and complex variants.

## Coverage gaps

- All four EQUED branches covered (none, row, column, both).
- Edge cases (M=0, N=0) covered.
- Extreme amax value triggers the row scaling path (via small_amax test).
- Non-square matrix (3x5) tested.

## Complex number handling

- Real-scalar times complex: `cj * Av[ia]` and `cj * Av[ia+1]` - safe to inline (just real multiplication of each component).
- No complex-complex operations needed - all scaling factors (R, C) are real Float64Array.
- Uses reinterpret(Complex128Array) to get Float64 view, with strides doubled accordingly.
