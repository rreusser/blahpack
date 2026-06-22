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

// MODULES //

import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var BS = 2.0;
var HALF = 0.5;
var TWO = 2.0;

// Machine constants (invariant — computed once at module load)
var OV = dlamch( 'overflow' );                  // overflow threshold (~1.798e+308)
var UN = dlamch( 'underflow' );                  // underflow threshold (~2.225e-308)
var EPS = dlamch( 'epsilon' );                 // machine epsilon (~1.110e-16)
var BE = BS / ( EPS * EPS );             // rescaling factor
var HALF_OV = HALF * OV;                 // half of overflow threshold
var SCALE_THRESH = UN * BS / EPS;        // underflow rescaling threshold


// FUNCTIONS //

/**
* Internal helper: DLADIV2.
*
* @private
* @param {number} a - a
* @param {number} b - b
* @param {number} c - c
* @param {number} d - d
* @param {number} r - r
* @param {number} t - t
* @returns {number} result
*/
function dladiv2( a, b, c, d, r, t ) {
	var br;
	if ( r !== 0.0 ) {
		br = b * r;
		if ( br !== 0.0 ) {
			return ( a + br ) * t;
		}
		return (a * t) + (( b * t ) * r);
	}
	return ( a + (d * ( b / c )) ) * t;
}

/**
* Internal helper: DLADIV1.
*
* @private
* @param {number} a - a
* @param {number} b - b
* @param {number} c - c
* @param {number} d - d
* @param {Float64Array} out - output array [p, q]
*/
function dladiv1( a, b, c, d, out ) {
	var r;
	var t;
	r = d / c;
	t = 1.0 / ( c + (d * r) );
	out[ 0 ] = dladiv2( a, b, c, d, r, t );
	out[ 1 ] = dladiv2( b, -a, c, d, r, t );
}


// MAIN //

/**
* Performs complex division in real arithmetic:.
*
* p + i_q = (a + i_b) / (c + i*d)
*
* The algorithm is due to Michael Baudin and Robert L. Smith.
*
* @private
* @param {number} a - real part of numerator
* @param {number} b - imaginary part of numerator
* @param {number} c - real part of denominator
* @param {number} d - imaginary part of denominator
* @param {Float64Array} out - output array: out[0]=p, out[1]=q
* @returns {Float64Array} out
*/
function dladiv( a, b, c, d, out ) {
	var aa;
	var bb;
	var cc;
	var dd;
	var ab;
	var cd;
	var s;

	aa = a;
	bb = b;
	cc = c;
	dd = d;
	ab = Math.max( Math.abs( a ), Math.abs( b ) );
	cd = Math.max( Math.abs( c ), Math.abs( d ) );
	s = 1.0;

	if ( ab >= HALF_OV ) {
		aa *= HALF;
		bb *= HALF;
		s *= TWO;
	}
	if ( cd >= HALF_OV ) {
		cc *= HALF;
		dd *= HALF;
		s *= HALF;
	}
	if ( ab <= SCALE_THRESH ) {
		aa *= BE;
		bb *= BE;
		s /= BE;
	}
	if ( cd <= SCALE_THRESH ) {
		cc *= BE;
		dd *= BE;
		s *= BE;
	}
	if ( Math.abs( dd ) <= Math.abs( cc ) ) {
		dladiv1( aa, bb, cc, dd, out );
	} else {
		dladiv1( bb, aa, dd, cc, out );
		out[ 1 ] = -out[ 1 ];
	}
	out[ 0 ] *= s;
	out[ 1 ] *= s;
	return out;
}


// EXPORTS //

export default dladiv;
