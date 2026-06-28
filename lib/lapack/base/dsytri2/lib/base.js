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

/* eslint-disable max-len, max-params */

// MODULES //

import dsytri from './../../../../lapack/base/dsytri/lib/base.js';
import dsytri2x from './../../../../lapack/base/dsytri2x/lib/base.js';


// VARIABLES //

// Block size dispatch threshold (matches the project's ILAENV-replacement convention; see `docs/dependency-conventions.md`).
var NBMAX = 32;


// MAIN //

/**
* Computes the inverse of a real symmetric indefinite matrix `A` using the factorization `A = U*D*U^T` or `A = L*D*L^T` produced by `dsytrf` (classic Bunch-Kaufman). Dispatches between the unblocked worker `dsytri` (small `N`) and the blocked worker `dsytri2x` (large `N`).
*
* For `N <= NBMAX` the unblocked path uses `WORK` as an `N`-element scratch vector. For `N > NBMAX` the blocked path treats `WORK` as a logical 2D array of shape `(N+NBMAX+1) x (NBMAX+3)` stored column-major with leading dimension `N+NBMAX+1`. Callers must size `WORK` for the worst case: at least `(N+NBMAX+1)*(NBMAX+3)` elements when `N > NBMAX`, and at least `N` elements otherwise.
*
* `IPIV` follows the JS convention used throughout the Bunch-Kaufman family: non-negative entries denote `1x1` pivot blocks and encode the interchange target as a `0`-based row index; negative entries denote `2x2` pivot blocks and encode the interchange target as `~IPIV[k]` (bitwise NOT).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input/output matrix; on entry, the factored form from `dsytrf`; on exit, the inverse stored in symmetric form
* @param {integer} strideA1 - first-dimension stride of `A`
* @param {integer} strideA2 - second-dimension stride of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Int32Array} IPIV - pivot indices from `dsytrf`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} WORK - workspace; size depends on dispatch path (see above)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (`0` = success; `> 0` = the `(k,k)` element of `D` is exactly zero so the inverse cannot be computed)
*/
function dsytri2( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
	// Quick return.
	if ( N === 0 ) {
		return 0;
	}

	// Dispatch: unblocked when NBMAX covers the whole matrix, blocked otherwise.
	if ( NBMAX >= N ) {
		return dsytri( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );
	}
	return dsytri2x( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork, NBMAX );
}


// EXPORTS //

export default dsytri2;
