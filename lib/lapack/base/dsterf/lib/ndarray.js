/**
 * Computes all eigenvalues of a real symmetric tridiagonal matrix using the.
 * Pal-Walker-Kahan variant of the QL or QR algorithm.
 *
 * On exit, the diagonal array `d` contains the eigenvalues in ascending order,
 * and the off-diagonal array `e` is destroyed.
 *
 *
 * @param {NonNegativeInteger} N - order of the matrix
 * @param {Float64Array} d - diagonal elements (length N); on exit, eigenvalues in ascending order
 * @param {integer} strideD - stride length for `d`
 * @param {NonNegativeInteger} offsetD - starting index for `d`
 * @param {Float64Array} e - off-diagonal elements (length N-1); destroyed on exit
 * @param {integer} strideE - stride length for `e`
 * @param {NonNegativeInteger} offsetE - starting index for `e`
 * @returns {integer} info - 0 on success, >0 if failed to converge (number of unconverged elements)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues of a real symmetric tridiagonal matrix using the.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements (length N); on exit, eigenvalues in ascending order
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - off-diagonal elements (length N-1); destroyed on exit
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} info - 0 on success, >0 if failed to converge (number of unconverged elements)
*/
function dsterf( N, d, strideD, offsetD, e, strideE, offsetE ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( N, d, strideD, offsetD, e, strideE, offsetE );
}


// EXPORTS //

export default dsterf;
