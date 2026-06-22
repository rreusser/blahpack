/**
 * Computes the value of the one norm, or the Frobenius norm, or the infinity.
 * norm, or the element of largest absolute value of a real symmetric
 * tridiagonal matrix A.
 *
 *
 * @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Float64Array} d - diagonal elements, length N
 * @param {integer} strideD - stride for d
 * @param {NonNegativeInteger} offsetD - starting index for d
 * @param {Float64Array} e - off-diagonal elements, length N-1
 * @param {integer} strideE - stride for e
 * @param {NonNegativeInteger} offsetE - starting index for e
 * @returns {number} the computed norm value
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the value of the one norm, or the Frobenius norm, or the infinity.
*
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} d - diagonal elements, length N
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - off-diagonal elements, length N-1
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @throws {TypeError} first argument must be a valid norm type
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {number} the computed norm value
*/
function dlanst( norm, N, d, strideD, offsetD, e, strideE, offsetE ) {
	if ( norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'max' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm type. Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0.0;
	}
	return base( norm, N, d, strideD, offsetD, e, strideE, offsetE );
}


// EXPORTS //

export default dlanst;
