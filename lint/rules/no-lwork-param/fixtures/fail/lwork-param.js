// target: lib/lapack/base/dgeqrf/lib/base.js
// expect: Remove the vestigial `lwork` parameter
function dgeqrf( M, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork, lwork ) {
	return lwork;
}
export default dgeqrf;
