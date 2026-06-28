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

// VARIABLES //

// LA_CONSTANTS for double precision:

// Dsafmin = 2^(-1022)

// Dsafmax = 1/dsafmin = 2^1022
var SAFMIN = 2.2250738585072014e-308;
var SAFMAX = 4.49423283715579e+307;
var RTMIN = Math.sqrt( SAFMIN );
var RTMAX = Math.sqrt( SAFMAX / 2.0 );


// MAIN //

/**
* Generates a plane rotation so that:.
*
* \[  c  s \] . \[ f \] = \[ r \]
* \[ -s  c \]   \[ g \]   \[ 0 \]
*
* where c^2 + s^2 = 1.
*
* ## Notes
*
* -   The mathematical formulas used are:
*     -   r = sign(f) * sqrt(f^2 + g^2)
*     -   c = f / r
*     -   s = g / r
*
*     Hence c >= 0.
*
* -   The algorithm incorporates scaling to avoid overflow or underflow.
*
* -   If g = 0, then c = 1 and s = 0.
*
* -   If f = 0 and g != 0, then c = 0 and s = sign(1, g).
*
* @private
* @param {number} f - first component of the vector to be rotated
* @param {number} g - second component of the vector to be rotated
* @param {Float64Array} out - output: out[0]=c, out[1]=s, out[2]=r
* @returns {Float64Array} out
*/
function dlartg( f, g, out ) {
	var f1;
	var g1;
	var fs;
	var gs;
	var d;
	var u;

	f1 = Math.abs( f );
	g1 = Math.abs( g );

	if ( g === 0.0 ) {
		out[ 0 ] = 1.0;
		out[ 1 ] = 0.0;
		out[ 2 ] = f;
	} else if ( f === 0.0 ) {
		out[ 0 ] = 0.0;
		out[ 1 ] = ( g > 0.0 ) ? 1.0 : -1.0;
		out[ 2 ] = g1;
	} else if ( f1 > RTMIN && f1 < RTMAX && g1 > RTMIN && g1 < RTMAX ) {
		d = Math.sqrt( (f * f) + (g * g) );
		out[ 0 ] = f1 / d;
		out[ 2 ] = ( f > 0.0 ) ? d : -d;
		out[ 1 ] = g / out[ 2 ];
	} else {
		u = Math.min( SAFMAX, Math.max( SAFMIN, f1, g1 ) );
		fs = f / u;
		gs = g / u;
		d = Math.sqrt( (fs * fs) + (gs * gs) );
		out[ 0 ] = Math.abs( fs ) / d;
		out[ 2 ] = ( f > 0.0 ) ? d * u : -(d * u);
		out[ 1 ] = gs / ( ( f > 0.0 ) ? d : -d );
	}
	return out;
}


// EXPORTS //

export default dlartg;
