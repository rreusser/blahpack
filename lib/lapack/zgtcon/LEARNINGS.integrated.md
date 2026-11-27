# zgtcon: Translation Learnings

## Translation pitfalls

- zlacn2 works with Complex128Array using complex-element strides/offsets. The WORK array is passed with V at offset N (complex elements) and X at offset 0.
- zgttrs is called with B strides in Float64 units: strideB1 = sw*2 (two doubles per complex element per row), strideB2 = N*sw*2 (column stride), offsetB = offsetWORK*2. This mismatch between complex-element addressing (for zlacn2) and Float64 addressing (for zgttrs B parameter) is the trickiest part.
- The Fortran uses DCMPLX(ZERO) to check if a complex diagonal is zero. In JS, we check both real and imaginary parts.

## Dependency interface surprises

- zlacn2 uses complex-element strides for V and X parameters.
- zgttrs uses 'conjugate-transpose' (not 'transpose') for the KASE != kase1 branch, matching Fortran's A^H.

## Missing automation

- N/A

## Coverage gaps

- The diagonal-zero early return is not explicitly tested.

## Complex number handling

- No direct complex arithmetic in this routine; all delegated to zlacn2 and zgttrs.
