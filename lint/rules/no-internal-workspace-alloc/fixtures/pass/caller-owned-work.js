// target: lib/lapack/dgeqrf/lib/base.js
function dgeqrf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	const scalar = new Float64Array( 2 );
	const T = new Float64Array( N * N );
	return WORK[ offsetWork ] + scalar[ 0 ] + T[ 0 ];
}
export default dgeqrf;
