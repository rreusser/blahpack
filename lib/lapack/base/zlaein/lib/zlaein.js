
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses inverse iteration to find an eigenvector of a complex upper Hessenberg matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {boolean} rightv - rightv
* @param {boolean} noinit - noinit
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} H - input matrix
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Complex128} w - complex eigenvalue
* @param {Complex128Array} v - in/out eigenvector of length N
* @param {integer} strideV - stride length for `v`
* @param {Complex128Array} B - workspace matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} RWORK - output array
* @param {integer} strideRWORK - stride length for `RWORK`
* @param {number} eps3 - eps3
* @param {number} smlnum - smlnum
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to max(1,N)
* @throws {RangeError} eleventh argument must be greater than or equal to max(1,N)
* @returns {integer} status code (0 = success)
*/
function zlaein( order, rightv, noinit, N, H, LDH, w, v, strideV, B, LDB, RWORK, strideRWORK, eps3, smlnum ) { // eslint-disable-line max-len, max-params
	var sh1;
	var sh2;
	var sb1;
	var sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'row-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' ) {
		sh1 = 1;
		sh2 = LDH;
		sb1 = 1;
		sb2 = LDB;
	} else {
		sh1 = LDH;
		sh2 = 1;
		sb1 = LDB;
		sb2 = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
		strideRWORK = 1;
	}
	return base( rightv, noinit, N, H, sh1, sh2, 0, w, v, strideV, 0, B, sb1, sb2, 0, RWORK, strideRWORK, 0, eps3, smlnum ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaein;
