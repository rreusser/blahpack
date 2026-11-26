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
* Solves a real symmetric indefinite system of linear equations A * X = B.
* using the Bunch-Kaufman diagonal pivoting method.
*
* The factorization has the form:
*   A = U _ D _ U^T  (if uplo = 'U')
*   A = L _ D _ L^T  (if uplo = 'L')
*
* where U (or L) is a product of permutation and unit upper (lower) triangular
* matrices, and D is symmetric and block diagonal with 1-by-1 and 2-by-2
* diagonal blocks.
*
* The factored form of A is then used to solve the system A * X = B via
* dsytrs2.
*
* IPIV is an output array that receives 0-based pivot indices from dsytrf.
* Negative values indicate 2x2 pivots (using bitwise NOT encoding).
*
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - input/output N-by-N symmetric matrix; on exit, block diagonal matrix D and multipliers for the factorization
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} IPIV - output pivot indices (0-based), length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Float64Array} B - input/output N-by-NRHS matrix; on exit, the solution X
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {Float64Array} WORK - caller-owned workspace, handed whole to dsytrf (length from `offsetWork` at least `1`; a length of at least `N*32` enables the full blocked factorization and the dsytrs2 solve, a length below `N` uses the dsytrs solve)
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - index offset for `WORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} WORK must have at least one element from `offsetWork` when `N > 0`
* @returns {integer} info - 0 if successful, k>0 if D(k-1,k-1) is exactly zero
*/
function dsysv( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	if ( !WORK || ( WORK.length - offsetWork ) < 1 ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least 1 element from offset %d. Provided length: %d.', offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsysv;
