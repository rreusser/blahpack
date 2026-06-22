

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Performs the matrix-vector operation:
 *
 *   y := alpha * A * x + beta * y
 *
 * where alpha and beta are complex scalars, x and y are complex vectors of
 * length N, and A is an N-by-N complex SYMMETRIC matrix.
 *
 * NOTE: This is SYMMETRIC (not Hermitian). A(i,j) = A(j,i), with NO
 * conjugation. For Hermitian, use zhemv.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of the matrix
 * @param {Complex128} alpha - scalar alpha
 * @param {Complex128Array} A - N x N symmetric matrix
 * @param {integer} strideA1 - first stride of A (complex elements)
 * @param {integer} strideA2 - second stride of A (complex elements)
 * @param {NonNegativeInteger} offsetA - offset into A (complex elements)
 * @param {Complex128Array} x - input vector
 * @param {integer} strideX - stride of x (complex elements)
 * @param {NonNegativeInteger} offsetX - offset into x (complex elements)
 * @param {Complex128} beta - scalar beta
 * @param {Complex128Array} y - input/output vector
 * @param {integer} strideY - stride of y (complex elements)
 * @param {NonNegativeInteger} offsetY - offset into y (complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {Complex128Array} y
 */
function zsymv( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ); // eslint-disable-line max-len
}


// EXPORTS //

export default zsymv;
