
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
* @param {string} howmny - howmny
* @param {(Uint8Array|Array)} SELECT - SELECT
* @param {integer} strideSELECT - strideSELECT
* @param {NonNegativeInteger} N - N
* @param {Float64Array} T - T
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} VL - VL
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - VR
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {integer} mm - mm
* @param {integer} M - M
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @returns {integer} info status code
*/
function dtrevc3( side, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, mm, M, WORK, strideWORK, lwork ) { // eslint-disable-line max-len, max-params
	var oselect;
	var owork;
	var svl1;
	var svl2;
	var svr1;
	var svr2;
	var st1;
	var st2;

	st1 = 1;
	st2 = LDT;
	svl1 = 1;
	svl2 = LDVL;
	svr1 = 1;
	svr2 = LDVR;
	oselect = stride2offset( N, strideSELECT );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1,3 * N);
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( LDT < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDT ) );
	}
	if ( LDVL < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDVR ) );
	}
	if ( howmny !== 'all' && howmny !== 'backtransform' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `howmny` value. Value: `%s`.', howmny ) );
	}
	return base( side, howmny, SELECT, strideSELECT, oselect, N, T, st1, st2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, strideWORK, owork, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrevc3;
