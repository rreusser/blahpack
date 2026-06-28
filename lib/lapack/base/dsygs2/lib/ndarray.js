
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a real symmetric-definite generalized eigenproblem to standard form.
* (unblocked algorithm).
*
* If itype = 1, the problem is A_x = lambda_B_x,
_ and A is overwritten by inv(U^T)_A_inv(U) or inv(L)_A*inv(L^T).
*
* If itype = 2 or 3, the problem is A_B_x = lambda_x or B_A_x = lambda_x,
* and A is overwritten by U_A_U^T or L^T_A_L.
*
* B must have been previously factorized as U^T_U or L_L^T by dpotrf.
*
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input/output symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - triangular factor from Cholesky factorization of B
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function dsygs2( itype, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( itype, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsygs2;
