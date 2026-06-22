

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a complex general banded matrix.
*
* @param {NonNegativeInteger} N - number of linear equations (order of the matrix)
* @param {NonNegativeInteger} kl - number of subdiagonals within the band of A
* @param {NonNegativeInteger} ku - number of superdiagonals within the band of A
* @param {NonNegativeInteger} ncols - number of columns to process
* @param {Complex128Array} AB - original band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Complex128Array} AFB - LU factored band matrix from zgbtrf
* @param {integer} strideAFB1 - stride of the first dimension of `AFB`
* @param {integer} strideAFB2 - stride of the second dimension of `AFB`
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB`
* @returns {number} reciprocal pivot growth factor
*/
function zla_gbrpvgrw( N, kl, ku, ncols, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, kl, ku, ncols, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB ); // eslint-disable-line max-len
}


// EXPORTS //

export default zla_gbrpvgrw;
