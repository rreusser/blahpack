/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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

// MAIN //

/**
* Performs the symmetric rank-1 update `A := alpha*x*x^T + A`.
*
* `alpha` is a scalar, `x` is an `N`-element vector, and `A` is an `N` by `N`
* symmetric matrix supplied in packed form.
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {number} alpha - scalar constant
* @param {Float64Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} AP - packed symmetric matrix
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @returns {Float64Array} `AP`
*/
function dspr( uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP ) {
	var temp;
	var kk;
	var ix;
	var jx;
	var i;
	var j;
	var k;

	// Quick return if possible:
	if ( N === 0 || alpha === 0.0 ) {
		return AP;
	}

	jx = offsetX;
	kk = offsetAP;

	if ( uplo === 'upper' ) {
		// Form A when upper triangle is stored in AP:
		for ( j = 0; j < N; j += 1 ) {
			if ( x[ jx ] !== 0.0 ) {
				temp = alpha * x[ jx ];
				ix = offsetX;
				k = kk;
				for ( i = 0; i <= j; i += 1 ) {
					AP[ k ] += x[ ix ] * temp;
					ix += strideX;
					k += strideAP;
				}
			}
			jx += strideX;
			kk += ( j + 1 ) * strideAP;
		}
	} else {
		// Form A when lower triangle is stored in AP:
		for ( j = 0; j < N; j += 1 ) {
			if ( x[ jx ] !== 0.0 ) {
				temp = alpha * x[ jx ];
				ix = jx;
				k = kk;
				for ( i = j; i < N; i += 1 ) {
					AP[ k ] += x[ ix ] * temp;
					ix += strideX;
					k += strideAP;
				}
			}
			jx += strideX;
			kk += ( N - j ) * strideAP;
		}
	}
	return AP;
}


// EXPORTS //

export default dspr;
