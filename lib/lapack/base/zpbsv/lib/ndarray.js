

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Computes the solution to a complex system of linear equations A * X = B,
 * where A is an N-by-N Hermitian positive definite band matrix and X and B
 * are N-by-NRHS matrices.
 *
 * The Cholesky decomposition is used to factor A as:
 * `A = U^H * U`,  if uplo = 'upper', or
 * `A = L * L^H`,  if uplo = 'lower',
 * where U is an upper triangular band matrix, and L is a lower triangular
 * band matrix. The factored form of A is then used to solve the system.
 *
 *
 * @param {string} uplo - 'upper': upper triangle of A is stored; 'lower': lower triangle of A is stored
 * @param {NonNegativeInteger} N - number of linear equations / order of A
 * @param {NonNegativeInteger} kd - number of super/sub-diagonals of A
 * @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
 * @param {Complex128Array} AB - on entry, the upper or lower triangle of A in band storage; on exit, the triangular factor U or L
 * @param {integer} strideAB1 - stride of the first dimension of AB (in complex elements)
 * @param {integer} strideAB2 - stride of the second dimension of AB (in complex elements)
 * @param {NonNegativeInteger} offsetAB - starting index for AB (in complex elements)
 * @param {Complex128Array} B - on entry, the RHS matrix B; on exit, the solution matrix X
 * @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
 * @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
 * @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info - 0 if successful, >0 if the leading minor of order info is not positive definite
 */
function zpbsv( uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, B, strideB1, strideB2, offsetB ); // eslint-disable-line max-len
}


// EXPORTS //

export default zpbsv;
