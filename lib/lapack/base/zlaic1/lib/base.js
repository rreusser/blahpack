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

/* eslint-disable max-depth, max-statements, max-len, max-params, max-lines-per-function */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import sqrt from '@stdlib/math/base/special/sqrt/lib/index.js';
import abs from '@stdlib/math/base/special/abs/lib/index.js';
import max from '@stdlib/math/base/special/max/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var TWO = 2.0;
var HALF = 0.5;
var FOUR = 4.0;
var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Applies one step of incremental condition estimation for complex matrices.
*
* @private
* @param {string} job - specifies whether to estimate the largest or smallest singular value (`largest-singular-value` or `smallest-singular-value`)
* @param {NonNegativeInteger} j - length of X and W
* @param {Complex128Array} x - input vector x
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {number} sest - estimated singular value of L
* @param {Complex128Array} w - input vector w
* @param {integer} strideW - stride for `w` (in complex elements)
* @param {NonNegativeInteger} offsetW - starting index for `w` (in complex elements)
* @param {Complex128} gamma - diagonal element gamma
* @param {Float64Array} sestpr - output: `sestpr[0]` receives the updated singular value estimate
* @param {Float64Array} s - output: `s[0]` and `s[1]` receive the real and imaginary parts of sine
* @param {Float64Array} c - output: `c[0]` and `c[1]` receive the real and imaginary parts of cosine
*/
function zlaic1( job, j, x, strideX, offsetX, sest, w, strideW, offsetW, gamma, sestpr, s, c ) {
	var cosineR;
	var cosineI;
	var absest;
	var absalp;
	var absgam;
	var alphaR;
	var alphaI;
	var gammaR;
	var gammaI;
	var sineR;
	var sineI;
	var alpha;
	var norma;
	var zeta1;
	var zeta2;
	var test;
	var tmp;
	var scl;
	var cr;
	var s1;
	var s2;
	var tR;
	var tI;
	var b;
	var t;

	gammaR = real( gamma );
	gammaI = imag( gamma );

	// alpha = zdotc( j, x, 1, w, 1 ) — conjugate dot product
	alpha = zdotc( j, x, strideX, offsetX, w, strideW, offsetW );
	alphaR = real( alpha );
	alphaI = imag( alpha );

	absalp = cmplx.abs( alpha );
	absgam = cmplx.abs( gamma );
	absest = abs( sest );

	if ( job === 'largest-singular-value' ) {
		// Estimating largest singular value

		if ( sest === ZERO ) {
			s1 = max( absgam, absalp );
			if ( s1 === ZERO ) {
				s[ 0 ] = ZERO;
				s[ 1 ] = ZERO;
				c[ 0 ] = ONE;
				c[ 1 ] = ZERO;
				sestpr[ 0 ] = ZERO;
			} else {
				// s = alpha / s1
				tR = alphaR / s1;
				tI = alphaI / s1;

				// c = gamma / s1
				cosineR = gammaR / s1;
				cosineI = gammaI / s1;

				// tmp = sqrt( s*conj(s) + c*conj(c) ) = sqrt(|s|^2 + |c|^2)
				tmp = sqrt( (tR * tR) + (tI * tI) + (cosineR * cosineR) + (cosineI * cosineI) );
				s[ 0 ] = tR / tmp;
				s[ 1 ] = tI / tmp;
				c[ 0 ] = cosineR / tmp;
				c[ 1 ] = cosineI / tmp;
				sestpr[ 0 ] = s1 * tmp;
			}
			return;
		}
		if ( absgam <= EPS * absest ) {
			s[ 0 ] = ONE;
			s[ 1 ] = ZERO;
			c[ 0 ] = ZERO;
			c[ 1 ] = ZERO;
			tmp = max( absest, absalp );
			s1 = absest / tmp;
			s2 = absalp / tmp;
			sestpr[ 0 ] = tmp * sqrt( (s1 * s1) + (s2 * s2) );
			return;
		}
		if ( absalp <= EPS * absest ) {
			s1 = absgam;
			s2 = absest;
			if ( s1 <= s2 ) {
				s[ 0 ] = ONE;
				s[ 1 ] = ZERO;
				c[ 0 ] = ZERO;
				c[ 1 ] = ZERO;
				sestpr[ 0 ] = s2;
			} else {
				s[ 0 ] = ZERO;
				s[ 1 ] = ZERO;
				c[ 0 ] = ONE;
				c[ 1 ] = ZERO;
				sestpr[ 0 ] = s1;
			}
			return;
		}
		if ( absest <= EPS * absalp || absest <= EPS * absgam ) {
			s1 = absgam;
			s2 = absalp;
			if ( s1 <= s2 ) {
				tmp = s1 / s2;
				scl = sqrt( ONE + (tmp * tmp) );
				sestpr[ 0 ] = s2 * scl;

				// s = (alpha / s2) / scl
				s[ 0 ] = (alphaR / s2) / scl;
				s[ 1 ] = (alphaI / s2) / scl;

				// c = (gamma / s2) / scl
				c[ 0 ] = (gammaR / s2) / scl;
				c[ 1 ] = (gammaI / s2) / scl;
			} else {
				tmp = s2 / s1;
				scl = sqrt( ONE + (tmp * tmp) );
				sestpr[ 0 ] = s1 * scl;

				// s = (alpha / s1) / scl
				s[ 0 ] = (alphaR / s1) / scl;
				s[ 1 ] = (alphaI / s1) / scl;

				// c = (gamma / s1) / scl
				c[ 0 ] = (gammaR / s1) / scl;
				c[ 1 ] = (gammaI / s1) / scl;
			}
			return;
		}

		// Normal case
		zeta1 = absalp / absest;
		zeta2 = absgam / absest;

		b = (ONE - (zeta1 * zeta1) - (zeta2 * zeta2)) * HALF;
		cr = zeta1 * zeta1;
		if ( b > ZERO ) {
			t = cr / (b + sqrt( (b * b) + cr ));
		} else {
			t = sqrt( (b * b) + cr ) - b;
		}

		// Sine = -(alpha / absest) / t
		sineR = -(alphaR / absest) / t;
		sineI = -(alphaI / absest) / t;

		// Cosine = -(gamma / absest) / (1 + t)
		cosineR = -(gammaR / absest) / (ONE + t);
		cosineI = -(gammaI / absest) / (ONE + t);

		// tmp = sqrt( sine*conj(sine) + cosine*conj(cosine) )
		tmp = sqrt( (sineR * sineR) + (sineI * sineI) + (cosineR * cosineR) + (cosineI * cosineI) );

		s[ 0 ] = sineR / tmp;
		s[ 1 ] = sineI / tmp;
		c[ 0 ] = cosineR / tmp;
		c[ 1 ] = cosineI / tmp;
		sestpr[ 0 ] = sqrt( t + ONE ) * absest;
		return;
	}
	if ( job === 'smallest-singular-value' ) {
		// Estimating smallest singular value

		if ( sest === ZERO ) {
			sestpr[ 0 ] = ZERO;
			if ( max( absgam, absalp ) === ZERO ) {
				sineR = ONE;
				sineI = ZERO;
				cosineR = ZERO;
				cosineI = ZERO;
			} else {
				// Sine = -conj(gamma), cosine = conj(alpha)
				sineR = -gammaR;
				sineI = gammaI;
				cosineR = alphaR;
				cosineI = -alphaI;
			}
			s1 = max( cmplx.abs( new Complex128( sineR, sineI ) ), cmplx.abs( new Complex128( cosineR, cosineI ) ) );

			// s = sine / s1
			tR = sineR / s1;
			tI = sineI / s1;

			// c = cosine / s1
			cosineR /= s1;
			cosineI /= s1;

			// tmp = sqrt( s*conj(s) + c*conj(c) )
			tmp = sqrt( (tR * tR) + (tI * tI) + (cosineR * cosineR) + (cosineI * cosineI) );
			s[ 0 ] = tR / tmp;
			s[ 1 ] = tI / tmp;
			c[ 0 ] = cosineR / tmp;
			c[ 1 ] = cosineI / tmp;
			return;
		}
		if ( absgam <= EPS * absest ) {
			s[ 0 ] = ZERO;
			s[ 1 ] = ZERO;
			c[ 0 ] = ONE;
			c[ 1 ] = ZERO;
			sestpr[ 0 ] = absgam;
			return;
		}
		if ( absalp <= EPS * absest ) {
			s1 = absgam;
			s2 = absest;
			if ( s1 <= s2 ) {
				s[ 0 ] = ZERO;
				s[ 1 ] = ZERO;
				c[ 0 ] = ONE;
				c[ 1 ] = ZERO;
				sestpr[ 0 ] = s1;
			} else {
				s[ 0 ] = ONE;
				s[ 1 ] = ZERO;
				c[ 0 ] = ZERO;
				c[ 1 ] = ZERO;
				sestpr[ 0 ] = s2;
			}
			return;
		}
		if ( absest <= EPS * absalp || absest <= EPS * absgam ) {
			s1 = absgam;
			s2 = absalp;
			if ( s1 <= s2 ) {
				tmp = s1 / s2;
				scl = sqrt( ONE + (tmp * tmp) );
				sestpr[ 0 ] = absest * (tmp / scl);

				// s = -(conj(gamma) / s2) / scl
				s[ 0 ] = (-gammaR / s2) / scl;
				s[ 1 ] = (gammaI / s2) / scl;

				// c = (conj(alpha) / s2) / scl
				c[ 0 ] = (alphaR / s2) / scl;
				c[ 1 ] = (-alphaI / s2) / scl;
			} else {
				tmp = s2 / s1;
				scl = sqrt( ONE + (tmp * tmp) );
				sestpr[ 0 ] = absest / scl;

				// s = -(conj(gamma) / s1) / scl
				s[ 0 ] = (-gammaR / s1) / scl;
				s[ 1 ] = (gammaI / s1) / scl;

				// c = (conj(alpha) / s1) / scl
				c[ 0 ] = (alphaR / s1) / scl;
				c[ 1 ] = (-alphaI / s1) / scl;
			}
			return;
		}

		// Normal case
		zeta1 = absalp / absest;
		zeta2 = absgam / absest;

		norma = max( ONE + (zeta1 * zeta1) + (zeta1 * zeta2), (zeta1 * zeta2) + (zeta2 * zeta2) );

		// See if root is closer to zero or to one
		test = ONE + (TWO * (zeta1 - zeta2) * (zeta1 + zeta2));
		if ( test >= ZERO ) {
			// Root is close to zero, compute directly
			b = ((zeta1 * zeta1) + (zeta2 * zeta2) + ONE) * HALF;
			cr = zeta2 * zeta2;
			t = cr / (b + sqrt( abs( (b * b) - cr ) ));

			// Sine = (alpha / absest) / (1 - t)
			sineR = (alphaR / absest) / (ONE - t);
			sineI = (alphaI / absest) / (ONE - t);

			// Cosine = -(gamma / absest) / t
			cosineR = -(gammaR / absest) / t;
			cosineI = -(gammaI / absest) / t;

			sestpr[ 0 ] = sqrt( t + (FOUR * EPS * EPS * norma) ) * absest;
		} else {
			// Root is closer to one, shift by that amount
			b = ((zeta2 * zeta2) + (zeta1 * zeta1) - ONE) * HALF;
			cr = zeta1 * zeta1;
			if ( b >= ZERO ) {
				t = -cr / (b + sqrt( (b * b) + cr ));
			} else {
				t = b - sqrt( (b * b) + cr );
			}

			// Sine = -(alpha / absest) / t
			sineR = -(alphaR / absest) / t;
			sineI = -(alphaI / absest) / t;

			// Cosine = -(gamma / absest) / (1 + t)
			cosineR = -(gammaR / absest) / (ONE + t);
			cosineI = -(gammaI / absest) / (ONE + t);

			sestpr[ 0 ] = sqrt( ONE + t + (FOUR * EPS * EPS * norma) ) * absest;
		}

		// tmp = sqrt( sine*conj(sine) + cosine*conj(cosine) )
		tmp = sqrt( (sineR * sineR) + (sineI * sineI) + (cosineR * cosineR) + (cosineI * cosineI) );
		s[ 0 ] = sineR / tmp;
		s[ 1 ] = sineI / tmp;
		c[ 0 ] = cosineR / tmp;
		c[ 1 ] = cosineI / tmp;
	}
}


// EXPORTS //

export default zlaic1;
