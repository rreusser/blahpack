
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute the reciprocal pivot growth factor norm(A)/norm(U) for a general banded matrix.
*
* @param {NonNegativeInteger} N - number of columns
* @param {integer} kl - kl
* @param {integer} ku - ku
* @param {integer} ncols - ncols
* @param {Float64Array} AB - input matrix
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} AFB - output matrix
* @param {integer} strideAFB1 - stride of the first dimension of `AFB`
* @param {integer} strideAFB2 - stride of the second dimension of `AFB`
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} result
*/
function dla_gbrpvgrw( N, kl, ku, ncols, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, kl, ku, ncols, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB ); // eslint-disable-line max-len
}


// EXPORTS //

export default dla_gbrpvgrw;
