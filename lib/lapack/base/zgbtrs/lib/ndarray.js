/**
 * Solves a system of linear equations `A*X = B`, `A^T*X = B`, or `A^H*X = B`.
 *
 * Uses a general band matrix A and the LU factorization computed by zgbtrf.
 *
 * IPIV is 0-based (matching zgbtf2/zgbtrf output).
 *
 * Band storage: AB is stored with LDAB = 2*KL+KU+1 rows. The factored form
 * has U as an upper triangular band matrix with KL+KU superdiagonals, and
 * L multipliers below the diagonal.
 *
 *
 * @param {string} trans - 'no-transpose' for A*X=B, 'transpose' for A^T*X=B, 'conjugate-transpose' for A^H*X=B
 * @param {NonNegativeInteger} N - order of matrix A
 * @param {NonNegativeInteger} kl - number of subdiagonals
 * @param {NonNegativeInteger} ku - number of superdiagonals
 * @param {NonNegativeInteger} nrhs - number of right-hand sides
 * @param {Complex128Array} AB - factored band matrix from zgbtrf
 * @param {integer} strideAB1 - stride of the first dimension of AB
 * @param {integer} strideAB2 - stride of the second dimension of AB
 * @param {NonNegativeInteger} offsetAB - starting index for AB
 * @param {Int32Array} IPIV - pivot indices from zgbtrf (0-based)
 * @param {integer} strideIPIV - stride for IPIV
 * @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
 * @param {Complex128Array} B - right-hand side matrix, overwritten with solution
 * @param {integer} strideB1 - stride of the first dimension of B
 * @param {integer} strideB2 - stride of the second dimension of B
 * @param {NonNegativeInteger} offsetB - starting index for B
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
* Solves a complex banded system using LU factorization.
*
* @param {string} trans - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {integer} kl - number of subdiagonals
* @param {integer} ku - number of superdiagonals
* @param {integer} nrhs - number of right-hand sides
* @param {Complex128Array} AB - input matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
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
* var AB = new Complex128Array( 16 );
* var IPIV = new Int32Array( 4 );
* var B = new Complex128Array( 4 );
*
* var info = zgbtrs( 'no-transpose', 4, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
* // ? => 0
*/
function zgbtrs( trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
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
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB );
}


// EXPORTS //

export default zgbtrs;
