// target: lib/lapack/dgeqrf/lib/base.js
// expect: never reads `WORK.length`
const NB = 32;
function dgeqrf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let i;
	for ( i = 0; i < N * NB; i++ ) {
		WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
	}
	return 0;
}
export default dgeqrf;
