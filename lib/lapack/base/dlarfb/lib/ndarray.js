/**
 * Applies a real block reflector H or its transpose H**T to a.
 * real M-by-N matrix C, from either the left or the right.
 *
 * `H = I - V*T*V**T  (for STOREV='C')`
 * `H = I - V**T*T*V  (for STOREV='R')`
 *
 * Supports both STOREV='C' (columnwise) and STOREV='R' (rowwise).
 *
 *
 * @param {string} side - `'left'` or `'right'`
 * @param {string} trans - `'no-transpose'` or `'transpose'`
 * @param {string} direct - `'forward'` or `'backward'`
 * @param {string} storev - `'columnwise'` or `'rowwise'`
 * @param {NonNegativeInteger} M - rows of C
 * @param {NonNegativeInteger} N - columns of C
 * @param {NonNegativeInteger} K - number of elementary reflectors
 * @param {Float64Array} V - matrix of reflector vectors
 * @param {integer} strideV1 - first dim stride of V
 * @param {integer} strideV2 - second dim stride of V
 * @param {NonNegativeInteger} offsetV - starting index for V
 * @param {Float64Array} T - triangular factor
 * @param {integer} strideT1 - first dim stride of T
 * @param {integer} strideT2 - second dim stride of T
 * @param {NonNegativeInteger} offsetT - starting index for T
 * @param {Float64Array} C - matrix, modified in-place
 * @param {integer} strideC1 - first dim stride of C
 * @param {integer} strideC2 - second dim stride of C
 * @param {NonNegativeInteger} offsetC - starting index for C
 * @param {Float64Array} WORK - workspace
 * @param {integer} strideWORK1 - first dim stride of WORK
 * @param {integer} strideWORK2 - second dim stride of WORK
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK
 * @throws {TypeError} First argument must be a valid operation side
 * @throws {TypeError} Second argument must be a valid transpose operation
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a real block reflector H or its transpose H.
*
* @param {string} side - `'left'` or `'right'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} direct - `'forward'` or `'backward'`
* @param {string} storev - `'columnwise'` or `'rowwise'`
* @param {NonNegativeInteger} M - rows of C
* @param {NonNegativeInteger} N - columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Float64Array} V - matrix of reflector vectors
* @param {integer} strideV1 - first dim stride of V
* @param {integer} strideV2 - second dim stride of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} T - triangular factor
* @param {integer} strideT1 - first dim stride of T
* @param {integer} strideT2 - second dim stride of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} C - matrix, modified in-place
* @param {integer} strideC1 - first dim stride of C
* @param {integer} strideC2 - second dim stride of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace
* @param {integer} strideWORK1 - first dim stride of WORK
* @param {integer} strideWORK2 - second dim stride of WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @throws {TypeError} first argument must be a valid operation side
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {TypeError} third argument must be a valid direction
* @throws {TypeError} fourth argument must be a valid storage direction
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
*/
function dlarfb( side, trans, direct, storev, M, N, K, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWORK1, strideWORK2, offsetWORK ) {
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( direct !== 'forward' && direct !== 'backward' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid direction. Value: `%s`.', direct ) );
	}
	if ( storev !== 'columnwise' && storev !== 'rowwise' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid storage direction. Value: `%s`.', storev ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( M === 0 || N === 0 ) {
		return;
	}
	return base( side, trans, direct, storev, M, N, K, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWORK1, strideWORK2, offsetWORK );
}


// EXPORTS //

export default dlarfb;
