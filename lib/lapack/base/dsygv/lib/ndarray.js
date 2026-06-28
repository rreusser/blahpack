
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all the eigenvalues, and optionally, the eigenvectors of a real.
* generalized symmetric-definite eigenproblem:
*   A_x = lambda_B_x  (itype=1)
_   A_B_x = lambda_x  (itype=2)
*   B_A_x = lambda*x  (itype=3)
*
* Here A and B are assumed to be symmetric and B is also positive definite.
*
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} jobz - 'compute-vectors' for eigenvalues and eigenvectors, 'no-vectors' for eigenvalues only
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input/output symmetric matrix; on exit, eigenvectors if jobz='compute-vectors'
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - symmetric positive definite matrix; on exit, Cholesky factor
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Float64Array} WORK - workspace array (length >= max(1, 3*N-1))
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - length of WORK array
* @throws {TypeError} Third argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 if dpotrf or dsyev failed
*/
function dsygv( itype, jobz, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, w, strideW, offsetW, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( itype, jobz, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, w, strideW, offsetW, WORK, strideWork, offsetWork, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsygv;
