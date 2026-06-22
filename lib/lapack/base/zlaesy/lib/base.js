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

/* eslint-disable max-len, max-statements, camelcase */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// VARIABLES //

var THRESH = 0.1;
var SCRATCH = new Float64Array( 2 );


// FUNCTIONS //

/**
* Compute complex modulus: `|re + im*i|`.
*
* @private
* @param {number} re - real part
* @param {number} im - imaginary part
* @returns {number} absolute value
*/
function cabs( re, im ) {
	return Math.sqrt( (re * re) + (im * im) );
}

/**
* Complex square root: `out = sqrt(re + im*i)`.
*
* Uses the principal branch.
*
* @private
* @param {number} re - real part
* @param {number} im - imaginary part
* @param {Float64Array} out - output array `[re, im]`
* @returns {void}
*/
function csqrt( re, im, out ) {
	var r;
	var t;
	if ( re === 0.0 && im === 0.0 ) {
		out[ 0 ] = 0.0;
		out[ 1 ] = 0.0;
		return;
	}
	if ( im === 0.0 ) {
		if ( re >= 0.0 ) {
			out[ 0 ] = Math.sqrt( re );
			out[ 1 ] = 0.0;
		} else {
			out[ 0 ] = 0.0;
			out[ 1 ] = Math.sqrt( -re );
		}
		return;
	}
	r = Math.sqrt( (re * re) + (im * im) );
	t = Math.sqrt( ( Math.abs( re ) + r ) / 2.0 );
	if ( re >= 0.0 ) {
		out[ 0 ] = t;
		out[ 1 ] = im / ( 2.0 * t );
	} else {
		out[ 0 ] = Math.abs( im ) / ( 2.0 * t );
		out[ 1 ] = ( im >= 0.0 ) ? t : -t;
	}
}

/**
* Complex division: `out = (ar + ai*i) / (br + bi*i)`.
*
* Uses Smith's formula for numerical stability.
*
* @private
* @param {number} ar - real part of numerator
* @param {number} ai - imaginary part of numerator
* @param {number} br - real part of denominator
* @param {number} bi - imaginary part of denominator
* @param {Float64Array} out - output array `[re, im]`
* @returns {void}
*/
function cdiv( ar, ai, br, bi, out ) {
	var r;
	var d;
	if ( Math.abs( bi ) <= Math.abs( br ) ) {
		r = bi / br;
		d = br + (bi * r);
		out[ 0 ] = ( ar + (ai * r) ) / d;
		out[ 1 ] = ( ai - (ar * r) ) / d;
	} else {
		r = br / bi;
		d = bi + (br * r);
		out[ 0 ] = ( (ar * r) + ai ) / d;
		out[ 1 ] = ( (ai * r) - ar ) / d;
	}
}


// MAIN //

