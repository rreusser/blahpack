/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import ddot from '../../../blas/ddot/lib/base.js';
import dlamch from './../../dlamch/lib/base.js';


// VARIABLES //

const EPS = dlamch( 'epsilon' );


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
* @param {('largest-singular-value'|'smallest-singular-value')} job - specifies whether to estimate the largest or smallest singular value (`'largest-singular-value'` or `'smallest-singular-value'`)
* @param {NonNegativeInteger} J - length of `x` and `w`
* @param {Float64Array} x - input vector of length `J`
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} sest - estimated singular value of the `j`-by-`j` matrix
* @param {Float64Array} w - input vector of length `J`
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {number} gamma - diagonal element
* @param {Float64Array} sestpr - output (length-1 array): estimated singular value of (j+1) by (j+1) matrix Lhat
* @param {Float64Array} s - output (length-1 array): sine needed in forming xhat
* @param {Float64Array} c - output (length-1 array): cosine needed in forming xhat
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlaic1 from '@rreusser/blahpack/lapack/dlaic1';
*
* var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
* var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var sestpr = new Float64Array( 1 );
* var s = new Float64Array( 1 );
* var c = new Float64Array( 1 );
*
* dlaic1.strided( 'largest-singular-value', 3, x, 1, 0, 5.0, w, 1, 0, 2.0, sestpr, s, c );
* // sestpr[ 0 ] => ~5.5289
* // s[ 0 ] => ~-0.98656
* // c[ 0 ] => ~-0.16338
*/
function dlaic1( job, J, x, strideX, offsetX, sest, w, strideW, offsetW, gamma, sestpr, s, c ) { // eslint-disable-line max-len, max-params
	let cosine, zeta1, zeta2, sine, tmp, s1, s2, b, t;

	const alpha = ddot( J, x, strideX, offsetX, w, strideW, offsetW );

	const absalp = Math.abs( alpha );
	const absgam = Math.abs( gamma );
	const absest = Math.abs( sest );

	if ( job === 'largest-singular-value' ) {
		// Estimating largest singular value...

		if ( sest === 0.0 ) {
			s1 = Math.max( absgam, absalp );
			if ( s1 === 0.0 ) {
				sestpr[ 0 ] = 0.0;  // sestpr
				s[ 0 ] = 0.0;  // s
				c[ 0 ] = 1.0;  // c
				return;
			}
			s[ 0 ] = alpha / s1;
			c[ 0 ] = gamma / s1;
			tmp = Math.sqrt( ( s[ 0 ] * s[ 0 ] ) + ( c[ 0 ] * c[ 0 ] ) );
			sestpr[ 0 ] = s1 * tmp;       // sestpr
			s[ 0 ] = s[ 0 ] / tmp;         // s
			c[ 0 ] = c[ 0 ] / tmp;         // c
			return;
		}
		if ( absgam <= EPS * absest ) {
			tmp = Math.max( absest, absalp );
			s1 = absest / tmp;
			s2 = absalp / tmp;
			sestpr[ 0 ] = tmp * Math.sqrt( ( s1 * s1 ) + ( s2 * s2 ) ); // sestpr
			s[ 0 ] = 1.0;  // s
			c[ 0 ] = 0.0;  // c
			return;
		}
		if ( absalp <= EPS * absest ) {
			s1 = absgam;
			s2 = absest;
			if ( s1 <= s2 ) {
				sestpr[ 0 ] = s2;   // sestpr
				s[ 0 ] = 1.0;  // s
				c[ 0 ] = 0.0;  // c
			} else {
				sestpr[ 0 ] = s1;   // sestpr
				s[ 0 ] = 0.0;  // s
				c[ 0 ] = 1.0;  // c
			}
			return;
		}
		if ( absest <= EPS * absalp || absest <= EPS * absgam ) {
			s1 = absgam;
			s2 = absalp;
			if ( s1 <= s2 ) {
				tmp = s1 / s2;
				s[ 0 ] = Math.sqrt( 1.0 + ( tmp * tmp ) );
				sestpr[ 0 ] = s2 * s[ 0 ];                               // sestpr
				c[ 0 ] = ( gamma / s2 ) / s[ 0 ];                   // c
				s[ 0 ] = ( ( alpha >= 0.0 ) ? 1.0 : -1.0 ) / s[ 0 ]; // s = sign(1, alpha) / s
			} else {
				tmp = s2 / s1;
				c[ 0 ] = Math.sqrt( 1.0 + ( tmp * tmp ) );
				sestpr[ 0 ] = s1 * c[ 0 ];                               // sestpr
				s[ 0 ] = ( alpha / s1 ) / c[ 0 ];                   // s
				c[ 0 ] = ( ( gamma >= 0.0 ) ? 1.0 : -1.0 ) / c[ 0 ]; // c = sign(1, gamma) / c
			}
			return;
		}

		// Normal case...
		zeta1 = alpha / absest;
		zeta2 = gamma / absest;

		b = ( 1.0 - ( zeta1 * zeta1 ) - ( zeta2 * zeta2 ) ) * 0.5;
		c[ 0 ] = zeta1 * zeta1;
		if ( b > 0.0 ) {
			t = c[ 0 ] / ( b + Math.sqrt( ( b * b ) + c[ 0 ] ) );
		} else {
			t = Math.sqrt( ( b * b ) + c[ 0 ] ) - b;
		}

		sine = -zeta1 / t;
		cosine = -zeta2 / ( 1.0 + t );
		tmp = Math.sqrt( ( sine * sine ) + ( cosine * cosine ) );
		sestpr[ 0 ] = Math.sqrt( t + 1.0 ) * absest; // sestpr
		s[ 0 ] = sine / tmp;                     // s
		c[ 0 ] = cosine / tmp;                   // c
		return;
	}
	// job === 'smallest-singular-value': Estimating smallest singular value...

	if ( sest === 0.0 ) {
		sestpr[ 0 ] = 0.0; // sestpr
		if ( Math.max( absgam, absalp ) === 0.0 ) {
			sine = 1.0;
			cosine = 0.0;
		} else {
			sine = -gamma;
			cosine = alpha;
		}
		s1 = Math.max( Math.abs( sine ), Math.abs( cosine ) );
		s[ 0 ] = sine / s1;
		c[ 0 ] = cosine / s1;
		tmp = Math.sqrt( ( s[ 0 ] * s[ 0 ] ) + ( c[ 0 ] * c[ 0 ] ) );
		s[ 0 ] = s[ 0 ] / tmp;  // s
		c[ 0 ] = c[ 0 ] / tmp;  // c
		return;
	}
	if ( absgam <= EPS * absest ) {
		sestpr[ 0 ] = absgam;  // sestpr
		s[ 0 ] = 0.0;     // s
		c[ 0 ] = 1.0;     // c
		return;
	}
	if ( absalp <= EPS * absest ) {
		s1 = absgam;
		s2 = absest;
		if ( s1 <= s2 ) {
			sestpr[ 0 ] = s1;   // sestpr
			s[ 0 ] = 0.0;  // s
			c[ 0 ] = 1.0;  // c
		} else {
			sestpr[ 0 ] = s2;   // sestpr
			s[ 0 ] = 1.0;  // s
			c[ 0 ] = 0.0;  // c
		}
		return;
	}
	if ( absest <= EPS * absalp || absest <= EPS * absgam ) {
		s1 = absgam;
		s2 = absalp;
		if ( s1 <= s2 ) {
			tmp = s1 / s2;
			c[ 0 ] = Math.sqrt( 1.0 + ( tmp * tmp ) );
			sestpr[ 0 ] = absest * ( tmp / c[ 0 ] );                   // sestpr
			s[ 0 ] = -( gamma / s2 ) / c[ 0 ];                    // s
			c[ 0 ] = ( ( alpha >= 0.0 ) ? 1.0 : -1.0 ) / c[ 0 ]; // c = sign(1, alpha) / c
		} else {
			tmp = s2 / s1;
			s[ 0 ] = Math.sqrt( 1.0 + ( tmp * tmp ) );
			sestpr[ 0 ] = absest / s[ 0 ];                              // sestpr
			c[ 0 ] = ( alpha / s1 ) / s[ 0 ];                      // c
			s[ 0 ] = -( ( gamma >= 0.0 ) ? 1.0 : -1.0 ) / s[ 0 ]; // s = -sign(1, gamma) / s
		}
		return;
	}

	// Normal case...
	zeta1 = alpha / absest;
	zeta2 = gamma / absest;

	const norma = Math.max(1.0 + ( zeta1 * zeta1 ) + Math.abs( zeta1 * zeta2 ), Math.abs( zeta1 * zeta2 ) + ( zeta2 * zeta2 ));

	// See if root is closer to zero or to one...
	const test = 1.0 + ( 2.0 * ( zeta1 - zeta2 ) * ( zeta1 + zeta2 ) );
	if ( test >= 0.0 ) {
		// Root is close to zero, compute directly...
		b = ( ( zeta1 * zeta1 ) + ( zeta2 * zeta2 ) + 1.0 ) * 0.5;
		c[ 0 ] = zeta2 * zeta2;
		t = c[ 0 ] / ( b + Math.sqrt( Math.abs( ( b * b ) - c[ 0 ] ) ) );
		sine = zeta1 / ( 1.0 - t );
		cosine = -zeta2 / t;
		sestpr[ 0 ] = Math.sqrt( t + ( 4.0 * EPS * EPS * norma ) ) * absest; // sestpr
	} else {
		// Root is closer to one, shift by that amount...
		b = ( ( zeta2 * zeta2 ) + ( zeta1 * zeta1 ) - 1.0 ) * 0.5;
		c[ 0 ] = zeta1 * zeta1;
		if ( b >= 0.0 ) {
			t = -c[ 0 ] / ( b + Math.sqrt( ( b * b ) + c[ 0 ] ) );
		} else {
			t = b - Math.sqrt( ( b * b ) + c[ 0 ] );
		}
		sine = -zeta1 / t;
		cosine = -zeta2 / ( 1.0 + t );
		sestpr[ 0 ] = Math.sqrt( 1.0 + t + ( 4.0 * EPS * EPS * norma ) ) * absest; // sestpr
	}
	tmp = Math.sqrt( ( sine * sine ) + ( cosine * cosine ) );
	s[ 0 ] = sine / tmp;    // s
	c[ 0 ] = cosine / tmp;  // c
}


// EXPORTS //

export default dlaic1;
