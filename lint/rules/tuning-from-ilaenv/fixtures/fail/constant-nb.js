// target: lib/lapack/dgeqrf/lib/base.js
// expect: is the reference's NB = ILAENV( 1, 'DGEQRF'
import ilaenv from '../../ilaenv/lib/base.js';
const DEFAULT_NB = 32;
function dgeqrf( M, N ) {
	const nx = Math.max( 0, ilaenv( 3, 'DGEQRF', ' ', M, N, -1, -1 ) );
	return DEFAULT_NB + nx;
}
export default dgeqrf;
