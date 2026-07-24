// PASS — complex vector kept as a reinterpreted typed array.
// Fortran: SUBROUTINE ZAXPY(N,ZA,ZX,INCX,ZY,INCY)
// The complex vectors keep their Fortran names (`zx`, `zy`) while stride/offset
// use the precision-prefix-stripped logical names (`strideX`, `offsetX`).
function zaxpy( N, za, zx, strideX, offsetX, zy, strideY, offsetY ) {
	return N + za + zx[ offsetX ] + zy[ offsetY ] + strideX + strideY;
}
export default zaxpy;
