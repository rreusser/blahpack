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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import dlahqr from '../../dlahqr/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlanv2 from '../../dlanv2/lib/base.js';
import dlaqr3 from '../../dlaqr3/lib/base.js';
import dlaqr4 from '../../dlaqr4/lib/base.js';
import dlaqr5 from '../../dlaqr5/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var NTINY = 15;
var KEXNW = 5;
var KEXSH = 6;
var WILK1 = 0.75;
var WILK2 = -0.4375;

// Iparmq defaults matching reference LAPACK
var IPARMQ_NMIN = 75;     // ISPEC=12: crossover point
var IPARMQ_NIBBLE = 14;   // ISPEC=14: nibble crossover
var IPARMQ_K22MIN = 14;   // threshold for KACC22=2
var IPARMQ_KACMIN = 14;   // threshold for KACC22=1
var IPARMQ_KNWSWP = 500;  // deflation window NS vs 3*NS/2 threshold


// FUNCTIONS //

/**
* Compute the number of simultaneous shifts (ISPEC=15) per iparmq.
*
* @private
* @param {integer} nh - IHI-ILO+1
* @returns {integer} ns
*/
function iparmqShifts( nh ) {
	var ns = 2;
	if ( nh >= 30 ) {
		ns = 4;
	}
	if ( nh >= 60 ) {
		ns = 10;
	}
	if ( nh >= 150 ) {
		ns = Math.max( 10, Math.round( nh / ( Math.log( nh ) / Math.log( 2.0 ) ) ) );
	}
	if ( nh >= 590 ) {
		ns = 64;
	}
	if ( nh >= 3000 ) {
		ns = 128;
	}
	if ( nh >= 6000 ) {
		ns = 256;
	}
	ns = Math.max( 2, ns - ( ns % 2 ) );
	return ns;
}


// MAIN //

