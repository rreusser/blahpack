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

/* eslint-disable max-len, max-params, new-cap */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';
import disnan from '../../disnan/lib/base.js';
import dlasq4 from '../../dlasq4/lib/base.js';
import dlasq5 from '../../dlasq5/lib/base.js';
import dlasq6 from '../../dlasq6/lib/base.js';


// VARIABLES //

var CBIAS = 1.50;
var QURTR = 0.250;
var HALF = 0.50;
var ONE = 1.0;
var TWO = 2.0;
var HUNDRD = 100.0;
var ZERO = 0.0;


// MAIN //

/**
* Checks for deflation, computes a shift (TAU) and calls dqds. In case of.
* failure it changes shifts, and tries again until output is positive.
*
* @private
* @param {integer} i0 - first index (1-based)
* @param {integer} n0 - last index (1-based)
* @param {Float64Array} z - qd array
* @param {integer} stride - stride length for `z`
* @param {NonNegativeInteger} offset - starting index for `z`
* @param {integer} pp - ping-pong flag (0, 1, or 2)
* @param {number} dmin - minimum value of d
* @param {number} sigma - accumulated shift
* @param {number} desig - lower order part of sigma
* @param {number} qmax - maximum value of q
* @param {integer} nfail - failure counter
* @param {integer} iter - iteration counter
* @param {integer} ndiv - division counter
* @param {boolean} ieee - flag for IEEE arithmetic
* @param {integer} ttype - shift type
* @param {number} dmin1 - min d excluding d(n0)
* @param {number} dmin2 - min d excluding d(n0) and d(n0-1)
* @param {number} dn - d(n0)
* @param {number} dn1 - d(n0-1)
* @param {number} dn2 - d(n0-2)
* @param {number} g - damping parameter
* @param {number} tau - shift value
* @returns {Object} object with updated values
*/
function dlasq3( i0, n0, z, stride, offset, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, ieee, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ) {
	var n0in;
	var tol2;
	var ipn4;
	var temp;
	var eps;
	var tol;
	var nn;
	var j4;
	var s;
	var t;
	var r;

	/**
	* Access Z using 1-based Fortran index.
	*
	* @private
	* @param {integer} idx - 1-based index
	* @returns {number} array element
	*/
	function Z( idx ) {
		return z[ offset + (( idx - 1 ) * stride) ];
	}

	/**
	* Set Z using 1-based Fortran index.
	*
	* @private
	* @param {integer} idx - 1-based index
	* @param {number} val - value to set
	*/
	function setZ( idx, val ) {
		z[ offset + (( idx - 1 ) * stride) ] = val;
	}

	n0in = n0;
	eps = dlamch( 'Precision' );
	tol = eps * HUNDRD;
	tol2 = tol * tol;

	// Main deflation loop (Fortran label 10)
	while ( true ) {
		if ( n0 < i0 ) {
			return {
				'n0': n0,
				'pp': pp,
				'dmin': dmin,
				'sigma': sigma,
				'desig': desig,
				'qmax': qmax,
				'nfail': nfail,
				'iter': iter,
				'ndiv': ndiv,
				'ttype': ttype,
				'dmin1': dmin1,
				'dmin2': dmin2,
				'dn': dn,
				'dn1': dn1,
				'dn2': dn2,
				'g': g,
				'tau': tau
			};
		}
		if ( n0 === i0 ) {
			// Deflate 1 eigenvalue (label 20)
			setZ( (4 * n0) - 3, Z( (4 * n0) + pp - 3 ) + sigma );
			n0 -= 1;
			continue;
		}
		nn = (4 * n0) + pp;
		if ( n0 === ( i0 + 1 ) ) {
			// 2 eigenvalues (label 40) — skip label 30 check
			// Fall through to label 40 below
		} else if ( Z( nn - 5 ) > tol2 * ( sigma + Z( nn - 3 ) ) &&
			Z( nn - (2 * pp) - 4 ) > tol2 * Z( nn - 7 ) ) {
			// Check whether E(N0-1) is negligible, 1 eigenvalue
			// Not negligible, go to label 30
			// Check whether E(N0-2) is negligible, 2 eigenvalues
			if ( Z( nn - 9 ) > tol2 * sigma &&
				Z( nn - (2 * pp) - 8 ) > tol2 * Z( nn - 11 ) ) {
				// Not negligible, go to label 50 — break out of deflation
				break;
			}
			// Fall through to label 40 (2-eigenvalue deflation)
		} else {
			// Negligible: deflate 1 eigenvalue (label 20)
			setZ( (4 * n0) - 3, Z( (4 * n0) + pp - 3 ) + sigma );
			n0 -= 1;
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
		setZ( (4 * n0) - 7, Z( nn - 7 ) + sigma );
		setZ( (4 * n0) - 3, Z( nn - 3 ) + sigma );
		n0 -= 2;
		continue;
	}

	// Label 50: past deflation checks
	if ( pp === 2 ) {
		pp = 0;
	}

	// Reverse the qd-array, if warranted
	if ( dmin <= ZERO || n0 < n0in ) {
		if ( CBIAS * Z( (4 * i0) + pp - 3 ) < Z( (4 * n0) + pp - 3 ) ) {
			ipn4 = 4 * ( i0 + n0 );
			for ( j4 = 4 * i0; j4 <= 2 * ( i0 + n0 - 1 ); j4 += 4 ) {
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
			if ( n0 - i0 <= 4 ) {
				setZ( (4 * n0) + pp - 1, Z( (4 * i0) + pp - 1 ) );
				setZ( (4 * n0) - pp, Z( (4 * i0) - pp ) );
			}
			dmin2 = Math.min( dmin2, Z( (4 * n0) + pp - 1 ) );
			setZ( (4 * n0) + pp - 1, Math.min( Z( (4 * n0) + pp - 1 ), Z( (4 * i0) + pp - 1 ), Z( (4 * i0) + pp + 3 ) ) );
			setZ( (4 * n0) - pp, Math.min( Z( (4 * n0) - pp ), Z( (4 * i0) - pp ), Z( (4 * i0) - pp + 4 ) ) );
			qmax = Math.max( qmax, Z( (4 * i0) + pp - 3 ), Z( (4 * i0) + pp + 1 ) );
			dmin = -ZERO;
		}
	}

	// Choose a shift (dlasq4)
	r = dlasq4( i0, n0, z, stride, offset, pp, n0in, dmin, dmin1, dmin2, dn, dn1, dn2, tau, ttype, g );
	tau = r.tau;
	ttype = r.ttype;
	g = r.g;

	// Call dqds until DMIN > 0 (Fortran label 70)
	while ( true ) {
		r = dlasq5( i0, n0, z, stride, offset, pp, tau, sigma, ieee, eps );
		dmin = r.dmin;
		dmin1 = r.dmin1;
		dmin2 = r.dmin2;
		dn = r.dn;
		dn1 = r.dnm1;
		dn2 = r.dnm2;

		ndiv += ( n0 - i0 + 2 );
		iter += 1;

		// Check status
		if ( dmin >= ZERO && dmin1 >= ZERO ) {
			// Success — go to label 90
			break;
		} else if ( dmin < ZERO && dmin1 > ZERO &&
			Z( (4 * ( n0 - 1 )) - pp ) < tol * ( sigma + dn1 ) &&
			Math.abs( dn ) < tol * sigma ) {
			// Convergence hidden by negative DN
			setZ( (4 * ( n0 - 1 )) - pp + 2, ZERO );
			dmin = ZERO;
			break;
		} else if ( dmin < ZERO ) {
			// TAU too big. Select new TAU and try again.
			nfail += 1;
			if ( ttype < -22 ) {
				// Failed twice. Play it safe.
				tau = ZERO;
			} else if ( dmin1 > ZERO ) {
				// Late failure. Gives excellent shift.
				tau = ( tau + dmin ) * ( ONE - (TWO * eps) );
				ttype -= 11;
			} else {
				// Early failure. Divide by 4.
				tau *= QURTR;
				ttype -= 12;
			}
			continue;
		} else if ( disnan( dmin ) ) {
			// NaN
			if ( tau === ZERO ) {
				// Go to label 80 (risk of underflow)
				r = dlasq6( i0, n0, z, stride, offset, pp );
				dmin = r.dmin;
				dmin1 = r.dmin1;
				dmin2 = r.dmin2;
				dn = r.dn;
				dn1 = r.dnm1;
				dn2 = r.dnm2;
				ndiv += ( n0 - i0 + 2 );
				iter += 1;
				tau = ZERO;
				break;
			}
			tau = ZERO;
			continue;
		} else {
			// Possible underflow. Play it safe. (label 80)
			r = dlasq6( i0, n0, z, stride, offset, pp );
			dmin = r.dmin;
			dmin1 = r.dmin1;
			dmin2 = r.dmin2;
			dn = r.dn;
			dn1 = r.dnm1;
			dn2 = r.dnm2;
			ndiv += ( n0 - i0 + 2 );
			iter += 1;
			tau = ZERO;
			break;
		}
	}

	// Label 90: update sigma
	if ( tau < sigma ) {
		desig += tau;
		t = sigma + desig;
		desig -= ( t - sigma );
	} else {
		t = sigma + tau;
		desig = sigma - ( t - tau ) + desig;
	}
	sigma = t;

	return {
		'n0': n0,
		'pp': pp,
		'dmin': dmin,
		'sigma': sigma,
		'desig': desig,
		'qmax': qmax,
		'nfail': nfail,
		'iter': iter,
		'ndiv': ndiv,
		'ttype': ttype,
		'dmin1': dmin1,
		'dmin2': dmin2,
		'dn': dn,
		'dn1': dn1,
		'dn2': dn2,
		'g': g,
		'tau': tau
	};
}


// EXPORTS //

export default dlasq3;
