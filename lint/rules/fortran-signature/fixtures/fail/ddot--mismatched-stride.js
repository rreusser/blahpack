// expect: strideNoArray
// FAIL — `strideZ` refers to an array `z`/`Z` that does not exist. The stride
// for `y` must be `strideY`. Classic copy-paste stride mismatch.
function ddot( N, x, strideX, offsetX, y, strideZ, offsetY ) {
	return N + x[ offsetX ] + y[ offsetY ] + strideX + strideZ;
}
export default ddot;
