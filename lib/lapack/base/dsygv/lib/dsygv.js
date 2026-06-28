
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
* @param {integer} itype - itype
* @param {string} jobz - jobz
* @param {string} uplo - uplo
* @param {NonNegativeInteger} N - N
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} w - w
* @param {integer} strideW - strideW
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dsygv( itype, jobz, uplo, N, A, LDA, B, LDB, w, strideW, WORK, strideWORK, lwork ) { // eslint-disable-line max-len, max-params
	var owork;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var ow;

	sa1 = 1;
	sa2 = LDA;
	sb1 = 1;
	sb2 = LDB;
	ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 3 * N - 1);
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobz` value. Value: `%s`.', jobz ) );
	}
	return base( itype, jobz, uplo, N, A, sa1, sa2, 0, B, sb1, sb2, 0, w, strideW, ow, WORK, strideWORK, owork, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsygv;
