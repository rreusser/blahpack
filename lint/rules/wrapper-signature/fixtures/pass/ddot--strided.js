// PASS — the strided BLAS form: strides but no offsets (computed internally).
function ddot( N, x, strideX, y, strideY ) {
	return N + x[ 0 ] + y[ 0 ] + strideX + strideY;
}
export default ddot;
