

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Solves a complex Hermitian positive definite tridiagonal system A*X = B
 * using the L*D*L^H or U^H*D*U factorization of A computed by zpttrf.
 *
 * D is a diagonal matrix (real) specified in the vector D, U (or L) is a unit
 * bidiagonal matrix whose superdiagonal (subdiagonal) is specified in the
 * complex vector E, and X and B are N by NRHS complex matrices.
 *
 *
 * @param {string} uplo - `'upper'` for U^H*D*U factorization, `'lower'` for L*D*L^H factorization
 * @param {NonNegativeInteger} N - order of the tridiagonal matrix A (N >= 0)
 * @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
 * @param {Float64Array} d - diagonal elements of D (real), length N
 * @param {integer} strideD - stride length for `d`
 * @param {NonNegativeInteger} offsetD - starting index for `d`
 * @param {Complex128Array} e - off-diagonal elements of L or U, length N-1
 * @param {integer} strideE - stride length for `e` (in complex elements)
 * @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
 * @param {Complex128Array} B - right hand side matrix (N x NRHS), overwritten with solution X
 * @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
 * @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
 * @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} status code (0 = success)
 */
function zpttrs( uplo, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( uplo, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB ); // eslint-disable-line max-len
}


// EXPORTS //

export default zpttrs;
