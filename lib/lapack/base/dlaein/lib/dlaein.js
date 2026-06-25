
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {boolean} rightv - rightv
* @param {boolean} noinit - noinit
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} H - input matrix
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {number} wr - wr
* @param {number} wi - wi
* @param {Float64Array} VR - input array
* @param {integer} strideVR - stride length for `VR`
* @param {Float64Array} VI - input array
* @param {integer} strideVI - stride length for `VI`
* @param {Float64Array} B - input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} WORK - output array
* @param {integer} strideWORK - stride length for `WORK`
* @param {number} eps3 - eps3
* @param {number} smlnum - smlnum
* @param {number} bignum - bignum
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to max(1,N)
* @throws {RangeError} fourteenth argument must be greater than or equal to max(1,N)
* @returns {integer} status code (0 = success)
*/
function dlaein( order, rightv, noinit, N, H, LDH, wr, wi, VR, strideVR, VI, strideVI, B, LDB, WORK, strideWORK, eps3, smlnum, bignum ) { // eslint-disable-line max-len, max-params
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
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
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
	if ( WORK === null || WORK === void 0 ) {
		var minWork = N;
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	return base( rightv, noinit, N, H, sh1, sh2, 0, wr, wi, VR, strideVR, 0, VI, strideVI, 0, B, sb1, sb2, 0, WORK, strideWORK, 0, eps3, smlnum, bignum ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaein;
