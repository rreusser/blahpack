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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies an elementary reflector, or Householder matrix, `H`, to an N-by-N Hermitian matrix `C`, from both the left and the right.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of `C` is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix `C`
* @param {Complex128Array} v - reflector vector
* @param {integer} strideV - stride for `v` (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for `v` (in complex elements)
* @param {Complex128} tau - complex scalar factor
* @param {Complex128Array} C - Hermitian matrix (modified in place)
* @param {integer} strideC1 - stride of the first dimension of `C` (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of `C` (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for `C` (in complex elements)
* @param {Complex128Array} WORK - workspace array of length N
* @param {integer} strideWORK - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @returns {Complex128Array} `C`
*/
function zlarfy( uplo, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	return base( uplo, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default zlarfy;
