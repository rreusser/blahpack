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

import dlamch from '../../dlamch/lib/base.js';
import dlahqr from '../../dlahqr/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dlanv2 from '../../dlanv2/lib/base.js';
import dlarfg from '../../dlarfg/lib/base.js';
import dlarf from '../../dlarf/lib/base.js';
import dgehrd from '../../dgehrd/lib/base.js';
import dormhr from '../../dormhr/lib/base.js';
import dtrexc from '../../dtrexc/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

var SAFMIN = dlamch( 'safe-minimum' );
var ULP = dlamch( 'precision' );


// MAIN //

/**
* Performs aggressive early deflation on an upper Hessenberg matrix.
*
* DLAQR2 is the non-recursive version. It always uses DLAHQR for the
* eigenvalue computation of the deflation window.
*
* Note: KTOP and KBOT are 1-based (Fortran convention).
*
* @private
* @param {boolean} wantt - if true, fully update H for Schur form
* @param {boolean} wantz - if true, accumulate transformations in Z
* @param {NonNegativeInteger} N - order of matrix H
* @param {integer} ktop - top of the active block (1-based)
* @param {integer} kbot - bottom of the active block (1-based)
* @param {integer} nw - deflation window size
* @param {Float64Array} H - upper Hessenberg matrix
* @param {integer} strideH1 - stride of first dim of H
* @param {integer} strideH2 - stride of second dim of H
* @param {NonNegativeInteger} offsetH - starting index for H
* @param {integer} iloz - first row of Z to update (1-based)
* @param {integer} ihiz - last row of Z to update (1-based)
* @param {Float64Array} Z - orthogonal matrix
* @param {integer} strideZ1 - stride of first dim of Z
* @param {integer} strideZ2 - stride of second dim of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Float64Array} SR - real parts of eigenvalues/shifts (output)
* @param {integer} strideSR - stride for SR
* @param {NonNegativeInteger} offsetSR - starting index for SR
* @param {Float64Array} SI - imaginary parts of eigenvalues/shifts (output)
* @param {integer} strideSI - stride for SI
* @param {NonNegativeInteger} offsetSI - starting index for SI
* @param {Float64Array} V - NW-by-NW workspace matrix
* @param {integer} strideV1 - stride of first dim of V
* @param {integer} strideV2 - stride of second dim of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {integer} nh - number of columns available in T
* @param {Float64Array} T - NW-by-NH workspace matrix
* @param {integer} strideT1 - stride of first dim of T
* @param {integer} strideT2 - stride of second dim of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {integer} nv - number of rows available in WV
* @param {Float64Array} WV - NV-by-NW workspace matrix
* @param {integer} strideWV1 - stride of first dim of WV
* @param {integer} strideWV2 - stride of second dim of WV
* @param {NonNegativeInteger} offsetWV - starting index for WV
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - length of WORK
* @returns {Object} { ns, nd }
*/
function dlaqr2( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, SR, strideSR, offsetSR, SI, strideSI, offsetSI, V, strideV1, strideV2, offsetV, nh, T, strideT1, strideT2, offsetT, nv, WV, strideWV1, strideWV2, offsetWV, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len
	return dlaqr23impl( null, wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, SR, strideSR, offsetSR, SI, strideSI, offsetSI, V, strideV1, strideV2, offsetV, nh, T, strideT1, strideT2, offsetT, nv, WV, strideWV1, strideWV2, offsetWV, WORK, strideWORK, offsetWORK, lwork );
}

