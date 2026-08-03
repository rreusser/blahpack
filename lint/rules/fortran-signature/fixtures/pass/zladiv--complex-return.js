// PASS — COMPLEX-valued function return becomes an added output parameter.
// Fortran: COMPLEX*16 FUNCTION ZLADIV( X, Y )
// X and Y are complex inputs (arr,offset each). The complex result cannot be a
// single JS number, so it is returned through an added `out,offsetOut` pair
// that has no Fortran dummy-argument counterpart.
function zladiv( x, offsetX, y, offsetY, out, offsetOut ) {
	out[ offsetOut ] = x[ offsetX ] + y[ offsetY ];
}
export default zladiv;
