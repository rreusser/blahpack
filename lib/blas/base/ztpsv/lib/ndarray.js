
// MODULES //

import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves one of the systems of equations `A*x = b`, `A**T*x = b`, or `A**H*x = b`.
*
* `b` and `x` are N element complex vectors and `A` is an N by N unit or
* non-unit, upper or lower triangular matrix, supplied in packed form.
* No test for singularity or near-singularity is included. Such tests must
* be performed before calling this routine.
*
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {string} trans - specifies the operation to be performed
* @param {string} diag - specifies whether the matrix is unit or non-unit triangular
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} AP - packed triangular matrix (complex-element strides)
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Complex128Array} x - input/output vector (b on entry, x on exit; complex-element strides)
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {TypeError} Second argument must be a valid transpose operation
* @throws {TypeError} Third argument must be a valid diagonal type
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} `x`
*/
function ztpsv( uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX ) { // eslint-disable-line max-len, max-params
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
	if ( strideAP === 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be non-zero. Value: `%d`.', strideAP ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	return base( uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztpsv;
