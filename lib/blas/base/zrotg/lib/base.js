/* eslint-disable max-len, max-statements, max-depth */

// MODULES //

import FLOAT64_SMALLEST_NORMAL from '@stdlib/constants/float64/smallest-normal/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// VARIABLES //

var SAFMIN = FLOAT64_SMALLEST_NORMAL; // 2^(-1022) ~ 2.225e-308
var SAFMAX = 1.0 / SAFMIN;           // 2^1022 ~ 4.494e+307
var RTMIN = Math.sqrt( SAFMIN );      // 2^(-511) ~ 1.491e-154


// FUNCTIONS //

/**
* Returns `re*re + im*im` without complex abs overhead.
*
* @private
* @param {number} re - real part
* @param {number} im - imaginary part
* @returns {number} sum of squares
*/
function abssq( re, im ) {
	return ( re * re ) + ( im * im );
}


// MAIN //

/**
* Constructs a Givens plane rotation with real cosine and complex sine.
*
* The rotation is defined such that:
*
* ```text
* [  c         s ] [ a ] = [ r ]
* [ -conjg(s)  c ] [ b ]   [ 0 ]
* ```
*
* where `c` is real, `s` is complex, and `c**2 + conjg(s)*s = 1`.
*
* Based on Anderson E. (2017), Algorithm 978: Safe Scaling in the Level 1
* BLAS, ACM Trans Math Softw 44:1-28.
*
* @private
* @param {Complex128Array} a - on entry, complex scalar `a`; on exit, overwritten with `r`
* @param {NonNegativeInteger} offsetA - index offset for `a` (in complex elements)
* @param {Complex128Array} b - complex scalar `b` (input only)
* @param {NonNegativeInteger} offsetB - index offset for `b` (in complex elements)
* @param {Float64Array} c - on exit, the real cosine of the rotation
* @param {NonNegativeInteger} offsetC - index offset for `c`
* @param {Complex128Array} s - on exit, the complex sine of the rotation
* @param {NonNegativeInteger} offsetS - index offset for `s` (in complex elements)
* @returns {void}
*/
function zrotg( a, offsetA, b, offsetB, c, offsetC, s, offsetS ) {
	var rtmax;
	var fsRe;
	var fsIm;
	var gsRe;
	var gsIm;
	var fRe;
	var fIm;
	var gRe;
	var gIm;
	var Av;
	var Bv;
	var Sv;
	var oA;
	var oB;
	var oS;
	var f1;
	var f2;
	var g1;
	var g2;
	var h2;
	var cc;
	var d;
	var u;
	var v;
	var w;

	// Reinterpret Complex128Array as Float64Array
	Av = reinterpret( a, 0 );
	oA = offsetA * 2;
	Bv = reinterpret( b, 0 );
	oB = offsetB * 2;
	Sv = reinterpret( s, 0 );
	oS = offsetS * 2;

	fRe = Av[ oA ];
	fIm = Av[ oA + 1 ];
	gRe = Bv[ oB ];
	gIm = Bv[ oB + 1 ];

	// Case 1: g == 0
	if ( gRe === 0.0 && gIm === 0.0 ) {
		c[ offsetC ] = 1.0;
		Sv[ oS ] = 0.0;
		Sv[ oS + 1 ] = 0.0;

		// R = f (a already contains f)
		return;
	}

	// Case 2: f == 0
	if ( fRe === 0.0 && fIm === 0.0 ) {
		c[ offsetC ] = 0.0;

		if ( gIm === 0.0 ) {
			// G is pure real
			d = Math.abs( gRe );
			Sv[ oS ] = gRe / d;
			Sv[ oS + 1 ] = 0.0;
		} else if ( gRe === 0.0 ) {
			// G is pure imaginary
			d = Math.abs( gIm );
			Sv[ oS ] = 0.0;
			Sv[ oS + 1 ] = -gIm / d;
		} else {
			g1 = Math.max( Math.abs( gRe ), Math.abs( gIm ) );
			rtmax = Math.sqrt( SAFMAX / 2.0 );

			if ( g1 > RTMIN && g1 < rtmax ) {
				// Unscaled
				g2 = abssq( gRe, gIm );
				d = Math.sqrt( g2 );
				Sv[ oS ] = gRe / d;
				Sv[ oS + 1 ] = -gIm / d;
			} else {
				// Scaled
				u = Math.min( SAFMAX, Math.max( SAFMIN, g1 ) );
				gsRe = gRe / u;
				gsIm = gIm / u;
				g2 = abssq( gsRe, gsIm );
				d = Math.sqrt( g2 );
				Sv[ oS ] = gsRe / d;
				Sv[ oS + 1 ] = -gsIm / d;
				d *= u;
			}
		}
		Av[ oA ] = d;
		Av[ oA + 1 ] = 0.0;
		return;
	}

	// Case 3: both f and g are nonzero
	f1 = Math.max( Math.abs( fRe ), Math.abs( fIm ) );
	g1 = Math.max( Math.abs( gRe ), Math.abs( gIm ) );
	rtmax = Math.sqrt( SAFMAX / 4.0 );

	if ( f1 > RTMIN && f1 < rtmax && g1 > RTMIN && g1 < rtmax ) {
		// Unscaled algorithm
		f2 = abssq( fRe, fIm );
		g2 = abssq( gRe, gIm );
		h2 = f2 + g2;

		if ( f2 >= h2 * SAFMIN ) {
			cc = Math.sqrt( f2 / h2 );
			fRe /= cc;
			fIm /= cc;
			rtmax *= 2.0;

			if ( f2 > RTMIN && h2 < rtmax ) {
				d = Math.sqrt( f2 * h2 );

				// S = conj(g) * (f / sqrt(f2*h2))
				Sv[ oS ] = ( (gRe * Av[ oA ]) + (gIm * Av[ oA + 1 ]) ) / d;
				Sv[ oS + 1 ] = ( (-gIm * Av[ oA ]) + (gRe * Av[ oA + 1 ]) ) / d;
			} else {
				// S = conj(g) * (r / h2)
				Sv[ oS ] = ( (gRe * fRe) + (gIm * fIm) ) / h2;
				Sv[ oS + 1 ] = ( (-gIm * fRe) + (gRe * fIm) ) / h2;
			}
		} else {
			d = Math.sqrt( f2 * h2 );
			cc = f2 / d;

			if ( cc >= SAFMIN ) {
				fRe = Av[ oA ] / cc;
				fIm = Av[ oA + 1 ] / cc;
			} else {
				fRe = Av[ oA ] * ( h2 / d );
				fIm = Av[ oA + 1 ] * ( h2 / d );
			}
			// S = conj(g) * (f / d) — using original f
			Sv[ oS ] = ( (gRe * Av[ oA ]) + (gIm * Av[ oA + 1 ]) ) / d;
			Sv[ oS + 1 ] = ( (-gIm * Av[ oA ]) + (gRe * Av[ oA + 1 ]) ) / d;
		}
		c[ offsetC ] = cc;
		Av[ oA ] = fRe;
		Av[ oA + 1 ] = fIm;
	} else {
		// Scaled algorithm
		u = Math.min( SAFMAX, Math.max( SAFMIN, f1, g1 ) );
		gsRe = gRe / u;
		gsIm = gIm / u;
		g2 = abssq( gsRe, gsIm );

		if ( f1 / u < RTMIN ) {
			// F is not well-scaled by u; use separate scaling
			v = Math.min( SAFMAX, Math.max( SAFMIN, f1 ) );
			w = v / u;
			fsRe = fRe / v;
			fsIm = fIm / v;
			f2 = abssq( fsRe, fsIm );
			h2 = ( f2 * w * w ) + g2;
		} else {
			// Same scaling for f and g
			w = 1.0;
			fsRe = fRe / u;
			fsIm = fIm / u;
			f2 = abssq( fsRe, fsIm );
			h2 = f2 + g2;
		}

		if ( f2 >= h2 * SAFMIN ) {
			cc = Math.sqrt( f2 / h2 );
			fRe = fsRe / cc;
			fIm = fsIm / cc;
			rtmax *= 2.0;

			if ( f2 > RTMIN && h2 < rtmax ) {
				d = Math.sqrt( f2 * h2 );
				Sv[ oS ] = ( (gsRe * fsRe) + (gsIm * fsIm) ) / d;
				Sv[ oS + 1 ] = ( (-gsIm * fsRe) + (gsRe * fsIm) ) / d;
			} else {
				Sv[ oS ] = ( (gsRe * fRe) + (gsIm * fIm) ) / h2;
				Sv[ oS + 1 ] = ( (-gsIm * fRe) + (gsRe * fIm) ) / h2;
			}
		} else {
			d = Math.sqrt( f2 * h2 );
			cc = f2 / d;

			if ( cc >= SAFMIN ) {
				fRe = fsRe / cc;
				fIm = fsIm / cc;
			} else {
				fRe = fsRe * ( h2 / d );
				fIm = fsIm * ( h2 / d );
			}
			Sv[ oS ] = ( (gsRe * fsRe) + (gsIm * fsIm) ) / d;
			Sv[ oS + 1 ] = ( (-gsIm * fsRe) + (gsRe * fsIm) ) / d;
		}
		// Rescale c and r
		c[ offsetC ] = cc * w;
		Av[ oA ] = fRe * u;
		Av[ oA + 1 ] = fIm * u;
	}
}


// EXPORTS //

export default zrotg;
