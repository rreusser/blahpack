
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses inverse iteration to find right and/or left eigenvectors of a real upper Hessenberg matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} side - specifies the operation type
* @param {string} eigsrc - specifies the operation type
* @param {string} initv - specifies the operation type
* @param {Float64Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} H - input matrix
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Float64Array} WR - input array
* @param {integer} strideWR - stride length for `WR`
* @param {Float64Array} WI - input array
* @param {integer} strideWI - stride length for `WI`
* @param {Float64Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {integer} mm - mm
* @param {NonNegativeInteger} M - number of rows
* @param {Float64Array} WORK - input array
* @param {integer} strideWork - stride length for `WORK`
* @param {Int32Array} IFAILL - input array
* @param {integer} strideIFAILL - stride length for `IFAILL`
* @param {NonNegativeInteger} offsetIFAILL - starting index for `IFAILL`
* @param {Int32Array} IFAILR - output array
* @param {integer} strideIFAILR - stride length for `IFAILR`
* @param {NonNegativeInteger} offsetIFAILR - starting index for `IFAILR`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} Second argument must be a valid operation side
* @throws {RangeError} N must be a nonnegative integer
* @throws {RangeError} M must be a nonnegative integer
* @throws {RangeError} leading dimensions must satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dhsein( order, side, eigsrc, initv, SELECT, strideSELECT, N, H, LDH, WR, strideWR, WI, strideWI, VL, LDVL, VR, LDVR, mm, M, WORK, strideWork, IFAILL, strideIFAILL, offsetIFAILL, IFAILR, strideIFAILR, offsetIFAILR ) { // eslint-disable-line max-len, max-params
	var svl1;
	var svl2;
	var svr1;
	var svr2;
	var sh1;
	var sh2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'column-major' && LDH < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDH ) );
	}
	if ( order === 'row-major' && LDVL < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVL ) );
	}
	if ( order === 'column-major' && LDVL < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDVL ) );
	}
	if ( order === 'row-major' && LDVR < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVR ) );
	}
	if ( order === 'column-major' && LDVR < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDVR ) );
	}
	if ( order === 'column-major' ) {
		sh1 = 1;
		sh2 = LDH;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		sh1 = LDH;
		sh2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = ( N + 2 ) * N;
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	return base( side, eigsrc, initv, SELECT, strideSELECT, 0, N, H, sh1, sh2, 0, WR, strideWR, 0, WI, strideWI, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, strideWork, 0, IFAILL, strideIFAILL, offsetIFAILL, IFAILR, strideIFAILR, offsetIFAILR ); // eslint-disable-line max-len
}


// EXPORTS //

export default dhsein;