/**
* Computes the eigenvalues of a Hessenberg matrix H and, optionally, the.
* matrices T and Z from the Schur decomposition H = Z T Z**T, where T is
* an upper quasi-triangular matrix (the Schur form), and Z is the orthogonal
* matrix of Schur vectors.
*
* This is the top-level driver that uses the multishift QR algorithm with
* aggressive early deflation (calls dlaqr3/dlaqr5). For small matrices
* (N <= NTINY = 15), it falls back to dlahqr.
*
* Note: ILO, IHI, ILOZ, IHIZ are 1-based (Fortran convention).
*
* @private
* @param {boolean} wantt - if true, compute full Schur form
* @param {boolean} wantz - if true, compute Schur vectors
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ilo - first row/col of the active block (1-based)
* @param {integer} ihi - last row/col of the active block (1-based)
* @param {Float64Array} H - upper Hessenberg matrix
* @param {integer} strideH1 - stride of first dim of H
* @param {integer} strideH2 - stride of second dim of H
* @param {NonNegativeInteger} offsetH - starting index for H
* @param {Float64Array} WR - real parts of eigenvalues (output)
* @param {integer} strideWR - stride for WR
* @param {NonNegativeInteger} offsetWR - starting index for WR
* @param {Float64Array} WI - imaginary parts of eigenvalues (output)
* @param {integer} strideWI - stride for WI
* @param {NonNegativeInteger} offsetWI - starting index for WI
* @param {integer} iloz - first row of Z to update (1-based)
* @param {integer} ihiz - last row of Z to update (1-based)
* @param {Float64Array} Z - orthogonal matrix
* @param {integer} strideZ1 - stride of first dim of Z
* @param {integer} strideZ2 - stride of second dim of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Float64Array} WORK - workspace
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - length of WORK
* @returns {integer} info (0=success, >0=convergence failure at that index)
*/
function dlaqr0( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, lwork ) {
	var lwkopt;
	var nwupbd;
	var nsmax;
	var nwmax;
	var sorted;
	var itmax;
	var kwtop;
	var kbot;
	var ktop;
	var ndfl;
	var ndec;
	var info;
	var swap;
	var nmin;
	var nwr;
	var nsr;
	var nw;
	var nh;
	var nho;
	var nve;
	var ns;
	var ks;
	var ld;
	var ls;
	var kv;
	var kt;
	var kwv;
	var kwh;
	var ku;
	var kdu;
	var aa;
	var bb;
	var cc;
	var dd;
	var ss;
	var lv2;
	var it;
	var k;
	var i;
	var nibble;
	var kacc22;
	var inf;
	var aedResult;
	var zdum;

	// Helper for 1-based indexing into H
	function hij( r, c ) {
		return offsetH + ( r - 1 ) * strideH1 + ( c - 1 ) * strideH2;
	}

	info = 0;

	// Quick return for N=0
	if ( N === 0 ) {
		WORK[ offsetWork ] = ONE;
		return 0;
	}

	if ( N <= NTINY ) {
		// Tiny matrices must use DLAHQR
		lwkopt = 1;
		if ( lwork !== -1 ) {
			info = dlahqr( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ );
		}
	} else {
		// Use small bulge multi-shift QR with aggressive early deflation
		info = 0;

		// Compute NS from iparmq (ISPEC=15)
		ns = iparmqShifts( ihi - ilo + 1 );

		// NWR = recommended deflation window size (ILAENV 13)

		// iparmq: NWR = NS if NH <= 500, else 3*NS/2
		nwr = ( ihi - ilo + 1 <= IPARMQ_KNWSWP ) ? ns : Math.floor( 3 * ns / 2 );
		nwr = Math.max( 2, nwr );
		nwr = Math.min( ihi - ilo + 1, Math.floor( ( N - 1 ) / 3 ), nwr );

		// NSR = recommended number of simultaneous shifts (ILAENV 15)
		nsr = ns;
		nsr = Math.min( nsr, Math.floor( ( N - 3 ) / 6 ), ihi - ilo );
		nsr = Math.max( 2, nsr - ( nsr % 2 ) );

		// Workspace query to DLAQR3
		dlaqr3( wantt, wantz, N, ilo, ihi, nwr + 1, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WR, strideWR, offsetWR, WI, strideWI, offsetWI, H, strideH1, strideH2, offsetH, N, H, strideH1, strideH2, offsetH, N, H, strideH1, strideH2, offsetH, WORK, strideWork, offsetWork, -1 );

		lwkopt = Math.max( Math.floor( 3 * nsr / 2 ), Math.floor( WORK[ offsetWork ] ) );

		// Quick return in case of workspace query
		if ( lwork === -1 ) {
			WORK[ offsetWork ] = lwkopt;
			return 0;
		}

		// DLAHQR/DLAQR0 crossover point (ILAENV 12 = iparmq NMIN)
		nmin = Math.max( NTINY, IPARMQ_NMIN );

		// Nibble crossover point (ILAENV 14)
		nibble = IPARMQ_NIBBLE;

		// Accumulate reflections? Block 2x2 structure? (ILAENV 16)

		// iparmq: for DLAQR0 (LAQR prefix), KACC22 based on NS vs thresholds
		kacc22 = 0;
		if ( ns >= IPARMQ_KACMIN ) {
			kacc22 = 1;
		}
		if ( ns >= IPARMQ_K22MIN ) {
			kacc22 = 2;
		}
		kacc22 = Math.max( 0, Math.min( 2, kacc22 ) );

		// NWMAX = largest possible deflation window
		nwmax = Math.min( Math.floor( ( N - 1 ) / 3 ), Math.floor( lwork / 2 ) );
		nw = nwmax;

		// NSMAX = largest number of simultaneous shifts
		nsmax = Math.min( Math.floor( ( N - 3 ) / 6 ), Math.floor( 2 * lwork / 3 ) );
		nsmax -= ( nsmax % 2 );

		// NDFL: iteration count restarted at deflation
		ndfl = 1;

		// Iteration limit
		itmax = Math.max( 30, 2 * KEXSH ) * Math.max( 10, ihi - ilo + 1 );

		// Last row and column in the active block
		kbot = ihi;

		// Main loop
		for ( it = 1; it <= itmax; it++ ) {
			// Done when KBOT falls below ILO
			if ( kbot < ilo ) {
				info = 0;
				break;
			}

			// Locate active block
			for ( k = kbot; k >= ilo + 1; k-- ) {
				if ( H[ hij( k, k - 1 ) ] === ZERO ) {
					break;
				}
			}
			if ( k > ilo && H[ hij( k, k - 1 ) ] !== ZERO ) {
				k = ilo;
			}
			ktop = k;

			// Select deflation window size
			nh = kbot - ktop + 1;
			nwupbd = Math.min( nh, nwmax );
			if ( ndfl < KEXNW ) {
				nw = Math.min( nwupbd, nwr );
			} else {
				nw = Math.min( nwupbd, 2 * nw );
			}
			if ( nw < nwmax ) {
				if ( nw >= nh - 1 ) {
					nw = nh;
				} else {
					kwtop = kbot - nw + 1;
					if ( Math.abs( H[ hij( kwtop, kwtop - 1 ) ] ) > Math.abs( H[ hij( kwtop - 1, kwtop - 2 ) ] ) ) {
						nw += 1;
					}
				}
			}
			if ( ndfl < KEXNW ) {
				ndec = -1;
			} else if ( ndec >= 0 || nw >= nwupbd ) {
				ndec += 1;
				if ( nw - ndec < 2 ) {
					ndec = 0;
				}
				nw -= ndec;
			}

			// Workspace partitioning for AED
			kv = N - nw + 1;
			kt = nw + 1;
			nho = ( N - nw - 1 ) - kt + 1;
			kwv = nw + 2;
			nve = ( N - nw ) - kwv + 1;

			// Aggressive early deflation (DLAQR3)
			aedResult = dlaqr3( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WR, strideWR, offsetWR, WI, strideWI, offsetWI, H, strideH1, strideH2, hij( kv, 1 ), nho, H, strideH1, strideH2, hij( kv, kt ), nve, H, strideH1, strideH2, hij( kwv, 1 ), WORK, strideWork, offsetWork, lwork );
			ls = aedResult.ns;
			ld = aedResult.nd;

			// Adjust KBOT
			kbot -= ld;

			// KS points to the shifts
			ks = kbot - ls + 1;

			// Skip QR sweep if enough eigenvalues deflated
			if ( ld === 0 || ( 100 * ld <= nw * nibble && kbot - ktop + 1 > Math.min( nmin, nwmax ) ) ) {
				// NS = nominal number of simultaneous shifts
				ns = Math.min( nsmax, nsr, Math.max( 2, kbot - ktop ) );
				ns -= ( ns % 2 );

				// Exceptional shifts or use shifts from deflation
				if ( ndfl % KEXSH === 0 ) {
					ks = kbot - ns + 1;
					for ( i = kbot; i >= Math.max( ks + 1, ktop + 2 ); i -= 2 ) {
						ss = Math.abs( H[ hij( i, i - 1 ) ] ) + Math.abs( H[ hij( i - 1, i - 2 ) ] );
						aa = WILK1 * ss + H[ hij( i, i ) ];
						bb = ss;
						cc = WILK2 * ss;
						dd = aa;
						lv2 = dlanv2( aa, bb, cc, dd );
						WR[ offsetWR + ( i - 2 ) * strideWR ] = lv2.rt1r;
						WI[ offsetWI + ( i - 2 ) * strideWI ] = lv2.rt1i;
						WR[ offsetWR + ( i - 1 ) * strideWR ] = lv2.rt2r;
						WI[ offsetWI + ( i - 1 ) * strideWI ] = lv2.rt2i;
					}
					if ( ks === ktop ) {
						WR[ offsetWR + ks * strideWR ] = H[ hij( ks + 1, ks + 1 ) ];
						WI[ offsetWI + ks * strideWI ] = ZERO;
						WR[ offsetWR + ( ks - 1 ) * strideWR ] = WR[ offsetWR + ks * strideWR ];
						WI[ offsetWI + ( ks - 1 ) * strideWI ] = WI[ offsetWI + ks * strideWI ];
					}
				} else {
					// Get more shifts from trailing submatrix
					if ( kbot - ks + 1 <= Math.floor( ns / 2 ) ) {
						ks = kbot - ns + 1;
						kt = N - ns + 1;
						dlacpy( 'full', ns, ns, H, strideH1, strideH2, hij( ks, ks ), H, strideH1, strideH2, hij( kt, 1 ) );
						if ( ns > nmin ) {
							inf = dlaqr4( false, false, ns, 1, ns, H, strideH1, strideH2, hij( kt, 1 ), WR, strideWR, offsetWR + ( ks - 1 ) * strideWR, WI, strideWI, offsetWI + ( ks - 1 ) * strideWI, 1, 1, WORK, 1, 1, 0, WORK, strideWork, offsetWork, lwork );
						} else {
							zdum = new Float64Array( 1 );
							inf = dlahqr( false, false, ns, 1, ns, H, strideH1, strideH2, hij( kt, 1 ), WR, strideWR, offsetWR + ( ks - 1 ) * strideWR, WI, strideWI, offsetWI + ( ks - 1 ) * strideWI, 1, 1, zdum, 1, 1, 0 );
						}
						ks += inf;

						if ( ks >= kbot ) {
							aa = H[ hij( kbot - 1, kbot - 1 ) ];
							cc = H[ hij( kbot, kbot - 1 ) ];
							bb = H[ hij( kbot - 1, kbot ) ];
							dd = H[ hij( kbot, kbot ) ];
							lv2 = dlanv2( aa, bb, cc, dd );
							WR[ offsetWR + ( kbot - 2 ) * strideWR ] = lv2.rt1r;
							WI[ offsetWI + ( kbot - 2 ) * strideWI ] = lv2.rt1i;
							WR[ offsetWR + ( kbot - 1 ) * strideWR ] = lv2.rt2r;
							WI[ offsetWI + ( kbot - 1 ) * strideWI ] = lv2.rt2i;
							ks = kbot - 1;
						}
					}

					if ( kbot - ks + 1 > ns ) {
						// Sort shifts (bubble sort keeps conjugate pairs together)
						sorted = false;
						for ( k = kbot; k >= ks + 1; k-- ) {
							if ( sorted ) {
								break;
							}
							sorted = true;
							for ( i = ks; i <= k - 1; i++ ) {
								if ( Math.abs( WR[ offsetWR + ( i - 1 ) * strideWR ] ) + Math.abs( WI[ offsetWI + ( i - 1 ) * strideWI ] ) <
									Math.abs( WR[ offsetWR + i * strideWR ] ) + Math.abs( WI[ offsetWI + i * strideWI ] ) ) {
									sorted = false;
									swap = WR[ offsetWR + ( i - 1 ) * strideWR ];
									WR[ offsetWR + ( i - 1 ) * strideWR ] = WR[ offsetWR + i * strideWR ];
									WR[ offsetWR + i * strideWR ] = swap;
									swap = WI[ offsetWI + ( i - 1 ) * strideWI ];
									WI[ offsetWI + ( i - 1 ) * strideWI ] = WI[ offsetWI + i * strideWI ];
									WI[ offsetWI + i * strideWI ] = swap;
								}
							}
						}
					}

					// Shuffle shifts into pairs
					for ( i = kbot; i >= ks + 2; i -= 2 ) {
						if ( WI[ offsetWI + ( i - 1 ) * strideWI ] !== -WI[ offsetWI + ( i - 2 ) * strideWI ] ) {
							swap = WR[ offsetWR + ( i - 1 ) * strideWR ];
							WR[ offsetWR + ( i - 1 ) * strideWR ] = WR[ offsetWR + ( i - 2 ) * strideWR ];
							WR[ offsetWR + ( i - 2 ) * strideWR ] = WR[ offsetWR + ( i - 3 ) * strideWR ];
							WR[ offsetWR + ( i - 3 ) * strideWR ] = swap;
							swap = WI[ offsetWI + ( i - 1 ) * strideWI ];
							WI[ offsetWI + ( i - 1 ) * strideWI ] = WI[ offsetWI + ( i - 2 ) * strideWI ];
							WI[ offsetWI + ( i - 2 ) * strideWI ] = WI[ offsetWI + ( i - 3 ) * strideWI ];
							WI[ offsetWI + ( i - 3 ) * strideWI ] = swap;
						}
					}
				}

				// If there are only two shifts and both are real, use only one
				if ( kbot - ks + 1 === 2 ) {
					if ( WI[ offsetWI + ( kbot - 1 ) * strideWI ] === ZERO ) {
						if ( Math.abs( WR[ offsetWR + ( kbot - 1 ) * strideWR ] - H[ hij( kbot, kbot ) ] ) <
							Math.abs( WR[ offsetWR + ( kbot - 2 ) * strideWR ] - H[ hij( kbot, kbot ) ] ) ) {
							WR[ offsetWR + ( kbot - 2 ) * strideWR ] = WR[ offsetWR + ( kbot - 1 ) * strideWR ];
						} else {
							WR[ offsetWR + ( kbot - 1 ) * strideWR ] = WR[ offsetWR + ( kbot - 2 ) * strideWR ];
						}
					}
				}

				// Use up to NS shifts
				ns = Math.min( ns, kbot - ks + 1 );
				ns -= ( ns % 2 );
				ks = kbot - ns + 1;

				// Workspace partitioning for QR sweep
				kdu = 2 * ns;
				ku = N - kdu + 1;
				kwh = kdu + 1;
				nho = ( N - kdu + 1 - 4 ) - ( kdu + 1 ) + 1;
				kwv = kdu + 4;
				nve = N - kdu - kwv + 1;

				// Small-bulge multi-shift QR sweep

				// V = WORK used as 2D with LDV=3 (column-major: strideV1=1, strideV2=3)

				// NOTE: dlaqr5 uses 0-based ktop, kbot, iloz, ihiz
				dlaqr5( wantt, wantz, kacc22, N, ktop - 1, kbot - 1, ns, WR, strideWR, offsetWR + ( ks - 1 ) * strideWR, WI, strideWI, offsetWI + ( ks - 1 ) * strideWI, H, strideH1, strideH2, offsetH, iloz - 1, ihiz - 1, Z, strideZ1, strideZ2, offsetZ, WORK, 1, 3, offsetWork, H, strideH1, strideH2, hij( ku, 1 ), nve, H, strideH1, strideH2, hij( kwv, 1 ), nho, H, strideH1, strideH2, hij( ku, kwh ) );
			}

			// Note progress
			if ( ld > 0 ) {
				ndfl = 1;
			} else {
				ndfl += 1;
			}
		}

		// If we get here without breaking, iteration limit exceeded
		if ( it > itmax ) {
			info = kbot;
		}
	}

	// Return optimal workspace
	WORK[ offsetWork ] = lwkopt;

	return info;
}


// EXPORTS //

export default dlaqr0;
