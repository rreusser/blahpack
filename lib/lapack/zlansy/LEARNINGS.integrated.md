# zlansy: Translation Learnings

## Translation pitfalls
- Uses sqrt(re^2+im^2) for complex absolute value (Fortran's ABS on complex).
- For one-norm/inf-norm: symmetric matrix has equal norms, so same code handles both.
- WORK array only needed for '1'/'O'/'I' norms (accumulates column/row sums).
- Frobenius norm uses zlassq which returns [scale, sum] array.
- Diagonal stride for zlassq: strideA1+strideA2 (complex elements).
- Off-diagonal sum doubled (symmetric: each off-diagonal appears twice).

## Dependency interface surprises
- zlassq returns a 2-element array [scale, sum], not an object.

## Missing automation
- N/A.

## Coverage gaps
- All four norm types tested for upper. Lower tested for one-norm and Frobenius. Max and inf for lower tested indirectly.

## Complex number handling
- Complex abs computed inline as sqrt(re*re + im*im).
