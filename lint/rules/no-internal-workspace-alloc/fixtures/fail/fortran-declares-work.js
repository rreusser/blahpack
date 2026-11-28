// target: lib/lapack/dgeqrf/lib/base.js
// expect: must not allocate a problem-sized workspace array
function dgeqrf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU ) {
	const work = new Float64Array( N );
	return work;
}
export default dgeqrf;
