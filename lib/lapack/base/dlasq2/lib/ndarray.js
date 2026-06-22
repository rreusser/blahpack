/**
 * Computes all the eigenvalues of the symmetric positive definite tridiagonal.
 * matrix associated with the qd array Z to high relative accuracy.
 *
 *
 * @param {NonNegativeInteger} N - number of rows and columns
 * @param {Float64Array} z - qd array of dimension 4*N
 * @param {integer} stride - stride length for `z`
 * @param {NonNegativeInteger} offset - starting index for `z`
 * @returns {integer} info - status code (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all the eigenvalues of the symmetric positive definite tridiagonal.
*
* @param {NonNegativeInteger} N - number of rows and columns
* @param {Float64Array} z - qd array of dimension 4*N
* @param {integer} stride - stride length for `z`
* @param {NonNegativeInteger} offset - starting index for `z`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} info - status code (0 = success)
*/
function dlasq2( N, z, stride, offset ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( N, z, stride, offset );
}


// EXPORTS //

export default dlasq2;
