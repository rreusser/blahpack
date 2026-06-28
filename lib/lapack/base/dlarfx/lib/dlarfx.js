
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} side - side
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} N - N
* @param {Float64Array} v - v
* @param {integer} strideV - strideV
* @param {number} tau - tau
* @param {Float64Array} C - C
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void} result
*/
function dlarfx( side, M, N, v, strideV, tau, C, LDC, WORK, strideWORK ) { // eslint-disable-line max-len, max-params
	var owork;
	var sc1;
	var sc2;
	var ov;

	sc1 = 1;
	sc2 = LDC;
	ov = stride2offset( N, strideV );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( 1 ); // TODO: set correct size
		strideWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	return base( side, M, N, v, strideV, ov, tau, C, sc1, sc2, 0, WORK, strideWORK, owork );
}


// EXPORTS //

export default dlarfx;
