
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
* @param {string} uplo - uplo
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} kd - kd
* @param {Float64Array} AB - AB
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {number} anorm - anorm
* @param {Float64Array} rcond - rcond
* @param {Float64Array} WORK - WORK
* @param {integer} strideWork - strideWork
* @param {Int32Array} IWORK - IWORK
* @param {integer} strideIWork - strideIWork
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dpbcon( uplo, N, kd, AB, LDAB, anorm, rcond, WORK, strideWork, IWORK, strideIWork ) { // eslint-disable-line max-len, max-params
	var oiwork;
	var owork;
	var sab1;
	var sab2;

	sab1 = 1;
	sab2 = LDAB;
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 3 * N );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
		strideIWork = 1;
	}
	owork = stride2offset( N, strideWork );
	oiwork = stride2offset( N, strideIWork );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	return base( uplo, N, kd, AB, sab1, sab2, 0, anorm, rcond, WORK, strideWork, owork, IWORK, strideIWork, oiwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dpbcon;
