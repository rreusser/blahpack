
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the matrix-vector operation `y := alpha*A*x + beta*y`.
*
* Alpha and beta are scalars, x and y are N-element vectors, and A is an
* N-by-N symmetric band matrix with K super-diagonals.
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
* @param {number} alpha - scalar constant
* @param {Float64Array} A - band matrix in band storage
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} beta - scalar constant
* @param {Float64Array} y - input/output vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Float64Array} `y`
*/
function dsbmv( uplo, N, K, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) { // eslint-disable-line max-len, max-params
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

export default dsbmv;
