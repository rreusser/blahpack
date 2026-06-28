
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Equilibrates a general M-by-N matrix A using the row and column scaling.
* factors in the vectors R and C.
*
* Returns 'N' (no equilibration), 'R' (row only), 'C' (column only),
* or 'B' (both row and column).
*
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} A - input/output M-by-N matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} r - row scale factors, length M
* @param {integer} strideR - stride for r
* @param {NonNegativeInteger} offsetR - index offset for r
* @param {Float64Array} c - column scale factors, length N
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - index offset for c
* @param {number} rowcnd - ratio of smallest to largest R(i)
* @param {number} colcnd - ratio of smallest to largest C(i)
* @param {number} amax - absolute value of largest matrix entry
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {string} equed - equilibration type: 'N', 'R', 'C', or 'B'
*/
function dlaqge( M, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax, equed ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( M, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax, equed ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqge;
