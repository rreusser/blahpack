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
* Computes the factorization of a real symmetric indefinite matrix `A` using the bounded Bunch-Kaufman (rook) diagonal pivoting method (blocked algorithm), with the diagonal of `D` overwriting the diagonal of `A` and the off-diagonal entries of `D` returned in `e`.
*
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input/output symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {Float64Array} e - output vector containing the off-diagonal entries of `D`
* @param {integer} strideE - stride for `e`
* @param {NonNegativeInteger} offsetE - index offset for `e`
* @param {Int32Array} IPIV - output pivot index array, length `N`
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {Float64Array} WORK - caller-owned workspace (length from `offsetWork` at least `1`; a length of at least `N*NB` (`NB = 64`, from `ilaenv`) enables the full blocked algorithm, and a shorter one a smaller block size or the unblocked algorithm)
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - index offset for `WORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} WORK must have at least one element from `offsetWork` when `N > 0`
* @returns {integer} info - `0` if successful; `k>0` if `D(k,k)` is exactly zero (1-based)
*/
function dsytrfrk( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
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
	if ( !WORK || ( WORK.length - offsetWork ) < 1 ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', 1, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dsytrfrk;
