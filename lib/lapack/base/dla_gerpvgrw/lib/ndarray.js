
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute the reciprocal pivot growth factor norm(A)/norm(U).
*
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ncols - ncols
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} AF - output matrix
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} result
*/
function dla_gerpvgrw( N, ncols, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, ncols, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF ); // eslint-disable-line max-len
}


// EXPORTS //

export default dla_gerpvgrw;
