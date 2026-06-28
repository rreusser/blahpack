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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the inverse of a real symmetric matrix stored in packed format.
*
* The routine uses the factorization `A = U * D * U^T` or
* `A = L * D * L^T` computed by `dsptrf`.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is packed ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed symmetric matrix containing the factorization from dsptrf, length N*(N+1)/2
* @param {Int32Array} IPIV - pivot index array from dsptrf, length N
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is zero (1-based)
*/
function dsptri( uplo, N, AP, IPIV ) {
	var WORK;

	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) ); // eslint-disable-line max-len
	}
	WORK = new Float64Array( N );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dsptri;
