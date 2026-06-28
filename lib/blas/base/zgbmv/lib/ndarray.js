
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs one of the matrix-vector operations `y := alpha*op(A)*x + beta*y`.
*
* `op(A) = A`, `op(A) = A^T`, or `op(A) = A^H`, where alpha and beta are
* complex scalars, x and y are complex vectors, and A is an M-by-N band
* matrix with `kl` sub-diagonals and `ku` super-diagonals.
*
* Band storage: the matrix A is stored in a `(kl+ku+1)` by N array, with the
* diagonal at row `ku`. Element `A(i,j)` of the full matrix is at band position
* `A_band[ku+i-j, j]`.
*
* @param {string} trans - specifies the operation: `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - number of rows of the matrix A
* @param {NonNegativeInteger} N - number of columns of the matrix A
* @param {NonNegativeInteger} kl - number of sub-diagonals
* @param {NonNegativeInteger} ku - number of super-diagonals
* @param {Complex128} alpha - complex scalar constant
* @param {Complex128Array} A - band matrix in band storage
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} x - input vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128} beta - complex scalar constant
* @param {Complex128Array} y - input/output vector
* @param {integer} strideY - stride length for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @throws {TypeError} First argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} `y`
*/
function zgbmv( trans, M, N, kl, ku, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideA1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideA1 ) );
	}
	if ( strideA2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be non-zero. Value: `%d`.', strideA2 ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( strideY === 0 ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be non-zero. Value: `%d`.', strideY ) );
	}
	return base( trans, M, N, kl, ku, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgbmv;
