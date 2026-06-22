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

/* eslint-disable max-len, max-params, new-cap */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';
import dlasq3 from '../../dlasq3/lib/base.js';
import dlasrt from '../../dlasrt/lib/base.js';


// VARIABLES //

var CBIAS = 1.50;
var ZERO = 0.0;
var HALF = 0.5;
var ONE = 1.0;
var TWO = 2.0;
var FOUR = 4.0;
var HUNDRD = 100.0;


// MAIN //

/**
* Computes all the eigenvalues of the symmetric positive definite tridiagonal.
* matrix associated with the qd array Z to high relative accuracy.
*
* @private
* @param {NonNegativeInteger} N - number of rows and columns
* @param {Float64Array} z - qd array of dimension 4*N
* @param {integer} stride - stride length for `z`
* @param {NonNegativeInteger} offset - starting index for `z`
* @returns {integer} info - status code (0 = success)
*/
function dlasq2( N, z, stride, offset ) {
	var deemin;
	var oldemn;
	var safmin;
	var iwhila;
	var iwhilb;
	var desig;
	var dmin1;
	var dmin2;
	var sigma;
	var trace;
	var tempq;
	var tempe;
	var ttype;
	var nfail;
	var emax;
	var emin;
	var info;
	var iter;
	var nbig;
	var ndiv;
	var ipn4;
	var kmin;
	var dmin;
	var qmax;
	var qmin;
	var temp;
	var tol2;
	var zmax;
	var splt;
	var dee;
	var eps;
	var tol;
	var tau;
	var dn1;
	var dn2;
	var pp;
	var i0;
	var i1;
	var i4;
	var n0;
	var n1;
	var dn;
	var r;
	var d;
	var e;
	var g;
	var k;
	var s;
	var t;

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

	info = 0;
	eps = dlamch( 'Precision' );
	safmin = dlamch( 'Safe minimum' );
	tol = eps * HUNDRD;
	tol2 = tol * tol;

	if ( N < 0 ) {
		return -1;
	}
	if ( N === 0 ) {
		return 0;
	}
	if ( N === 1 ) {
		// 1-by-1 case
		if ( Z( 1 ) < ZERO ) {
			return -201;
		}
		return 0;
	}
	if ( N === 2 ) {
		// 2-by-2 case
		if ( Z( 1 ) < ZERO ) {
			return -201;
		}
		if ( Z( 2 ) < ZERO ) {
			return -202;
		}
		if ( Z( 3 ) < ZERO ) {
			return -203;
		}
		if ( Z( 3 ) > Z( 1 ) ) {
			d = Z( 3 );
			setZ( 3, Z( 1 ) );
			setZ( 1, d );
		}
		setZ( 5, Z( 1 ) + Z( 2 ) + Z( 3 ) );
		if ( Z( 2 ) > Z( 3 ) * tol2 ) {
			t = HALF * ( ( Z( 1 ) - Z( 3 ) ) + Z( 2 ) );
			s = Z( 3 ) * ( Z( 2 ) / t );
			if ( s <= t ) {
				s = Z( 3 ) * ( Z( 2 ) / ( t * ( ONE + Math.sqrt( ONE + (s / t) ) ) ) );
			} else {
				s = Z( 3 ) * ( Z( 2 ) / ( t + (Math.sqrt( t ) * Math.sqrt( t + s )) ) );
			}
			t = Z( 1 ) + ( s + Z( 2 ) );
			setZ( 3, Z( 3 ) * ( Z( 1 ) / t ) );
			setZ( 1, t );
		}
		setZ( 2, Z( 3 ) );
		setZ( 6, Z( 2 ) + Z( 1 ) );
		return 0;
	}

	// Check for negative data and compute sums of q's and e's
	setZ( 2 * N, ZERO );
	emin = Z( 2 );
	qmax = ZERO;
	zmax = ZERO;
	d = ZERO;
	e = ZERO;

	for ( k = 1; k <= 2 * ( N - 1 ); k += 2 ) {
		if ( Z( k ) < ZERO ) {
			return -( 200 + k );
		}
		if ( Z( k + 1 ) < ZERO ) {
			return -( 200 + k + 1 );
		}
		d += Z( k );
		e += Z( k + 1 );
		qmax = Math.max( qmax, Z( k ) );
		emin = Math.min( emin, Z( k + 1 ) );
		zmax = Math.max( qmax, zmax, Z( k + 1 ) );
	}
	if ( Z( (2 * N) - 1 ) < ZERO ) {
		return -( 200 + (2 * N) - 1 );
	}
	d += Z( (2 * N) - 1 );
	qmax = Math.max( qmax, Z( (2 * N) - 1 ) );
	zmax = Math.max( qmax, zmax );

	// Check for diagonality
	if ( e === ZERO ) {
		for ( k = 2; k <= N; k++ ) {
			setZ( k, Z( (2 * k) - 1 ) );
		}
		dlasrt( 'decreasing', N, z, stride, offset );
		setZ( (2 * N) - 1, d );
		return 0;
	}

	trace = d + e;

	// Check for zero data
	if ( trace === ZERO ) {
		setZ( (2 * N) - 1, ZERO );
		return 0;
	}

	// Check whether the machine is IEEE conformable
	// (In JS, always true)
	// IEEE = true

	// Rearrange data for locality: Z=(q1,qq1,e1,ee1,q2,qq2,e2,ee2,...)
	for ( k = 2 * N; k >= 2; k -= 2 ) {
		setZ( (2 * k), ZERO );
		setZ( (2 * k) - 1, Z( k ) );
		setZ( (2 * k) - 2, ZERO );
		setZ( (2 * k) - 3, Z( k - 1 ) );
	}

	i0 = 1;
	n0 = N;

	// Reverse the qd-array, if warranted
	if ( (CBIAS * Z( (4 * i0) - 3 )) < Z( (4 * n0) - 3 ) ) {
		ipn4 = 4 * ( i0 + n0 );
		for ( i4 = 4 * i0; i4 <= 2 * ( i0 + n0 - 1 ); i4 += 4 ) {
			temp = Z( i4 - 3 );
			setZ( i4 - 3, Z( ipn4 - i4 - 3 ) );
			setZ( ipn4 - i4 - 3, temp );
			temp = Z( i4 - 1 );
			setZ( i4 - 1, Z( ipn4 - i4 - 5 ) );
			setZ( ipn4 - i4 - 5, temp );
		}
	}

	// Initial split checking via dqd and Li's test
	pp = 0;

	for ( k = 1; k <= 2; k++ ) {
		d = Z( (4 * n0) + pp - 3 );
		for ( i4 = (4 * ( n0 - 1 )) + pp; i4 >= (4 * i0) + pp; i4 -= 4 ) {
			if ( Z( i4 - 1 ) <= tol2 * d ) {
				setZ( i4 - 1, -ZERO );
				d = Z( i4 - 3 );
			} else {
				d = Z( i4 - 3 ) * ( d / ( d + Z( i4 - 1 ) ) );
			}
		}

		// Dqd maps Z to ZZ plus Li's test
		emin = Z( (4 * i0) + pp + 1 );
		d = Z( (4 * i0) + pp - 3 );
		for ( i4 = (4 * i0) + pp; i4 <= (4 * ( n0 - 1 )) + pp; i4 += 4 ) {
			setZ( i4 - (2 * pp) - 2, d + Z( i4 - 1 ) );
			if ( Z( i4 - 1 ) <= (tol2 * d) ) {
				setZ( i4 - 1, -ZERO );
				setZ( i4 - (2 * pp) - 2, d );
				setZ( i4 - (2 * pp), ZERO );
				d = Z( i4 + 1 );
			} else if ( (safmin * Z( i4 + 1 )) < Z( i4 - (2 * pp) - 2 ) &&
				(safmin * Z( i4 - (2 * pp) - 2 )) < Z( i4 + 1 ) ) {
				temp = Z( i4 + 1 ) / Z( i4 - (2 * pp) - 2 );
				setZ( i4 - (2 * pp), (Z( i4 - 1 ) * temp) );
				d *= temp;
			} else {
				setZ( i4 - (2 * pp), Z( i4 + 1 ) * ( Z( i4 - 1 ) / Z( i4 - (2 * pp) - 2 ) ) );
				d = Z( i4 + 1 ) * ( d / Z( i4 - (2 * pp) - 2 ) );
			}
			emin = Math.min( emin, Z( i4 - (2 * pp) ) );
		}
		setZ( (4 * n0) - pp - 2, d );

		// Now find qmax
		qmax = Z( (4 * i0) - pp - 2 );
		for ( i4 = (4 * i0) - pp + 2; i4 <= (4 * n0) - pp - 2; i4 += 4 ) {
			qmax = Math.max( qmax, Z( i4 ) );
		}

		// Prepare for the next iteration on K
		pp = 1 - pp;
	}

	// Initialize variables to pass to DLASQ3
	ttype = 0;
	dmin1 = ZERO;
	dmin2 = ZERO;
	dn = ZERO;
	dn1 = ZERO;
	dn2 = ZERO;
	g = ZERO;
	tau = ZERO;

	iter = 2;
	nfail = 0;
	ndiv = 2 * ( n0 - i0 );

	// Main outer loop (DO 160 IWHILA = 1, N + 1)
	for ( iwhila = 1; iwhila <= N + 1; iwhila++ ) {
		if ( n0 < 1 ) {
			// GO TO 170 — success path
			// Move q's to the front
			for ( k = 2; k <= N; k++ ) {
				setZ( k, Z( (4 * k) - 3 ) );
			}

			// Sort and compute sum of eigenvalues
			dlasrt( 'decreasing', N, z, stride, offset );

			e = ZERO;
			for ( k = N; k >= 1; k-- ) {
				e += Z( k );
			}

			// Store trace, sum(eigenvalues) and information on performance
			setZ( (2 * N) + 1, trace );
			setZ( (2 * N) + 2, e );
			setZ( (2 * N) + 3, iter );
			setZ( (2 * N) + 4, ndiv / ( N * N ) );
			setZ( (2 * N) + 5, (HUNDRD * nfail) / iter );
			return 0;
		}

		// E(N0) holds the value of SIGMA when submatrix in I0:N0
		// Splits from the rest of the array, but is negated.
		desig = ZERO;
		if ( n0 === N ) {
			sigma = ZERO;
		} else {
			sigma = -Z( (4 * n0) - 1 );
		}
		if ( sigma < ZERO ) {
			info = 1;
			return info;
		}

		// Find last unreduced submatrix's top index I0, find QMAX and
		// EMIN. Find Gershgorin-type bound if Q's much greater than E's.
		emax = ZERO;
		if ( n0 > i0 ) {
			emin = Math.abs( Z( (4 * n0) - 5 ) );
		} else {
			emin = ZERO;
		}
		qmin = Z( (4 * n0) - 3 );
		qmax = qmin;

		// DO 90 loop
		for ( i4 = 4 * n0; i4 >= 8; i4 -= 4 ) {
			if ( Z( i4 - 5 ) <= ZERO ) {
				// GO TO 100
				break;
			}
			if ( qmin >= FOUR * emax ) {
				qmin = Math.min( qmin, Z( i4 - 3 ) );
				emax = Math.max( emax, Z( i4 - 5 ) );
			}
			qmax = Math.max( qmax, Z( i4 - 7 ) + Z( i4 - 5 ) );
			emin = Math.min( emin, Z( i4 - 5 ) );
		}
		// If the loop completed without break, set i4 = 4
		if ( i4 < 8 ) {
			i4 = 4;
		}

		// Label 100
		i0 = i4 / 4;
		pp = 0;

		if ( n0 - i0 > 1 ) {
			dee = Z( (4 * i0) - 3 );
			deemin = dee;
			kmin = i0;
			for ( i4 = (4 * i0) + 1; i4 <= (4 * n0) - 3; i4 += 4 ) {
				dee = Z( i4 ) * ( dee / ( dee + Z( i4 - 2 ) ) );
				if ( dee <= deemin ) {
					deemin = dee;
					kmin = ( ( i4 + 3 ) / 4 ) | 0;
				}
			}
			if ( (( kmin - i0 ) * 2) < n0 - kmin &&
				deemin <= (HALF * Z( (4 * n0) - 3 )) ) {
				ipn4 = 4 * ( i0 + n0 );
				pp = 2;
				for ( i4 = 4 * i0; i4 <= 2 * ( i0 + n0 - 1 ); i4 += 4 ) {
					temp = Z( i4 - 3 );
					setZ( i4 - 3, Z( ipn4 - i4 - 3 ) );
					setZ( ipn4 - i4 - 3, temp );
					temp = Z( i4 - 2 );
					setZ( i4 - 2, Z( ipn4 - i4 - 2 ) );
					setZ( ipn4 - i4 - 2, temp );
					temp = Z( i4 - 1 );
					setZ( i4 - 1, Z( ipn4 - i4 - 5 ) );
					setZ( ipn4 - i4 - 5, temp );
					temp = Z( i4 );
					setZ( i4, Z( ipn4 - i4 - 4 ) );
					setZ( ipn4 - i4 - 4, temp );
				}
			}
		}

		// Put -(initial shift) into DMIN
		dmin = -Math.max( ZERO, qmin - (TWO * Math.sqrt( qmin ) * Math.sqrt( emax )) );

		// Inner loop: call dlasq3 repeatedly
		nbig = 100 * ( n0 - i0 + 1 );
		for ( iwhilb = 1; iwhilb <= nbig; iwhilb++ ) {
			if ( i0 > n0 ) {
				// GO TO 150
				break;
			}

			// Call dlasq3
			r = dlasq3( i0, n0, z, stride, offset, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau );

			n0 = r.n0;
			pp = r.pp;
			dmin = r.dmin;
			sigma = r.sigma;
			desig = r.desig;
			qmax = r.qmax;
			nfail = r.nfail;
			iter = r.iter;
			ndiv = r.ndiv;
			ttype = r.ttype;
			dmin1 = r.dmin1;
			dmin2 = r.dmin2;
			dn = r.dn;
			dn1 = r.dn1;
			dn2 = r.dn2;
			g = r.g;
			tau = r.tau;

			pp = 1 - pp;

			// When EMIN is very small check for splits
			if ( pp === 0 && n0 - i0 >= 3 ) {
				if ( Z( (4 * n0) ) <= (tol2 * qmax) ||
					Z( (4 * n0) - 1 ) <= (tol2 * sigma) ) {
					splt = i0 - 1;
					qmax = Z( (4 * i0) - 3 );
					emin = Z( (4 * i0) - 1 );
					oldemn = Z( (4 * i0) );
					for ( i4 = 4 * i0; i4 <= 4 * ( n0 - 3 ); i4 += 4 ) {
						if ( Z( i4 ) <= (tol2 * Z( i4 - 3 )) ||
							Z( i4 - 1 ) <= (tol2 * sigma) ) {
							setZ( i4 - 1, -sigma );
							splt = ( i4 / 4 ) | 0;
							qmax = ZERO;
							emin = Z( i4 + 3 );
							oldemn = Z( i4 + 4 );
						} else {
							qmax = Math.max( qmax, Z( i4 + 1 ) );
							emin = Math.min( emin, Z( i4 - 1 ) );
							oldemn = Math.min( oldemn, Z( i4 ) );
						}
					}
					setZ( (4 * n0) - 1, emin );
					setZ( (4 * n0), oldemn );
					i0 = splt + 1;
				}
			}
		}

		// If inner loop exhausted without breaking, we have INFO = 2
		if ( iwhilb > nbig ) {
			// Maximum number of iterations exceeded, restore the shift SIGMA
			// And place the new d's and e's in a qd array.
			info = 2;

			i1 = i0;
			n1 = n0;

			// Label 145 loop
			while ( true ) {
				tempq = Z( (4 * i0) - 3 );
				setZ( (4 * i0) - 3, Z( (4 * i0) - 3 ) + sigma );
				for ( k = i0 + 1; k <= n0; k++ ) {
					tempe = Z( (4 * k) - 5 );
					setZ( (4 * k) - 5, Z( (4 * k) - 5 ) * ( tempq / Z( (4 * k) - 7 ) ) );
					tempq = Z( (4 * k) - 3 );
					setZ( (4 * k) - 3, Z( (4 * k) - 3 ) + sigma + tempe - Z( (4 * k) - 5 ) );
				}

				// Prepare to do this on the previous block if there is one
				if ( i1 > 1 ) {
					n1 = i1 - 1;
					while ( i1 >= 2 && Z( (4 * i1) - 5 ) >= ZERO ) {
						i1 -= 1;
					}
					sigma = -Z( (4 * n1) - 1 );
					i0 = i1;

					// GO TO 145 — continue the while loop
				} else {
					break;
				}
			}

			for ( k = 1; k <= N; k++ ) {
				setZ( (2 * k) - 1, Z( (4 * k) - 3 ) );
				if ( k < n0 ) {
					setZ( (2 * k), Z( (4 * k) - 1 ) );
				} else {
					setZ( (2 * k), 0 );
				}
			}
			return info;
		}

		// Label 150 — end of IWHILB (successful)
		// Continue to next IWHILA iteration
	}

	// Fell through the IWHILA loop: INFO = 3
	return 3;
}


// EXPORTS //

export default dlasq2;
