/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solve a system of linear equations A_X = B with a complex Hermitian matrix.
_ using the factorization A = U_D_U__H or A = L_D*L**H computed by zhetrf.
*
* IPIV uses 0-based convention:
*   IPIV[k] >= 0: 1x1 pivot, row k was interchanged with row IPIV[k]
*   IPIV[k] < 0: 2x2 pivot, IPIV[k] = ~kp (bitwise NOT of 0-based index)
*
* @param {string} uplo - 'upper' or 'lower', must match the factorization
* @param {integer} N - order of the matrix
* @param {integer} nrhs - number of right-hand sides
* @param {Complex128Array} A - factored matrix from zhetrf
* @param {integer} strideA1 - first stride of A (in complex elements)
* @param {integer} strideA2 - second stride of A (in complex elements)
* @param {integer} offsetA - offset into A (in complex elements)
* @param {Int32Array} IPIV - pivot indices from zhetrf (0-based)
* @param {integer} strideIPIV - stride of IPIV
* @param {integer} offsetIPIV - offset into IPIV
* @param {Complex128Array} B - input/output right-hand side matrix
* @param {integer} strideB1 - first stride of B (in complex elements)
* @param {integer} strideB2 - second stride of B (in complex elements)
* @param {integer} offsetB - offset into B (in complex elements)
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info value (0 = success)
*/
function zhetrs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhetrs;
