// target: lib/lapack/base/dgeqrf/lib/ndarray.js
// expect: never asserts it is 1
function dgeqrf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	return base( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}
export default dgeqrf;
