/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-depth, max-statements */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';


// VARIABLES //

const ZERO = 0.0;
const HALF = 0.5;
const ONE = 1.0;
const TWO = 2.0;
const MULTPL = 4.0;

const EPS = dlamch( 'precision' );
const SAFMIN = dlamch( 'safe-minimum' );
const BASE = dlamch( 'base' );
const SAFMN2 = Math.pow( BASE, Math.floor( Math.log( SAFMIN / EPS ) / Math.log( BASE ) / TWO ) ); // eslint-disable-line max-len
const SAFMX2 = ONE / SAFMN2;


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
	const mag = Math.abs( a );
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
* @param {Float64Array} A - input/output (length-1 array): the (1,1) element of the matrix
* @param {Float64Array} B - input/output (length-1 array): the (1,2) element of the matrix
* @param {Float64Array} C - input/output (length-1 array): the (2,1) element of the matrix
* @param {Float64Array} D - input/output (length-1 array): the (2,2) element of the matrix
* @param {Float64Array} rt1r - output (length-1 array): `rt1r`
* @param {Float64Array} rt1i - output (length-1 array): `rt1i`
* @param {Float64Array} rt2r - output (length-1 array): `rt2r`
* @param {Float64Array} rt2i - output (length-1 array): the real and imaginary parts of the eigenvalues
* @param {Float64Array} cs - output (length-1 array): `cs`
* @param {Float64Array} sn - output (length-1 array): parameters of the rotation matrix
* @returns {void}
*/
function dlanv2( A, B, C, D, rt1r, rt1i, rt2r, rt2i, cs, sn ) {
	let bcmax, bcmis, scale, sigma, count, temp, tau, cs1, sn1, sab;
	let sac, aa, bb, cc, dd, p, z;

	if ( C[ 0 ] === ZERO ) {
		cs[ 0 ] = ONE;
		sn[ 0 ] = ZERO;
	} else if ( B[ 0 ] === ZERO ) {
		// Swap rows and columns:
		cs[ 0 ] = ZERO;
		sn[ 0 ] = ONE;
		temp = D[ 0 ];
		D[ 0 ] = A[ 0 ];
		A[ 0 ] = temp;
		B[ 0 ] = -C[ 0 ];
		C[ 0 ] = ZERO;
	} else if ( ( A[ 0 ] - D[ 0 ] ) === ZERO && sign( ONE, B[ 0 ] ) !== sign( ONE, C[ 0 ] ) ) {
		cs[ 0 ] = ONE;
		sn[ 0 ] = ZERO;
	} else {
		temp = A[ 0 ] - D[ 0 ];
		p = HALF * temp;
		bcmax = Math.max( Math.abs( B[ 0 ] ), Math.abs( C[ 0 ] ) );
		bcmis = Math.min( Math.abs( B[ 0 ] ), Math.abs( C[ 0 ] ) ) * sign( ONE, B[ 0 ] ) * sign( ONE, C[ 0 ] ); // eslint-disable-line max-len
		scale = Math.max( Math.abs( p ), bcmax );
		z = ( (p / scale) * p ) + ( (bcmax / scale) * bcmis );

		// If Z is of the order of the machine accuracy, postpone the

		// Decision on the nature of eigenvalues:
		if ( z >= MULTPL * EPS ) {
			// Real eigenvalues. Compute A and D.
			z = p + ( sign( Math.sqrt( scale ) * Math.sqrt( z ), p ) );
			A[ 0 ] = D[ 0 ] + z;
			D[ 0 ] -= ( bcmax / z ) * bcmis;

			// Compute B and the rotation matrix:
			tau = dlapy2( C[ 0 ], z );
			cs[ 0 ] = z / tau;
			sn[ 0 ] = C[ 0 ] / tau;
			B[ 0 ] -= C[ 0 ];
			C[ 0 ] = ZERO;
		} else {
			// Complex eigenvalues, or real (almost) equal eigenvalues.
			// Make diagonal elements equal.
			count = 0;
			sigma = B[ 0 ] + C[ 0 ];

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
			cs[ 0 ] = Math.sqrt( HALF * ( ONE + ( Math.abs( sigma ) / tau ) ) );
			sn[ 0 ] = -( p / ( tau * cs[ 0 ] ) ) * sign( ONE, sigma );

			// Compute [ AA  BB ] = [ A  B ] [ CS -SN ]

			//         [ CC  DD ]   [ C  D ] [ SN  CS ]
			aa = ( A[ 0 ] * cs[ 0 ] ) + ( B[ 0 ] * sn[ 0 ] );
			bb = ( -A[ 0 ] * sn[ 0 ] ) + ( B[ 0 ] * cs[ 0 ] );
			cc = ( C[ 0 ] * cs[ 0 ] ) + ( D[ 0 ] * sn[ 0 ] );
			dd = ( -C[ 0 ] * sn[ 0 ] ) + ( D[ 0 ] * cs[ 0 ] );

			// Compute [ A  B ] = [ CS  SN ] [ AA  BB ]

			//         [ C  D ]   [-SN  CS ] [ CC  DD ]
			A[ 0 ] = ( aa * cs[ 0 ] ) + ( cc * sn[ 0 ] );
			B[ 0 ] = ( bb * cs[ 0 ] ) + ( dd * sn[ 0 ] );
			C[ 0 ] = ( -aa * sn[ 0 ] ) + ( cc * cs[ 0 ] );
			D[ 0 ] = ( -bb * sn[ 0 ] ) + ( dd * cs[ 0 ] );

			temp = HALF * ( A[ 0 ] + D[ 0 ] );
			A[ 0 ] = temp;
			D[ 0 ] = temp;

			if ( C[ 0 ] !== ZERO ) {
				if ( B[ 0 ] === ZERO ) {
					B[ 0 ] = -C[ 0 ];
					C[ 0 ] = ZERO;
					temp = cs[ 0 ];
					cs[ 0 ] = -sn[ 0 ];
					sn[ 0 ] = temp;
				} else if ( sign( ONE, B[ 0 ] ) === sign( ONE, C[ 0 ] ) ) {
					// Real eigenvalues: reduce to upper triangular form
					sab = Math.sqrt( Math.abs( B[ 0 ] ) );
					sac = Math.sqrt( Math.abs( C[ 0 ] ) );
					p = sign( sab * sac, C[ 0 ] );
					tau = ONE / Math.sqrt( Math.abs( B[ 0 ] + C[ 0 ] ) );
					A[ 0 ] = temp + p;
					D[ 0 ] = temp - p;
					B[ 0 ] -= C[ 0 ];
					C[ 0 ] = ZERO;
					cs1 = sab * tau;
					sn1 = sac * tau;
					temp = ( cs[ 0 ] * cs1 ) - ( sn[ 0 ] * sn1 );
					sn[ 0 ] = ( cs[ 0 ] * sn1 ) + ( sn[ 0 ] * cs1 );
					cs[ 0 ] = temp;
				}
			}
		}
	}

	// Store eigenvalues in (RT1R,RT1I) and (RT2R,RT2I):
	rt1r[ 0 ] = A[ 0 ];
	rt2r[ 0 ] = D[ 0 ];
	if ( C[ 0 ] === ZERO ) {
		rt1i[ 0 ] = ZERO;
		rt2i[ 0 ] = ZERO;
	} else {
		rt1i[ 0 ] = Math.sqrt( Math.abs( B[ 0 ] ) ) * Math.sqrt( Math.abs( C[ 0 ] ) );
		rt2i[ 0 ] = -rt1i[ 0 ];
	}

}


// EXPORTS //

export default dlanv2;
