
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Swaps adjacent diagonal blocks T11 and T22 of order 1 or 2 in an upper.
* quasi-triangular matrix T by an orthogonal similarity transformation.
*
* T must be in Schur canonical form, i.e., block upper triangular with
* 1-by-1 and 2-by-2 diagonal blocks; each 2-by-2 diagonal block has its
* diagonal elements equal and its off-diagonal elements of opposite sign.
*
* Note: j1 is 1-based (Fortran convention).
*
* @param {boolean} wantq - if true, accumulate transformation into Q
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Float64Array} T - the upper quasi-triangular matrix
* @param {integer} strideT1 - stride of the first dimension of T
* @param {integer} strideT2 - stride of the second dimension of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} Q - orthogonal matrix (updated if wantq)
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {integer} j1 - position of first block (1-based)
* @param {integer} n1 - order of first block (1 or 2)
* @param {integer} n2 - order of second block (1 or 2)
* @param {Float64Array} WORK - workspace of length N
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {integer} info (0=success, 1=swap failed)
*/
function dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, j1, n1, n2, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !WORK || ( WORK.length - offsetWORK ) < N ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetWORK, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, j1, n1, n2, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaexc;
