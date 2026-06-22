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

/* eslint-disable camelcase */

// MAIN //

/**
* Adds a vector W into a doubled-single accumulation vector (X, Y).
*
* The doubled-single representation stores the high-order part in X and
* the low-order part in Y such that `X[i] + Y[i]` approximates the true
* accumulated value with extra precision.
*
* @private
* @param {NonNegativeInteger} N - length of vectors X, Y, and W
* @param {Float64Array} x - first part of the doubled-single accumulation vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} y - second part of the doubled-single accumulation vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {Float64Array} w - vector to be added
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @returns {void}
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var y = new Float64Array( [ 0.1, 0.2, 0.3 ] );
* var w = new Float64Array( [ 10.0, 20.0, 30.0 ] );
*
* dla_wwaddw( 3, x, 1, 0, y, 1, 0, w, 1, 0 );
*/
function dla_wwaddw( N, x, strideX, offsetX, y, strideY, offsetY, w, strideW, offsetW ) { // eslint-disable-line max-len, max-params
	var ix;
	var iy;
	var iw;
	var s;
	var i;

	ix = offsetX;
	iy = offsetY;
	iw = offsetW;
	for ( i = 0; i < N; i += 1 ) {
		s = x[ ix ] + w[ iw ];

		// s = (s + s) - s: Rounding step to extract the high-order part
		s = ( s + s ) - s;
		y[ iy ] = ( ( x[ ix ] - s ) + w[ iw ] ) + y[ iy ];
		x[ ix ] = s;
		ix += strideX;
		iy += strideY;
		iw += strideW;
	}
}


// EXPORTS //

export default dla_wwaddw;
