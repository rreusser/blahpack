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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// VARIABLES //

// LA_CONSTANTS for double precision:

// Dsafmin = 2^(-1022)

// Dsafmax = 1/dsafmin = 2^1022
var SAFMIN = 2.2250738585072014e-308;
var SAFMAX = 4.49423283715579e+307;
var RTMIN = Math.sqrt( SAFMIN );
var RTMAX_HALF = Math.sqrt( SAFMAX / 2.0 );
var RTMAX_QTR = Math.sqrt( SAFMAX / 4.0 );


// FUNCTIONS //

/**
* Compute |re|^2 + |im|^2.
*
* @private
* @param {number} re - real part
* @param {number} im - imaginary part
* @returns {number} sum of squares
*/
function abssq( re, im ) {
	return (re * re) + (im * im);
}


// MAIN //

/**
* Generates a plane rotation so that:.
*
* ```text
* [  C         S  ] . [ F ]  =  [ R ]
* [ -conjg(S)  C  ]   [ G ]     [ 0 ]
* ```
*
* where C is real and `C**2 + |S|**2 = 1`.
*
* F and G are unchanged on return.
*
* @private
* @param {Complex128Array} f - first component (input only)
* @param {NonNegativeInteger} offsetF - index offset for `f` (in complex elements)
* @param {Complex128Array} g - second component (input only)
* @param {NonNegativeInteger} offsetG - index offset for `g` (in complex elements)
* @param {Float64Array} c - on exit, the real cosine of the rotation
* @param {NonNegativeInteger} offsetC - index offset for `c`
* @param {Complex128Array} s - on exit, the complex sine of the rotation
* @param {NonNegativeInteger} offsetS - index offset for `s` (in complex elements)
* @param {Complex128Array} r - on exit, the complex result
* @param {NonNegativeInteger} offsetR - index offset for `r` (in complex elements)
* @returns {void}
*/
function zlartg( f, offsetF, g, offsetG, c, offsetC, s, offsetS, r, offsetR ) {
	var Fv;
	var Gv;
	var Sv;
	var Rv;
	var oF;
	var oG;
	var oS;
	var oR;
	var fsr;
	var fsi;
	var gsr;
	var gsi;
	var fr;
	var fi;
	var gr;
	var gi;
	var f1;
	var f2;
	var g1;
	var g2;
	var h2;
	var sr;
	var si;
	var rr;
	var ri;
	var t0;
	var t1;
	var t2;
	var cc;
	var d;
	var u;
	var v;
	var w;

	// Reinterpret Complex128Array as Float64Array
	Fv = reinterpret( f, 0 );
	oF = offsetF * 2;
	Gv = reinterpret( g, 0 );
	oG = offsetG * 2;
	Sv = reinterpret( s, 0 );
	oS = offsetS * 2;
	Rv = reinterpret( r, 0 );
	oR = offsetR * 2;

	fr = Fv[ oF ];
	fi = Fv[ oF + 1 ];
	gr = Gv[ oG ];
	gi = Gv[ oG + 1 ];

	// g == 0
	if ( gr === 0.0 && gi === 0.0 ) {
		c[ offsetC ] = 1.0;
		Sv[ oS ] = 0.0;
		Sv[ oS + 1 ] = 0.0;
		Rv[ oR ] = fr;
		Rv[ oR + 1 ] = fi;
		return;
	}

	// f == 0
	if ( fr === 0.0 && fi === 0.0 ) {
		cc = 0.0;
		if ( gr === 0.0 ) {
			// g is purely imaginary
			d = Math.abs( gi );
			rr = d;
			ri = 0.0;
			sr = gr / d;
			si = -(gi / d);
		} else if ( gi === 0.0 ) {
			// g is purely real
			d = Math.abs( gr );
			rr = d;
			ri = 0.0;
			sr = gr / d;
			si = -(gi / d);
		} else {
			// g is general complex
			g1 = Math.max( Math.abs( gr ), Math.abs( gi ) );
			if ( g1 > RTMIN && g1 < RTMAX_HALF ) {
				// Unscaled
				g2 = abssq( gr, gi );
				d = Math.sqrt( g2 );
				sr = gr / d;
				si = -(gi / d);
				rr = d;
				ri = 0.0;
			} else {
				// Scaled
				u = Math.min( SAFMAX, Math.max( SAFMIN, g1 ) );
				gsr = gr / u;
				gsi = gi / u;
				g2 = abssq( gsr, gsi );
				d = Math.sqrt( g2 );
				sr = gsr / d;
				si = -(gsi / d);
				rr = d * u;
				ri = 0.0;
			}
		}
		c[ offsetC ] = cc;
		Sv[ oS ] = sr;
		Sv[ oS + 1 ] = si;
		Rv[ oR ] = rr;
		Rv[ oR + 1 ] = ri;
		return;
	}

	// General case: both f and g are nonzero
	f1 = Math.max( Math.abs( fr ), Math.abs( fi ) );
	g1 = Math.max( Math.abs( gr ), Math.abs( gi ) );

	if ( f1 > RTMIN && f1 < RTMAX_QTR && g1 > RTMIN && g1 < RTMAX_QTR ) {
		// Unscaled algorithm
		f2 = abssq( fr, fi );
		g2 = abssq( gr, gi );
		h2 = f2 + g2;

		if ( f2 >= h2 * SAFMIN ) {
			cc = Math.sqrt( f2 / h2 );
			rr = fr / cc;
			ri = fi / cc;
			if ( f2 > RTMIN && h2 < RTMAX_QTR * 2.0 ) {
				t0 = Math.sqrt( f2 * h2 );

				// S = conjg(g) * (f / sqrt(f2*h2))
				t1 = fr / t0;
				t2 = fi / t0;

				// conjg(g) = (gr, -gi), multiply by (t1, t2):
				sr = (gr * t1) + (gi * t2);
				si = (gr * t2) - (gi * t1);
			} else {
				// S = conjg(g) * (r / h2)
				t0 = rr / h2;
				t1 = ri / h2;
				sr = (gr * t0) + (gi * t1);
				si = (gr * t1) - (gi * t0);
			}
		} else {
			d = Math.sqrt( f2 * h2 );
			cc = f2 / d;
			if ( cc >= SAFMIN ) {
				rr = fr / cc;
				ri = fi / cc;
			} else {
				t0 = h2 / d;
				rr = fr * t0;
				ri = fi * t0;
			}
			// S = conjg(g) * (f / d)
			t0 = fr / d;
			t1 = fi / d;
			sr = (gr * t0) + (gi * t1);
			si = (gr * t1) - (gi * t0);
		}
	} else {
		// Scaled algorithm
		u = Math.min( SAFMAX, Math.max( SAFMIN, f1, g1 ) );
		gsr = gr / u;
		gsi = gi / u;
		g2 = abssq( gsr, gsi );

		if ( f1 / u < RTMIN ) {
			// f is not well-scaled when scaled by u.
			// Use a different scaling for f.
			v = Math.min( SAFMAX, Math.max( SAFMIN, f1 ) );
			w = v / u;
			fsr = fr / v;
			fsi = fi / v;
			f2 = abssq( fsr, fsi );
			h2 = (f2 * (w * w)) + g2;
		} else {
			// Use the same scaling for f and g.
			w = 1.0;
			fsr = fr / u;
			fsi = fi / u;
			f2 = abssq( fsr, fsi );
			h2 = f2 + g2;
		}

		if ( f2 >= h2 * SAFMIN ) {
			cc = Math.sqrt( f2 / h2 );
			rr = fsr / cc;
			ri = fsi / cc;
			if ( f2 > RTMIN && h2 < RTMAX_QTR * 2.0 ) {
				t0 = Math.sqrt( f2 * h2 );
				t1 = fsr / t0;
				t2 = fsi / t0;
				sr = (gsr * t1) + (gsi * t2);
				si = (gsr * t2) - (gsi * t1);
			} else {
				t0 = rr / h2;
				t1 = ri / h2;
				sr = (gsr * t0) + (gsi * t1);
				si = (gsr * t1) - (gsi * t0);
			}
		} else {
			d = Math.sqrt( f2 * h2 );
			cc = f2 / d;
			if ( cc >= SAFMIN ) {
				rr = fsr / cc;
				ri = fsi / cc;
			} else {
				t0 = h2 / d;
				rr = fsr * t0;
				ri = fsi * t0;
			}
			t0 = fsr / d;
			t1 = fsi / d;
			sr = (gsr * t0) + (gsi * t1);
			si = (gsr * t1) - (gsi * t0);
		}
		// Rescale c and r
		cc *= w;
		rr *= u;
		ri *= u;
	}

	c[ offsetC ] = cc;
	Sv[ oS ] = sr;
	Sv[ oS + 1 ] = si;
	Rv[ oR ] = rr;
	Rv[ oR + 1 ] = ri;
}


// EXPORTS //

export default zlartg;
