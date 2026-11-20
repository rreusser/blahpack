/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, new-cap */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';
import disnan from '../../disnan/lib/base.js';
import dlasq4 from '../../dlasq4/lib/base.js';
import dlasq5 from '../../dlasq5/lib/base.js';
import dlasq6 from '../../dlasq6/lib/base.js';


// VARIABLES //

const CBIAS = 1.50;
const QURTR = 0.250;
const HALF = 0.50;
const ONE = 1.0;
const TWO = 2.0;
const HUNDRD = 100.0;
const ZERO = 0.0;


// MAIN //

/**
* Checks for deflation, computes a shift (TAU) and calls dqds. In case of.
* failure it changes shifts, and tries again until output is positive.
*
* @private
* @param {integer} i0 - first index (1-based)
* @param {Int32Array} n0 - input/output (length-1 array): last index (1-based)
* @param {Float64Array} z - qd array
* @param {integer} strideZ - stride length for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {Int32Array} pp - input/output (length-1 array): ping-pong flag (0, 1, or 2)
* @param {Float64Array} dmin - input/output (length-1 array): minimum value of d
* @param {Float64Array} sigma - input/output (length-1 array): accumulated shift
* @param {Float64Array} desig - input/output (length-1 array): lower order part of sigma
* @param {Float64Array} qmax - input/output (length-1 array): maximum value of q
* @param {Int32Array} nfail - input/output (length-1 array): failure counter
* @param {Int32Array} iter - input/output (length-1 array): iteration counter
* @param {Int32Array} ndiv - input/output (length-1 array): division counter
* @param {boolean} ieee - flag for IEEE arithmetic
* @param {Int32Array} ttype - input/output (length-1 array): shift type
* @param {Float64Array} dmin1 - input/output (length-1 array): min d excluding d(n0)
* @param {Float64Array} dmin2 - input/output (length-1 array): min d excluding d(n0) and d(n0-1)
* @param {Float64Array} dn - input/output (length-1 array): d(n0)
* @param {Float64Array} dn1 - input/output (length-1 array): d(n0-1)
* @param {Float64Array} dn2 - input/output (length-1 array): d(n0-2)
* @param {Float64Array} g - input/output (length-1 array): damping parameter
* @param {Float64Array} tau - input/output (length-1 array): shift value
* @returns {Float64Array} `z`
*/
function dlasq3( i0, n0, z, strideZ, offsetZ, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, ieee, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ) {
	const tauOut = new Float64Array( 1 );
	const ttypeOut = new Int32Array( 1 );
	const gOut = new Float64Array( 1 );
	const dminOut = new Float64Array( 1 );
	const dmin1Out = new Float64Array( 1 );
	const dmin2Out = new Float64Array( 1 );
	const dnOut = new Float64Array( 1 );
	const dnm1 = new Float64Array( 1 );
	const dnm2 = new Float64Array( 1 );
	let ipn4, temp, nn, j4, s, t;

	/**
	* Access Z using 1-based Fortran index.
	*
	* @private
	* @param {integer} idx - 1-based index
	* @returns {number} array element
	*/
	function Z( idx ) {
		return z[ offsetZ + (( idx - 1 ) * strideZ) ];
	}

	/**
	* Set Z using 1-based Fortran index.
	*
	* @private
	* @param {integer} idx - 1-based index
	* @param {number} val - value to set
	*/
	function setZ( idx, val ) {
		z[ offsetZ + (( idx - 1 ) * strideZ) ] = val;
	}

	const n0in = n0[ 0 ];
	const eps = dlamch( 'Precision' );
	const tol = eps * HUNDRD;
	const tol2 = tol * tol;

	// Main deflation loop (Fortran label 10)
	while ( true ) {
		if ( n0[ 0 ] < i0 ) {
			return z;
		}
		if ( n0[ 0 ] === i0 ) {
			// Deflate 1 eigenvalue (label 20)
			setZ( (4 * n0[ 0 ]) - 3, Z( (4 * n0[ 0 ]) + pp[ 0 ] - 3 ) + sigma[ 0 ] );
			n0[ 0 ] -= 1;
			continue;
		}
		nn = (4 * n0[ 0 ]) + pp[ 0 ];
		if ( n0[ 0 ] === ( i0 + 1 ) ) {
			// 2 eigenvalues (label 40) — skip label 30 check
			// Fall through to label 40 below
		} else if ( Z( nn - 5 ) > tol2 * ( sigma[ 0 ] + Z( nn - 3 ) ) &&
			Z( nn - (2 * pp[ 0 ]) - 4 ) > tol2 * Z( nn - 7 ) ) {
			// Check whether E(N0-1) is negligible, 1 eigenvalue
			// Not negligible, go to label 30
			// Check whether E(N0-2) is negligible, 2 eigenvalues
			if ( Z( nn - 9 ) > tol2 * sigma[ 0 ] &&
				Z( nn - (2 * pp[ 0 ]) - 8 ) > tol2 * Z( nn - 11 ) ) {
				// Not negligible, go to label 50 — break out of deflation
				break;
			}
			// Fall through to label 40 (2-eigenvalue deflation)
		} else {
			// Negligible: deflate 1 eigenvalue (label 20)
			setZ( (4 * n0[ 0 ]) - 3, Z( (4 * n0[ 0 ]) + pp[ 0 ] - 3 ) + sigma[ 0 ] );
			n0[ 0 ] -= 1;
			continue;
		}

		// Label 40: 2-eigenvalue deflation
		if ( Z( nn - 3 ) > Z( nn - 7 ) ) {
			s = Z( nn - 3 );
			setZ( nn - 3, Z( nn - 7 ) );
			setZ( nn - 7, s );
		}
		t = HALF * ( ( Z( nn - 7 ) - Z( nn - 3 ) ) + Z( nn - 5 ) );
		if ( Z( nn - 5 ) > Z( nn - 3 ) * tol2 && t !== ZERO ) {
			s = Z( nn - 3 ) * ( Z( nn - 5 ) / t );
			if ( s <= t ) {
				s = Z( nn - 3 ) * ( Z( nn - 5 ) /
					( t * ( ONE + Math.sqrt( ONE + (s / t) ) ) ) );
			} else {
				s = Z( nn - 3 ) * ( Z( nn - 5 ) /
					( t + (Math.sqrt( t ) * Math.sqrt( t + s )) ) );
			}
			t = Z( nn - 7 ) + ( s + Z( nn - 5 ) );
			setZ( nn - 3, Z( nn - 3 ) * ( Z( nn - 7 ) / t ) );
			setZ( nn - 7, t );
		}
		setZ( (4 * n0[ 0 ]) - 7, Z( nn - 7 ) + sigma[ 0 ] );
		setZ( (4 * n0[ 0 ]) - 3, Z( nn - 3 ) + sigma[ 0 ] );
		n0[ 0 ] -= 2;
		continue;
	}

	// Label 50: past deflation checks
	if ( pp[ 0 ] === 2 ) {
		pp[ 0 ] = 0;
	}

	// Reverse the qd-array, if warranted
	if ( dmin[ 0 ] <= ZERO || n0[ 0 ] < n0in ) {
		if ( CBIAS * Z( (4 * i0) + pp[ 0 ] - 3 ) < Z( (4 * n0[ 0 ]) + pp[ 0 ] - 3 ) ) {
			ipn4 = 4 * ( i0 + n0[ 0 ] );
			for ( j4 = 4 * i0; j4 <= 2 * ( i0 + n0[ 0 ] - 1 ); j4 += 4 ) {
				temp = Z( j4 - 3 );
				setZ( j4 - 3, Z( ipn4 - j4 - 3 ) );
				setZ( ipn4 - j4 - 3, temp );
				temp = Z( j4 - 2 );
				setZ( j4 - 2, Z( ipn4 - j4 - 2 ) );
				setZ( ipn4 - j4 - 2, temp );
				temp = Z( j4 - 1 );
				setZ( j4 - 1, Z( ipn4 - j4 - 5 ) );
				setZ( ipn4 - j4 - 5, temp );
				temp = Z( j4 );
				setZ( j4, Z( ipn4 - j4 - 4 ) );
				setZ( ipn4 - j4 - 4, temp );
			}
			if ( n0[ 0 ] - i0 <= 4 ) {
				setZ( (4 * n0[ 0 ]) + pp[ 0 ] - 1, Z( (4 * i0) + pp[ 0 ] - 1 ) );
				setZ( (4 * n0[ 0 ]) - pp[ 0 ], Z( (4 * i0) - pp[ 0 ] ) );
			}
			dmin2[ 0 ] = Math.min( dmin2[ 0 ], Z( (4 * n0[ 0 ]) + pp[ 0 ] - 1 ) );
			setZ( (4 * n0[ 0 ]) + pp[ 0 ] - 1, Math.min( Z( (4 * n0[ 0 ]) + pp[ 0 ] - 1 ), Z( (4 * i0) + pp[ 0 ] - 1 ), Z( (4 * i0) + pp[ 0 ] + 3 ) ) );
			setZ( (4 * n0[ 0 ]) - pp[ 0 ], Math.min( Z( (4 * n0[ 0 ]) - pp[ 0 ] ), Z( (4 * i0) - pp[ 0 ] ), Z( (4 * i0) - pp[ 0 ] + 4 ) ) );
			qmax[ 0 ] = Math.max( qmax[ 0 ], Z( (4 * i0) + pp[ 0 ] - 3 ), Z( (4 * i0) + pp[ 0 ] + 1 ) );
			dmin[ 0 ] = -ZERO;
		}
	}

	// Choose a shift (dlasq4)
	tauOut[ 0 ] = tau[ 0 ];
	ttypeOut[ 0 ] = ttype[ 0 ];
	gOut[ 0 ] = g[ 0 ];
	dlasq4( i0, n0[ 0 ], z, strideZ, offsetZ, pp[ 0 ], n0in, dmin[ 0 ], dmin1[ 0 ], dmin2[ 0 ], dn[ 0 ], dn1[ 0 ], dn2[ 0 ], tauOut, ttypeOut, gOut );
	tau[ 0 ] = tauOut[ 0 ];
	ttype[ 0 ] = ttypeOut[ 0 ];
	g[ 0 ] = gOut[ 0 ];

	// Call dqds until DMIN > 0 (Fortran label 70)
	while ( true ) {
		dlasq5( i0, n0[ 0 ], z, strideZ, offsetZ, pp[ 0 ], tau[ 0 ], sigma[ 0 ], dminOut, dmin1Out, dmin2Out, dnOut, dnm1, dnm2, ieee, eps );
		dmin[ 0 ] = dminOut[ 0 ];
		dmin1[ 0 ] = dmin1Out[ 0 ];
		dmin2[ 0 ] = dmin2Out[ 0 ];
		dn[ 0 ] = dnOut[ 0 ];
		dn1[ 0 ] = dnm1[ 0 ];
		dn2[ 0 ] = dnm2[ 0 ];

		ndiv[ 0 ] += ( n0[ 0 ] - i0 + 2 );
		iter[ 0 ] += 1;

		// Check status
		if ( dmin[ 0 ] >= ZERO && dmin1[ 0 ] >= ZERO ) {
			// Success — go to label 90
			break;
		} else if ( dmin[ 0 ] < ZERO && dmin1[ 0 ] > ZERO &&
			Z( (4 * ( n0[ 0 ] - 1 )) - pp[ 0 ] ) < tol * ( sigma[ 0 ] + dn1[ 0 ] ) &&
			Math.abs( dn[ 0 ] ) < tol * sigma[ 0 ] ) {
			// Convergence hidden by negative DN
			setZ( (4 * ( n0[ 0 ] - 1 )) - pp[ 0 ] + 2, ZERO );
			dmin[ 0 ] = ZERO;
			break;
		} else if ( dmin[ 0 ] < ZERO ) {
			// TAU too big. Select new TAU and try again.
			nfail[ 0 ] += 1;
			if ( ttype[ 0 ] < -22 ) {
				// Failed twice. Play it safe.
				tau[ 0 ] = ZERO;
			} else if ( dmin1[ 0 ] > ZERO ) {
				// Late failure. Gives excellent shift.
				tau[ 0 ] = ( tau[ 0 ] + dmin[ 0 ] ) * ( ONE - (TWO * eps) );
				ttype[ 0 ] -= 11;
			} else {
				// Early failure. Divide by 4.
				tau[ 0 ] *= QURTR;
				ttype[ 0 ] -= 12;
			}
			continue;
		} else if ( disnan( dmin[ 0 ] ) ) {
			// NaN
			if ( tau[ 0 ] === ZERO ) {
				// Go to label 80 (risk of underflow)
				dlasq6( i0, n0[ 0 ], z, strideZ, offsetZ, pp[ 0 ], dminOut, dmin1Out, dmin2Out, dnOut, dnm1, dnm2 );
				dmin[ 0 ] = dminOut[ 0 ];
				dmin1[ 0 ] = dmin1Out[ 0 ];
				dmin2[ 0 ] = dmin2Out[ 0 ];
				dn[ 0 ] = dnOut[ 0 ];
				dn1[ 0 ] = dnm1[ 0 ];
				dn2[ 0 ] = dnm2[ 0 ];
				ndiv[ 0 ] += ( n0[ 0 ] - i0 + 2 );
				iter[ 0 ] += 1;
				tau[ 0 ] = ZERO;
				break;
			}
			tau[ 0 ] = ZERO;
			continue;
		} else {
			// Possible underflow. Play it safe. (label 80)
			dlasq6( i0, n0[ 0 ], z, strideZ, offsetZ, pp[ 0 ], dminOut, dmin1Out, dmin2Out, dnOut, dnm1, dnm2 );
			dmin[ 0 ] = dminOut[ 0 ];
			dmin1[ 0 ] = dmin1Out[ 0 ];
			dmin2[ 0 ] = dmin2Out[ 0 ];
			dn[ 0 ] = dnOut[ 0 ];
			dn1[ 0 ] = dnm1[ 0 ];
			dn2[ 0 ] = dnm2[ 0 ];
			ndiv[ 0 ] += ( n0[ 0 ] - i0 + 2 );
			iter[ 0 ] += 1;
			tau[ 0 ] = ZERO;
			break;
		}
	}

	// Label 90: update sigma
	if ( tau[ 0 ] < sigma[ 0 ] ) {
		desig[ 0 ] += tau[ 0 ];
		t = sigma[ 0 ] + desig[ 0 ];
		desig[ 0 ] -= ( t - sigma[ 0 ] );
	} else {
		t = sigma[ 0 ] + tau[ 0 ];
		desig[ 0 ] = sigma[ 0 ] - ( t - tau[ 0 ] ) + desig[ 0 ];
	}
	sigma[ 0 ] = t;

	return z;
}


// EXPORTS //

export default dlasq3;
