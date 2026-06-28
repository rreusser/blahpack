
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the symmetric rank-k operation `C := alpha*A*A**T + beta*C` or `C := alpha*A**T*A + beta*C`.
*
* where alpha and beta are complex scalars, C is an N-by-N symmetric matrix
* (stored as Complex128Array), and A is an N-by-K matrix in the first case
* and a K-by-N matrix in the second case.
*
* Only the upper or lower triangular part of C is updated.
*
* @param {string} uplo - `'upper'` for upper triangle, `'lower'` for lower triangle
* @param {string} trans - `'no-transpose'` for `A*A**T`, `'transpose'` for `A**T*A`
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - number of columns of A (if trans is `'no-transpose'`) or rows (if trans is `'transpose'`)
* @param {Complex128} alpha - complex scalar multiplier
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128} beta - complex scalar multiplier
* @param {Complex128Array} C - input/output symmetric matrix (only upper or lower triangle accessed)
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - index offset for C (in complex elements)
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {TypeError} Second argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} `C`
*/
function zsyrk( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC1, strideC2, offsetC ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( strideA1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be non-zero. Value: `%d`.', strideA1 ) );
	}
	if ( strideA2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideA2 ) );
	}
	if ( strideC1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be non-zero. Value: `%d`.', strideC1 ) );
	}
	if ( strideC2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be non-zero. Value: `%d`.', strideC2 ) );
	}
	return base( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC1, strideC2, offsetC ); // eslint-disable-line max-len
}


// EXPORTS //

export default zsyrk;
