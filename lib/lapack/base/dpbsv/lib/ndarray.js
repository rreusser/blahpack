/**
 * Computes the solution to a real system of linear equations A * X = B.
 * where A is an N-by-N symmetric positive definite band matrix and X and B
 * are N-by-NRHS matrices.
 *
 * The Cholesky decomposition is used to factor A as:
 * `A = U**T*U`,  if uplo = 'upper', or
 * A = L*L**T,  if uplo = 'lower',
 * where U is an upper triangular band matrix, and L is a lower triangular
 * band matrix. The factored form of A is then used to solve the system.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - number of linear equations / order of A
 * @param {NonNegativeInteger} kd - number of super/sub-diagonals of A
 * @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
 * @param {Float64Array} AB - on entry, the upper or lower triangle of A in band storage; on exit, the triangular factor U or L
 * @param {integer} strideAB1 - stride of the first dimension of AB
 * @param {integer} strideAB2 - stride of the second dimension of AB
 * @param {NonNegativeInteger} offsetAB - starting index for AB
 * @param {Float64Array} B - on entry, the RHS matrix B; on exit, the solution matrix X
 * @param {integer} strideB1 - stride of the first dimension of B
 * @param {integer} strideB2 - stride of the second dimension of B
 * @param {NonNegativeInteger} offsetB - starting index for B
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info - 0 if successful, >0 if the leading minor of order info is not positive definite
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the solution to a real system of linear equations A.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - number of linear equations / order of A
* @param {NonNegativeInteger} kd - number of super/sub-diagonals of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} AB - on entry, the upper or lower triangle of A in band storage; on exit, the triangular factor U or L
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Float64Array} B - on entry, the RHS matrix B; on exit, the solution matrix X
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {integer} info - 0 if successful, >0 if the leading minor of order info is not positive definite
*/
function dpbsv( uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, B, strideB1, strideB2, offsetB ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, B, strideB1, strideB2, offsetB );
}


// EXPORTS //

export default dpbsv;
