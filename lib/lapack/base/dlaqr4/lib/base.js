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
import dlaqr2 from '../../dlaqr2/lib/base.js';
import dlaqr5 from '../../dlaqr5/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var NTINY = 15;
var KEXNW = 5;
var KEXSH = 6;
var WILK1 = 0.75;
var WILK2 = -0.4375;


// MAIN //

/**
* Implements one level of recursion for DLAQR0. It is a complete implementation.
* of the small bulge multi-shift QR algorithm. This routine is identical to
* DLAQR0 except that it calls DLAQR2 instead of DLAQR3 (breaking the recursion).
*
* Computes the eigenvalues of a Hessenberg matrix H and, optionally, the
* matrices T and Z from the Schur decomposition H = Z T Z**T.
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
function dlaqr4( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, lwork ) {
	var aedResult;
	var lwkopt;
	var nwupbd;
	var sorted;
	var nibble;
	var kacc22;
	var nsmax;
	var itmax;
	var kwtop;
	var kbot;
	var ktop;
	var ndfl;
	var ndec;
	var info;
	var swap;
	var nmin;
	var zdum;
	var nwr;
	var nsr;
	var nho;
	var nve;
	var kwv;
	var kwh;
	var kdu;
	var lv2;
	var inf;
	var nw;
	var nh;
	var ns;
	var ks;
	var ld;
	var ls;
	var kv;
	var kt;
	var ku;
	var aa;
	var bb;
	var cc;
	var dd;
	var ss;
	var it;
	var k;
	var i;

	// Helpers for 1-based indexing
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

		// Hardcoded ILAENV values (defaults from reference LAPACK)
		nwr = 4;           // ILAENV(13): recommended deflation window size
		nwr = Math.max( 2, nwr );
		nwr = Math.min( ihi - ilo + 1, Math.floor( ( N - 1 ) / 3 ), nwr );

		nsr = 2;           // ILAENV(15): recommended number of simultaneous shifts
		nsr = Math.min( nsr, Math.floor( ( N - 3 ) / 6 ), ihi - ilo );
		nsr = Math.max( 2, nsr - ( nsr % 2 ) );

		// Workspace query to DLAQR2
		dlaqr2( wantt, wantz, N, ilo, ihi, nwr + 1, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WR, strideWR, offsetWR, WI, strideWI, offsetWI, H, strideH1, strideH2, offsetH, N, H, strideH1, strideH2, offsetH, N, H, strideH1, strideH2, offsetH, WORK, strideWork, offsetWork, -1 );

		lwkopt = Math.max( Math.floor( 3 * nsr / 2 ), Math.floor( WORK[ offsetWork ] ) );

		// Quick return in case of workspace query
		if ( lwork === -1 ) {
			WORK[ offsetWork ] = lwkopt;
			return 0;
		}

		// DLAHQR/DLAQR0 crossover point
		nmin = NTINY;     // ILAENV(12)

		// Nibble crossover point
		nibble = 14;       // ILAENV(14)

		// Accumulate reflections during ttswp? Use block 2x2 structure?
		kacc22 = 0;        // ILAENV(16)
		kacc22 = Math.max( 0, Math.min( 2, kacc22 ) );

		// NWMAX and NSMAX
		var nwmax = Math.min( Math.floor( ( N - 1 ) / 3 ), Math.floor( lwork / 2 ) );
		nw = nwmax;
		nsmax = Math.min( Math.floor( ( N - 3 ) / 6 ), Math.floor( 2 * lwork / 3 ) );
		nsmax -= ( nsmax % 2 );

		ndfl = 1;
		itmax = Math.max( 30, 2 * KEXSH ) * Math.max( 10, ihi - ilo + 1 );

		kbot = ihi;

		// Main loop
		for ( it = 1; it <= itmax; it++ ) {
			if ( kbot < ilo ) {
				// Done
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

			// Workspace partitioning
			kv = N - nw + 1;
			kt = nw + 1;
			nho = ( N - nw - 1 ) - kt + 1;
			kwv = nw + 2;
			nve = ( N - nw ) - kwv + 1;

			// Aggressive early deflation
			aedResult = dlaqr2( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WR, strideWR, offsetWR, WI, strideWI, offsetWI, H, strideH1, strideH2, hij( kv, 1 ), nho, H, strideH1, strideH2, hij( kv, kt ), nve, H, strideH1, strideH2, hij( kwv, 1 ), WORK, strideWork, offsetWork, lwork );
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
						WR[ offsetWR + ( ks ) * strideWR ] = H[ hij( ks + 1, ks + 1 ) ];
						WI[ offsetWI + ( ks ) * strideWI ] = ZERO;
						WR[ offsetWR + ( ks - 1 ) * strideWR ] = WR[ offsetWR + ( ks ) * strideWR ];
						WI[ offsetWI + ( ks - 1 ) * strideWI ] = WI[ offsetWI + ( ks ) * strideWI ];
					}
				} else {
					// Get more shifts from trailing submatrix
					if ( kbot - ks + 1 <= Math.floor( ns / 2 ) ) {
						ks = kbot - ns + 1;
						kt = N - ns + 1;
						dlacpy( 'full', ns, ns, H, strideH1, strideH2, hij( ks, ks ), H, strideH1, strideH2, hij( kt, 1 ) );
						zdum = new Float64Array( 1 );
						inf = dlahqr( false, false, ns, 1, ns, H, strideH1, strideH2, hij( kt, 1 ), WR, strideWR, offsetWR + ( ks - 1 ) * strideWR, WI, strideWI, offsetWI + ( ks - 1 ) * strideWI, 1, 1, zdum, 1, 1, 0 );
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
						// Sort shifts
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

export default dlaqr4;
