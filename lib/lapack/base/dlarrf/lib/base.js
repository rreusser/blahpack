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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'precision' );
var SAFMIN = dlamch( 'safe minimum' );
var ONE = 1.0;
var TWO = 2.0;
var FOUR = 4.0;
var QUART = 0.25;
var MAXGROWTH1 = 8.0;
var MAXGROWTH2 = 8.0;
var KTRYMAX = 1;
var SLEFT = 1;
var SRIGHT = 2;


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
* @param {integer} strideWORK - stride length for `work`
* @param {NonNegativeInteger} offsetWORK - starting index for `work`
* @returns {integer} info - status code (0 = success, 1 = no acceptable shift found)
*/
function dlarrf( N, d, strideD, offsetD, l, strideL, offsetL, ld, strideLD, offsetLD, clstrt, clend, w, strideW, offsetW, wgap, strideWGAP, offsetWGAP, werr, strideWERR, offsetWERR, spdiam, clgapl, clgapr, pivmin, sigma, dplus, strideDPLUS, offsetDPLUS, lplus, strideLPLUS, offsetLPLUS, work, strideWORK, offsetWORK ) {
	var growthBound;
	var bestShift;
	var smlGrowth;
	var tryRrr1;
	var sawnan1;
	var sawnan2;
	var clwdth;
	var mingap;
	var dorrr1;
	var forcer;
	var nofail;
	var ldelta;
	var rdelta;
	var lsigma;
	var rsigma;
	var ldmax;
	var rdmax;
	var avgap;
	var shift;
	var fail2;
	var fact;
	var max1;
	var max2;
	var oldp;
	var prod;
	var rrr1;
	var rrr2;
	var fail;
	var indx;
	var ktry;
	var znm2;
	var info;
	var eps;
	var tmp;
	var sig;
	var s;
	var i;

	info = 0;
	sig = 0.0;
	sigma[ 0 ] = 0.0;

	if ( N <= 0 ) {
		return info;
	}

	fact = ( 1 << KTRYMAX );
	eps = EPS;
	shift = 0;
	forcer = false;
	nofail = false;

	// CLWDTH = |W(CLEND) - W(CLSTRT)| + WERR(CLEND) + WERR(CLSTRT)
	clwdth = Math.abs( w[ offsetW + ( ( clend - 1 ) * strideW ) ] - w[ offsetW + ( ( clstrt - 1 ) * strideW ) ] ) + werr[ offsetWERR + ( ( clend - 1 ) * strideWERR ) ] + werr[ offsetWERR + ( ( clstrt - 1 ) * strideWERR ) ];
	avgap = clwdth / ( clend - clstrt );
	mingap = Math.min( clgapl, clgapr );
	lsigma = Math.min( w[ offsetW + ( ( clstrt - 1 ) * strideW ) ], w[ offsetW + ( ( clend - 1 ) * strideW ) ] ) - werr[ offsetWERR + ( ( clstrt - 1 ) * strideWERR ) ];
	rsigma = Math.max( w[ offsetW + ( ( clstrt - 1 ) * strideW ) ], w[ offsetW + ( ( clend - 1 ) * strideW ) ] ) + werr[ offsetWERR + ( ( clend - 1 ) * strideWERR ) ];

	lsigma -= Math.abs( lsigma ) * FOUR * eps;
	rsigma += Math.abs( rsigma ) * FOUR * eps;

	ldmax = ( QUART * mingap ) + ( TWO * pivmin );
	rdmax = ( QUART * mingap ) + ( TWO * pivmin );

	ldelta = Math.max( avgap, wgap[ offsetWGAP + ( ( clstrt - 1 ) * strideWGAP ) ] ) / fact;
	rdelta = Math.max( avgap, wgap[ offsetWGAP + ( ( clend - 2 ) * strideWGAP ) ] ) / fact;

	s = SAFMIN;
	smlGrowth = ONE / s;
	fail = ( N - 1 ) * mingap / ( spdiam * eps );
	fail2 = ( N - 1 ) * mingap / ( spdiam * Math.sqrt( eps ) );
	bestShift = lsigma;

	ktry = 0;
	growthBound = MAXGROWTH1 * spdiam;

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
		work[ offsetWORK ] = d[ offsetD ] + s;
		if ( Math.abs( work[ offsetWORK ] ) < pivmin ) {
			work[ offsetWORK ] = -pivmin;
			sawnan2 = true;
		}
		max2 = Math.abs( work[ offsetWORK ] );
		for ( i = 1; i <= N - 1; i++ ) {
			work[ offsetWORK + ( ( N + i - 1 ) * strideWORK ) ] = ld[ offsetLD + ( ( i - 1 ) * strideLD ) ] / work[ offsetWORK + ( ( i - 1 ) * strideWORK ) ];
			s = ( s * work[ offsetWORK + ( ( N + i - 1 ) * strideWORK ) ] * l[ offsetL + ( ( i - 1 ) * strideL ) ] ) - rsigma;
			work[ offsetWORK + ( i * strideWORK ) ] = d[ offsetD + ( i * strideD ) ] + s;
			if ( Math.abs( work[ offsetWORK + ( i * strideWORK ) ] ) < pivmin ) {
				work[ offsetWORK + ( i * strideWORK ) ] = -pivmin;
				sawnan2 = true;
			}
			tmp = Math.abs( work[ offsetWORK + ( i * strideWORK ) ] );
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
						prod = ( ( dplus[ offsetDPLUS + ( i * strideDPLUS ) ] * work[ offsetWORK + ( ( N + i ) * strideWORK ) ] ) / ( dplus[ offsetDPLUS + ( ( i - 1 ) * strideDPLUS ) ] * work[ offsetWORK + ( ( N + i - 1 ) * strideWORK ) ] ) ) * oldp;
					} else {
						prod *= Math.abs( work[ offsetWORK + ( ( N + i - 1 ) * strideWORK ) ] );
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
				tmp = Math.abs( work[ offsetWORK + ( ( N - 1 ) * strideWORK ) ] );
				znm2 = ONE;
				prod = ONE;
				oldp = ONE;
				for ( i = N - 1; i >= 1; i-- ) {
					if ( prod <= eps ) {
						prod = ( ( work[ offsetWORK + ( i * strideWORK ) ] * lplus[ offsetLPLUS + ( i * strideLPLUS ) ] ) / ( work[ offsetWORK + ( ( i - 1 ) * strideWORK ) ] * lplus[ offsetLPLUS + ( ( i - 1 ) * strideLPLUS ) ] ) ) * oldp;
					} else {
						prod *= Math.abs( lplus[ offsetLPLUS + ( ( i - 1 ) * strideLPLUS ) ] );
					}
					oldp = prod;
					znm2 += prod * prod;
					tmp = Math.max( tmp, Math.abs( work[ offsetWORK + ( ( i - 1 ) * strideWORK ) ] * prod ) );
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
		dcopy( N, work, strideWORK, offsetWORK, dplus, strideDPLUS, offsetDPLUS );
		dcopy( N - 1, work, strideWORK, offsetWORK + ( N * strideWORK ), lplus, strideLPLUS, offsetLPLUS );
	}

	sigma[ 0 ] = sig;
	return info;
}


// EXPORTS //

export default dlarrf;
