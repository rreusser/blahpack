
/* eslint-disable max-len, max-params */

// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a real triangular-pentagonal block reflector `H` or its transpose to the stacked matrix `C` composed of blocks `A` and `B`.
*
* @param {string} side - `'left'` or `'right'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} direct - `'forward'` or `'backward'`
* @param {string} storev - `'columnwise'` or `'rowwise'`
* @param {NonNegativeInteger} M - rows of `B`
* @param {NonNegativeInteger} N - columns of `B`
* @param {NonNegativeInteger} K - order of the triangular factor `T`
* @param {NonNegativeInteger} l - trapezoidal index
* @param {Float64Array} V - pentagonal matrix of reflector vectors
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Float64Array} T - triangular factor
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} A - upper block of `C`, modified in-place
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - lower/right block of `C`, modified in-place
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} WORK - workspace
* @param {integer} strideWORK1 - stride of the first dimension of `WORK`
* @param {integer} strideWORK2 - stride of the second dimension of `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @throws {TypeError} first argument must be a valid operation side
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {TypeError} third argument must be a valid direction
* @throws {TypeError} fourth argument must be a valid storage direction
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be a nonnegative integer
* @returns {void}
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var V = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 0.3, 1.0, 0.0, 1.0 ] );
* var T = new Float64Array( [ 1.2, 0.0, -0.3, 0.8 ] );
* var A = new Float64Array( [ 1.0, 4.0, 2.0, 5.0, 3.0, 6.0 ] );
* var B = new Float64Array( [ 7.0, 10.0, 13.0, 16.0, 8.0, 11.0, 14.0, 17.0, 9.0, 12.0, 15.0, 18.0 ] );
* var WORK = new Float64Array( 6 );
*
* dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, V, 1, 4, 0, T, 1, 2, 0, A, 1, 2, 0, B, 1, 4, 0, WORK, 1, 2, 0 );
*/
function dtprfb( side, trans, direct, storev, M, N, K, l, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWORK1, strideWORK2, offsetWORK ) {
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isTransposeOperation( trans ) ) {
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
	if ( l < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', l ) );
	}
	if ( M === 0 || N === 0 || K === 0 ) {
		return;
	}
	return base( side, trans, direct, storev, M, N, K, l, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWORK1, strideWORK2, offsetWORK );
}


// EXPORTS //

export default dtprfb;
