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

import base from './base.js';


// MAIN //

/**
* Sets `v` to a scalar multiple of the first column of the QZ shift product.
* for a 3-by-3 matrix pencil `(A,B)`.
*
* @param {Float64Array} A - the 3-by-3 matrix `A`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - the 3-by-3 matrix `B`
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {number} sr1 - real part of the first shift
* @param {number} sr2 - real part of the second shift
* @param {number} si - imaginary part of the shift
* @param {number} beta1 - first beta scalar
* @param {number} beta2 - second beta scalar
* @param {Float64Array} v - output array of length `>= 3`
* @param {integer} strideV - stride length for `v`
* @param {NonNegativeInteger} offsetV - starting index for `v`
* @returns {Float64Array} `v`
*/
function dlaqz1( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, sr1, sr2, si, beta1, beta2, v, strideV, offsetV ) {
	base( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, sr1, sr2, si, beta1, beta2, v, strideV, offsetV );
	return v;
}


// EXPORTS //

export default dlaqz1;
