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

import dsymv from './../../../../blas/base/dsymv/lib/base.js';
import ddot from './../../../../blas/base/ddot/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import dsyr2 from './../../../../blas/base/dsyr2/lib/base.js';


// MAIN //

/**
* Applies an elementary reflector, or Householder matrix, H, to an N-by-N symmetric matrix C, from both sides.
*
* `H = I - tau * v * v**T`
*
* If tau is zero, then H is taken to be the unit matrix.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangular part of C is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix C
* @param {Float64Array} v - reflector vector
* @param {integer} strideV - stride for `v`
* @param {NonNegativeInteger} offsetV - starting index for `v`
* @param {number} tau - scalar factor
* @param {Float64Array} C - symmetric matrix, modified in-place
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Float64Array} WORK - workspace array of length `N`
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {Float64Array} `C`
*/
function dlarfy( uplo, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var alpha;

	// Quick return if tau is zero (H is the identity):
	if ( tau === 0.0 ) {
		return C;
	}

	// Form w := C * v
	dsymv( uplo, N, 1.0, C, strideC1, strideC2, offsetC, v, strideV, offsetV, 0.0, WORK, strideWork, offsetWork );

	// alpha := -1/2 * tau * (w^T * v)
	alpha = -0.5 * tau * ddot( N, WORK, strideWork, offsetWork, v, strideV, offsetV );

	// W := w + alpha * v
	daxpy( N, alpha, v, strideV, offsetV, WORK, strideWork, offsetWork );

	// C := C - v * w^T - w * v^T
	dsyr2( uplo, N, -tau, v, strideV, offsetV, WORK, strideWork, offsetWork, C, strideC1, strideC2, offsetC );

	return C;
}


// EXPORTS //

export default dlarfy;
