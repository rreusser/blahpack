/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
 * Computes the factorization of a real symmetric matrix A using the.
 * Bunch-Kaufman diagonal pivoting method (blocked algorithm):
 *
 * `A = U*D*U^T  or  A = L*D*L^T`
 *
 * where U (or L) is a product of permutation and unit upper (lower)
 * triangular matrices, and D is symmetric and block diagonal with
 * 1-by-1 and 2-by-2 diagonal blocks.
 *
 * IPIV stores 0-based pivot indices. Positive values indicate 1x1 pivots.
 * Negative values ~kp (bitwise NOT of 0-based index) indicate 2x2 pivots.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Float64Array} A - input/output symmetric matrix (column-major)
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - index offset for A
 * @param {Int32Array} IPIV - pivot index output array, length N
 * @param {integer} strideIPIV - stride for IPIV
 * @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info - 0 if successful, k>0 if D(k-1,k-1) is exactly zero
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the factorization of a real symmetric matrix A using the.
*
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Float64Array} WORK - workspace; length >= 1 (N*NB, with `NB = 64` from `ilaenv`, enables the full blocked algorithm)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - 0 if successful, k>0 if D(k-1,k-1) is exactly zero
*/
function dsytrf( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	if ( WORK.length < offsetWork + 1 ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', 1, offsetWork, WORK.length ) );
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dsytrf;
