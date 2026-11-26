/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';



// MAIN //

/**
* Computes the factorization of a complex symmetric matrix `A` using Aasen's algorithm (blocked).
*
* The form of the factorization is `A = U^T*T*U` (upper) or `A = L*T*L^T` (lower),
* where `T` is a complex symmetric tridiagonal matrix.
*
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for `A` (in complex elements)
* @param {Int32Array} IPIV - pivot index output array, length `N`
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {Complex128Array} WORK - caller-owned workspace (length from `offsetWork` at least `2*N` when `N > 1`, unused otherwise; a length of at least `N*(1+NB)` with `NB = 64` (from `ilaenv`) enables the full block size, and a shorter one a block size of `floor((length-N)/N)`)
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - index offset for `WORK` (in complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} WORK must be sufficiently large
* @returns {integer} `0`
*/
function zsytrfAa( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
	let need;

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
	// Caller owns the workspace: the reference's minimum is `2*N` (block size 1).
	// `N <= 1` returns before touching WORK.
	if ( N > 1 ) {
		need = 2 * N;
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zsytrfAa;
