

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates reciprocal condition numbers of eigenvalues and/or eigenvectors of a real upper quasi-triangular matrix
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} job - specifies the operation type
* @param {string} howmny - specifies the operation type
* @param {Float64Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {Float64Array} s - input array
* @param {integer} strideS - stride length for `s`
* @param {Float64Array} SEP - input array
* @param {integer} strideSEP - stride length for `SEP`
* @param {integer} mm - mm
* @param {NonNegativeInteger} M - number of rows
* @param {Float64Array} WORK - input matrix
* @param {PositiveInteger} LDWORK - leading dimension of `WORK`
* @param {Int32Array} IWORK - output array
* @param {integer} strideIWORK - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
* @throws {TypeError} first argument must be a valid order
* @returns {integer} status code (0 = success)
*/
function dtrsna( order, job, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, s, strideS, SEP, strideSEP, mm, M, WORK, LDWORK, IWORK, strideIWORK, offsetIWORK ) { // eslint-disable-line max-len, max-params
	var st1;
	var st2;
	var svl1;
	var svl2;
	var svr1;
	var svr2;
	var swork1;
	var swork2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( order === 'row-major' && LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' && LDT < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,M). Value: `%d`.', LDT ) );
	}
	if ( order === 'row-major' && LDVL < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVL ) );
	}
	if ( order === 'column-major' && LDVL < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDVL ) );
	}
	if ( order === 'row-major' && LDVR < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVR ) );
	}
	if ( order === 'column-major' && LDVR < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,M). Value: `%d`.', LDVR ) );
	}
	if ( order === 'row-major' && LDWORK < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,N). Value: `%d`.', LDWORK ) );
	}
	if ( order === 'column-major' && LDWORK < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,M). Value: `%d`.', LDWORK ) );
	}
	if ( order === 'column-major' ) {
		st1 = 1;
		st2 = LDT;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
		swork1 = 1;
		swork2 = LDWORK;
	} else {
		st1 = LDT;
		st2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
		swork1 = LDWORK;
		swork2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, LDWORK,N + 6 );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, 2 * (N - 1) );
		IWORK = new Int32Array( minIwork );
		strideIWORK = 1;
	}
	return base( job, howmny, SELECT, strideSELECT, 0, N, T, st1, st2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, s, strideS, 0, SEP, strideSEP, 0, mm, M, WORK, swork1, swork2, 0, IWORK, strideIWORK, offsetIWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrsna;
