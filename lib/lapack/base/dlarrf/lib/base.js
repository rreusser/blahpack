/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';


// VARIABLES //

const EPS = dlamch( 'precision' );
const SAFMIN = dlamch( 'safe minimum' );
const ONE = 1.0;
const TWO = 2.0;
const FOUR = 4.0;
const QUART = 0.25;
const MAXGROWTH1 = 8.0;
const MAXGROWTH2 = 8.0;
const KTRYMAX = 1;
const SLEFT = 1;
const SRIGHT = 2;


// MAIN //

/**
* Finds a new relatively robust representation (RRR) for a tridiagonal cluster.
*
* ## Notes
*
* -   Such that at least one of its eigenvalues is relatively isolated.
*
* @private
* @param {NonNegativeInteger} N - order of the tridiagonal matrix
* @param {Float64Array} d - diagonal of the parent representation
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} l - subdiagonal of the unit bidiagonal factor
* @param {integer} strideL - stride length for `l`
* @param {NonNegativeInteger} offsetL - starting index for `l`
* @param {Float64Array} ld - elementwise product L*D
* @param {integer} strideLD - stride length for `ld`
* @param {NonNegativeInteger} offsetLD - starting index for `ld`
* @param {integer} clstrt - first index of the cluster (1-based)
* @param {integer} clend - last index of the cluster (1-based)
* @param {Float64Array} w - approximate eigenvalues of the parent
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} wgap - approximate gaps between eigenvalues
* @param {integer} strideWGAP - stride length for `wgap`
* @param {NonNegativeInteger} offsetWGAP - starting index for `wgap`
* @param {Float64Array} werr - errors in the approximate eigenvalues
* @param {integer} strideWERR - stride length for `werr`
* @param {NonNegativeInteger} offsetWERR - starting index for `werr`
* @param {number} spdiam - estimate of the spectral diameter
* @param {number} clgapl - left gap of the cluster
* @param {number} clgapr - right gap of the cluster
* @param {number} pivmin - minimum pivot allowed in the Sturm sequence
* @param {Float64Array} sigma - output (length 1): `sigma[0]` receives the chosen shift
* @param {Float64Array} dplus - output: diagonal of the new RRR L+ D+ L+^T
* @param {integer} strideDPLUS - stride length for `dplus`
* @param {NonNegativeInteger} offsetDPLUS - starting index for `dplus`
* @param {Float64Array} lplus - output: subdiagonal of the new RRR
* @param {integer} strideLPLUS - stride length for `lplus`
* @param {NonNegativeInteger} offsetLPLUS - starting index for `lplus`
* @param {Float64Array} work - workspace of length 2*N
* @param {integer} strideWork - stride length for `work`
* @param {NonNegativeInteger} offsetWork - starting index for `work`
* @returns {integer} info - status code (0 = success, 1 = no acceptable shift found)
*/
function dlarrf( N, d, strideD, offsetD, l, strideL, offsetL, ld, strideLD, offsetLD, clstrt, clend, w, strideW, offsetW, wgap, strideWGAP, offsetWGAP, werr, strideWERR, offsetWERR, spdiam, clgapl, clgapr, pivmin, sigma, dplus, strideDPLUS, offsetDPLUS, lplus, strideLPLUS, offsetLPLUS, work, strideWork, offsetWork ) {
	let bestShift, smlGrowth, tryRrr1, sawnan1, sawnan2, dorrr1, forcer, ldelta;
	let rdelta, lsigma, rsigma, shift, max1, max2, oldp, prod, rrr1, rrr2, indx;
	let ktry, znm2, info, tmp, sig, s, i;

	info = 0;
	sig = 0.0;
	sigma[ 0 ] = 0.0;

	if ( N <= 0 ) {
		return info;
	}

	const fact = ( 1 << KTRYMAX );
	const eps = EPS;
	shift = 0;
	forcer = false;
	const nofail = false;

	// CLWDTH = |W(CLEND) - W(CLSTRT)| + WERR(CLEND) + WERR(CLSTRT)
	const clwdth = Math.abs( w[ offsetW + ( ( clend - 1 ) * strideW ) ] - w[ offsetW + ( ( clstrt - 1 ) * strideW ) ] ) + werr[ offsetWERR + ( ( clend - 1 ) * strideWERR ) ] + werr[ offsetWERR + ( ( clstrt - 1 ) * strideWERR ) ];
	const avgap = clwdth / ( clend - clstrt );
	const mingap = Math.min( clgapl, clgapr );
	lsigma = Math.min( w[ offsetW + ( ( clstrt - 1 ) * strideW ) ], w[ offsetW + ( ( clend - 1 ) * strideW ) ] ) - werr[ offsetWERR + ( ( clstrt - 1 ) * strideWERR ) ];
	rsigma = Math.max( w[ offsetW + ( ( clstrt - 1 ) * strideW ) ], w[ offsetW + ( ( clend - 1 ) * strideW ) ] ) + werr[ offsetWERR + ( ( clend - 1 ) * strideWERR ) ];

	lsigma -= Math.abs( lsigma ) * FOUR * eps;
	rsigma += Math.abs( rsigma ) * FOUR * eps;

	const ldmax = ( QUART * mingap ) + ( TWO * pivmin );
	const rdmax = ( QUART * mingap ) + ( TWO * pivmin );

	ldelta = Math.max( avgap, wgap[ offsetWGAP + ( ( clstrt - 1 ) * strideWGAP ) ] ) / fact;
	rdelta = Math.max( avgap, wgap[ offsetWGAP + ( ( clend - 2 ) * strideWGAP ) ] ) / fact;

	s = SAFMIN;
	smlGrowth = ONE / s;
	const fail = ( N - 1 ) * mingap / ( spdiam * eps );
	const fail2 = ( N - 1 ) * mingap / ( spdiam * Math.sqrt( eps ) );
	bestShift = lsigma;

	ktry = 0;
	const growthBound = MAXGROWTH1 * spdiam;

	indx = 0;

	// Label 5: try a shift
	while ( true ) {
		sawnan1 = false;
		sawnan2 = false;
		ldelta = Math.min( ldmax, ldelta );
		rdelta = Math.min( rdmax, rdelta );

		// Try the LSIGMA shift: compute D+ and L+ in dplus, lplus
		s = -lsigma;
		dplus[ offsetDPLUS ] = d[ offsetD ] + s;
		if ( Math.abs( dplus[ offsetDPLUS ] ) < pivmin ) {
			dplus[ offsetDPLUS ] = -pivmin;
			sawnan1 = true;
		}
		max1 = Math.abs( dplus[ offsetDPLUS ] );
		for ( i = 1; i <= N - 1; i++ ) {
			lplus[ offsetLPLUS + ( ( i - 1 ) * strideLPLUS ) ] = ld[ offsetLD + ( ( i - 1 ) * strideLD ) ] / dplus[ offsetDPLUS + ( ( i - 1 ) * strideDPLUS ) ];
			s = ( s * lplus[ offsetLPLUS + ( ( i - 1 ) * strideLPLUS ) ] * l[ offsetL + ( ( i - 1 ) * strideL ) ] ) - lsigma;
			dplus[ offsetDPLUS + ( i * strideDPLUS ) ] = d[ offsetD + ( i * strideD ) ] + s;
			if ( Math.abs( dplus[ offsetDPLUS + ( i * strideDPLUS ) ] ) < pivmin ) {
				dplus[ offsetDPLUS + ( i * strideDPLUS ) ] = -pivmin;
				sawnan1 = true;
			}
			tmp = Math.abs( dplus[ offsetDPLUS + ( i * strideDPLUS ) ] );
			if ( tmp > max1 ) {
				max1 = tmp;
			}
		}
		sawnan1 = sawnan1 || isnan( max1 );
		if ( forcer || ( max1 <= growthBound && !sawnan1 ) ) {
			sig = lsigma;
			shift = SLEFT;
			break;
		}

		// Try the RSIGMA shift in workspace
		s = -rsigma;
		work[ offsetWork ] = d[ offsetD ] + s;
		if ( Math.abs( work[ offsetWork ] ) < pivmin ) {
			work[ offsetWork ] = -pivmin;
			sawnan2 = true;
		}
		max2 = Math.abs( work[ offsetWork ] );
		for ( i = 1; i <= N - 1; i++ ) {
			work[ offsetWork + ( ( N + i - 1 ) * strideWork ) ] = ld[ offsetLD + ( ( i - 1 ) * strideLD ) ] / work[ offsetWork + ( ( i - 1 ) * strideWork ) ];
			s = ( s * work[ offsetWork + ( ( N + i - 1 ) * strideWork ) ] * l[ offsetL + ( ( i - 1 ) * strideL ) ] ) - rsigma;
			work[ offsetWork + ( i * strideWork ) ] = d[ offsetD + ( i * strideD ) ] + s;
			if ( Math.abs( work[ offsetWork + ( i * strideWork ) ] ) < pivmin ) {
				work[ offsetWork + ( i * strideWork ) ] = -pivmin;
				sawnan2 = true;
			}
			tmp = Math.abs( work[ offsetWork + ( i * strideWork ) ] );
			if ( tmp > max2 ) {
				max2 = tmp;
			}
		}
		sawnan2 = sawnan2 || isnan( max2 );
		if ( forcer || ( max2 <= growthBound && !sawnan2 ) ) {
			sig = rsigma;
			shift = SRIGHT;
			break;
		}

		// Neither standard shift accepted; check the relative growth heuristic
		if ( !( sawnan1 && sawnan2 ) ) {
			if ( !sawnan1 ) {
				indx = 1;
				if ( max1 <= smlGrowth ) {
					smlGrowth = max1;
					bestShift = lsigma;
				}
			}
			if ( !sawnan2 ) {
				if ( sawnan1 || max2 <= max1 ) {
					indx = 2;
				}
				if ( max2 <= smlGrowth ) {
					smlGrowth = max2;
					bestShift = rsigma;
				}
			}

			dorrr1 = ( clwdth < ( mingap / 128.0 ) ) && ( Math.min( max1, max2 ) < fail2 ) && !sawnan1 && !sawnan2;
			tryRrr1 = true;
			if ( tryRrr1 && dorrr1 && indx === 1 ) {
				tmp = Math.abs( dplus[ offsetDPLUS + ( ( N - 1 ) * strideDPLUS ) ] );
				znm2 = ONE;
				prod = ONE;
				oldp = ONE;
				for ( i = N - 1; i >= 1; i-- ) {
					if ( prod <= eps ) {
						prod = ( ( dplus[ offsetDPLUS + ( i * strideDPLUS ) ] * work[ offsetWork + ( ( N + i ) * strideWork ) ] ) / ( dplus[ offsetDPLUS + ( ( i - 1 ) * strideDPLUS ) ] * work[ offsetWork + ( ( N + i - 1 ) * strideWork ) ] ) ) * oldp;
					} else {
						prod *= Math.abs( work[ offsetWork + ( ( N + i - 1 ) * strideWork ) ] );
					}
					oldp = prod;
					znm2 += prod * prod;
					tmp = Math.max( tmp, Math.abs( dplus[ offsetDPLUS + ( ( i - 1 ) * strideDPLUS ) ] * prod ) );
				}
				rrr1 = tmp / ( spdiam * Math.sqrt( znm2 ) );
				if ( rrr1 <= MAXGROWTH2 ) {
					sig = lsigma;
					shift = SLEFT;
					break;
				}
			} else if ( tryRrr1 && dorrr1 && indx === 2 ) {
				tmp = Math.abs( work[ offsetWork + ( ( N - 1 ) * strideWork ) ] );
				znm2 = ONE;
				prod = ONE;
				oldp = ONE;
				for ( i = N - 1; i >= 1; i-- ) {
					if ( prod <= eps ) {
						prod = ( ( work[ offsetWork + ( i * strideWork ) ] * lplus[ offsetLPLUS + ( i * strideLPLUS ) ] ) / ( work[ offsetWork + ( ( i - 1 ) * strideWork ) ] * lplus[ offsetLPLUS + ( ( i - 1 ) * strideLPLUS ) ] ) ) * oldp;
					} else {
						prod *= Math.abs( lplus[ offsetLPLUS + ( ( i - 1 ) * strideLPLUS ) ] );
					}
					oldp = prod;
					znm2 += prod * prod;
					tmp = Math.max( tmp, Math.abs( work[ offsetWork + ( ( i - 1 ) * strideWork ) ] * prod ) );
				}
				rrr2 = tmp / ( spdiam * Math.sqrt( znm2 ) );
				if ( rrr2 <= MAXGROWTH2 ) {
					sig = rsigma;
					shift = SRIGHT;
					break;
				}
			}
		}

		// Label 50: shifts not accepted, retry or fail
		if ( ktry < KTRYMAX ) {
			lsigma = Math.max( lsigma - ldelta, lsigma - ldmax );
			rsigma = Math.min( rsigma + rdelta, rsigma + rdmax );
			ldelta *= TWO;
			rdelta *= TWO;
			ktry += 1;
			continue;
		}
		if ( smlGrowth < fail || nofail ) {
			lsigma = bestShift;
			rsigma = bestShift;
			forcer = true;
			continue;
		}
		info = 1;
		sigma[ 0 ] = sig;
		return info;
	}

	// Label 100: a shift was accepted; if right shift, copy WORK -> DPLUS, LPLUS
	if ( shift === SRIGHT ) {
		dcopy( N, work, strideWork, offsetWork, dplus, strideDPLUS, offsetDPLUS );
		dcopy( N - 1, work, strideWork, offsetWork + ( N * strideWork ), lplus, strideLPLUS, offsetLPLUS );
	}

	sigma[ 0 ] = sig;
	return info;
}


// EXPORTS //

export default dlarrf;
