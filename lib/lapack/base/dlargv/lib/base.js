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

// MAIN //

/**
* Generates a vector of real plane rotations (Givens rotations).
*
* For `i = 0, 1, ..., N-1`:
*
* ```text
*   (  c(i)  s(i) ) ( x(i) ) = ( a(i) )
*   ( -s(i)  c(i) ) ( y(i) ) = (   0  )
* ```
*
* On exit, `x` is overwritten by `a`, `y` is overwritten by the sines,
* and `c` receives the cosines of the plane rotations.
*
* @private
* @param {NonNegativeInteger} N - number of plane rotations to generate
* @param {Float64Array} x - input/output vector x
* @param {integer} strideX - stride for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} y - input/output vector y
* @param {integer} strideY - stride for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {Float64Array} c - output vector for cosines
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @returns {void}
*/
function dlargv( N, x, strideX, offsetX, y, strideY, offsetY, c, strideC, offsetC ) { // eslint-disable-line max-len, max-params
	var tt;
	var ix;
	var iy;
	var ic;
	var f;
	var g;
	var t;
	var i;

	ix = offsetX;
	iy = offsetY;
	ic = offsetC;
	for ( i = 0; i < N; i += 1 ) {
		f = x[ ix ];
		g = y[ iy ];
		if ( g === 0.0 ) {
			c[ ic ] = 1.0;
		} else if ( f === 0.0 ) {
			c[ ic ] = 0.0;
			y[ iy ] = 1.0;
			x[ ix ] = g;
		} else if ( Math.abs( f ) > Math.abs( g ) ) {
			t = g / f;
			tt = Math.sqrt( 1.0 + ( t * t ) );
			c[ ic ] = 1.0 / tt;
			y[ iy ] = t * c[ ic ];
			x[ ix ] = f * tt;
		} else {
			t = f / g;
			tt = Math.sqrt( 1.0 + ( t * t ) );
			y[ iy ] = 1.0 / tt;
			c[ ic ] = t * y[ iy ];
			x[ ix ] = g * tt;
		}
		ic += strideC;
		iy += strideY;
		ix += strideX;
	}
}


// EXPORTS //

export default dlargv;
