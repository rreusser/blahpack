/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
* Computes the singular values of a 2-by-2 triangular matrix:.
*
* \[ F  G \]
* \[ 0  H \]
*
* On return, `out[0]` is the smaller singular value (SSMIN) and `out[1]` is the
* larger singular value (SSMAX).
*
* The algorithm is numerically stable, avoiding overflow and unnecessary
* underflow by carefully ordering the arithmetic.
*
* @private
* @param {number} f - the (1,1) element of the 2-by-2 matrix
* @param {number} g - the (1,2) element of the 2-by-2 matrix
* @param {number} h - the (2,2) element of the 2-by-2 matrix
* @param {Float64Array} out - output array: out[0]=ssmin, out[1]=ssmax
* @returns {Float64Array} out
*/
function dlas2( f, g, h, out ) {
	var fhmn;
	var fhmx;
	var fa;
	var ga;
	var ha;
	var as;
	var at;
	var au;
	var c;

	fa = Math.abs( f );
	ga = Math.abs( g );
	ha = Math.abs( h );
	fhmn = Math.min( fa, ha );
	fhmx = Math.max( fa, ha );

	if ( fhmn === 0.0 ) {
		out[ 0 ] = 0.0;
		if ( fhmx === 0.0 ) {
			out[ 1 ] = ga;
		} else {
			out[ 1 ] = Math.max( fhmx, ga ) * Math.sqrt( 1.0 + (( Math.min( fhmx, ga ) / Math.max( fhmx, ga ) ) * ( Math.min( fhmx, ga ) / Math.max( fhmx, ga ) )) );
		}
	} else if ( ga < fhmx ) {
		as = 1.0 + (fhmn / fhmx);
		at = ( fhmx - fhmn ) / fhmx;
		au = ( ga / fhmx ) * ( ga / fhmx );
		c = 2.0 / ( Math.sqrt( (as * as) + au ) + Math.sqrt( (at * at) + au ) );
		out[ 0 ] = fhmn * c;
		out[ 1 ] = fhmx / c;
	} else {
		au = fhmx / ga;
		if ( au === 0.0 ) {
			// Avoid possible harmful underflow if exponent range
			// Asymmetric (true SSMIN may not underflow even if AU underflows)
			out[ 0 ] = ( fhmn * fhmx ) / ga;
			out[ 1 ] = ga;
		} else {
			as = 1.0 + (fhmn / fhmx);
			at = ( fhmx - fhmn ) / fhmx;
			c = 1.0 / ( Math.sqrt( 1.0 + (( as * au ) * ( as * au )) ) + Math.sqrt( 1.0 + (( at * au ) * ( at * au )) ) );
			out[ 0 ] = ( fhmn * c ) * au;
			out[ 0 ] += out[ 0 ];
			out[ 1 ] = ga / ( c + c );
		}
	}
	return out;
}


// EXPORTS //

export default dlas2;
