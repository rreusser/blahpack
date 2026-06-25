
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} jobz - jobz
* @param {string} range - range
* @param {string} uplo - uplo
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {number} vl - vl
* @param {number} vu - vu
* @param {integer} il - il
* @param {integer} iu - iu
* @param {number} abstol - abstol
* @param {Object} out - out
* @param {Float64Array} w - w
* @param {integer} strideW - strideW
* @param {Complex128Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Int32Array} ISUPPZ - ISUPPZ
* @param {integer} strideISUPPZ - strideISUPPZ
* @param {Complex128Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @param {Float64Array} RWORK - RWORK
* @param {integer} strideRWORK - strideRWORK
* @param {integer} lrwork - lrwork
* @param {Int32Array} IWORK - IWORK
* @param {integer} strideIWORK - strideIWORK
* @param {integer} liwork - liwork
* @returns {integer} info status code
*/
function zheevr( jobz, range, uplo, N, A, LDA, vl, vu, il, iu, abstol, out, w, strideW, Z, LDZ, ISUPPZ, strideISUPPZ, WORK, strideWORK, lwork, RWORK, strideRWORK, lrwork, IWORK, strideIWORK, liwork ) { // eslint-disable-line max-len, max-params
	var oisuppz;
	var oiwork;
	var orwork;
	var owork;
	var sa1;
	var sa2;
	var sz1;
	var sz2;
	var ow;

	sa1 = 1;
	sa2 = LDA;
	sz1 = 1;
	sz2 = LDZ;
	ow = stride2offset( N, strideW );
	oisuppz = stride2offset( N, strideISUPPZ );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1,2 * N);
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1,24 * N);
		RWORK = new Float64Array( minRwork );
		strideRWORK = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1,10 * N);
		IWORK = new Int32Array( minIwork );
		strideIWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	orwork = stride2offset( N, strideRWORK );
	oiwork = stride2offset( N, strideIWORK );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `jobz` value. Value: `%s`.', jobz ) );
	}
	if ( range !== 'all' && range !== 'value' && range !== 'index' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `range` value. Value: `%s`.', range ) );
	}
	return base( jobz, range, uplo, N, A, sa1, sa2, 0, vl, vu, il, iu, abstol, out, w, strideW, ow, Z, sz1, sz2, 0, ISUPPZ, strideISUPPZ, oisuppz, WORK, strideWORK, owork, lwork, RWORK, strideRWORK, orwork, lrwork, IWORK, strideIWORK, oiwork, liwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zheevr;
