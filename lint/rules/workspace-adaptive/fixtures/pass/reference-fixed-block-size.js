// target: lib/lapack/dsytri2/lib/base.js
// DSYTRI2 rejects an LWORK below its minimum; it never adapts to it.
const NBMAX = 32;
function dsytri2( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
	let i;
	for ( i = 0; i < ( N + NBMAX + 1 ) * ( NBMAX + 3 ); i++ ) {
		WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
	}
	return 0;
}
export default dsytri2;
