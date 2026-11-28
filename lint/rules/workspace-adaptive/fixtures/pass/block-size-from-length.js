// target: lib/lapack/dgeqrf/lib/base.js
const NB = 32;
function dgeqrf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );
	let nb = NB;
	if ( lwork < N * nb ) {
		nb = Math.floor( lwork / N );
	}
	return nb;
}
export default dgeqrf;
