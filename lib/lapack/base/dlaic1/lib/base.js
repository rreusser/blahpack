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

// MODULES //

import ddot from './../../../../blas/base/ddot/lib/base.js';
import dlamch from './../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Applies one step of incremental condition estimation.
*
* ## Notes
*
* -   Given a `j`-by-`j` lower triangular matrix `L` and its estimated
*     singular value `sest` (with approximate singular vector `x`), this
*     routine extends the estimate by one row/column to compute `sestpr`,
*     `s`, and `c` such that:
*
*     ```text
*              [ s*x ]
*     xhat =   [  c  ]
*     ```
*
*     is an approximate singular vector of:
*
*     ```text
*              [ L       0  ]
*     Lhat =   [ w^T  gamma ]
*     ```
*
* -   When `job` is `'largest-singular-value'`, an estimate for the largest
*     singular value is computed. When `job` is `'smallest-singular-value'`,
*     an estimate for the smallest singular value is computed.
*
* @private
* @param {string} job - specifies whether to estimate the largest or smallest singular value (`'largest-singular-value'` or `'smallest-singular-value'`)
* @param {NonNegativeInteger} J - length of `x` and `w`
* @param {Float64Array} x - input vector of length `J`
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} sest - estimated singular value of the `j`-by-`j` matrix
* @param {Float64Array} w - input vector of length `J`
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {number} gamma - diagonal element
* @param {Float64Array} out - output array; on exit, `out[0]` is `sestpr`, `out[1]` is `s`, `out[2]` is `c`
* @returns {Float64Array} `out`
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
* var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var out = new Float64Array( 3 );
*
* dlaic1( 'largest-singular-value', 3, x, 1, 0, 5.0, w, 1, 0, 2.0, out );
* // out => <Float64Array>[ ~5.529, ~-0.987, ~-0.163 ]
*/
function dlaic1( job, J, x, strideX, offsetX, sest, w, strideW, offsetW, gamma, out ) { // eslint-disable-line max-len, max-params
	var absalp;
	var absest;
	var absgam;
	var cosine;
	var alpha;
	var norma;
	var zeta1;
	var zeta2;
	var sine;
	var test;
	var tmp;
	var s1;
	var s2;
	var b;
	var c;
	var s;
	var t;

	alpha = ddot( J, x, strideX, offsetX, w, strideW, offsetW );

	absalp = Math.abs( alpha );
	absgam = Math.abs( gamma );
	absest = Math.abs( sest );

	if ( job === 'largest-singular-value' ) {
		// Estimating largest singular value...

		if ( sest === 0.0 ) {
			s1 = Math.max( absgam, absalp );
			if ( s1 === 0.0 ) {
				out[ 0 ] = 0.0;  // sestpr
				out[ 1 ] = 0.0;  // s
				out[ 2 ] = 1.0;  // c
				return out;
			}
			s = alpha / s1;
			c = gamma / s1;
			tmp = Math.sqrt( ( s * s ) + ( c * c ) );
			out[ 0 ] = s1 * tmp;       // sestpr
			out[ 1 ] = s / tmp;         // s
			out[ 2 ] = c / tmp;         // c
			return out;
		}
		if ( absgam <= EPS * absest ) {
			tmp = Math.max( absest, absalp );
			s1 = absest / tmp;
			s2 = absalp / tmp;
			out[ 0 ] = tmp * Math.sqrt( ( s1 * s1 ) + ( s2 * s2 ) ); // sestpr
			out[ 1 ] = 1.0;  // s
			out[ 2 ] = 0.0;  // c
			return out;
		}
		if ( absalp <= EPS * absest ) {
			s1 = absgam;
			s2 = absest;
			if ( s1 <= s2 ) {
				out[ 0 ] = s2;   // sestpr
				out[ 1 ] = 1.0;  // s
				out[ 2 ] = 0.0;  // c
			} else {
				out[ 0 ] = s1;   // sestpr
				out[ 1 ] = 0.0;  // s
				out[ 2 ] = 1.0;  // c
			}
			return out;
		}
		if ( absest <= EPS * absalp || absest <= EPS * absgam ) {
			s1 = absgam;
			s2 = absalp;
			if ( s1 <= s2 ) {
				tmp = s1 / s2;
				s = Math.sqrt( 1.0 + ( tmp * tmp ) );
				out[ 0 ] = s2 * s;                               // sestpr
				out[ 2 ] = ( gamma / s2 ) / s;                   // c
				out[ 1 ] = ( ( alpha >= 0.0 ) ? 1.0 : -1.0 ) / s; // s = sign(1, alpha) / s
			} else {
				tmp = s2 / s1;
				c = Math.sqrt( 1.0 + ( tmp * tmp ) );
				out[ 0 ] = s1 * c;                               // sestpr
				out[ 1 ] = ( alpha / s1 ) / c;                   // s
				out[ 2 ] = ( ( gamma >= 0.0 ) ? 1.0 : -1.0 ) / c; // c = sign(1, gamma) / c
			}
			return out;
		}

		// Normal case...
		zeta1 = alpha / absest;
		zeta2 = gamma / absest;

		b = ( 1.0 - ( zeta1 * zeta1 ) - ( zeta2 * zeta2 ) ) * 0.5;
		c = zeta1 * zeta1;
		if ( b > 0.0 ) {
			t = c / ( b + Math.sqrt( ( b * b ) + c ) );
		} else {
			t = Math.sqrt( ( b * b ) + c ) - b;
		}

		sine = -zeta1 / t;
		cosine = -zeta2 / ( 1.0 + t );
		tmp = Math.sqrt( ( sine * sine ) + ( cosine * cosine ) );
		out[ 0 ] = Math.sqrt( t + 1.0 ) * absest; // sestpr
		out[ 1 ] = sine / tmp;                     // s
		out[ 2 ] = cosine / tmp;                   // c
		return out;
	}
	// job === 'smallest-singular-value': Estimating smallest singular value...

	if ( sest === 0.0 ) {
		out[ 0 ] = 0.0; // sestpr
		if ( Math.max( absgam, absalp ) === 0.0 ) {
			sine = 1.0;
			cosine = 0.0;
		} else {
			sine = -gamma;
			cosine = alpha;
		}
		s1 = Math.max( Math.abs( sine ), Math.abs( cosine ) );
		s = sine / s1;
		c = cosine / s1;
		tmp = Math.sqrt( ( s * s ) + ( c * c ) );
		out[ 1 ] = s / tmp;  // s
		out[ 2 ] = c / tmp;  // c
		return out;
	}
	if ( absgam <= EPS * absest ) {
		out[ 0 ] = absgam;  // sestpr
		out[ 1 ] = 0.0;     // s
		out[ 2 ] = 1.0;     // c
		return out;
	}
	if ( absalp <= EPS * absest ) {
		s1 = absgam;
		s2 = absest;
		if ( s1 <= s2 ) {
			out[ 0 ] = s1;   // sestpr
			out[ 1 ] = 0.0;  // s
			out[ 2 ] = 1.0;  // c
		} else {
			out[ 0 ] = s2;   // sestpr
			out[ 1 ] = 1.0;  // s
			out[ 2 ] = 0.0;  // c
		}
		return out;
	}
	if ( absest <= EPS * absalp || absest <= EPS * absgam ) {
		s1 = absgam;
		s2 = absalp;
		if ( s1 <= s2 ) {
			tmp = s1 / s2;
			c = Math.sqrt( 1.0 + ( tmp * tmp ) );
			out[ 0 ] = absest * ( tmp / c );                   // sestpr
			out[ 1 ] = -( gamma / s2 ) / c;                    // s
			out[ 2 ] = ( ( alpha >= 0.0 ) ? 1.0 : -1.0 ) / c; // c = sign(1, alpha) / c
		} else {
			tmp = s2 / s1;
			s = Math.sqrt( 1.0 + ( tmp * tmp ) );
			out[ 0 ] = absest / s;                              // sestpr
			out[ 2 ] = ( alpha / s1 ) / s;                      // c
			out[ 1 ] = -( ( gamma >= 0.0 ) ? 1.0 : -1.0 ) / s; // s = -sign(1, gamma) / s
		}
		return out;
	}

	// Normal case...
	zeta1 = alpha / absest;
	zeta2 = gamma / absest;

	norma = Math.max(1.0 + ( zeta1 * zeta1 ) + Math.abs( zeta1 * zeta2 ), Math.abs( zeta1 * zeta2 ) + ( zeta2 * zeta2 ));

	// See if root is closer to zero or to one...
	test = 1.0 + ( 2.0 * ( zeta1 - zeta2 ) * ( zeta1 + zeta2 ) );
	if ( test >= 0.0 ) {
		// Root is close to zero, compute directly...
		b = ( ( zeta1 * zeta1 ) + ( zeta2 * zeta2 ) + 1.0 ) * 0.5;
		c = zeta2 * zeta2;
		t = c / ( b + Math.sqrt( Math.abs( ( b * b ) - c ) ) );
		sine = zeta1 / ( 1.0 - t );
		cosine = -zeta2 / t;
		out[ 0 ] = Math.sqrt( t + ( 4.0 * EPS * EPS * norma ) ) * absest; // sestpr
	} else {
		// Root is closer to one, shift by that amount...
		b = ( ( zeta2 * zeta2 ) + ( zeta1 * zeta1 ) - 1.0 ) * 0.5;
		c = zeta1 * zeta1;
		if ( b >= 0.0 ) {
			t = -c / ( b + Math.sqrt( ( b * b ) + c ) );
		} else {
			t = b - Math.sqrt( ( b * b ) + c );
		}
		sine = -zeta1 / t;
		cosine = -zeta2 / ( 1.0 + t );
		out[ 0 ] = Math.sqrt( 1.0 + t + ( 4.0 * EPS * EPS * norma ) ) * absest; // sestpr
	}
	tmp = Math.sqrt( ( sine * sine ) + ( cosine * cosine ) );
	out[ 1 ] = sine / tmp;    // s
	out[ 2 ] = cosine / tmp;  // c
	return out;
}


// EXPORTS //

export default dlaic1;
