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

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import dlas2 from '../../dlas2/lib/base.js';
import dlasq1 from '../../dlasq1/lib/base.js';
import dlasv2 from '../../dlasv2/lib/base.js';
import drot from '../../../../blas/base/drot/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dlasr from '../../dlasr/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var NEGONE = -1.0;
var HNDRTH = 0.01;
var TEN = 10.0;
var HNDRD = 100.0;
var MEIGTH = -0.125;
var MAXITR = 6;

// Module-level scratch to avoid per-call allocation
var DOUT = new Float64Array( 2 );


// FUNCTIONS //

/**
* Returns |a| with the sign of b (Fortran SIGN intrinsic).
*
* @private
* @param {number} a - magnitude source
* @param {number} b - sign source
* @returns {number} |a| * sign(b)
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
* Computes the singular values and, optionally, the right and/or left.
* singular vectors from the singular value decomposition (SVD) of a real
* N-by-N (upper or lower) bidiagonal matrix B using the implicit
* zero-shift QR algorithm.
*
* The SVD of B has the form:
* `B = Q*S*P^T`
* where S is the diagonal matrix of singular values, Q is an orthogonal
* matrix of left singular vectors, and P is an orthogonal matrix of right
* singular vectors.
*
* If left singular vectors are requested, this subroutine actually returns
* U_Q instead of Q, and if right singular vectors are requested, this
* subroutine returns P^T_VT instead of P^T, for given real input
* matrices U and VT.
*
* ## Notes
*
* -   D and E are real arrays containing diagonal and off-diagonal elements.
*
* -   VT, U, C are Float64Arrays (real matrices).
*
* -   WORK is a real workspace of length at least max(1, 4_N-4) when NCVT=NRU=NCC=0,
* or max(1, 4_N) otherwise.
*
* @private
* @param {string} uplo - `'upper'` for upper bidiagonal, `'lower'` for lower bidiagonal
* @param {NonNegativeInteger} N - order of the bidiagonal matrix
* @param {NonNegativeInteger} ncvt - number of columns in VT
* @param {NonNegativeInteger} nru - number of rows in U
* @param {NonNegativeInteger} ncc - number of columns in C
* @param {Float64Array} d - diagonal elements (length N), real
* @param {integer} strideD - stride for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - off-diagonal elements (length N-1), real
* @param {integer} strideE - stride for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} VT - right singular vectors (N-by-NCVT)
* @param {integer} strideVT1 - stride of first dimension of VT
* @param {integer} strideVT2 - stride of second dimension of VT
* @param {NonNegativeInteger} offsetVT - starting index for VT
* @param {Float64Array} U - left singular vectors (NRU-by-N)
* @param {integer} strideU1 - stride of first dimension of U
* @param {integer} strideU2 - stride of second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Float64Array} C - matrix C (N-by-NCC)
* @param {integer} strideC1 - stride of first dimension of C
* @param {integer} strideC2 - stride of second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - real workspace array
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 on success, >0 if convergence failed
*/
function dbdsqr( uplo, N, ncvt, nru, ncc, d, strideD, offsetD, e, strideE, offsetE, VT, strideVT1, strideVT2, offsetVT, U, strideU1, strideU2, offsetU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var splitFound;
	var maxitdivn;
	var converged;
	var iterdivn;
	var rotate;
	var thresh;
	var sminoa;
	var tolmul;
	var lower;
	var oldcs;
	var oldsn;
	var shift;
	var sigmn;
	var sigmx;
	var oldll;
	var oldm;
	var smax;
	var smin;
	var abse;
	var abss;
	var cosl;
	var cosr;
	var sinl;
	var sinr;
	var unfl;
	var info;
	var idir;
	var iter;
	var dout;
	var svd2;
	var nm12;
	var nm13;
	var rot;
	var eps;
	var nm1;
	var tol;
	var sll;
	var lll;
	var cs;
	var sn;
	var mu;
	var ll;
	var m;
	var f;
	var g;
	var h;
	var r;
	var i;

	// Reuse module-level scratch for dlas2 output:
	dout = DOUT;
	rot = new Float64Array( 3 );

	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	lower = ( uplo === 'lower' );

	// N=1 case: jump to sorting section
	if ( N === 1 ) {
		// Make singular value non-negative
		if ( d[ offsetD ] < ZERO ) {
			d[ offsetD ] = -d[ offsetD ];
			if ( ncvt > 0 ) {
				dscal( ncvt, NEGONE, VT, strideVT2, offsetVT );
			}
		}
		return 0;
	}

	// Check if we need to accumulate rotations
	rotate = ( ncvt > 0 ) || ( nru > 0 ) || ( ncc > 0 );

	// If no singular vectors requested, use dqds algorithm
	if ( !rotate ) {
		info = dlasq1( N, d, strideD, offsetD, e, strideE, offsetE, WORK, strideWork, offsetWork );

		// If dlasq1 returned 2 (failed to converge), fall through to QR iteration
		if ( info !== 2 ) {
			return info;
		}
		info = 0;
	}

	nm1 = N - 1;
	nm12 = nm1 + nm1;
	nm13 = nm12 + nm1;
	idir = 0;

	// Get machine constants
	eps = dlamch( 'Epsilon' );
	unfl = dlamch( 'Safe minimum' );

	// If matrix is lower bidiagonal, rotate to upper bidiagonal
	if ( lower ) {
		for ( i = 0; i < N - 1; i++ ) {
			dlartg( d[ offsetD + (i * strideD) ], e[ offsetE + (i * strideE) ], rot );
			cs = rot[ 0 ];
			sn = rot[ 1 ];
			r = rot[ 2 ];
			d[ offsetD + (i * strideD) ] = r;
			e[ offsetE + (i * strideE) ] = sn * d[ offsetD + (( i + 1 ) * strideD) ];
			d[ offsetD + (( i + 1 ) * strideD) ] = cs * d[ offsetD + (( i + 1 ) * strideD) ];
			WORK[ offsetWork + (i * strideWork) ] = cs;
			WORK[ offsetWork + (( nm1 + i ) * strideWork) ] = sn;
		}

		// If NRU > 0, apply rotations to U from the right
		// Fortran: DLASR('R','V','F', NRU, N, WORK(1), WORK(N), U, LDU)
		if ( nru > 0 ) {
			dlasr( 'right', 'variable', 'forward', nru, N, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork + (nm1 * strideWork), U, strideU1, strideU2, offsetU);
		}
		// If NCC > 0, apply rotations to C from the left
		// Fortran: DLASR('lower','V','F', N, NCC, WORK(1), WORK(N), C, LDC)
		if ( ncc > 0 ) {
			dlasr( 'left', 'variable', 'forward', N, ncc, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork + (nm1 * strideWork), C, strideC1, strideC2, offsetC);
		}
	}

	// Compute the tolerance for convergence
	tolmul = Math.max( TEN, Math.min( HNDRD, Math.pow( eps, MEIGTH ) ) );
	tol = tolmul * eps;

	// Compute SMAX = max absolute value of all D and E entries
	smax = ZERO;
	for ( i = 0; i < N; i++ ) {
		smax = Math.max( smax, Math.abs( d[ offsetD + (i * strideD) ] ) );
	}
	for ( i = 0; i < N - 1; i++ ) {
		smax = Math.max( smax, Math.abs( e[ offsetE + (i * strideE) ] ) );
	}

	// Compute SMINOA (smallest singular value estimate) if tol >= 0
	smin = ZERO;
	if ( tol >= ZERO ) {
		sminoa = Math.abs( d[ offsetD ] );
		if ( sminoa !== ZERO ) {
			mu = sminoa;
			for ( i = 1; i < N; i++ ) {
				mu = Math.abs( d[ offsetD + (i * strideD) ] ) * ( mu / ( mu + Math.abs( e[ offsetE + (( i - 1 ) * strideE) ] ) ) );
				sminoa = Math.min( sminoa, mu );
				if ( sminoa === ZERO ) {
					break;
				}
			}
		}
		sminoa /= Math.sqrt( N );
		thresh = Math.max( tol * sminoa, MAXITR * ( N * ( N * unfl ) ) );
	} else {
		thresh = Math.max( Math.abs( tol ) * smax, MAXITR * ( N * ( N * unfl ) ) );
	}

	// Main iteration loop
	maxitdivn = MAXITR * N;
	iterdivn = 0;
	iter = -1;
	oldll = -1;
	oldm = -1;

	// M points to last element of unconverged part of matrix
	m = N - 1; // 0-based (Fortran M starts at N, we use N-1)

	// Outer loop (label 60 in Fortran)

	/* eslint-disable max-len, max-params */
	while ( true ) { // eslint-disable-line no-constant-condition
		// Check if the matrix is split
		if ( m <= 0 ) {
			break;
		}

		if ( iter >= N ) {
			iter -= N;
			iterdivn += 1;
			if ( iterdivn >= maxitdivn ) {
				// Non-convergence: count remaining non-zero E entries
				info = 0;
				for ( i = 0; i < N - 1; i++ ) {
					if ( e[ offsetE + (i * strideE) ] !== ZERO ) {
						info += 1;
					}
				}
				// Sort singular values and make non-negative before returning
				sortSingularValues( N, d, strideD, offsetD, ncvt, VT, strideVT1, strideVT2, offsetVT, nru, U, strideU1, strideU2, offsetU, ncc, C, strideC1, strideC2, offsetC );
				return info;
			}
		}

		// Find diagonal block of matrix to work on (label 70 in Fortran)
		// Zero out negligible E entries from the bottom
		if ( tol < ZERO && Math.abs( d[ offsetD + (m * strideD) ] ) <= thresh ) {
			d[ offsetD + (m * strideD) ] = ZERO;
		}
		smax = Math.abs( d[ offsetD + (m * strideD) ] );

		ll = -1; // will be set below
		splitFound = false;
		for ( lll = 0; lll < m; lll++ ) {
			ll = m - 1 - lll; // scanning from m-1 down to 0
			abss = Math.abs( d[ offsetD + (ll * strideD) ] );
			abse = Math.abs( e[ offsetE + (ll * strideE) ] );
			if ( tol < ZERO && abss <= thresh ) {
				d[ offsetD + (ll * strideD) ] = ZERO;
			}
			if ( abse <= thresh ) {
				// Found a negligible E entry
				e[ offsetE + (ll * strideE) ] = ZERO;

				// Matrix splits
				if ( ll === m - 1 ) {
					// Bottom singular value found: decrement m and restart
					m -= 1;
					splitFound = true;
					break;
				}
				// ll is the index where split occurs
				ll += 1;
				break;
			}
			smax = Math.max( smax, abss, abse );
			if ( lll === m - 1 ) {
				// No split found: ll = 0
				ll = 0;
				break;
			}
		}
		if ( splitFound ) {
			continue;
		}
		if ( m === 0 ) {
			// Edge case: single element
			break;
		}
		if ( ll === -1 ) {
			ll = 0;
		}

		// 2-by-2 block at bottom (label 90 in Fortran)
		if ( ll === m - 1 ) {
			// 2-by-2 block: compute SVD
			svd2 = dlasv2(d[ offsetD + (( m - 1 ) * strideD) ], e[ offsetE + (( m - 1 ) * strideE) ], d[ offsetD + (m * strideD) ]);
			sigmn = svd2.ssmin;
			sigmx = svd2.ssmax;
			sinr = svd2.snr;
			cosr = svd2.csr;
			sinl = svd2.snl;
			cosl = svd2.csl;
			d[ offsetD + (( m - 1 ) * strideD) ] = sigmx;
			e[ offsetE + (( m - 1 ) * strideE) ] = ZERO;
			d[ offsetD + (m * strideD) ] = sigmn;

			// Update singular vectors if requested
			if ( ncvt > 0 ) {
				// DROT(NCVT, VT(M-1,1), LDVT, VT(M,1), LDVT, COSR, SINR)
				// In 0-based: rows m-1 and m of VT
				drot( ncvt, VT, strideVT2, offsetVT + (( m - 1 ) * strideVT1), VT, strideVT2, offsetVT + (m * strideVT1), cosr, sinr);
			}
			if ( nru > 0 ) {
				// DROT(NRU, U(1,M-1), 1, U(1,M), 1, COSL, SINL)
				// Columns m-1 and m (0-based), step through rows with stride 1
				drot( nru, U, strideU1, offsetU + (( m - 1 ) * strideU2), U, strideU1, offsetU + (m * strideU2), cosl, sinl);
			}
			if ( ncc > 0 ) {
				// DROT(NCC, C(M-1,1), LDC, C(M,1), LDC, COSL, SINL)
				drot( ncc, C, strideC2, offsetC + (( m - 1 ) * strideC1), C, strideC2, offsetC + (m * strideC1), cosl, sinl);
			}
			m -= 2;
			continue;
		}

		// Determine direction of chase (top-to-bottom or bottom-to-top)
		if ( ll > oldm || m < oldll ) {
			if ( Math.abs( d[ offsetD + (ll * strideD) ] ) >= Math.abs( d[ offsetD + (m * strideD) ] ) ) {
				idir = 1; // chase bulge from top to bottom
			} else {
				idir = 2; // chase bulge from bottom to top
			}
		}

		// Apply convergence tests
		converged = false;
		if ( idir === 1 ) {
			// Run convergence test in top-to-bottom direction
			if ( Math.abs( e[ offsetE + (( m - 1 ) * strideE) ] ) <= Math.abs( tol ) * Math.abs( d[ offsetD + (m * strideD) ] ) ||
				( tol < ZERO && Math.abs( e[ offsetE + (( m - 1 ) * strideE) ] ) <= thresh ) ) {
				e[ offsetE + (( m - 1 ) * strideE) ] = ZERO;
				converged = true;
			}

			if ( !converged && tol >= ZERO ) {
				// If relative accuracy desired, apply relative convergence criterion forward
				mu = Math.abs( d[ offsetD + (ll * strideD) ] );
				smin = mu;
				for ( lll = ll; lll < m; lll++ ) {
					if ( Math.abs( e[ offsetE + (lll * strideE) ] ) <= tol * mu ) {
						e[ offsetE + (lll * strideE) ] = ZERO;
						converged = true;
						break;
					}
					mu = Math.abs( d[ offsetD + (( lll + 1 ) * strideD) ] ) * ( mu / ( mu + Math.abs( e[ offsetE + (lll * strideE) ] ) ) );
					smin = Math.min( smin, mu );
				}
			}
		} else {
			// Run convergence test in bottom-to-top direction
			if ( Math.abs( e[ offsetE + (ll * strideE) ] ) <= Math.abs( tol ) * Math.abs( d[ offsetD + (ll * strideD) ] ) ||
				( tol < ZERO && Math.abs( e[ offsetE + (ll * strideE) ] ) <= thresh ) ) {
				e[ offsetE + (ll * strideE) ] = ZERO;
				converged = true;
			}

			if ( !converged && tol >= ZERO ) {
				// If relative accuracy desired, apply relative convergence criterion backward
				mu = Math.abs( d[ offsetD + (m * strideD) ] );
				smin = mu;
				for ( lll = m - 1; lll >= ll; lll-- ) {
					if ( Math.abs( e[ offsetE + (lll * strideE) ] ) <= tol * mu ) {
						e[ offsetE + (lll * strideE) ] = ZERO;
						converged = true;
						break;
					}
					mu = Math.abs( d[ offsetD + (lll * strideD) ] ) * ( mu / ( mu + Math.abs( e[ offsetE + (lll * strideE) ] ) ) );
					smin = Math.min( smin, mu );
				}
			}
		}
		if ( converged ) {
			continue;
		}
		oldll = ll;
		oldm = m;

		// Compute shift
		if ( tol >= ZERO && N * tol * ( smin / smax ) <= Math.max( eps, HNDRTH * tol ) ) {
			// Use a zero shift
			shift = ZERO;
		} else {
			// Compute shift from 2-by-2 block at end of matrix
			if ( idir === 1 ) {
				sll = Math.abs( d[ offsetD + (ll * strideD) ] );
				dlas2(d[ offsetD + (( m - 1 ) * strideD) ], e[ offsetE + (( m - 1 ) * strideE) ], d[ offsetD + (m * strideD) ], dout);
				shift = dout[ 0 ];
				r = dout[ 1 ];
			} else {
				sll = Math.abs( d[ offsetD + (m * strideD) ] );
				dlas2(d[ offsetD + (ll * strideD) ], e[ offsetE + (ll * strideE) ], d[ offsetD + (( ll + 1 ) * strideD) ], dout);
				shift = dout[ 0 ];
				r = dout[ 1 ];
			}

			// Test if shift is negligible
			if ( sll > ZERO ) {
				if ( ( shift / sll ) * ( shift / sll ) < eps ) {
					shift = ZERO;
				}
			}
		}

		// Increment iteration count
		iter = iter + m - ll;

		// Main QR iteration step
		if ( shift === ZERO ) {
			// Zero-shift QR iteration
			if ( idir === 1 ) {
				// Chase bulge from top to bottom
				cs = ONE;
				oldcs = ONE;
				for ( i = ll; i < m; i++ ) {
					dlartg( d[ offsetD + (i * strideD) ] * cs, e[ offsetE + (i * strideE) ], rot );
					cs = rot[ 0 ];
					sn = rot[ 1 ];
					r = rot[ 2 ];
					if ( i > ll ) {
						e[ offsetE + (( i - 1 ) * strideE) ] = oldsn * r;
					}
					dlartg( oldcs * r, d[ offsetD + (( i + 1 ) * strideD) ] * sn, rot );
					oldcs = rot[ 0 ];
					oldsn = rot[ 1 ];
					d[ offsetD + (i * strideD) ] = rot[ 2 ];
					WORK[ offsetWork + (( i - ll ) * strideWork) ] = cs;
					WORK[ offsetWork + (( i - ll + nm1 ) * strideWork) ] = sn;
					WORK[ offsetWork + (( i - ll + nm12 ) * strideWork) ] = oldcs;
					WORK[ offsetWork + (( i - ll + nm13 ) * strideWork) ] = oldsn;
				}
				h = d[ offsetD + (m * strideD) ] * cs;
				d[ offsetD + (m * strideD) ] = h * oldcs;
				e[ offsetE + (( m - 1 ) * strideE) ] = h * oldsn;

				// Update singular vectors
				if ( ncvt > 0 ) {
					// DLASR('lower','V','F', M-LL+1, NCVT, WORK(1), WORK(N), VT(LL,1), LDVT)
					dlasr( 'left', 'variable', 'forward', m - ll + 1, ncvt, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork + (nm1 * strideWork), VT, strideVT1, strideVT2, offsetVT + (ll * strideVT1));
				}
				if ( nru > 0 ) {
					// DLASR('R','V','F', NRU, M-LL+1, WORK(NM12+1), WORK(NM13+1), U(1,LL), LDU)
					dlasr( 'right', 'variable', 'forward', nru, m - ll + 1, WORK, strideWork, offsetWork + (nm12 * strideWork), WORK, strideWork, offsetWork + (nm13 * strideWork), U, strideU1, strideU2, offsetU + (ll * strideU2));
				}
				if ( ncc > 0 ) {
					// DLASR('lower','V','F', M-LL+1, NCC, WORK(NM12+1), WORK(NM13+1), C(LL,1), LDC)
					dlasr( 'left', 'variable', 'forward', m - ll + 1, ncc, WORK, strideWork, offsetWork + (nm12 * strideWork), WORK, strideWork, offsetWork + (nm13 * strideWork), C, strideC1, strideC2, offsetC + (ll * strideC1));
				}

				// Test convergence
				if ( Math.abs( e[ offsetE + (( m - 1 ) * strideE) ] ) <= thresh ) {
					e[ offsetE + (( m - 1 ) * strideE) ] = ZERO;
				}
			} else {
				// Chase bulge from bottom to top
				cs = ONE;
				oldcs = ONE;
				for ( i = m; i >= ll + 1; i-- ) {
					dlartg( d[ offsetD + (i * strideD) ] * cs, e[ offsetE + (( i - 1 ) * strideE) ], rot );
					cs = rot[ 0 ];
					sn = rot[ 1 ];
					r = rot[ 2 ];
					if ( i < m ) {
						e[ offsetE + (i * strideE) ] = oldsn * r;
					}
					dlartg( oldcs * r, d[ offsetD + (( i - 1 ) * strideD) ] * sn, rot );
					oldcs = rot[ 0 ];
					oldsn = rot[ 1 ];
					d[ offsetD + (i * strideD) ] = rot[ 2 ];
					WORK[ offsetWork + (( i - ll - 1 ) * strideWork) ] = cs;
					WORK[ offsetWork + (( i - ll - 1 + nm1 ) * strideWork) ] = -sn;
					WORK[ offsetWork + (( i - ll - 1 + nm12 ) * strideWork) ] = oldcs;
					WORK[ offsetWork + (( i - ll - 1 + nm13 ) * strideWork) ] = -oldsn;
				}
				h = d[ offsetD + (ll * strideD) ] * cs;
				d[ offsetD + (ll * strideD) ] = h * oldcs;
				e[ offsetE + (ll * strideE) ] = h * oldsn;

				// Update singular vectors
				if ( ncvt > 0 ) {
					// DLASR('lower','V','B', M-LL+1, NCVT, WORK(NM12+1), WORK(NM13+1), VT(LL,1), LDVT)
					dlasr( 'left', 'variable', 'backward', m - ll + 1, ncvt, WORK, strideWork, offsetWork + (nm12 * strideWork), WORK, strideWork, offsetWork + (nm13 * strideWork), VT, strideVT1, strideVT2, offsetVT + (ll * strideVT1));
				}
				if ( nru > 0 ) {
					// DLASR('R','V','B', NRU, M-LL+1, WORK(1), WORK(N), U(1,LL), LDU)
					dlasr( 'right', 'variable', 'backward', nru, m - ll + 1, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork + (nm1 * strideWork), U, strideU1, strideU2, offsetU + (ll * strideU2));
				}
				if ( ncc > 0 ) {
					// DLASR('lower','V','B', M-LL+1, NCC, WORK(1), WORK(N), C(LL,1), LDC)
					dlasr( 'left', 'variable', 'backward', m - ll + 1, ncc, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork + (nm1 * strideWork), C, strideC1, strideC2, offsetC + (ll * strideC1));
				}

				// Test convergence
				if ( Math.abs( e[ offsetE + (ll * strideE) ] ) <= thresh ) {
					e[ offsetE + (ll * strideE) ] = ZERO;
				}
			}
		} else if ( idir === 1 ) {
			// Nonzero shift: shifted QR iteration
			// Chase bulge from top to bottom (standard direction)
			f = ( Math.abs( d[ offsetD + (ll * strideD) ] ) - shift ) *
				( sign( ONE, d[ offsetD + (ll * strideD) ] ) + (shift / d[ offsetD + (ll * strideD) ]) );
			g = e[ offsetE + (ll * strideE) ];
			for ( i = ll; i < m; i++ ) {
				dlartg( f, g, rot );
				cosr = rot[ 0 ];
				sinr = rot[ 1 ];
				r = rot[ 2 ];
				if ( i > ll ) {
					e[ offsetE + (( i - 1 ) * strideE) ] = r;
				}
				f = (cosr * d[ offsetD + (i * strideD) ]) + (sinr * e[ offsetE + (i * strideE) ]);
				e[ offsetE + (i * strideE) ] = (cosr * e[ offsetE + (i * strideE) ]) - (sinr * d[ offsetD + (i * strideD) ]);
				g = sinr * d[ offsetD + (( i + 1 ) * strideD) ];
				d[ offsetD + (( i + 1 ) * strideD) ] = cosr * d[ offsetD + (( i + 1 ) * strideD) ];
				dlartg( f, g, rot );
				cosl = rot[ 0 ];
				sinl = rot[ 1 ];
				d[ offsetD + (i * strideD) ] = rot[ 2 ];
				f = (cosl * e[ offsetE + (i * strideE) ]) + (sinl * d[ offsetD + (( i + 1 ) * strideD) ]);
				d[ offsetD + (( i + 1 ) * strideD) ] = (cosl * d[ offsetD + (( i + 1 ) * strideD) ]) - (sinl * e[ offsetE + (i * strideE) ]);
				if ( i < m - 1 ) {
					g = sinl * e[ offsetE + (( i + 1 ) * strideE) ];
					e[ offsetE + (( i + 1 ) * strideE) ] = cosl * e[ offsetE + (( i + 1 ) * strideE) ];
				}
				WORK[ offsetWork + (( i - ll ) * strideWork) ] = cosr;
				WORK[ offsetWork + (( i - ll + nm1 ) * strideWork) ] = sinr;
				WORK[ offsetWork + (( i - ll + nm12 ) * strideWork) ] = cosl;
				WORK[ offsetWork + (( i - ll + nm13 ) * strideWork) ] = sinl;
			}
			e[ offsetE + (( m - 1 ) * strideE) ] = f;

			// Update singular vectors
			if ( ncvt > 0 ) {
				dlasr( 'left', 'variable', 'forward', m - ll + 1, ncvt, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork + (nm1 * strideWork), VT, strideVT1, strideVT2, offsetVT + (ll * strideVT1));
			}
			if ( nru > 0 ) {
				dlasr( 'right', 'variable', 'forward', nru, m - ll + 1, WORK, strideWork, offsetWork + (nm12 * strideWork), WORK, strideWork, offsetWork + (nm13 * strideWork), U, strideU1, strideU2, offsetU + (ll * strideU2));
			}
			if ( ncc > 0 ) {
				dlasr( 'left', 'variable', 'forward', m - ll + 1, ncc, WORK, strideWork, offsetWork + (nm12 * strideWork), WORK, strideWork, offsetWork + (nm13 * strideWork), C, strideC1, strideC2, offsetC + (ll * strideC1));
			}

			// Test convergence
			if ( Math.abs( e[ offsetE + (( m - 1 ) * strideE) ] ) <= thresh ) {
				e[ offsetE + (( m - 1 ) * strideE) ] = ZERO;
			}
		} else {
			// Nonzero shift: shifted QR iteration
			// Chase bulge from bottom to top
			f = ( Math.abs( d[ offsetD + (m * strideD) ] ) - shift ) *
				( sign( ONE, d[ offsetD + (m * strideD) ] ) + (shift / d[ offsetD + (m * strideD) ]) );
			g = e[ offsetE + (( m - 1 ) * strideE) ];
			for ( i = m; i >= ll + 1; i-- ) {
				dlartg( f, g, rot );
				cosr = rot[ 0 ];
				sinr = rot[ 1 ];
				r = rot[ 2 ];
				if ( i < m ) {
					e[ offsetE + (i * strideE) ] = r;
				}
				f = (cosr * d[ offsetD + (i * strideD) ]) + (sinr * e[ offsetE + (( i - 1 ) * strideE) ]);
				e[ offsetE + (( i - 1 ) * strideE) ] = (cosr * e[ offsetE + (( i - 1 ) * strideE) ]) - (sinr * d[ offsetD + (i * strideD) ]);
				g = sinr * d[ offsetD + (( i - 1 ) * strideD) ];
				d[ offsetD + (( i - 1 ) * strideD) ] = cosr * d[ offsetD + (( i - 1 ) * strideD) ];
				dlartg( f, g, rot );
				cosl = rot[ 0 ];
				sinl = rot[ 1 ];
				d[ offsetD + (i * strideD) ] = rot[ 2 ];
				f = (cosl * e[ offsetE + (( i - 1 ) * strideE) ]) + (sinl * d[ offsetD + (( i - 1 ) * strideD) ]);
				d[ offsetD + (( i - 1 ) * strideD) ] = (cosl * d[ offsetD + (( i - 1 ) * strideD) ]) - (sinl * e[ offsetE + (( i - 1 ) * strideE) ]);
				if ( i > ll + 1 ) {
					g = sinl * e[ offsetE + (( i - 2 ) * strideE) ];
					e[ offsetE + (( i - 2 ) * strideE) ] = cosl * e[ offsetE + (( i - 2 ) * strideE) ];
				}
				WORK[ offsetWork + (( i - ll - 1 ) * strideWork) ] = cosr;
				WORK[ offsetWork + (( i - ll - 1 + nm1 ) * strideWork) ] = -sinr;
				WORK[ offsetWork + (( i - ll - 1 + nm12 ) * strideWork) ] = cosl;
				WORK[ offsetWork + (( i - ll - 1 + nm13 ) * strideWork) ] = -sinl;
			}
			e[ offsetE + (ll * strideE) ] = f;

			// Test convergence
			if ( Math.abs( e[ offsetE + (ll * strideE) ] ) <= thresh ) {
				e[ offsetE + (ll * strideE) ] = ZERO;
			}

			// Update singular vectors
			if ( ncvt > 0 ) {
				dlasr( 'left', 'variable', 'backward', m - ll + 1, ncvt, WORK, strideWork, offsetWork + (nm12 * strideWork), WORK, strideWork, offsetWork + (nm13 * strideWork), VT, strideVT1, strideVT2, offsetVT + (ll * strideVT1));
			}
			if ( nru > 0 ) {
				dlasr( 'right', 'variable', 'backward', nru, m - ll + 1, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork + (nm1 * strideWork), U, strideU1, strideU2, offsetU + (ll * strideU2));
			}
			if ( ncc > 0 ) {
				dlasr( 'left', 'variable', 'backward', m - ll + 1, ncc, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork + (nm1 * strideWork), C, strideC1, strideC2, offsetC + (ll * strideC1));
			}
		}
	}
	/* eslint-enable no-labels, no-label-var */

	// Make all singular values non-negative, then sort descending
	sortSingularValues( N, d, strideD, offsetD, ncvt, VT, strideVT1, strideVT2, offsetVT, nru, U, strideU1, strideU2, offsetU, ncc, C, strideC1, strideC2, offsetC );

	return info;
}

