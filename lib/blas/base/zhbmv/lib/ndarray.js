
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the Hermitian banded matrix-vector operation `y := alpha*A*x + beta*y`.
*
* Alpha and beta are complex scalars, x and y are N-element complex vectors,
* and A is an N-by-N Hermitian band matrix with K super-diagonals, stored in
* band format.
*
* Upper band storage: the diagonal is at row K, and element `A(i,j)` of the
* full matrix is at band position `A_band[K+i-j, j]`.
*
* Lower band storage: the diagonal is at row 0, and element `A(i,j)` of the
* full matrix is at band position `A_band[i-j, j]`.
*
* @param {string} uplo - specifies whether the upper or lower triangle is stored: `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} K - number of super-diagonals (or sub-diagonals)
* @param {Complex128} alpha - complex scalar constant
* @param {Complex128Array} A - band matrix in band storage
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128} beta - complex scalar constant
* @param {Complex128Array} y - complex input/output vector
* @param {integer} strideY - stride length for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @throws {TypeError} First argument must be a valid matrix triangle
* @returns {Complex128Array} `y`
*/
function zhbmv( uplo, N, K, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( strideA1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be non-zero. Value: `%d`.', strideA1 ) );
	}
	if ( strideA2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be non-zero. Value: `%d`.', strideA2 ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( strideY === 0 ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be non-zero. Value: `%d`.', strideY ) );
	}
	return base( uplo, N, K, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhbmv;
