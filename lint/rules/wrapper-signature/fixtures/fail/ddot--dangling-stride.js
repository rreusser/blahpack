// expect: strideNoArray
// FAIL — `strideZ` names an array `z` that is not a parameter. In the strided
// form there is no offset requirement, but a stride must still name a real array.
function ddot( N, x, strideX, y, strideZ ) {
	return N + x[ 0 ] + y[ 0 ] + strideX + strideZ;
}
export default ddot;
