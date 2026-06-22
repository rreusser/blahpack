

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Computes the solution to a complex system of linear equations A*X = B,
 * where A is an N-by-N Hermitian matrix and X and B are N-by-NRHS matrices.
 *
 * The diagonal pivoting method is used to factor A as:
 *   A = U * D * U^H  (if uplo = 'U'), or
 *   A = L * D * L^H  (if uplo = 'L'),
 *
 * where U (or L) is a product of permutation and unit upper (lower)
 * triangular matrices, and D is Hermitian and block diagonal with 1-by-1
 * and 2-by-2 diagonal blocks.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {integer} N - order of the matrix A
 * @param {integer} nrhs - number of right hand sides
 * @param {Complex128Array} A - input/output matrix A (N x N)
 * @param {integer} strideA1 - first stride of A
 * @param {integer} strideA2 - second stride of A
 * @param {integer} offsetA - offset into A
 * @param {Int32Array} IPIV - output pivot indices
 * @param {integer} strideIPIV - stride of IPIV
 * @param {integer} offsetIPIV - offset into IPIV
 * @param {Complex128Array} B - input/output right hand side / solution
 * @param {integer} strideB1 - first stride of B
 * @param {integer} strideB2 - second stride of B
 * @param {integer} offsetB - offset into B
 * @param {Complex128Array} WORK - workspace
 * @param {integer} strideWORK - stride of WORK
 * @param {integer} offsetWORK - offset into WORK
 * @param {integer} lwork - length of WORK
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info - 0 if successful, >0 if D(i,i) is zero
 */
function zhesv( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhesv;
