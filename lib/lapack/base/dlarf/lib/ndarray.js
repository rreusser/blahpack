/**
 * Applies a real elementary reflector H to a real M-by-N matrix C.
 * from either the left or the right.
 *
 * `H = I - tau*v*v**T`
 *
 *
 * @param {string} side - `'left'` or `'right'`
 * @param {NonNegativeInteger} M - number of rows of C
 * @param {NonNegativeInteger} N - number of columns of C
 * @param {Float64Array} v - reflector vector
 * @param {integer} strideV - stride for v
 * @param {NonNegativeInteger} offsetV - starting index for v
 * @param {number} tau - scalar factor
 * @param {Float64Array} C - matrix, modified in-place
 * @param {integer} strideC1 - stride of first dimension of C
 * @param {integer} strideC2 - stride of second dimension of C
 * @param {NonNegativeInteger} offsetC - starting index for C
 * @param {Float64Array} WORK - workspace array
 * @param {integer} strideWORK - stride for WORK
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK
 * @throws {TypeError} First argument must be a valid operation side
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a real elementary reflector H to a real M-by-N matrix C.
*
* @param {string} side - `'left'` or `'right'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Float64Array} v - reflector vector
* @param {integer} strideV - stride for v
* @param {NonNegativeInteger} offsetV - starting index for v
* @param {number} tau - scalar factor
* @param {Float64Array} C - matrix, modified in-place
* @param {integer} strideC1 - stride of first dimension of C
* @param {integer} strideC2 - stride of second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @throws {TypeError} first argument must be a valid operation side
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
*/
function dlarf( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return;
	}
	return base( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default dlarf;
