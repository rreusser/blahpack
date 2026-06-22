/**
 * Performs a series of row interchanges on a complex double-precision matrix `A`.
 * using pivot indices stored in `IPIV`.
 *
 * When incx > 0, rows k1 through k2 are interchanged in forward order, reading
 * IPIV from offsetIPIV.
 *
 * When incx < 0, rows k1 down to k2 are interchanged in reverse order (k1 > k2),
 * reading IPIV from offsetIPIV + (k1-k2)*strideIPIV backwards.
 *
 *
 * @param {PositiveInteger} N - number of columns in `A`
 * @param {Complex128Array} A - input matrix
 * @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
 * @param {NonNegativeInteger} offsetA - index offset for `A` (in complex elements)
 * @param {NonNegativeInteger} k1 - index of first row to interchange (0-based)
 * @param {NonNegativeInteger} k2 - index of last row to interchange (0-based)
 * @param {Int32Array} IPIV - vector of pivot indices (0-based)
 * @param {integer} strideIPIV - `IPIV` stride length
 * @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
 * @param {integer} incx - direction in which to apply pivots (-1 to apply in reverse order; otherwise, apply in provided order)
 * @returns {Complex128Array} permuted matrix `A`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs a series of row interchanges on a complex double-precision matrix `A`.
*
* @param {PositiveInteger} N - number of columns in `A`
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for `A` (in complex elements)
* @param {NonNegativeInteger} k1 - index of first row to interchange (0-based)
* @param {NonNegativeInteger} k2 - index of last row to interchange (0-based)
* @param {Int32Array} IPIV - vector of pivot indices (0-based)
* @param {integer} strideIPIV - `IPIV` stride length
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {integer} incx - direction in which to apply pivots (-1 to apply in reverse order; otherwise, apply in provided order)
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Complex128Array} permuted matrix `A`
*/
function zlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, IPIV, strideIPIV, offsetIPIV, incx ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return A;
	}
	return base( N, A, strideA1, strideA2, offsetA, k1, k2, IPIV, strideIPIV, offsetIPIV, incx );
}


// EXPORTS //

export default zlaswp;
