

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Equilibrates a complex general M-by-N matrix A using the row and column
 * scaling factors in the vectors R and C.
 *
 * Returns 'none' (no equilibration), 'row' (row only), 'column' (column only),
 * or 'both' (both row and column).
 *
 *
 * @param {NonNegativeInteger} M - number of rows of A
 * @param {NonNegativeInteger} N - number of columns of A
 * @param {Complex128Array} A - input/output M-by-N complex matrix
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
 * @param {Float64Array} r - row scale factors, length M
 * @param {integer} strideR - stride for r
 * @param {NonNegativeInteger} offsetR - index offset for r
 * @param {Float64Array} c - column scale factors, length N
 * @param {integer} strideC - stride for c
 * @param {NonNegativeInteger} offsetC - index offset for c
 * @param {number} rowcnd - ratio of smallest to largest R(i)
 * @param {number} colcnd - ratio of smallest to largest C(i)
 * @param {number} amax - absolute value of largest matrix entry
 * @returns {string} equed - equilibration type: 'none', 'row', 'column', or 'both'
 */
function zlaqge( M, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax, equed ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( M, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax, equed ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaqge;
