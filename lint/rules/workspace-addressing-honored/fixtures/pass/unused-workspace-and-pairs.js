// target: lib/lapack/zgbbrd/lib/base.js
function zgbbrd( N, AB, offsetAB, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, ZWORK, strideZWork, offsetZWork ) {
	const ra = new Float64Array( 2 );

	// (array, offset) pair convention followed by an unrelated literal 0:
	zlartg( AB, offsetAB, RWORK, offsetRWork, WORK, offsetWork, ra, 0 );

	// The 0.0 beta scalar after a workspace is not an offset:
	dgemv( N, 1.0, AB, 1, offsetAB, WORK, strideWork, offsetWork, 0.0, RWORK, strideRWork, offsetRWork );

	// ZWORK is declared but never referenced (an unreferenced Fortran argument): not checked.
	return N;
}
export default zgbbrd;
