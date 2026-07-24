// PASS — plain 1D BLAS vectors.
// Fortran: DOUBLE PRECISION FUNCTION DDOT(N,DX,INCX,DY,INCY)
// Each 1D array expands to arr,stride,offset; INCX/INCY are consumed; the
// real function return adds no parameter.
function ddot( N, x, strideX, offsetX, y, strideY, offsetY ) {
	return N + x[ offsetX ] + y[ offsetY ] + strideX + strideY;
}
export default ddot;
