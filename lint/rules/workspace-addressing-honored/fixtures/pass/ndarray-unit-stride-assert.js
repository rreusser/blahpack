// target: lib/lapack/dgeqrf/lib/ndarray.js
function helper( WORK, strideWork ) {
	return WORK[ strideWork ];
}
function dgeqrf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	if ( strideWork !== 1 ) {
		throw new RangeError( 'invalid argument' );
	}
	return base( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) + helper( WORK, 1 );
}
export default dgeqrf;
