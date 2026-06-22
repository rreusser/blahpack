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

import zsytri from './../../../../lapack/base/zsytri/lib/base.js';
import zsytri2x from './../../../../lapack/base/zsytri2x/lib/base.js';


// VARIABLES //

// Block size dispatch threshold (matches the project's ILAENV-replacement convention; see `docs/dependency-conventions.md`).
var NBMAX = 32;


// MAIN //

/**
* Computes the inverse of a complex symmetric indefinite matrix `A` using the factorization `A = U*D*U^T` or `A = L*D*L^T` produced by `zsytrf` (classic Bunch-Kaufman). Dispatches between the unblocked worker `zsytri` (small `N`) and the blocked worker `zsytri2x` (large `N`).
*
* For `N <= NBMAX` the unblocked path uses `WORK` as an `N`-element complex scratch vector. For `N > NBMAX` the blocked path treats `WORK` as a logical 2D array of shape `(N+NBMAX+1) x (NBMAX+3)` stored column-major with leading dimension `N+NBMAX+1`. Callers must size `WORK` for the worst case: at least `(N+NBMAX+1)*(NBMAX+3)` complex elements when `N > NBMAX`, and at least `N` complex elements otherwise.
*
* `IPIV` follows the JS convention used throughout the Bunch-Kaufman family: non-negative entries denote `1x1` pivot blocks and encode the interchange target as a `0`-based row index; negative entries denote `2x2` pivot blocks and encode the interchange target as `~IPIV[k]` (bitwise NOT).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output matrix; on entry, the factored form from `zsytrf`; on exit, the inverse stored in symmetric form
* @param {integer} strideA1 - first-dimension stride of `A` (in complex elements)
* @param {integer} strideA2 - second-dimension stride of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from `zsytrf`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} WORK - workspace; size depends on dispatch path (see above)
* @param {integer} strideWORK - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @returns {integer} status code (`0` = success; `> 0` = the `(k,k)` element of `D` is exactly zero so the inverse cannot be computed)
*/
function zsytri2( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK ) {
	// Quick return.
	if ( N === 0 ) {
		return 0;
	}

	// Dispatch: unblocked when NBMAX covers the whole matrix, blocked otherwise.
	if ( NBMAX >= N ) {
		return zsytri( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK );
	}
	return zsytri2x( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK, NBMAX );
}


// EXPORTS //

export default zsytri2;
