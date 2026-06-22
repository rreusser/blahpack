
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs reciprocal diagonal scaling on a complex matrix: `X = D^{-1} * X` where `D` is a real diagonal matrix stored as a vector.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} d - real diagonal scaling vector of length `M`
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Complex128Array} X - input/output complex matrix
* @param {integer} strideX1 - stride of the first dimension of `X` (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of `X` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
* @returns {Complex128Array} `X`
*/
function zlarscl2( M, N, d, strideD, offsetD, X, strideX1, strideX2, offsetX ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( M, N, d, strideD, offsetD, X, strideX1, strideX2, offsetX ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlarscl2;
