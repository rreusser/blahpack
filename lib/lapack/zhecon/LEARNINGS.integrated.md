# zhecon: Translation Learnings

## Translation pitfalls

- Nearly identical to dsycon except WORK is Complex128Array (not Float64Array) and the solver call is zhetrs instead of dsytrs.
- The singular diagonal check uses `Av[p1] === 0.0` (checking real part of diagonal), which is correct since Hermitian diagonals are real. The Fortran uses `A(I,I).EQ.ZERO` which compares the complex value to zero, but for Hermitian matrices the imaginary part is always zero.
- No IWORK parameter needed (unlike dsycon) because zlacn2 for complex case does not need an integer sign array. The Fortran reference passes ISAVE internally.

## Dependency interface surprises

- zlacn2 expects Complex128Array for V and X parameters, with strides/offsets in complex elements. The workspace carving is WORK[0..N-1] for X and WORK[N..2N-1] for V.
- zhetrs is called with WORK as the B parameter (N-by-1 matrix): strideB1=sw, strideB2=N*sw, offsetB=offsetWORK. This is the same pattern as dsycon calling dsytrs.

## Automation opportunities

- The conversion from dsycon to zhecon is mechanical: change Float64Array to Complex128Array, dsytrs to zhetrs, dlacn2 to zlacn2, and adjust the diagonal check to use reinterpreted Float64 view. Could be a transform rule.

## Coverage gaps

- The singular diagonal branch (returning rcond=0 when a 1x1 pivot has zero diagonal) is not directly tested because creating such a matrix that passes through zhetrf is difficult. 97.35% line / 89.47% branch achieved.

## Complex number handling

- No complex arithmetic in zhecon itself; all complex operations are delegated to zhetrs and zlacn2.
- The diagonal singularity check reads `Av[p1]` (real part of complex diagonal) via reinterpret.
