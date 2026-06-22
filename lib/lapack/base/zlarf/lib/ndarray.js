/**
 * Apply a complex elementary reflector H to a complex M-by-N matrix C.
 * from either the left or the right.
 *
 * `H = I - tau*v*v^H`
 *
 * If tau = 0, then H is taken to be the unit matrix.
 *
 *
 * @param {string} side - `'left'` or `'right'`
 * @param {NonNegativeInteger} M - number of rows of C
 * @param {NonNegativeInteger} N - number of columns of C
 * @param {Complex128Array} v - reflector vector
 * @param {integer} strideV - stride for v (in complex elements)
 * @param {NonNegativeInteger} offsetV - starting index for v (in complex elements)
 * @param {Complex128Array} tau - complex scalar
 * @param {NonNegativeInteger} offsetTau - starting index for tau (in complex elements)
 * @param {Complex128Array} C - matrix, modified in-place
 * @param {integer} strideC1 - stride of the first dimension of C (complex elements)
 * @param {integer} strideC2 - stride of the second dimension of C (complex elements)
 * @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
 * @param {Complex128Array} WORK - workspace
 * @param {integer} strideWORK - stride for WORK (in complex elements)
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
 * @throws {TypeError} First argument must be a valid operation side
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Apply a complex elementary reflector H to a complex M-by-N matrix C.
*
* @param {string} side - `'left'` or `'right'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Complex128Array} v - reflector vector
* @param {integer} strideV - stride for v (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for v (in complex elements)
* @param {Complex128Array} tau - complex scalar
* @param {NonNegativeInteger} offsetTau - starting index for tau (in complex elements)
* @param {Complex128Array} C - matrix, modified in-place
* @param {integer} strideC1 - stride of the first dimension of C (complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @throws {TypeError} first argument must be a valid operation side
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
*/
function zlarf( side, M, N, v, strideV, offsetV, tau, offsetTau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
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
	return base( side, M, N, v, strideV, offsetV, tau, offsetTau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default zlarf;
