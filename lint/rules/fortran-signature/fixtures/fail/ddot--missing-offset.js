// expect: strideNoOffset
// FAIL — `x` has a stride but no matching `offsetX`. Every strided array needs
// both stride<Array> and offset<Array>.
function ddot( N, x, strideX, y, strideY, offsetY ) {
	return N + x[ 0 ] + y[ offsetY ] + strideX + strideY;
}
export default ddot;
