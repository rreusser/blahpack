/**
 * Solves a system of linear equations.
 * `A*X = B`,  `A^T*X = B`,  or  `A^H * X = B`
 * with a general N-by-N matrix A using the LU factorization computed by
 * zgetrf/zgetrf2.
 *
 * IPIV must contain 0-based pivot indices (as produced by zgetrf/zgetrf2).
 *
 *
 * @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
 * @param {NonNegativeInteger} N - order of matrix A
 * @param {NonNegativeInteger} nrhs - number of right-hand side columns
 * @param {Complex128Array} A - LU-factored N-by-N matrix (from zgetrf)
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
 * @param {Int32Array} IPIV - pivot indices from zgetrf (0-based)
 * @param {integer} strideIPIV - stride for IPIV
 * @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
 * @param {Complex128Array} B - right-hand side matrix, overwritten with solution
 * @param {integer} strideB1 - stride of the first dimension of B (complex elements)
 * @param {integer} strideB2 - stride of the second dimension of B (complex elements)
 * @param {NonNegativeInteger} offsetB - index offset for B (complex elements)
 * @throws {TypeError} First argument must be a valid transpose operation
 * @returns {integer} info - 0 if successful
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a system of linear equations using LU factorization (complex double-precision).
*
* @param {string} trans - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {integer} nrhs - number of right-hand sides
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Int32Array} IPIV - pivot indices
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} B - output matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @throws {TypeError} first argument must be a valid transpose operation
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
*
* var A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] );
* var IPIV = new Int32Array( [ 0, 1, 2 ] );
* var B = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
*
* var info = zgetrs( 'no-transpose', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
* // info => 0
*/
function zgetrs( trans, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( trans, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB );
}


// EXPORTS //

export default zgetrs;
