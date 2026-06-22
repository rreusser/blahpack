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

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

var abs = Math.abs;
var max = Math.max;
var min = Math.min;


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a general banded matrix.
*
* The "max absolute element" norm is used. If this is much less than 1, the
* stability of the LU factorization of the (equilibrated) matrix A could be
* poor.
*
* @private
* @param {NonNegativeInteger} N - number of linear equations (order of the matrix)
* @param {NonNegativeInteger} kl - number of subdiagonals within the band of A
* @param {NonNegativeInteger} ku - number of superdiagonals within the band of A
* @param {NonNegativeInteger} ncols - number of columns to process
* @param {Float64Array} AB - original band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} AFB - LU factored band matrix from dgbtrf
* @param {integer} strideAFB1 - stride of the first dimension of `AFB`
* @param {integer} strideAFB2 - stride of the second dimension of `AFB`
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB`
* @returns {number} reciprocal pivot growth factor
*/
function dla_gbrpvgrw( N, kl, ku, ncols, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB ) {
	var rpvgrw;
	var amax;
	var umax;
	var kd;
	var i;
	var j;

	rpvgrw = 1.0;
	kd = ku;

	for ( j = 0; j < ncols; j += 1 ) {
		amax = 0.0;
		umax = 0.0;

		// Scan original band matrix column j for max absolute element
		for ( i = max( j - ku, 0 ); i < min( j + kl + 1, N ); i += 1 ) {
			amax = max( abs( AB[ offsetAB + (( kd + i - j ) * strideAB1) + (j * strideAB2) ] ), amax );
		}

		// Scan U factor column j for max absolute element
		for ( i = max( j - ku, 0 ); i <= j; i += 1 ) {
			umax = max( abs( AFB[ offsetAFB + (( kd + i - j ) * strideAFB1) + (j * strideAFB2) ] ), umax );
		}
		if ( umax !== 0.0 ) {
			rpvgrw = min( amax / umax, rpvgrw );
		}
	}
	return rpvgrw;
}


// EXPORTS //

export default dla_gbrpvgrw;
