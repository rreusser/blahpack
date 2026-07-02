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
* Computes the factorization of a complex Hermitian indefinite matrix `A` using the bounded Bunch-Kaufman (rook) diagonal pivoting method (blocked algorithm), with the diagonal of `D` overwriting the diagonal of `A` and the off-diagonal entries of `D` returned in `e`.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output Hermitian matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - complex-element offset for `A`
* @param {Complex128Array} e - output vector containing the off-diagonal entries of `D`
* @param {integer} strideE - stride for `e`
* @param {NonNegativeInteger} offsetE - complex-element offset for `e`
* @param {Int32Array} IPIV - output pivot index array, length `N`
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - `0` if successful; `k>0` if `D(k,k)` is exactly zero (1-based)
*/
function zhetrfrk( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV );
}


// EXPORTS //

export default zhetrfrk;
