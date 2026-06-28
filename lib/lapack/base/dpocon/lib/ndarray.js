/**
 * Estimates the reciprocal of the condition number of a symmetric positive.
 * definite matrix A using the Cholesky factorization `A = U^T*U` or
 * A = L*L^T computed by dpotrf.
 *
 * An estimate is obtained for norm(inv(A)), and the reciprocal of the
 * condition number is computed as RCOND = 1 / ( norm(A) * norm(inv(A)) ).
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Float64Array} A - Cholesky factorization from dpotrf, N-by-N
 * @param {integer} strideA1 - stride of the first dimension of `A`
 * @param {integer} strideA2 - stride of the second dimension of `A`
 * @param {NonNegativeInteger} offsetA - starting index for `A`
 * @param {number} anorm - the 1-norm (or infinity-norm) of the original matrix
 * @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
 * @param {Float64Array} WORK - workspace array of length 3*N
 * @param {integer} strideWORK - stride length for `WORK`
 * @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
 * @param {Int32Array} IWORK - workspace array of length N
 * @param {integer} strideIWORK - stride length for `IWORK`
 * @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info - 0 if successful
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a symmetric positive.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - Cholesky factorization from dpotrf, N-by-N
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {number} anorm - the 1-norm (or infinity-norm) of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length 3*N
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {Int32Array} IWORK - workspace array of length N
* @param {integer} strideIWORK - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*/
function dpocon( uplo, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	var minWork = Math.max( 1, 3 * N );
	if ( !WORK || ( WORK.length - offsetWORK ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWORK, ( WORK ) ? WORK.length : 0 ) );
	}

	return base( uplo, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK );
}


// EXPORTS //

export default dpocon;
