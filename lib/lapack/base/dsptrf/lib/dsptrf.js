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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the Bunch-Kaufman factorization of a real symmetric matrix stored.
* in packed format.
*
* The factorization has the form `A = U*D*U^T` (if uplo = 'upper') or
* `A = L*D*L^T` (if uplo = 'lower'), where U (or L) is a product of
* permutation and unit upper (lower) triangular matrices, and D is symmetric
* and block diagonal with 1-by-1 and 2-by-2 diagonal blocks.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is packed ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed symmetric matrix, length N*(N+1)/2
* @param {Int32Array} IPIV - pivot index output array, length N
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero (1-based)
*/
function dsptrf( order, uplo, N, AP, IPIV ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( order === 'row-major' ) {
		throw new TypeError( format( 'invalid argument. First argument must be \'column-major\'; packed storage is LAPACK column-major packed. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, AP, 1, 0, IPIV, 1, 0 );
}


// EXPORTS //

export default dsptrf;
