
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes row and column scalings intended to equilibrate an M-by-N complex band matrix A and reduce its condition number.
*
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} kl - number of subdiagonals within the band
* @param {NonNegativeInteger} ku - number of superdiagonals within the band
* @param {Complex128Array} AB - band matrix in LAPACK band storage
* @param {integer} strideAB1 - stride of the first dimension of AB (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of AB (in complex elements)
* @param {NonNegativeInteger} offsetAB - index offset for AB (in complex elements)
* @param {Float64Array} r - output row scale factors, length M
* @param {integer} strideR - stride for r
* @param {NonNegativeInteger} offsetR - index offset for r
* @param {Float64Array} c - output column scale factors, length N
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - index offset for c
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} result with info, rowcnd, colcnd, amax
*/
function zgbequ( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, r, strideR, offsetR, c, strideC, offsetC ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, r, strideR, offsetR, c, strideC, offsetC ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgbequ;
