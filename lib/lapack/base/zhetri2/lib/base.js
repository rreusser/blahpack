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

import zhetri from './../../../../lapack/base/zhetri/lib/base.js';
import zhetri2x from './../../../../lapack/base/zhetri2x/lib/base.js';


// VARIABLES //

// Hardcoded block size from ILAENV(1, 'ZHETRF', ...). The Fortran reference picks a tuned NB per architecture (typically 32 or 64); we use a single canonical value, consistent with the rest of the codebase.
var NBMAX = 32;


// MAIN //

/**
* Computes the inverse of a complex Hermitian indefinite matrix `A` using the factorization `A = U*D*U**H` or `A = L*D*L**H` computed by `zhetrf`.
*
* ## Notes
*
* -   When `N <= NBMAX` (block size threshold), dispatches to the unblocked routine `zhetri`; otherwise dispatches to the blocked routine `zhetri2x`.
* -   `IPIV` follows the JS convention used by `zhetrf`/`zsyconv`: non-negative entries denote `1x1` pivot blocks and encode the interchange target as a `0`-based row index; negative entries denote `2x2` pivot blocks and encode the interchange target as `~IPIV[k]` (bitwise NOT).
* -   The caller's `WORK` buffer must satisfy the size requirement of whichever path is taken: at least `N` complex elements when `N <= NBMAX`, and at least `(N+NBMAX+1)*(NBMAX+3)` complex elements when `N > NBMAX`. The Fortran workspace-query path (`LWORK = -1`) is not exposed.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output matrix; on entry, the factored form from `zhetrf`; on exit, the inverse stored as a Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from `zhetrf`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} WORK - workspace (sized for whichever path is selected; see Notes)
* @param {integer} strideWORK - row stride of `WORK` (in complex elements; typically `1`)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @returns {integer} status code (`0` = success; `> 0` = the `(k,k)` element of `D` is exactly zero so the inverse cannot be computed)
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
*
* var A = new Complex128Array( [ 4.0, 0.0 ] );
* var IPIV = new Int32Array( [ 0 ] );
* var WORK = new Complex128Array( 1 );
*
* var info = zhetri2( 'lower', 1, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
* // returns 0
*/
function zhetri2( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK ) {
	// Quick return.
	if ( N === 0 ) {
		return 0;
	}

	// Dispatch: small problems use the unblocked variant; large problems use the blocked variant.
	if ( NBMAX >= N ) {
		return zhetri( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK );
	}
	return zhetri2x( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK, NBMAX );
}


// EXPORTS //

export default zhetri2;
