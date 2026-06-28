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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';
import dlanv2 from '../../dlanv2/lib/base.js';
import dlarfg from '../../dlarfg/lib/base.js';
import drot from '../../../../blas/base/drot/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var TWO = 2.0;
var DAT1 = 3.0 / 4.0;
var DAT2 = -0.4375;
var KEXSH = 10;

var SAFMIN = dlamch( 'safe-minimum' );
var ULP = dlamch( 'precision' );


// MAIN //

/**
* Computes the eigenvalues and optionally the Schur factorization of an upper.
* Hessenberg matrix, using the double-shift implicit QR algorithm.
*
* On exit, H is upper quasi-triangular (Schur form) if WANTT is true,
* otherwise it is in an unspecified form. The eigenvalues are stored in
* (WR, WI): real parts in WR, imaginary parts in WI. Complex eigenvalues
* come in conjugate pairs stored in consecutive entries.
*
* INFO = 0: success.
* INFO > 0: dlahqr failed to compute all eigenvalues. Element INFO
*           (1-based) of WR and WI contains those eigenvalues which
*           have been successfully computed.
*
* Note: ILO and IHI are 1-based indices (Fortran convention).
*
* @private
* @param {boolean} wantt - if true, compute the full Schur form T
* @param {boolean} wantz - if true, compute the Schur vectors Z
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ilo - first row/col of the block (1-based)
* @param {integer} ihi - last row/col of the block (1-based)
* @param {Float64Array} H - upper Hessenberg matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Float64Array} WR - output array for real parts of eigenvalues
* @param {integer} strideWR - stride length for `WR`
* @param {NonNegativeInteger} offsetWR - starting index for `WR`
* @param {Float64Array} WI - output array for imaginary parts of eigenvalues
* @param {integer} strideWI - stride length for `WI`
* @param {NonNegativeInteger} offsetWI - starting index for `WI`
* @param {integer} iloz - first row of Z to update (1-based)
* @param {integer} ihiz - last row of Z to update (1-based)
* @param {Float64Array} Z - Schur vectors (updated if wantz is true)
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @returns {integer} info - 0 on success, >0 if failed to converge
*/
function dlahqr( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ ) {
	var rtdisc;
	var smlnum;
	var kdefl;
	var itmax;
	var lanv2;
	var info;
	var h21s;
	var rt1r;
	var rt1i;
	var rt2r;
	var rt2i;
	var h11;
	var h12;
	var h21;
	var h22;
	var sum;
	var tst;
	var det;
	var tau;
	var its;
	var aa;
	var ab;
	var ba;
	var bb;
	var cs;
	var sn;
	var nr;
	var nh;
	var nz;
	var tr;
	var t1;
	var t2;
	var t3;
	var v2;
	var v3;
	var i1;
	var i2;
	var s;
	var v;
	var i;
	var j;
	var k;
	var l;
	var m;

	// Working arrays: v[3] for reflectors, tau[1] for dlarfg output
	v = new Float64Array( 3 );
	tau = new Float64Array( 1 );

	info = 0;

	// Quick return if possible
	if ( N === 0 ) {
		return info;
	}

	// Convert 1-based ilo/ihi to 0-based for array access
	// Internally we use 0-based i, l, m, k but the Fortran algorithm logic
	// Uses 1-based. We'll keep the algorithm in 1-based and convert at access time.
	// Actually, to minimize errors, let's use the Fortran 1-based convention
	// Throughout and convert to 0-based only at array access points.

	if ( ilo === ihi ) {
		WR[ offsetWR + ( ilo - 1 ) * strideWR ] = H[ offsetH + ( ilo - 1 ) * strideH1 + ( ilo - 1 ) * strideH2 ];
		WI[ offsetWI + ( ilo - 1 ) * strideWI ] = ZERO;
		return info;
	}

	// Clear sub-sub-diagonal entries (ensure upper Hessenberg form)
	for ( j = ilo; j <= ihi - 3; j++ ) {
		H[ offsetH + ( j + 1 ) * strideH1 + ( j - 1 ) * strideH2 ] = ZERO;
		H[ offsetH + ( j + 1 + 1 ) * strideH1 + ( j - 1 ) * strideH2 ] = ZERO;
	}
	if ( ilo <= ihi - 2 ) {
		H[ offsetH + ( ihi - 1 ) * strideH1 + ( ihi - 2 - 1 ) * strideH2 ] = ZERO;
	}

	nh = ihi - ilo + 1;
	nz = ihiz - iloz + 1;

	// Small-number threshold
	smlnum = SAFMIN * ( nh / ULP );

	// Set range for applying transformations
	if ( wantt ) {
		i1 = 1;
		i2 = N;
	}

	// Maximum iterations
	itmax = 30 * Math.max( 10, nh );

	// Deflation counter
	kdefl = 0;

	// Main loop: i is the deflation pointer (1-based), starts at ihi, works down
	i = ihi;

	// Outer deflation loop (Fortran label 20)
	while ( i >= ilo ) {
		l = ilo;

		// Inner iteration loop (Fortran DO 140 ITS = 0, ITMAX)
		var converged = false; // eslint-disable-line no-var
		for ( its = 0; its <= itmax; its++ ) {
			// Look for single small sub-diagonal element (Fortran DO 30, label 40)
			for ( k = i; k >= l + 1; k-- ) {
				if ( Math.abs( H[ offsetH + ( k - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2 ] ) <= smlnum ) {
					break;
				}
				tst = Math.abs( H[ offsetH + ( k - 1 - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2 ] ) + Math.abs( H[ offsetH + ( k - 1 ) * strideH1 + ( k - 1 ) * strideH2 ] );
				if ( tst === ZERO ) {
					if ( k - 2 >= ilo ) {
						tst += Math.abs( H[ offsetH + ( k - 1 - 1 ) * strideH1 + ( k - 2 - 1 ) * strideH2 ] );
					}
					if ( k + 1 <= ihi ) {
						tst += Math.abs( H[ offsetH + ( k + 1 - 1 ) * strideH1 + ( k - 1 ) * strideH2 ] );
					}
				}
				if ( Math.abs( H[ offsetH + ( k - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2 ] ) <= ULP * tst ) {
					ab = Math.max( Math.abs( H[ offsetH + ( k - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2 ] ), Math.abs( H[ offsetH + ( k - 1 - 1 ) * strideH1 + ( k - 1 ) * strideH2 ] ) );
					ba = Math.min( Math.abs( H[ offsetH + ( k - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2 ] ), Math.abs( H[ offsetH + ( k - 1 - 1 ) * strideH1 + ( k - 1 ) * strideH2 ] ) );
					aa = Math.max( Math.abs( H[ offsetH + ( k - 1 ) * strideH1 + ( k - 1 ) * strideH2 ] ), Math.abs( H[ offsetH + ( k - 1 - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2 ] - H[ offsetH + ( k - 1 ) * strideH1 + ( k - 1 ) * strideH2 ] ) );
					bb = Math.min( Math.abs( H[ offsetH + ( k - 1 ) * strideH1 + ( k - 1 ) * strideH2 ] ), Math.abs( H[ offsetH + ( k - 1 - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2 ] - H[ offsetH + ( k - 1 ) * strideH1 + ( k - 1 ) * strideH2 ] ) );
					s = aa + ab;
					if ( ba * ( ab / s ) <= Math.max( smlnum, ULP * ( bb * ( aa / s ) ) ) ) {
						break;
					}
				}
			}
			// After the search loop, k is the row where the subdiagonal is negligible
			l = k;

			if ( l > ilo ) {
				// Set the small subdiagonal element to zero
				H[ offsetH + ( l - 1 ) * strideH1 + ( l - 1 - 1 ) * strideH2 ] = ZERO;
			}

			// Check if we've deflated a 1x1 or 2x2 block (Fortran: IF(L.GE.I-1) GO TO 150)
			if ( l >= i - 1 ) {
				converged = true;
				break;
			}

			kdefl += 1;

			// Set range for transformations when not computing full Schur form
			if ( !wantt ) {
				i1 = l;
				i2 = i;
			}

			// Determine shift
			if ( ( kdefl % ( 2 * KEXSH ) ) === 0 ) {
				// Exceptional shift (type 1)
				s = Math.abs( H[ offsetH + ( i - 1 ) * strideH1 + ( i - 1 - 1 ) * strideH2 ] ) + Math.abs( H[ offsetH + ( i - 1 - 1 ) * strideH1 + ( i - 2 - 1 ) * strideH2 ] );
				h11 = DAT1 * s + H[ offsetH + ( i - 1 ) * strideH1 + ( i - 1 ) * strideH2 ];
				h12 = DAT2 * s;
				h21 = s;
				h22 = h11;
			} else if ( ( kdefl % KEXSH ) === 0 ) {
				// Exceptional shift (type 2)
				s = Math.abs( H[ offsetH + ( l + 1 - 1 ) * strideH1 + ( l - 1 ) * strideH2 ] ) + Math.abs( H[ offsetH + ( l + 2 - 1 ) * strideH1 + ( l + 1 - 1 ) * strideH2 ] );
				h11 = DAT1 * s + H[ offsetH + ( l - 1 ) * strideH1 + ( l - 1 ) * strideH2 ];
				h12 = DAT2 * s;
				h21 = s;
				h22 = h11;
			} else {
				// Wilkinson shift: eigenvalues of the 2x2 block at bottom
				h11 = H[ offsetH + ( i - 1 - 1 ) * strideH1 + ( i - 1 - 1 ) * strideH2 ];
				h21 = H[ offsetH + ( i - 1 ) * strideH1 + ( i - 1 - 1 ) * strideH2 ];
				h12 = H[ offsetH + ( i - 1 - 1 ) * strideH1 + ( i - 1 ) * strideH2 ];
				h22 = H[ offsetH + ( i - 1 ) * strideH1 + ( i - 1 ) * strideH2 ];
			}

			s = Math.abs( h11 ) + Math.abs( h12 ) + Math.abs( h21 ) + Math.abs( h22 );
			if ( s === ZERO ) {
				rt1r = ZERO;
				rt1i = ZERO;
				rt2r = ZERO;
				rt2i = ZERO;
			} else {
				h11 /= s;
				h21 /= s;
				h12 /= s;
				h22 /= s;
				tr = ( h11 + h22 ) / TWO;
				det = ( h11 - tr ) * ( h22 - tr ) - h12 * h21;
				rtdisc = Math.sqrt( Math.abs( det ) );
				if ( det >= ZERO ) {
					// Complex conjugate shifts
					rt1r = tr * s;
					rt2r = rt1r;
					rt1i = rtdisc * s;
					rt2i = -rt1i;
				} else {
					// Real shifts
					rt1r = tr + rtdisc;
					rt2r = tr - rtdisc;
					if ( Math.abs( rt1r - h22 ) <= Math.abs( rt2r - h22 ) ) {
						rt1r *= s;
						rt2r = rt1r;
					} else {
						rt2r *= s;
						rt1r = rt2r;
					}
					rt1i = ZERO;
					rt2i = ZERO;
				}
			}

			// Look for two consecutive small subdiagonal elements (Fortran DO 50, label 60)
			for ( m = i - 2; m >= l; m-- ) {
				h21s = H[ offsetH + ( m + 1 - 1 ) * strideH1 + ( m - 1 ) * strideH2 ];
				s = Math.abs( H[ offsetH + ( m - 1 ) * strideH1 + ( m - 1 ) * strideH2 ] - rt2r ) + Math.abs( rt2i ) + Math.abs( h21s );
				h21s = H[ offsetH + ( m + 1 - 1 ) * strideH1 + ( m - 1 ) * strideH2 ] / s;
				v[ 0 ] = h21s * H[ offsetH + ( m - 1 ) * strideH1 + ( m + 1 - 1 ) * strideH2 ] + ( H[ offsetH + ( m - 1 ) * strideH1 + ( m - 1 ) * strideH2 ] - rt1r ) * ( ( H[ offsetH + ( m - 1 ) * strideH1 + ( m - 1 ) * strideH2 ] - rt2r ) / s ) - rt1i * ( rt2i / s );
				v[ 1 ] = h21s * ( H[ offsetH + ( m - 1 ) * strideH1 + ( m - 1 ) * strideH2 ] + H[ offsetH + ( m + 1 - 1 ) * strideH1 + ( m + 1 - 1 ) * strideH2 ] - rt1r - rt2r );
				v[ 2 ] = h21s * H[ offsetH + ( m + 2 - 1 ) * strideH1 + ( m + 1 - 1 ) * strideH2 ];
				s = Math.abs( v[ 0 ] ) + Math.abs( v[ 1 ] ) + Math.abs( v[ 2 ] );
				v[ 0 ] /= s;
				v[ 1 ] /= s;
				v[ 2 ] /= s;
				if ( m === l ) {
					break;
				}
				if ( Math.abs( H[ offsetH + ( m - 1 ) * strideH1 + ( m - 1 - 1 ) * strideH2 ] ) * ( Math.abs( v[ 1 ] ) + Math.abs( v[ 2 ] ) ) <= ULP * Math.abs( v[ 0 ] ) * ( Math.abs( H[ offsetH + ( m - 1 - 1 ) * strideH1 + ( m - 1 - 1 ) * strideH2 ] ) + Math.abs( H[ offsetH + ( m - 1 ) * strideH1 + ( m - 1 ) * strideH2 ] ) + Math.abs( H[ offsetH + ( m + 1 - 1 ) * strideH1 + ( m + 1 - 1 ) * strideH2 ] ) ) ) {
					break;
				}
			}

			// Double shift QR step (Fortran DO 130)
			for ( k = m; k <= i - 1; k++ ) {
				// NR is the order of the reflector (2 or 3)
				nr = Math.min( 3, i - k + 1 );
				if ( k > m ) {
					dcopy( nr, H, strideH1, offsetH + ( k - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2, v, 1, 0 );
				}
				dlarfg( nr, v, 0, v, 1, 1, tau, 0 );
				t1 = tau[ 0 ];
				if ( k > m ) {
					H[ offsetH + ( k - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2 ] = v[ 0 ];
					H[ offsetH + ( k + 1 - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2 ] = ZERO;
					if ( k < i - 1 ) {
						H[ offsetH + ( k + 2 - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2 ] = ZERO;
					}
				} else if ( m > l ) {
					// Use Householder to introduce bulge
					H[ offsetH + ( k - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2 ] = H[ offsetH + ( k - 1 ) * strideH1 + ( k - 1 - 1 ) * strideH2 ] * ( ONE - t1 );
				}
				v2 = v[ 1 ];
				t2 = t1 * v2;
				if ( nr === 3 ) {
					v3 = v[ 2 ];
					t3 = t1 * v3;

					// Apply reflector from the left to rows K..I2, columns K..I2
					for ( j = k; j <= i2; j++ ) {
						sum = H[ offsetH + ( k - 1 ) * strideH1 + ( j - 1 ) * strideH2 ] + v2 * H[ offsetH + ( k + 1 - 1 ) * strideH1 + ( j - 1 ) * strideH2 ] + v3 * H[ offsetH + ( k + 2 - 1 ) * strideH1 + ( j - 1 ) * strideH2 ];
						H[ offsetH + ( k - 1 ) * strideH1 + ( j - 1 ) * strideH2 ] -= sum * t1;
						H[ offsetH + ( k + 1 - 1 ) * strideH1 + ( j - 1 ) * strideH2 ] -= sum * t2;
						H[ offsetH + ( k + 2 - 1 ) * strideH1 + ( j - 1 ) * strideH2 ] -= sum * t3;
					}

					// Apply reflector from the right to rows I1..min(K+3,I), columns K..K+2
					for ( j = i1; j <= Math.min( k + 3, i ); j++ ) {
						sum = H[ offsetH + ( j - 1 ) * strideH1 + ( k - 1 ) * strideH2 ] + v2 * H[ offsetH + ( j - 1 ) * strideH1 + ( k + 1 - 1 ) * strideH2 ] + v3 * H[ offsetH + ( j - 1 ) * strideH1 + ( k + 2 - 1 ) * strideH2 ];
						H[ offsetH + ( j - 1 ) * strideH1 + ( k - 1 ) * strideH2 ] -= sum * t1;
						H[ offsetH + ( j - 1 ) * strideH1 + ( k + 1 - 1 ) * strideH2 ] -= sum * t2;
						H[ offsetH + ( j - 1 ) * strideH1 + ( k + 2 - 1 ) * strideH2 ] -= sum * t3;
					}

					// Accumulate transformations in Z
					if ( wantz ) {
						for ( j = iloz; j <= ihiz; j++ ) {
							sum = Z[ offsetZ + ( j - 1 ) * strideZ1 + ( k - 1 ) * strideZ2 ] + v2 * Z[ offsetZ + ( j - 1 ) * strideZ1 + ( k + 1 - 1 ) * strideZ2 ] + v3 * Z[ offsetZ + ( j - 1 ) * strideZ1 + ( k + 2 - 1 ) * strideZ2 ];
							Z[ offsetZ + ( j - 1 ) * strideZ1 + ( k - 1 ) * strideZ2 ] -= sum * t1;
							Z[ offsetZ + ( j - 1 ) * strideZ1 + ( k + 1 - 1 ) * strideZ2 ] -= sum * t2;
							Z[ offsetZ + ( j - 1 ) * strideZ1 + ( k + 2 - 1 ) * strideZ2 ] -= sum * t3;
						}
					}
				} else if ( nr === 2 ) {
					// Apply 2x2 reflector from the left
					for ( j = k; j <= i2; j++ ) {
						sum = H[ offsetH + ( k - 1 ) * strideH1 + ( j - 1 ) * strideH2 ] + v2 * H[ offsetH + ( k + 1 - 1 ) * strideH1 + ( j - 1 ) * strideH2 ];
						H[ offsetH + ( k - 1 ) * strideH1 + ( j - 1 ) * strideH2 ] -= sum * t1;
						H[ offsetH + ( k + 1 - 1 ) * strideH1 + ( j - 1 ) * strideH2 ] -= sum * t2;
					}

					// Apply 2x2 reflector from the right
					for ( j = i1; j <= i; j++ ) {
						sum = H[ offsetH + ( j - 1 ) * strideH1 + ( k - 1 ) * strideH2 ] + v2 * H[ offsetH + ( j - 1 ) * strideH1 + ( k + 1 - 1 ) * strideH2 ];
						H[ offsetH + ( j - 1 ) * strideH1 + ( k - 1 ) * strideH2 ] -= sum * t1;
						H[ offsetH + ( j - 1 ) * strideH1 + ( k + 1 - 1 ) * strideH2 ] -= sum * t2;
					}

					// Accumulate transformations in Z
					if ( wantz ) {
						for ( j = iloz; j <= ihiz; j++ ) {
							sum = Z[ offsetZ + ( j - 1 ) * strideZ1 + ( k - 1 ) * strideZ2 ] + v2 * Z[ offsetZ + ( j - 1 ) * strideZ1 + ( k + 1 - 1 ) * strideZ2 ];
							Z[ offsetZ + ( j - 1 ) * strideZ1 + ( k - 1 ) * strideZ2 ] -= sum * t1;
							Z[ offsetZ + ( j - 1 ) * strideZ1 + ( k + 1 - 1 ) * strideZ2 ] -= sum * t2;
						}
					}
				}
			}
		}

		if ( !converged ) {
			// Failed to converge in ITMAX iterations
			info = i;
			return info;
		}

		// Deflation (Fortran label 150)
		if ( l === i ) {
			// 1x1 deflation: eigenvalue found
			WR[ offsetWR + ( i - 1 ) * strideWR ] = H[ offsetH + ( i - 1 ) * strideH1 + ( i - 1 ) * strideH2 ];
			WI[ offsetWI + ( i - 1 ) * strideWI ] = ZERO;
		} else if ( l === i - 1 ) {
			// 2x2 deflation: use dlanv2 to compute eigenvalues and optionally Schur form
			lanv2 = dlanv2(H[ offsetH + ( i - 1 - 1 ) * strideH1 + ( i - 1 - 1 ) * strideH2 ], H[ offsetH + ( i - 1 - 1 ) * strideH1 + ( i - 1 ) * strideH2 ], H[ offsetH + ( i - 1 ) * strideH1 + ( i - 1 - 1 ) * strideH2 ], H[ offsetH + ( i - 1 ) * strideH1 + ( i - 1 ) * strideH2 ]);
			H[ offsetH + ( i - 1 - 1 ) * strideH1 + ( i - 1 - 1 ) * strideH2 ] = lanv2.a;
			H[ offsetH + ( i - 1 - 1 ) * strideH1 + ( i - 1 ) * strideH2 ] = lanv2.b;
			H[ offsetH + ( i - 1 ) * strideH1 + ( i - 1 - 1 ) * strideH2 ] = lanv2.c;
			H[ offsetH + ( i - 1 ) * strideH1 + ( i - 1 ) * strideH2 ] = lanv2.d;
			WR[ offsetWR + ( i - 1 - 1 ) * strideWR ] = lanv2.rt1r;
			WI[ offsetWI + ( i - 1 - 1 ) * strideWI ] = lanv2.rt1i;
			WR[ offsetWR + ( i - 1 ) * strideWR ] = lanv2.rt2r;
			WI[ offsetWI + ( i - 1 ) * strideWI ] = lanv2.rt2i;
			cs = lanv2.cs;
			sn = lanv2.sn;

			if ( wantt ) {
				// Apply rotation to the rest of H
				if ( i2 > i ) {
					drot( i2 - i, H, strideH2, offsetH + ( i - 1 - 1 ) * strideH1 + ( i + 1 - 1 ) * strideH2, H, strideH2, offsetH + ( i - 1 ) * strideH1 + ( i + 1 - 1 ) * strideH2, cs, sn );
				}
				drot( i - i1 - 1, H, strideH1, offsetH + ( i1 - 1 ) * strideH1 + ( i - 1 - 1 ) * strideH2, H, strideH1, offsetH + ( i1 - 1 ) * strideH1 + ( i - 1 ) * strideH2, cs, sn );
			}
			if ( wantz ) {
				// Apply rotation to Z
				drot( nz, Z, strideZ1, offsetZ + ( iloz - 1 ) * strideZ1 + ( i - 1 - 1 ) * strideZ2, Z, strideZ1, offsetZ + ( iloz - 1 ) * strideZ1 + ( i - 1 ) * strideZ2, cs, sn );
			}
		}

		// Reset deflation counter
		kdefl = 0;

		// Move to next block
		i = l - 1;
	}

	return info;
}


// EXPORTS //

export default dlahqr;
