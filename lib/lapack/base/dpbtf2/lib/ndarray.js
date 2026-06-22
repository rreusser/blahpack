/**
 * Computes the Cholesky factorization of a real symmetric positive definite.
 * band matrix A.
 *
 * The factorization has the form:
 * `A = U^T*U`,  if uplo = 'upper', or
 * A = L*L^T,  if uplo = 'lower',
 * where U is upper triangular and L is lower triangular.
 *
 * This is the unblocked version of the algorithm, calling Level 2 BLAS.
 *
 * Uses band storage format: if UPLO = 'U', AB(kd+1+i-j, j) = A(i,j) for
 * max(1,j-kd)<=i<=j; if UPLO = 'L', AB(1+i-j, j) = A(i,j) for
 * j<=i<=min(n,j+kd).
 *
 *
 * @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {NonNegativeInteger} kd - number of super/sub-diagonals
 * @param {Float64Array} AB - input/output band matrix in band storage
 * @param {integer} strideAB1 - stride of the first dimension of AB
 * @param {integer} strideAB2 - stride of the second dimension of AB
 * @param {NonNegativeInteger} offsetAB - starting index for AB
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info - 0 if successful, k>0 if the leading minor of order k is not positive definite
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the Cholesky factorization of a real symmetric positive definite.
*
* @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super/sub-diagonals
* @param {Float64Array} AB - input/output band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - 0 if successful, k>0 if the leading minor of order k is not positive definite
*/
function dpbtf2( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB );
}


// EXPORTS //

export default dpbtf2;
