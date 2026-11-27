// target: lib/lapack/dgeqrf/lib/base.js
import ilaenv from '../../ilaenv/lib/base.js';
function dgeqrf( M, N ) {
	const nb = ilaenv( 1, 'DGEQRF', ' ', M, N, -1, -1 );
	let nbmin = 2;
	if ( nb > 1 ) {
		nbmin = Math.max( 2, ilaenv( 2, 'DGEQRF', ' ', M, N, -1, -1 ) );
	}
	return nb + nbmin;
}
export default dgeqrf;
