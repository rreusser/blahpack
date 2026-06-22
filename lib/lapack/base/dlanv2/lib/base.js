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

/* eslint-disable max-depth, max-statements */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var HALF = 0.5;
var ONE = 1.0;
var TWO = 2.0;
var MULTPL = 4.0;

var EPS = dlamch( 'precision' );
var SAFMIN = dlamch( 'safe-minimum' );
var BASE = dlamch( 'base' );
var SAFMN2 = Math.pow( BASE, Math.floor( Math.log( SAFMIN / EPS ) / Math.log( BASE ) / TWO ) ); // eslint-disable-line max-len
var SAFMX2 = ONE / SAFMN2;


// FUNCTIONS //

/**
* Returns |a| with the sign of b (Fortran SIGN intrinsic).
*
* @private
* @param {number} a - magnitude source
* @param {number} b - sign source
* @returns {number} result
*/
function sign( a, b ) {
	var mag = Math.abs( a );
	if ( b > 0.0 || ( b === 0.0 && !Object.is( b, -0.0 ) ) ) {
		return mag;
	}
	return -mag;
}


// MAIN //

/**
* Computes the Schur factorization of a real 2-by-2 nonsymmetric matrix in standard form.
*
* ## Notes
*
* The factorization has the form:
*
* ```text
* [ A  B ] = [ CS -SN ] [ AA  BB ] [ CS  SN ]
* [ C  D ]   [ SN  CS ] [ CC  DD ] [-SN  CS ]
* ```
*
* where either `CC = 0` so that `AA` and `DD` are real eigenvalues of the
* matrix, or `AA = DD` and `BB*CC < 0`, so that `AA +/- sqrt(BB*CC)` are
* complex conjugate eigenvalues.
*
* @private
* @param {number} A - the (1,1) element of the matrix
* @param {number} B - the (1,2) element of the matrix
* @param {number} C - the (2,1) element of the matrix
* @param {number} D - the (2,2) element of the matrix
* @returns {Object} object with fields: `a`, `b`, `c`, `d` (Schur form), `rt1r`, `rt1i`, `rt2r`, `rt2i` (eigenvalues), `cs`, `sn` (rotation)
*/
function dlanv2( A, B, C, D ) {
	var bcmax;
	var bcmis;
	var scale;
	var sigma;
	var count;
	var temp;
	var rt1r;
	var rt1i;
	var rt2r;
	var rt2i;
	var tau;
	var cs1;
	var sn1;
	var sab;
	var sac;
	var cs;
	var sn;
	var aa;
	var bb;
	var cc;
	var dd;
	var p;
	var z;

	if ( C === ZERO ) {
		cs = ONE;
		sn = ZERO;
	} else if ( B === ZERO ) {
		// Swap rows and columns:
		cs = ZERO;
		sn = ONE;
		temp = D;
		D = A;
		A = temp;
		B = -C;
		C = ZERO;
	} else if ( ( A - D ) === ZERO && sign( ONE, B ) !== sign( ONE, C ) ) {
		cs = ONE;
		sn = ZERO;
	} else {
		temp = A - D;
		p = HALF * temp;
		bcmax = Math.max( Math.abs( B ), Math.abs( C ) );
		bcmis = Math.min( Math.abs( B ), Math.abs( C ) ) * sign( ONE, B ) * sign( ONE, C ); // eslint-disable-line max-len
		scale = Math.max( Math.abs( p ), bcmax );
		z = ( (p / scale) * p ) + ( (bcmax / scale) * bcmis );

		// If Z is of the order of the machine accuracy, postpone the

		// Decision on the nature of eigenvalues:
		if ( z >= MULTPL * EPS ) {
			// Real eigenvalues. Compute A and D.
			z = p + ( sign( Math.sqrt( scale ) * Math.sqrt( z ), p ) );
			A = D + z;
			D -= ( bcmax / z ) * bcmis;

			// Compute B and the rotation matrix:
			tau = dlapy2( C, z );
			cs = z / tau;
			sn = C / tau;
			B -= C;
			C = ZERO;
		} else {
			// Complex eigenvalues, or real (almost) equal eigenvalues.
			// Make diagonal elements equal.
			count = 0;
			sigma = B + C;

			// Scaling loop (Fortran GOTO 10):
			while ( true ) {
				count += 1;
				scale = Math.max( Math.abs( temp ), Math.abs( sigma ) );
				if ( scale >= SAFMX2 ) {
					sigma *= SAFMN2;
					temp *= SAFMN2;
					if ( count <= 20 ) {
						continue;
					}
				}
				if ( scale <= SAFMN2 ) {
					sigma *= SAFMX2;
					temp *= SAFMX2;
					if ( count <= 20 ) {
						continue;
					}
				}
				break;
			}

			p = HALF * temp;
			tau = dlapy2( sigma, temp );
			cs = Math.sqrt( HALF * ( ONE + ( Math.abs( sigma ) / tau ) ) );
			sn = -( p / ( tau * cs ) ) * sign( ONE, sigma );

			// Compute [ AA  BB ] = [ A  B ] [ CS -SN ]

			//         [ CC  DD ]   [ C  D ] [ SN  CS ]
			aa = ( A * cs ) + ( B * sn );
			bb = ( -A * sn ) + ( B * cs );
			cc = ( C * cs ) + ( D * sn );
			dd = ( -C * sn ) + ( D * cs );

			// Compute [ A  B ] = [ CS  SN ] [ AA  BB ]

			//         [ C  D ]   [-SN  CS ] [ CC  DD ]
			A = ( aa * cs ) + ( cc * sn );
			B = ( bb * cs ) + ( dd * sn );
			C = ( -aa * sn ) + ( cc * cs );
			D = ( -bb * sn ) + ( dd * cs );

			temp = HALF * ( A + D );
			A = temp;
			D = temp;

			if ( C !== ZERO ) {
				if ( B === ZERO ) {
					B = -C;
					C = ZERO;
					temp = cs;
					cs = -sn;
					sn = temp;
				} else if ( sign( ONE, B ) === sign( ONE, C ) ) {
					// Real eigenvalues: reduce to upper triangular form
					sab = Math.sqrt( Math.abs( B ) );
					sac = Math.sqrt( Math.abs( C ) );
					p = sign( sab * sac, C );
					tau = ONE / Math.sqrt( Math.abs( B + C ) );
					A = temp + p;
					D = temp - p;
					B -= C;
					C = ZERO;
					cs1 = sab * tau;
					sn1 = sac * tau;
					temp = ( cs * cs1 ) - ( sn * sn1 );
					sn = ( cs * sn1 ) + ( sn * cs1 );
					cs = temp;
				}
			}
		}
	}

	// Store eigenvalues in (RT1R,RT1I) and (RT2R,RT2I):
	rt1r = A;
	rt2r = D;
	if ( C === ZERO ) {
		rt1i = ZERO;
		rt2i = ZERO;
	} else {
		rt1i = Math.sqrt( Math.abs( B ) ) * Math.sqrt( Math.abs( C ) );
		rt2i = -rt1i;
	}

	return {
		'a': A,
		'b': B,
		'c': C,
		'd': D,
		'rt1r': rt1r,
		'rt1i': rt1i,
		'rt2r': rt2r,
		'rt2i': rt2i,
		'cs': cs,
		'sn': sn
	};
}


// EXPORTS //

export default dlanv2;