/**
* Shared implementation for dlaqr2 and dlaqr3.
*
* @private
* @param {Function|null} dlaqr4fn - if non-null, use this for large windows (dlaqr3 mode)
* @param ... (all params same as dlaqr2)
* @returns {Object} { ns, nd }
*/
function dlaqr23impl( dlaqr4fn, wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, SR, strideSR, offsetSR, SI, strideSI, offsetSI, V, strideV1, strideV2, offsetV, nh, T, strideT1, strideT2, offsetT, nv, WV, strideWV1, strideWV2, offsetWV, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len
	var trxResult;
	var lwkopt;
	var smlnum;
	var sorted;
	var tauArr;
	var kwtop;
	var infqr;
	var bulge;
	var nmin;
	var ilst;
	var ifst;
	var kend;
	var krow;
	var kcol;
	var ltop;
	var lwk1;
	var lwk2;
	var lwk3;
	var tau;
	var foo;
	var evi;
	var evk;
	var lv2;
	var kln;
	var jw;
	var ns;
	var nd;
	var aa;
	var bb;
	var cc;
	var dd;
	var s;
	var i;
	var j;
	var k;

	// Helpers for 1-based matrix indexing
	function hij( r, c ) {
		return offsetH + ( r - 1 ) * strideH1 + ( c - 1 ) * strideH2;
	}
	function tij( r, c ) {
		return offsetT + ( r - 1 ) * strideT1 + ( c - 1 ) * strideT2;
	}
	function vij( r, c ) {
		return offsetV + ( r - 1 ) * strideV1 + ( c - 1 ) * strideV2;
	}
	function zij( r, c ) {
		return offsetZ + ( r - 1 ) * strideZ1 + ( c - 1 ) * strideZ2;
	}
	// ==== Estimate optimal workspace ====
	jw = Math.min( nw, kbot - ktop + 1 );
	if ( jw <= 2 ) {
		lwkopt = 1;
	} else {
		// Workspace query to DGEHRD
		dgehrd( jw, 1, jw - 1, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK, WORK, strideWORK, offsetWORK, -1 );
		lwk1 = Math.floor( WORK[ offsetWORK ] );

		// Workspace query to DORMHR
		dormhr( 'right', 'no-transpose', jw, jw, 1, jw - 1, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK, V, strideV1, strideV2, offsetV, WORK, strideWORK, offsetWORK, -1 );
		lwk2 = Math.floor( WORK[ offsetWORK ] );

		if ( dlaqr4fn ) {
			// dlaqr3 mode: also query dlaqr4
			dlaqr4fn( true, true, jw, 1, jw, T, strideT1, strideT2, offsetT, SR, strideSR, offsetSR, SI, strideSI, offsetSI, 1, jw, V, strideV1, strideV2, offsetV, WORK, strideWORK, offsetWORK, -1 );
			lwk3 = Math.floor( WORK[ offsetWORK ] );
			lwkopt = Math.max( jw + Math.max( lwk1, lwk2 ), lwk3 );
		} else {
			lwkopt = jw + Math.max( lwk1, lwk2 );
		}
	}

	// ==== Quick return in case of workspace query ====
	if ( lwork === -1 ) {
		WORK[ offsetWORK ] = lwkopt;
		return {
			'ns': 0,
			'nd': 0
		};
	}

	// ==== Nothing to do for empty active block or empty deflation window ====
	ns = 0;
	nd = 0;
	WORK[ offsetWORK ] = ONE;
	if ( ktop > kbot ) {
		return {
			'ns': ns,
			'nd': nd
		};
	}
	if ( nw < 1 ) {
		return {
			'ns': ns,
			'nd': nd
		};
	}

	// ==== Machine constants ====
	smlnum = SAFMIN * ( N / ULP );

	// ==== Setup deflation window ====
	jw = Math.min( nw, kbot - ktop + 1 );
	kwtop = kbot - jw + 1;
	if ( kwtop === ktop ) {
		s = ZERO;
	} else {
		s = H[ hij( kwtop, kwtop - 1 ) ];
	}

	if ( kbot === kwtop ) {
		// ==== 1-by-1 deflation window ====
		SR[ offsetSR + ( kwtop - 1 ) * strideSR ] = H[ hij( kwtop, kwtop ) ];
		SI[ offsetSI + ( kwtop - 1 ) * strideSI ] = ZERO;
		ns = 1;
		nd = 0;
		if ( Math.abs( s ) <= Math.max( smlnum, ULP * Math.abs( H[ hij( kwtop, kwtop ) ] ) ) ) {
			ns = 0;
			nd = 1;
			if ( kwtop > ktop ) {
				H[ hij( kwtop, kwtop - 1 ) ] = ZERO;
			}
		}
		WORK[ offsetWORK ] = ONE;
		return {
			'ns': ns,
			'nd': nd
		};
	}

	// ==== Convert to spike-triangular form ====
	dlacpy( 'upper', jw, jw, H, strideH1, strideH2, hij( kwtop, kwtop ), T, strideT1, strideT2, offsetT );
	dcopy( jw - 1, H, strideH1 + strideH2, hij( kwtop + 1, kwtop ), T, strideT1 + strideT2, tij( 2, 1 ) );

	dlaset( 'full', jw, jw, ZERO, ONE, V, strideV1, strideV2, offsetV );

	// Compute Schur decomposition of the deflation window
	if ( dlaqr4fn ) {
		// dlaqr3 mode: use dlaqr4 for large windows, dlahqr for small
		// NMIN threshold: use a fixed value of 12 (matching ILAENV default for DLAQR3)
		nmin = 12;
		if ( jw > nmin ) {
			infqr = dlaqr4fn( true, true, jw, 1, jw, T, strideT1, strideT2, offsetT, SR, strideSR, offsetSR + ( kwtop - 1 ) * strideSR, SI, strideSI, offsetSI + ( kwtop - 1 ) * strideSI, 1, jw, V, strideV1, strideV2, offsetV, WORK, strideWORK, offsetWORK, lwork );
		} else {
			infqr = dlahqr( true, true, jw, 1, jw, T, strideT1, strideT2, offsetT, SR, strideSR, offsetSR + ( kwtop - 1 ) * strideSR, SI, strideSI, offsetSI + ( kwtop - 1 ) * strideSI, 1, jw, V, strideV1, strideV2, offsetV );
		}
	} else {
		// dlaqr2 mode: always use dlahqr
		infqr = dlahqr( true, true, jw, 1, jw, T, strideT1, strideT2, offsetT, SR, strideSR, offsetSR + ( kwtop - 1 ) * strideSR, SI, strideSI, offsetSI + ( kwtop - 1 ) * strideSI, 1, jw, V, strideV1, strideV2, offsetV );
	}

	// ==== DTREXC needs a clean margin near the diagonal ====
	for ( j = 1; j <= jw - 3; j++ ) {
		T[ tij( j + 2, j ) ] = ZERO;
		T[ tij( j + 3, j ) ] = ZERO;
	}
	if ( jw > 2 ) {
		T[ tij( jw, jw - 2 ) ] = ZERO;
	}

	// ==== Deflation detection loop ====
	ns = jw;
	ilst = infqr + 1;

	while ( ilst <= ns ) {
		if ( ns === 1 ) {
			bulge = false;
		} else {
			bulge = T[ tij( ns, ns - 1 ) ] !== ZERO;
		}

		if ( !bulge ) {
			// Real eigenvalue
			foo = Math.abs( T[ tij( ns, ns ) ] );
			if ( foo === ZERO ) {
				foo = Math.abs( s );
			}
			if ( Math.abs( s * V[ vij( 1, ns ) ] ) <= Math.max( smlnum, ULP * foo ) ) {
				ns -= 1;
			} else {
				ifst = ns;
				trxResult = dtrexc( 'update', jw, T, strideT1, strideT2, offsetT, V, strideV1, strideV2, offsetV, ifst, ilst, WORK, strideWORK, offsetWORK );
				ilst = trxResult.ilst + 1;
			}
		} else {
			// Complex conjugate pair
			foo = Math.abs( T[ tij( ns, ns ) ] ) + Math.sqrt( Math.abs( T[ tij( ns, ns - 1 ) ] ) ) * Math.sqrt( Math.abs( T[ tij( ns - 1, ns ) ] ) );
			if ( foo === ZERO ) {
				foo = Math.abs( s );
			}
			if ( Math.max( Math.abs( s * V[ vij( 1, ns ) ] ), Math.abs( s * V[ vij( 1, ns - 1 ) ] ) ) <= Math.max( smlnum, ULP * foo ) ) {
				ns -= 2;
			} else {
				ifst = ns;
				trxResult = dtrexc( 'update', jw, T, strideT1, strideT2, offsetT, V, strideV1, strideV2, offsetV, ifst, ilst, WORK, strideWORK, offsetWORK );
				ilst = trxResult.ilst + 2;
			}
		}
	}

	// ==== Return to Hessenberg form ====
	if ( ns === 0 ) {
		s = ZERO;
	}

	if ( ns < jw ) {
		// ==== Sorting diagonal blocks ====
		sorted = false;
		i = ns + 1;
		while ( !sorted ) {
			sorted = true;
			kend = i - 1;
			i = infqr + 1;
			if ( i === ns ) {
				k = i + 1;
			} else if ( T[ tij( i + 1, i ) ] === ZERO ) {
				k = i + 1;
			} else {
				k = i + 2;
			}

			while ( k <= kend ) {
				if ( k === i + 1 ) {
					evi = Math.abs( T[ tij( i, i ) ] );
				} else {
					evi = Math.abs( T[ tij( i, i ) ] ) + Math.sqrt( Math.abs( T[ tij( i + 1, i ) ] ) ) * Math.sqrt( Math.abs( T[ tij( i, i + 1 ) ] ) );
				}

				if ( k === kend ) {
					evk = Math.abs( T[ tij( k, k ) ] );
				} else if ( T[ tij( k + 1, k ) ] === ZERO ) {
					evk = Math.abs( T[ tij( k, k ) ] );
				} else {
					evk = Math.abs( T[ tij( k, k ) ] ) + Math.sqrt( Math.abs( T[ tij( k + 1, k ) ] ) ) * Math.sqrt( Math.abs( T[ tij( k, k + 1 ) ] ) );
				}

				if ( evi >= evk ) {
					i = k;
				} else {
					sorted = false;
					ifst = i;
					trxResult = dtrexc( 'update', jw, T, strideT1, strideT2, offsetT, V, strideV1, strideV2, offsetV, ifst, k, WORK, strideWORK, offsetWORK );
					if ( trxResult.info === 0 ) {
						i = trxResult.ilst;
					} else {
						i = k;
					}
				}

				if ( i === kend ) {
					k = i + 1;
				} else if ( T[ tij( i + 1, i ) ] === ZERO ) {
					k = i + 1;
				} else {
					k = i + 2;
				}
			}
		}
	}

	// ==== Restore shift/eigenvalue array from T ====
	i = jw;
	while ( i >= infqr + 1 ) {
		if ( i === infqr + 1 ) {
			SR[ offsetSR + ( kwtop + i - 2 ) * strideSR ] = T[ tij( i, i ) ];
			SI[ offsetSI + ( kwtop + i - 2 ) * strideSI ] = ZERO;
			i -= 1;
		} else if ( T[ tij( i, i - 1 ) ] === ZERO ) {
			SR[ offsetSR + ( kwtop + i - 2 ) * strideSR ] = T[ tij( i, i ) ];
			SI[ offsetSI + ( kwtop + i - 2 ) * strideSI ] = ZERO;
			i -= 1;
		} else {
			aa = T[ tij( i - 1, i - 1 ) ];
			cc = T[ tij( i, i - 1 ) ];
			bb = T[ tij( i - 1, i ) ];
			dd = T[ tij( i, i ) ];
			lv2 = dlanv2( aa, bb, cc, dd );
			SR[ offsetSR + ( kwtop + i - 3 ) * strideSR ] = lv2.rt1r;
			SI[ offsetSI + ( kwtop + i - 3 ) * strideSI ] = lv2.rt1i;
			SR[ offsetSR + ( kwtop + i - 2 ) * strideSR ] = lv2.rt2r;
			SI[ offsetSI + ( kwtop + i - 2 ) * strideSI ] = lv2.rt2i;
			i -= 2;
		}
	}

	if ( ns < jw || s === ZERO ) {
		if ( ns > 1 && s !== ZERO ) {
			// ==== Reflect spike back into lower triangle ====
			// Reference: DCOPY( NS, V, LDV, WORK, 1 ) copies the first ROW
			// Of V (increment LDV = column stride), not the first column.
			dcopy( ns, V, strideV2, vij( 1, 1 ), WORK, strideWORK, offsetWORK );
			tauArr = new Float64Array( 1 );
			dlarfg( ns, WORK, offsetWORK, WORK, strideWORK, offsetWORK + strideWORK, tauArr, 0 );
			tau = tauArr[ 0 ];
			WORK[ offsetWORK ] = ONE;

			dlaset( 'lower', jw - 2, jw - 2, ZERO, ZERO, T, strideT1, strideT2, tij( 3, 1 ) );

			dlarf( 'left', ns, jw, WORK, strideWORK, offsetWORK, tau, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK + jw * strideWORK );
			dlarf( 'right', ns, ns, WORK, strideWORK, offsetWORK, tau, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK + jw * strideWORK );
			dlarf( 'right', jw, ns, WORK, strideWORK, offsetWORK, tau, V, strideV1, strideV2, offsetV, WORK, strideWORK, offsetWORK + jw * strideWORK );

			dgehrd( jw, 1, ns, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK, WORK, strideWORK, offsetWORK + jw * strideWORK, lwork - jw );
		}

		// ==== Copy updated reduced window into place ====
		if ( kwtop > 1 ) {
			H[ hij( kwtop, kwtop - 1 ) ] = s * V[ vij( 1, 1 ) ];
		}
		dlacpy( 'upper', jw, jw, T, strideT1, strideT2, offsetT, H, strideH1, strideH2, hij( kwtop, kwtop ) );
		dcopy( jw - 1, T, strideT1 + strideT2, tij( 2, 1 ), H, strideH1 + strideH2, hij( kwtop + 1, kwtop ) );

		// ==== Accumulate orthogonal matrix ====
		if ( ns > 1 && s !== ZERO ) {
			dormhr( 'right', 'no-transpose', jw, ns, 1, ns, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK, V, strideV1, strideV2, offsetV, WORK, strideWORK, offsetWORK + jw * strideWORK, lwork - jw );
		}

		// ==== Update vertical slab in H ====
		if ( wantt ) {
			ltop = 1;
		} else {
			ltop = ktop;
		}
		for ( krow = ltop; krow <= kwtop - 1; krow += nv ) {
			kln = Math.min( nv, kwtop - krow );
			dgemm( 'no-transpose', 'no-transpose', kln, jw, jw, ONE, H, strideH1, strideH2, hij( krow, kwtop ), V, strideV1, strideV2, offsetV, ZERO, WV, strideWV1, strideWV2, offsetWV );
			dlacpy( 'full', kln, jw, WV, strideWV1, strideWV2, offsetWV, H, strideH1, strideH2, hij( krow, kwtop ) );
		}

		// ==== Update horizontal slab in H ====
		if ( wantt ) {
			for ( kcol = kbot + 1; kcol <= N; kcol += nh ) {
				kln = Math.min( nh, N - kcol + 1 );
				dgemm( 'transpose', 'no-transpose', jw, kln, jw, ONE, V, strideV1, strideV2, offsetV, H, strideH1, strideH2, hij( kwtop, kcol ), ZERO, T, strideT1, strideT2, offsetT );
				dlacpy( 'full', jw, kln, T, strideT1, strideT2, offsetT, H, strideH1, strideH2, hij( kwtop, kcol ) );
			}
		}

		// ==== Update vertical slab in Z ====
		if ( wantz ) {
			for ( krow = iloz; krow <= ihiz; krow += nv ) {
				kln = Math.min( nv, ihiz - krow + 1 );
				dgemm( 'no-transpose', 'no-transpose', kln, jw, jw, ONE, Z, strideZ1, strideZ2, zij( krow, kwtop ), V, strideV1, strideV2, offsetV, ZERO, WV, strideWV1, strideWV2, offsetWV );
				dlacpy( 'full', kln, jw, WV, strideWV1, strideWV2, offsetWV, Z, strideZ1, strideZ2, zij( krow, kwtop ) );
			}
		}
	}

	// ==== Return ====
	nd = jw - ns;
	ns -= infqr;

	WORK[ offsetWORK ] = lwkopt;

	return {
		'ns': ns,
		'nd': nd
	};
}


// EXPORTS //

export default dlaqr2;
export { dlaqr23impl };
