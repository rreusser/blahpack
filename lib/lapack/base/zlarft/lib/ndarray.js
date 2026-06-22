/**
 * Form the triangular factor T of a complex block reflector H of order N.
 * which is defined as a product of K elementary reflectors.
 *
 * If DIRECT = 'F', H = H(1) H(2) ... H(k) and T is upper triangular.
 * If DIRECT = 'B', H = H(k) ... H(2) H(1) and T is lower triangular.
 *
 * Supports both STOREV='C' (columnwise) and STOREV='R' (rowwise).
 *
 *
 * @param {string} direct - `'forward'` or `'backward'`
 * @param {string} storev - `'columnwise'` or `'rowwise'`
 * @param {NonNegativeInteger} N - order of the block reflector
 * @param {NonNegativeInteger} K - number of elementary reflectors
 * @param {Complex128Array} V - matrix of reflector vectors
 * @param {integer} strideV1 - stride of first dim of V (complex elements)
 * @param {integer} strideV2 - stride of second dim of V (complex elements)
 * @param {NonNegativeInteger} offsetV - starting index for V (in complex elements)
 * @param {Complex128Array} TAU - array of scalar factors
 * @param {integer} strideTAU - stride for TAU (in complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (in complex elements)
 * @param {Complex128Array} T - output triangular matrix
 * @param {integer} strideT1 - stride of first dim of T (complex elements)
 * @param {integer} strideT2 - stride of second dim of T (complex elements)
 * @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Form the triangular factor T of a complex block reflector H of order N.
*
* @param {string} direct - `'forward'` or `'backward'`
* @param {string} storev - `'columnwise'` or `'rowwise'`
* @param {NonNegativeInteger} N - order of the block reflector
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Complex128Array} V - matrix of reflector vectors
* @param {integer} strideV1 - stride of first dim of V (complex elements)
* @param {integer} strideV2 - stride of second dim of V (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (in complex elements)
* @param {Complex128Array} TAU - array of scalar factors
* @param {integer} strideTAU - stride for TAU (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (in complex elements)
* @param {Complex128Array} T - output triangular matrix
* @param {integer} strideT1 - stride of first dim of T (complex elements)
* @param {integer} strideT2 - stride of second dim of T (complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
* @throws {TypeError} first argument must be a valid direction
* @throws {TypeError} second argument must be a valid storage direction
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
*/
function zlarft( direct, storev, N, K, V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT ) {
	if ( direct !== 'forward' && direct !== 'backward' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid direction. Value: `%s`.', direct ) );
	}
	if ( storev !== 'columnwise' && storev !== 'rowwise' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid storage direction. Value: `%s`.', storev ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( N === 0 ) {
		return;
	}
	return base( direct, storev, N, K, V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT );
}


// EXPORTS //

export default zlarft;
