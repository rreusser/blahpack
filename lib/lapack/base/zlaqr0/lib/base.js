/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, no-var */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlahqr from '../../zlahqr/lib/base.js';
import zlaqr3 from '../../zlaqr3/lib/base.js';
import zlaqr4 from '../../zlaqr4/lib/base.js';
import zlaqr5 from '../../zlaqr5/lib/base.js';


// VARIABLES //

const NTINY = 15;
const KEXNW = 5;
const KEXSH = 6;
const WILK1 = 0.75;
const TWO = 2.0;

// Hardcoded ILAENV values
const NWR = 5;
const NSR = 14;
const NMIN = 75;
const NIBBLE = 14;
const KACMIN = 14;
const K22MIN = 14;


// FUNCTIONS //

function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}

function cabs1a( re, im ) {
	return Math.abs( re ) + Math.abs( im );
}


// MAIN //

/**
* Top-level multishift QR driver for complex upper Hessenberg matrices.
* Uses zlaqr3 (recursive deflation) and zlaqr5 (multi-shift sweep).
*
* All indices are 1-based (Fortran convention).
*
* @private
*/
function zlaqr0( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, w, strideW, offsetW, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork ) {
	let kacc22, nwupbd, sorted, nsmax, kwtop, kbot, ktop, ndec, ndfl, info, nho;
	let nve, kwh, kwv, kdu, swp, inf, nh, nw, ns, ks, kt, kv, ku, ld, ls;
	let deflResult, it, k, i;

	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	// Caller owns the workspace; the available length (in complex elements) plays
	// the role of the former `lwork` argument in the tuning heuristics below.
	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );

	if ( N <= NTINY ) {
		info = zlahqr( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, w, strideW, offsetW, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ );
		return info;
	}

	const Hv = reinterpret( H, 0 );
	const wv = reinterpret( w, 0 );
	const sh1 = strideH1 * 2;
	const sh2 = strideH2 * 2;
	const oH = offsetH * 2;
	const sw = strideW * 2;
	const ow = offsetW * 2;

	const nwr = Math.min( ihi - ilo + 1, Math.floor( ( N - 1 ) / 3 ), Math.max( 2, NWR ) );
	let nsr = Math.min( Math.floor( ( N - 3 ) / 6 ), ihi - ilo, Math.max( 2, NSR ) );
	nsr -= ( nsr % 2 );
	const nmin = Math.max( NTINY, NMIN );

	// Accumulate reflections? Block 2x2 structure? (ILAENV 16 / IPARMQ)
	kacc22 = 0;
	if ( nsr >= KACMIN ) {
		kacc22 = 1;
	}
	if ( nsr >= K22MIN ) {
		kacc22 = 2;
	}
	kacc22 = Math.max( 0, Math.min( 2, kacc22 ) );

	const nwmax = Math.min( Math.floor( ( N - 1 ) / 3 ), Math.floor( lwork / 2 ) );
	nw = nwmax;

	nsmax = Math.min( Math.floor( ( N - 3 ) / 6 ), Math.floor( 2 * lwork / 3 ) );
	nsmax -= ( nsmax % 2 );

	ndfl = 1;
	ndec = -1;
	const itmax = Math.max( 30, 2 * KEXSH ) * Math.max( 10, ihi - ilo + 1 );
	kbot = ihi;

	for ( it = 1; it <= itmax; it++ ) {
		if ( kbot < ilo ) {
			return 0;
		}

		for ( k = kbot; k >= ilo + 1; k-- ) {
			if ( Hv[ oH + ( k - 1 ) * sh1 + ( k - 2 ) * sh2 ] === 0.0 && Hv[ oH + ( k - 1 ) * sh1 + ( k - 2 ) * sh2 + 1 ] === 0.0 ) {
				break;
			}
		}
		ktop = ( k <= ilo ) ? ilo : k;

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
				if ( cabs1( Hv, oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 ) > cabs1( Hv, oH + ( kwtop - 2 ) * sh1 + ( kwtop - 3 ) * sh2 ) ) {
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

		kv = N - nw + 1;
		kt = nw + 1;
		nho = ( N - nw - 1 ) - kt + 1;
		kwv = nw + 2;
		nve = ( N - nw ) - kwv + 1;

		// Aggressive early deflation (using zlaqr3 — recursive)
		deflResult = zlaqr3( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, 0, 0, w, strideW, offsetW, H, strideH1, strideH2, offsetH + ( kv - 1 ) * strideH1, nho, H, strideH1, strideH2, offsetH + ( kv - 1 ) * strideH1 + ( kt - 1 ) * strideH2, nve, H, strideH1, strideH2, offsetH + ( kwv - 1 ) * strideH1, WORK, strideWork, offsetWork );
		ls = deflResult.ns;
		ld = deflResult.nd;

		kbot -= ld;
		ks = kbot - ls + 1;

		if ( ld === 0 || ( 100 * ld <= nw * NIBBLE && ( kbot - ktop + 1 > Math.min( nmin, nwmax ) ) ) ) {
			ns = Math.min( nsmax, nsr, Math.max( 2, kbot - ktop ) );
			ns -= ( ns % 2 );

			if ( ( ndfl % KEXSH ) === 0 ) {
				ks = kbot - ns + 1;
				for ( i = kbot; i >= ks + 1; i -= 2 ) {
					const hiiR = Hv[ oH + ( i - 1 ) * sh1 + ( i - 1 ) * sh2 ];
					const hiiI = Hv[ oH + ( i - 1 ) * sh1 + ( i - 1 ) * sh2 + 1 ];
					const wlk = WILK1 * cabs1( Hv, oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 );
					wv[ ow + ( i - 1 ) * sw ] = hiiR + wlk;
					wv[ ow + ( i - 1 ) * sw + 1 ] = hiiI;
					wv[ ow + ( i - 2 ) * sw ] = hiiR + wlk;
					wv[ ow + ( i - 2 ) * sw + 1 ] = hiiI;
				}
			} else {
				if ( kbot - ks + 1 <= Math.floor( ns / 2 ) ) {
					ks = kbot - ns + 1;
					kt = N - ns + 1;
					zlacpy( 'full', ns, ns, H, strideH1, strideH2, offsetH + ( ks - 1 ) * strideH1 + ( ks - 1 ) * strideH2, H, strideH1, strideH2, offsetH + ( kt - 1 ) * strideH1 );
					const zdum = new Complex128Array( 1 );
					if ( ns > nmin ) {
						inf = zlaqr4( false, false, ns, 1, ns, H, strideH1, strideH2, offsetH + ( kt - 1 ) * strideH1, w, strideW, offsetW + ( ks - 1 ) * strideW, 1, 1, zdum, 1, 1, 0, WORK, strideWork, offsetWork );
					} else {
						inf = zlahqr( false, false, ns, 1, ns, H, strideH1, strideH2, offsetH + ( kt - 1 ) * strideH1, w, strideW, offsetW + ( ks - 1 ) * strideW, 1, 1, zdum, 1, 1, 0 );
					}
					ks += inf;

					if ( ks >= kbot ) {
						const sR = cabs1( Hv, oH + ( kbot - 2 ) * sh1 + ( kbot - 2 ) * sh2 ) + cabs1( Hv, oH + ( kbot - 1 ) * sh1 + ( kbot - 2 ) * sh2 ) + cabs1( Hv, oH + ( kbot - 2 ) * sh1 + ( kbot - 1 ) * sh2 ) + cabs1( Hv, oH + ( kbot - 1 ) * sh1 + ( kbot - 1 ) * sh2 );
						const aaR = Hv[ oH + ( kbot - 2 ) * sh1 + ( kbot - 2 ) * sh2 ] / sR;
						const aaI = Hv[ oH + ( kbot - 2 ) * sh1 + ( kbot - 2 ) * sh2 + 1 ] / sR;
						const ccR = Hv[ oH + ( kbot - 1 ) * sh1 + ( kbot - 2 ) * sh2 ] / sR;
						const ccI = Hv[ oH + ( kbot - 1 ) * sh1 + ( kbot - 2 ) * sh2 + 1 ] / sR;
						const bbR = Hv[ oH + ( kbot - 2 ) * sh1 + ( kbot - 1 ) * sh2 ] / sR;
						const bbI = Hv[ oH + ( kbot - 2 ) * sh1 + ( kbot - 1 ) * sh2 + 1 ] / sR;
						const ddR = Hv[ oH + ( kbot - 1 ) * sh1 + ( kbot - 1 ) * sh2 ] / sR;
						const ddI = Hv[ oH + ( kbot - 1 ) * sh1 + ( kbot - 1 ) * sh2 + 1 ] / sR;
						const tr2R = ( aaR + ddR ) / TWO;
						const tr2I = ( aaI + ddI ) / TWO;
						const d1R = aaR - tr2R;
						const d1I = aaI - tr2I;
						const d2R = ddR - tr2R;
						const d2I = ddI - tr2I;
						const detR = ( d1R * d2R - d1I * d2I ) - ( bbR * ccR - bbI * ccI );
						const detI = ( d1R * d2I + d1I * d2R ) - ( bbR * ccI + bbI * ccR );
						const negDetR = -detR;
						const negDetI = -detI;
						const r = Math.sqrt( negDetR * negDetR + negDetI * negDetI );
						const w2 = Math.sqrt( ( Math.abs( negDetR ) + r ) / 2.0 );
						let rtR, rtI;
						if ( w2 === 0.0 ) { rtR = 0.0; rtI = 0.0; }
						else if ( negDetR >= 0.0 ) { rtR = w2; rtI = negDetI / ( 2.0 * w2 ); }
						else { rtR = Math.abs( negDetI ) / ( 2.0 * w2 ); rtI = ( negDetI >= 0.0 ) ? w2 : -w2; }
						wv[ ow + ( kbot - 2 ) * sw ] = ( tr2R + rtR ) * sR;
						wv[ ow + ( kbot - 2 ) * sw + 1 ] = ( tr2I + rtI ) * sR;
						wv[ ow + ( kbot - 1 ) * sw ] = ( tr2R - rtR ) * sR;
						wv[ ow + ( kbot - 1 ) * sw + 1 ] = ( tr2I - rtI ) * sR;
						ks = kbot - 1;
					}
				}

				if ( kbot - ks + 1 > ns ) {
					sorted = false;
					for ( k = kbot; k >= ks + 1; k-- ) {
						if ( sorted ) { break; }
						sorted = true;
						for ( i = ks; i <= k - 1; i++ ) {
							if ( cabs1( wv, ow + ( i - 1 ) * sw ) < cabs1( wv, ow + i * sw ) ) {
								sorted = false;
								swp = wv[ ow + ( i - 1 ) * sw ];
								wv[ ow + ( i - 1 ) * sw ] = wv[ ow + i * sw ];
								wv[ ow + i * sw ] = swp;
								swp = wv[ ow + ( i - 1 ) * sw + 1 ];
								wv[ ow + ( i - 1 ) * sw + 1 ] = wv[ ow + i * sw + 1 ];
								wv[ ow + i * sw + 1 ] = swp;
							}
						}
					}
				}
			}

			if ( kbot - ks + 1 === 2 ) {
				const d1v = cabs1a( wv[ ow + ( kbot - 1 ) * sw ] - Hv[ oH + ( kbot - 1 ) * sh1 + ( kbot - 1 ) * sh2 ], wv[ ow + ( kbot - 1 ) * sw + 1 ] - Hv[ oH + ( kbot - 1 ) * sh1 + ( kbot - 1 ) * sh2 + 1 ] );
				const d2v = cabs1a( wv[ ow + ( kbot - 2 ) * sw ] - Hv[ oH + ( kbot - 1 ) * sh1 + ( kbot - 1 ) * sh2 ], wv[ ow + ( kbot - 2 ) * sw + 1 ] - Hv[ oH + ( kbot - 1 ) * sh1 + ( kbot - 1 ) * sh2 + 1 ] );
				if ( d1v < d2v ) {
					wv[ ow + ( kbot - 2 ) * sw ] = wv[ ow + ( kbot - 1 ) * sw ];
					wv[ ow + ( kbot - 2 ) * sw + 1 ] = wv[ ow + ( kbot - 1 ) * sw + 1 ];
				} else {
					wv[ ow + ( kbot - 1 ) * sw ] = wv[ ow + ( kbot - 2 ) * sw ];
					wv[ ow + ( kbot - 1 ) * sw + 1 ] = wv[ ow + ( kbot - 2 ) * sw + 1 ];
				}
			}

			ns = Math.min( ns, kbot - ks + 1 );
			ns -= ( ns % 2 );
			ks = kbot - ns + 1;

			kdu = 2 * ns;
			ku = N - kdu + 1;
			kwh = kdu + 1;
			nho = ( N - kdu + 1 - 4 ) - ( kdu + 1 ) + 1;
			kwv = kdu + 4;
			nve = N - kdu - kwv + 1;

			zlaqr5( wantt, wantz, kacc22, N, ktop, kbot, ns,
				w, strideW, offsetW + ( ks - 1 ) * strideW,
				H, strideH1, strideH2, offsetH,
				iloz, ihiz,
				Z, strideZ1, strideZ2, offsetZ,
				WORK, 1, 3, 0,
				H, strideH1, strideH2, offsetH + ( ku - 1 ) * strideH1,
				nve,
				H, strideH1, strideH2, offsetH + ( kwv - 1 ) * strideH1,
				nho,
				H, strideH1, strideH2, offsetH + ( ku - 1 ) * strideH1 + ( kwh - 1 ) * strideH2 );
		}

		if ( ld > 0 ) {
			ndfl = 1;
		} else {
			ndfl += 1;
		}
	}

	info = kbot;
	return info;
}


// EXPORTS //

export default zlaqr0;