/**
* Compute the eigenvalues and eigenvectors of a 2-by-2 complex symmetric matrix.
*
* The matrix is `((A, B); (B, C))`. RT1 is the eigenvalue of larger absolute
* value, RT2 of smaller absolute value. If the eigenvectors are computed, then
* `(CS1, SN1)` is the unit eigenvector for RT1, and EVSCAL is the scaling
* factor applied to make the eigenvector matrix orthonormal.
*
* If EVSCAL is zero, the eigenvectors were not computed (the norm of the
* eigenvector matrix was below the threshold or the matrix could not be
* diagonalized).
*
* @private
* @param {Complex128} a - the (1,1) element of the input matrix
* @param {Complex128} b - the (1,2) and (2,1) element of the input matrix
* @param {Complex128} c - the (2,2) element of the input matrix
* @returns {Object} object with fields `rt1r`, `rt1i`, `rt2r`, `rt2i`, `evscalr`, `evscali`, `cs1r`, `cs1i`, `sn1r`, `sn1i`
*/
function zlaesy( a, b, c ) {
	var invTabs;
	var evscalr;
	var evscali;
	var evnorm;
	var sn1sqr;
	var sn1sqi;
	var sn1sr;
	var sn1si;
	var cs1r;
	var cs1i;
	var sn1r;
	var sn1i;
	var rt1r;
	var rt1i;
	var rt2r;
	var rt2i;
	var babs;
	var tabs;
	var tmpr;
	var tmpi;
	var sumr;
	var sumi;
	var ss2r;
	var ss2i;
	var tz2r;
	var tz2i;
	var bz2r;
	var bz2i;
	var tzr;
	var tzi;
	var bzr;
	var bzi;
	var ar;
	var ai;
	var br;
	var bi;
	var cr;
	var ci;
	var sr;
	var si;
	var tr;
	var ti;
	var z;

	ar = real( a );
	ai = imag( a );
	br = real( b );
	bi = imag( b );
	cr = real( c );
	ci = imag( c );

	// Special case: the matrix is actually diagonal.

	// To avoid divide by zero later, we treat this case separately.
	if ( cabs( br, bi ) === 0.0 ) {
		rt1r = ar;
		rt1i = ai;
		rt2r = cr;
		rt2i = ci;
		if ( cabs( rt1r, rt1i ) < cabs( rt2r, rt2i ) ) {
			// Swap RT1 and RT2
			tmpr = rt1r;
			tmpi = rt1i;
			rt1r = rt2r;
			rt1i = rt2i;
			rt2r = tmpr;
			rt2i = tmpi;
			cs1r = 0.0;
			cs1i = 0.0;
			sn1r = 1.0;
			sn1i = 0.0;
		} else {
			cs1r = 1.0;
			cs1i = 0.0;
			sn1r = 0.0;
			sn1i = 0.0;
		}
		evscalr = 0.0;
		evscali = 0.0;
	} else {
		// Compute the eigenvalues and eigenvectors.
		// The characteristic equation is:
		//   lambda^2 - (A+C)*lambda + (A*C - B*B)
		// We solve it using the quadratic formula.

		// S = (A + C) * 0.5
		sr = ( ar + cr ) * 0.5;
		si = ( ai + ci ) * 0.5;

		// T = (A - C) * 0.5
		tr = ( ar - cr ) * 0.5;
		ti = ( ai - ci ) * 0.5;

		// Take the square root carefully to avoid over/under flow.
		babs = cabs( br, bi );
		tabs = cabs( tr, ti );
		z = Math.max( babs, tabs );
		if ( z > 0.0 ) {
			// T = Z * SQRT( (T/Z)**2 + (B/Z)**2 )

			// T/Z is complex / real (safe to inline)
			tzr = tr / z;
			tzi = ti / z;

			// B/Z is complex / real (safe to inline)
			bzr = br / z;
			bzi = bi / z;

			// (T/Z)**2 = (tzr + tzi*i)^2 = (tzr^2 - tzi^2) + 2*tzr*tzi*i
			tz2r = (tzr * tzr) - (tzi * tzi);
			tz2i = 2.0 * tzr * tzi;

			// (B/Z)**2 = (bzr + bzi*i)^2 = (bzr^2 - bzi^2) + 2*bzr*bzi*i
			bz2r = (bzr * bzr) - (bzi * bzi);
			bz2i = 2.0 * bzr * bzi;

			// Sum = (T/Z)**2 + (B/Z)**2
			sumr = tz2r + bz2r;
			sumi = tz2i + bz2i;

			// T = Z * sqrt(sum)
			csqrt( sumr, sumi, SCRATCH );
			tr = z * SCRATCH[ 0 ];
			ti = z * SCRATCH[ 1 ];
		}

		// Compute the two eigenvalues: RT1 = S + T, RT2 = S - T
		rt1r = sr + tr;
		rt1i = si + ti;
		rt2r = sr - tr;
		rt2i = si - ti;

		// Exchange if necessary so RT1 has greater magnitude
		if ( cabs( rt1r, rt1i ) < cabs( rt2r, rt2i ) ) {
			tmpr = rt1r;
			tmpi = rt1i;
			rt1r = rt2r;
			rt1i = rt2i;
			rt2r = tmpr;
			rt2i = tmpi;
		}

		// SN1 = (RT1 - A) / B (complex division)
		cdiv( rt1r - ar, rt1i - ai, br, bi, SCRATCH );
		sn1r = SCRATCH[ 0 ];
		sn1i = SCRATCH[ 1 ];

		// Compute T = SQRT(CONE + SN1*SN1) for eigenvector normalization
		tabs = cabs( sn1r, sn1i );
		if ( tabs > 1.0 ) {
			// T = TABS * SQRT( (1/TABS)**2 + (SN1/TABS)**2 )
			// Overflow-safe: scale by 1/TABS before squaring
			invTabs = 1.0 / tabs;
			sn1sr = sn1r / tabs;
			sn1si = sn1i / tabs;

			// (SN1/TABS)**2 = (sn1sr + sn1si*i)^2
			ss2r = (sn1sr * sn1sr) - (sn1si * sn1si);
			ss2i = 2.0 * sn1sr * sn1si;

			// Sum = (1/TABS)**2 + (SN1/TABS)**2
			csqrt( (invTabs * invTabs) + ss2r, ss2i, SCRATCH );
			tr = tabs * SCRATCH[ 0 ];
			ti = tabs * SCRATCH[ 1 ];
		} else {
			// T = SQRT(CONE + SN1*SN1)

			// SN1*SN1 = (sn1r + sn1i*i)^2
			sn1sqr = (sn1r * sn1r) - (sn1i * sn1i);
			sn1sqi = 2.0 * sn1r * sn1i;

			// CONE + SN1*SN1 = (1 + sn1sqr) + sn1sqi*i
			csqrt( 1.0 + sn1sqr, sn1sqi, SCRATCH );
			tr = SCRATCH[ 0 ];
			ti = SCRATCH[ 1 ];
		}

		evnorm = cabs( tr, ti );
		if ( evnorm >= THRESH ) {
			// EVSCAL = CONE / T (complex division)
			cdiv( 1.0, 0.0, tr, ti, SCRATCH );
			evscalr = SCRATCH[ 0 ];
			evscali = SCRATCH[ 1 ];

			// CS1 = EVSCAL
			cs1r = evscalr;
			cs1i = evscali;

			// SN1 = SN1 * EVSCAL (complex multiply, safe to inline)
			tmpr = (sn1r * evscalr) - (sn1i * evscali);
			tmpi = (sn1r * evscali) + (sn1i * evscalr);
			sn1r = tmpr;
			sn1i = tmpi;
		} else {
			evscalr = 0.0;
			evscali = 0.0;
			cs1r = 0.0;
			cs1i = 0.0;
			sn1r = 0.0;
			sn1i = 0.0;
		}
	}

	return {
		'rt1r': rt1r,
		'rt1i': rt1i,
		'rt2r': rt2r,
		'rt2i': rt2i,
		'evscalr': evscalr,
		'evscali': evscali,
		'cs1r': cs1r,
		'cs1i': cs1i,
		'sn1r': sn1r,
		'sn1i': sn1i
	};
}


// EXPORTS //

export default zlaesy;
