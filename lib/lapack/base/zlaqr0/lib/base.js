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
import ilaenv from '../../ilaenv/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlahqr from '../../zlahqr/lib/base.js';
import zlaqr3, { computeOptimalWorkSize as zlaqr3WorkOpt } from '../../zlaqr3/lib/base.js';
import zlaqr4 from '../../zlaqr4/lib/base.js';
import zlaqr5 from '../../zlaqr5/lib/base.js';


// VARIABLES //

const NTINY = 15;
const KEXNW = 5;
const KEXSH = 6;
const WILK1 = 0.75;
const TWO = 2.0;


// FUNCTIONS //

/**
* Returns |Re(z)| + |Im(z)| for the complex value at a Float64 index.
*
* @private
* @param {Float64Array} v - Float64 view of a complex array
* @param {number} idx - index of the real part in `v`
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}

/**
* Returns |re| + |im| for a complex value given as separate parts.
*
* @private
* @param {number} re - real part
* @param {number} im - imaginary part
*/
function cabs1a( re, im ) {
	return Math.abs( re ) + Math.abs( im );
}


/**
* Returns the reference's optimal workspace length (LWKOPT, complex elements) for ZLAQR0.
*
* `LWKOPT = max( 3*NSR/2, LWK )`, where LWK is ZLAQR3's optimum for the window `NWR+1` on the active block (the reference's workspace query, with NWR and NSR from ILAENV); 1 for `N <= NTINY`.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {integer} ilo - first row/column of the active block (1-based)
* @param {integer} ihi - last row/column of the active block (1-based)
* @returns {PositiveInteger} optimal workspace length
*/
function computeOptimalWorkSize( N, ilo, ihi ) {
	let nwr;
	let nsr;
	if ( N <= NTINY ) {
		return 1;
	}
	// The reference's workspace query (LWORK = -1); ISPEC 13 and 15 do not read OPTS, so the query's JBCMPZ is immaterial:
	nwr = ilaenv( 13, 'ZLAQR0', 'SV', N, ilo, ihi, -1 );
	nwr = Math.max( 2, nwr );
	nwr = Math.min( ihi - ilo + 1, Math.floor( ( N - 1 ) / 3 ), nwr );
	nsr = ilaenv( 15, 'ZLAQR0', 'SV', N, ilo, ihi, -1 );
	nsr = Math.min( nsr, Math.floor( ( N - 3 ) / 6 ), ihi - ilo );
	nsr = Math.max( 2, nsr - ( nsr % 2 ) );
	return Math.max( Math.floor( 3 * nsr / 2 ), zlaqr3WorkOpt( nwr + 1, ilo, ihi ) );
}


// MAIN //

/**
* Top-level multishift QR driver for complex upper Hessenberg matrices.
* Uses zlaqr3 (recursive deflation) and zlaqr5 (multi-shift sweep).
*
* All indices are 1-based (Fortran convention).
*
* @private

* @param {boolean} wantt - = `true` : the full Schur form T is required; = `false`: only eigenvalues are required.
* @param {boolean} wantz - = `true` : the matrix of Schur vectors Z is required; = `false`: Schur vectors are not required.
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ilo - it is assumed that H is already upper triangular in rows and columns 1:ILO-1 and IHI+1:N and, if ILO > 1, H(ILO,ILO-1) is zero.
* @param {NonNegativeInteger} ihi - it is assumed that H is already upper triangular in rows and columns 1:ILO-1 and IHI+1:N and, if ILO > 1, H(ILO,ILO-1) is zero.
* @param {Complex128Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Complex128Array} w - input array
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {integer} iloz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= ILO.
* @param {integer} ihiz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= ILO.
* @param {Complex128Array} Z - input matrix
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Complex128Array} WORK - workspace array of length at least `max(1,N)` (the reference's minimum); the reference's optimum (`max( 3*NSR/2, LWKOPT of ZLAQR3 for the window NWR+1 )`) gives the deflation window and its callees their full room
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code
*/
function zlaqr0( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, w, strideW, offsetW, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork ) {
	const nsOut = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	let jbcmpz, nibble, nmin, nwr, nsr;
	let kacc22, nwupbd, sorted, nsmax, kwtop, kbot, ktop, ndec, ndfl, info, nho;
	let nve, kwh, kwv, kdu, swp, inf, nh, nw, ns, ks, kt, kv, ku, ld, ls;
	let it, k, i;

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

	// JBCMPZ: 'S' or 'E' for WANTT, then 'V' or 'N' for WANTZ:
	if ( wantt ) {
		jbcmpz = ( wantz ) ? 'SV' : 'SN';
	} else {
		jbcmpz = ( wantz ) ? 'EV' : 'EN';
	}

	// NWR = recommended deflation window size:
	nwr = ilaenv( 13, 'ZLAQR0', jbcmpz, N, ilo, ihi, lwork );
	nwr = Math.max( 2, nwr );
	nwr = Math.min( ihi - ilo + 1, Math.floor( ( N - 1 ) / 3 ), nwr );

	// NSR = recommended number of simultaneous shifts:
	nsr = ilaenv( 15, 'ZLAQR0', jbcmpz, N, ilo, ihi, lwork );
	nsr = Math.min( nsr, Math.floor( ( N - 3 ) / 6 ), ihi - ilo );
	nsr = Math.max( 2, nsr - ( nsr % 2 ) );

	// ZLAHQR/ZLAQR0 crossover point:
	nmin = ilaenv( 12, 'ZLAQR0', jbcmpz, N, ilo, ihi, lwork );
	nmin = Math.max( NTINY, nmin );

	// Nibble crossover point:
	nibble = ilaenv( 14, 'ZLAQR0', jbcmpz, N, ilo, ihi, lwork );
	nibble = Math.max( 0, nibble );

	// Accumulate reflections during the sweep? Use block 2-by-2 structure during the matrix-matrix multiplies?
	kacc22 = ilaenv( 16, 'ZLAQR0', jbcmpz, N, ilo, ihi, lwork );
	kacc22 = Math.max( 0, kacc22 );
	kacc22 = Math.min( 2, kacc22 );

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
		nsOut[ 0 ] = 0;
		nd[ 0 ] = 0;
		zlaqr3( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, nsOut, nd, w, strideW, offsetW, H, strideH1, strideH2, offsetH + ( kv - 1 ) * strideH1, nho, H, strideH1, strideH2, offsetH + ( kv - 1 ) * strideH1 + ( kt - 1 ) * strideH2, nve, H, strideH1, strideH2, offsetH + ( kwv - 1 ) * strideH1, WORK, strideWork, offsetWork );
		ls = nsOut[ 0 ];
		ld = nd[ 0 ];

		kbot -= ld;
		ks = kbot - ls + 1;

		if ( ld === 0 || ( 100 * ld <= nw * nibble && ( kbot - ktop + 1 > Math.min( nmin, nwmax ) ) ) ) {
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
					zlacpy( 'all', ns, ns, H, strideH1, strideH2, offsetH + ( ks - 1 ) * strideH1 + ( ks - 1 ) * strideH2, H, strideH1, strideH2, offsetH + ( kt - 1 ) * strideH1 );
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
				WORK, 1, 3, offsetWork,
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
export { computeOptimalWorkSize };
