/**
 * Reduces NB columns of a real general n-by-(n-k+1) matrix A.
 *
 * Elements below the k-th subdiagonal are zeroed out.
 *
 * Returns matrices V, T, and Y needed to apply the transformation to the
 * unreduced part of A.
 *
 *
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {NonNegativeInteger} K - offset for the reduction
 * @param {NonNegativeInteger} nb - number of columns to reduce
 * @param {Float64Array} A - input matrix A
 * @param {integer} strideA1 - first dimension stride of A
 * @param {integer} strideA2 - second dimension stride of A
 * @param {NonNegativeInteger} offsetA - starting index for A
 * @param {Float64Array} tau - output array for scalar factors
 * @param {integer} strideTAU - stride for tau
 * @param {NonNegativeInteger} offsetTAU - starting index for tau
 * @param {Float64Array} T - output upper triangular matrix T
 * @param {integer} strideT - first dimension stride of T
 * @param {NonNegativeInteger} offsetT - starting index for T
 * @param {integer} ldT - leading dimension (second dimension stride) of T
 * @param {Float64Array} Y - output matrix Y
 * @param {integer} strideY - first dimension stride of Y
 * @param {NonNegativeInteger} offsetY - starting index for Y
 * @param {integer} ldY - leading dimension (second dimension stride) of Y
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduce NB columns of a general matrix in Hessenberg form.
*
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} K - number of superdiagonals
* @param {integer} nb - nb
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} tau - input array
* @param {integer} strideTAU - stride length for `tau`
* @param {NonNegativeInteger} offsetTAU - starting index for `tau`
* @param {Float64Array} T - input array
* @param {integer} strideT - stride length for `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {integer} ldT - ldT
* @param {Float64Array} Y - input array
* @param {integer} strideY - stride length for `Y`
* @param {NonNegativeInteger} offsetY - starting index for `Y`
* @param {integer} ldY - ldY
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
*/
function dlahr2( N, K, nb, A, strideA1, strideA2, offsetA, tau, strideTAU, offsetTAU, T, strideT, offsetT, ldT, Y, strideY, offsetY, ldY ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( nb < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nb ) );
	}
	if ( N === 0 ) {
		return;
	}
	return base( N, K, nb, A, strideA1, strideA2, offsetA, tau, strideTAU, offsetTAU, T, strideT, offsetT, ldT, Y, strideY, offsetY, ldY );
}


// EXPORTS //

export default dlahr2;
