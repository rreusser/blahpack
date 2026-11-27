// target: lib/lapack/dgeqrf/lib/base.js
function dgeqrf( M, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) {
	const lwork = WORK.length - offsetWork;
	return lwork;
}
export default dgeqrf;
