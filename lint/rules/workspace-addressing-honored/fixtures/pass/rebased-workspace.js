// target: lib/lapack/zgelss/lib/base.js
function zgelss( N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) {
	const itau = 0;
	WORK = WORK.subarray( offsetWork );
	zgemm( 'no-transpose', N, A, strideA1, strideA2, offsetA, 0.0, WORK, 1, N, 0 );
	return WORK[ itau ];
}
export default zgelss;
