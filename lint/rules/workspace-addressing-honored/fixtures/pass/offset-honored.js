// target: lib/lapack/dsytrd/lib/base.js
function dsytrd( N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) {
	dlatrd( N, A, strideA1, strideA2, offsetA, WORK, strideWork, N * strideWork, offsetWork );
	dsyr2k( N, 0.0, A, strideA1, strideA2, offsetA, WORK, strideWork, N * strideWork, offsetWork + ( 32 * strideWork ) );
	return 0;
}
export default dsytrd;
