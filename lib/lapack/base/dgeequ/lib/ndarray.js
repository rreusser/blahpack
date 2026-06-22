

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Computes row and column scalings intended to equilibrate an M-by-N matrix A
 * and reduce its condition number.
 *
 * R returns the row scale factors and C the column scale factors, chosen to
 * try to make the largest element in each row and column of the matrix B with
 * elements B(i,j)=R(i)*A(i,j)*C(j) have absolute value 1.
 *
 * Returns an object with:
 * - info: 0 if successful; i if the i-th row is zero (1-based); M+j if the
 *   (j)-th column (after row scaling) is zero (1-based).
 * - rowcnd: ratio of smallest to largest row scale factor
 * - colcnd: ratio of smallest to largest column scale factor
 * - amax: absolute value of largest matrix element
 *
 *
 * @param {NonNegativeInteger} M - number of rows of A
 * @param {NonNegativeInteger} N - number of columns of A
 * @param {Float64Array} A - input M-by-N matrix
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - index offset for A
 * @param {Float64Array} r - output row scale factors, length M
 * @param {integer} strideR - stride for r
 * @param {NonNegativeInteger} offsetR - index offset for r
 * @param {Float64Array} c - output column scale factors, length N
 * @param {integer} strideC - stride for c
 * @param {NonNegativeInteger} offsetC - index offset for c
 * @returns {Object} result with info, rowcnd, colcnd, amax
 */
function dgeequ( M, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( M, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgeequ;
