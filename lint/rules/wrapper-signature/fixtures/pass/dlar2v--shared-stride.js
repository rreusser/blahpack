// PASS — shared stride over parallel arrays. `strideXYZ` is the single stride
// for the parallel vectors x, y, z; `strideCS` is shared by c and s. The suffix
// decomposes into real array parameters.
function dlar2v( N, x, y, z, strideXYZ, c, s, strideCS ) {
	return N + x[ 0 ] + y[ 0 ] + z[ 0 ] + c[ 0 ] + s[ 0 ] + strideXYZ + strideCS;
}
export default dlar2v;
