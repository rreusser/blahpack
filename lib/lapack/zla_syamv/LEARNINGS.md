# zla_syamv: Translation Learnings

## Translation pitfalls

The Fortran reference has a bug in the non-unit-INCX path: the symbolic zero
check uses `X(J)` (unit stride indexing) while the computation uses `X(JX)`
(strided indexing). Our JS implementation uses `x[jx]` consistently for both,
matching the dla_syamv pattern.

The Fortran test for stride-2 access of 3 elements requires array size >= 5
(indices 1, 3, 5 in Fortran 1-based). The initial x(4) declaration was too
small; needed a separate xbig(6) array.

## Complex number handling

A and X are Complex128Array; Y, alpha, and beta are all real. The routine
computes with absolute values only (CABS1), so no complex arithmetic is
needed. CABS1(z) = |Re(z)| + |Im(z)| is the 1-norm, NOT the true modulus.

Defined a local `cabs1At(v, idx)` helper since the pattern repeats heavily
in inner loops for both A entries and X entries.

Symmetric matrix means NO conjugation on mirror reads (unlike Hermitian).
The same element value is used whether reading A(i,j) or A(j,i).

Complex strides require the *2 conversion: `sa1 = strideA1 * 2`,
`sx = strideX * 2`, and offsets similarly `offsetA * 2`, `offsetX * 2`.
Y strides remain in Float64 units since Y is real.
