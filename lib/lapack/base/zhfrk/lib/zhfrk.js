
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs a Hermitian rank-k operation for a matrix in Rectangular Full Packed format.
*
* C := alpha\*A\*A^H + beta\*C, or C := alpha\*A^H\*A + beta\*C,
* where alpha and beta are real scalars, C is an N-by-N Hermitian matrix
* stored in RFP format, and A is an N-by-K or K-by-N complex matrix.
*
* @param {string} transr - specifies the storage format (`'no-transpose'` or `'conjugate-transpose'`)
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {string} trans - specifies the operation (`'no-transpose'` or `'conjugate-transpose'`)
* @param {NonNegativeInteger} N - order of Hermitian matrix C
* @param {NonNegativeInteger} K - number of columns of A (if trans='no-transpose') or rows (if trans='conjugate-transpose')
* @param {number} alpha - real scalar multiplier for A\*A^H or A^H\*A
* @param {Complex128Array} A - complex input matrix
* @param {NonNegativeInteger} LDA - leading dimension of `A`
* @param {number} beta - real scalar multiplier for C
* @param {Complex128Array} C - RFP array of length N*(N+1)/2
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} `C`
*/
function zhfrk( transr, uplo, trans, N, K, alpha, A, LDA, beta, C ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( transr !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `transr` value. Value: `%s`.', transr ) );
	}
	return base( transr, uplo, trans, N, K, alpha, A, 1, LDA, 0, beta, C, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhfrk;