/**
* Makes all singular values non-negative and sorts them in decreasing order.
* applying the same permutations to the singular vector matrices.
*
* @private
* @param {NonNegativeInteger} N - number of singular values
* @param {Float64Array} d - singular values
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {NonNegativeInteger} ncvt - columns of VT
* @param {Float64Array} VT - right singular vectors
* @param {integer} strideVT1 - row stride
* @param {integer} strideVT2 - column stride
* @param {NonNegativeInteger} offsetVT - offset for VT
* @param {NonNegativeInteger} nru - rows of U
* @param {Float64Array} U - left singular vectors
* @param {integer} strideU1 - row stride
* @param {integer} strideU2 - column stride
* @param {NonNegativeInteger} offsetU - offset for U
* @param {NonNegativeInteger} ncc - columns of C
* @param {Float64Array} C - matrix C
* @param {integer} strideC1 - row stride
* @param {integer} strideC2 - column stride
* @param {NonNegativeInteger} offsetC - offset for C
*/
function sortSingularValues( N, d, strideD, offsetD, ncvt, VT, strideVT1, strideVT2, offsetVT, nru, U, strideU1, strideU2, offsetU, ncc, C, strideC1, strideC2, offsetC ) {
	var smin;
	var isub;
	var i;
	var j;

	// Make all singular values non-negative
	for ( i = 0; i < N; i++ ) {
		if ( d[ offsetD + (i * strideD) ] < ZERO ) {
			d[ offsetD + (i * strideD) ] = -d[ offsetD + (i * strideD) ];
			if ( ncvt > 0 ) {
				// Negate row i of VT
				dscal( ncvt, NEGONE, VT, strideVT2, offsetVT + (i * strideVT1) );
			}
		}
	}

	// Sort singular values in decreasing order (selection sort)
	for ( i = 0; i < N - 1; i++ ) {
		// Find minimum from d[0..N-1-i] (to place at end)
		isub = 0;
		smin = d[ offsetD ];
		for ( j = 1; j < N - i; j++ ) {
			if ( d[ offsetD + (j * strideD) ] <= smin ) {
				isub = j;
				smin = d[ offsetD + (j * strideD) ];
			}
		}
		// Swap with position N-1-i if different
		if ( isub !== N - 1 - i ) {
			d[ offsetD + (isub * strideD) ] = d[ offsetD + (( N - 1 - i ) * strideD) ];
			d[ offsetD + (( N - 1 - i ) * strideD) ] = smin;
			if ( ncvt > 0 ) {
				dswap( ncvt, VT, strideVT2, offsetVT + (isub * strideVT1), VT, strideVT2, offsetVT + (( N - 1 - i ) * strideVT1));
			}
			if ( nru > 0 ) {
				dswap( nru, U, strideU1, offsetU + (isub * strideU2), U, strideU1, offsetU + (( N - 1 - i ) * strideU2));
			}
			if ( ncc > 0 ) {
				dswap( ncc, C, strideC2, offsetC + (isub * strideC1), C, strideC2, offsetC + (( N - 1 - i ) * strideC1));
			}
		}
	}
}


// EXPORTS //

export default dbdsqr;
