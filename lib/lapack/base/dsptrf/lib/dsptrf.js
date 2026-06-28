/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// MODULES //

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
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is packed ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed symmetric matrix, length N*(N+1)/2
* @param {Int32Array} IPIV - pivot index output array, length N
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero (1-based)
*/
function dsptrf( uplo, N, AP, IPIV ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, AP, 1, 0, IPIV, 1, 0 );
}


// EXPORTS //

export default dsptrf;
