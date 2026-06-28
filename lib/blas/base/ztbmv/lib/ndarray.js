
// MODULES //

import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs one of the matrix-vector operations `x := A*x`, `x := A**T*x`, or `x := A**H*x`.
*
* `x` is an N element complex vector and A is an N by N unit or non-unit,
* upper or lower triangular band matrix, with (K+1) diagonals.
*
* Band storage: for upper triangular, the j-th column of A is stored in the
* j-th column of the band array, with diagonal at row K (0-based).
* For lower triangular, diagonal at row 0.
*
* Upper band: `A_band[K-s + s*sa1 + j*sa2] = A(j-s, j)` for s = 0..min(K,j)
* Lower band: `A_band[s*sa1 + j*sa2] = A(j+s, j)` for s = 0..min(K, N-1-j)
*
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {string} trans - specifies the operation to be performed
* @param {string} diag - specifies whether the matrix is unit or non-unit triangular
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} K - number of super/sub-diagonals
* @param {Complex128Array} A - band matrix in band storage
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} x - input/output vector
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {TypeError} Second argument must be a valid transpose operation
* @throws {TypeError} Third argument must be a valid diagonal type
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} `x`
*/
function ztbmv( uplo, trans, diag, N, K, A, strideA1, strideA2, offsetA, x, strideX, offsetX ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( strideA1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be non-zero. Value: `%d`.', strideA1 ) );
	}
	if ( strideA2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideA2 ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be non-zero. Value: `%d`.', strideX ) );
	}
	return base( uplo, trans, diag, N, K, A, strideA1, strideA2, offsetA, x, strideX, offsetX ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztbmv;
