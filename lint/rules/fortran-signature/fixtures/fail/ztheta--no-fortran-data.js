// expect: noData
// FAIL — no reference Fortran arguments are ingested for `ztheta` (it is not a
// real routine). The rule reports a loud coverage gap rather than silently
// passing; the fix is to add its Fortran signature, never to exempt it.
function ztheta( N, x, strideX, offsetX ) {
	return N + x[ offsetX ] + strideX;
}
export default ztheta;
