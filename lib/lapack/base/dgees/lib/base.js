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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dgebal from '../../dgebal/lib/base.js';
import dgebak from '../../dgebak/lib/base.js';
import dgehrd from '../../dgehrd/lib/base.js';
import dorghr from '../../dorghr/lib/base.js';
import dhseqr from '../../dhseqr/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dtrsen from '../../dtrsen/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

var EPS = dlamch( 'precision' );
var SMLNUM_RAW = dlamch( 'safe-minimum' );
var SMLNUM = Math.sqrt( SMLNUM_RAW ) / EPS;
var BIGNUM = ONE / SMLNUM;


// MAIN //

/**
* Computes for an N-by-N real nonsymmetric matrix A, the eigenvalues, the real.
* Schur form T, and, optionally, the matrix of Schur vectors Z. This gives
* the Schur factorization A = Z_T_Z**T.
*
* Optionally, it also orders the eigenvalues on the diagonal of the real Schur
* form so that selected eigenvalues are at the top left. The leading columns
* of Z then form an orthonormal basis for the invariant subspace corresponding
* to the selected eigenvalues.
*
* @private
* @param {string} jobvs - `'none'` or `'compute-vectors'`
* @param {string} sort - `'none'` or `'sort'`
* @param {Function} select - function(wr, wi) returning boolean; used when sort=`'sort'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - N-by-N matrix, overwritten with Schur form T on exit
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} sdim - output: sdim[0] = number of eigenvalues for which SELECT is true
* @param {Float64Array} WR - output: real parts of eigenvalues
* @param {integer} strideWR - stride for WR
* @param {NonNegativeInteger} offsetWR - starting index for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues
* @param {integer} strideWI - stride for WI
* @param {NonNegativeInteger} offsetWI - starting index for WI
* @param {Float64Array} VS - output: N-by-N matrix of Schur vectors
* @param {integer} strideVS1 - stride of the first dimension of VS
* @param {integer} strideVS2 - stride of the second dimension of VS
* @param {NonNegativeInteger} offsetVS - starting index for VS
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - length of WORK
* @param {Uint8Array} BWORK - boolean workspace of length N (used when sort=`'sort'`)
* @param {integer} strideBWORK - stride for BWORK
* @param {NonNegativeInteger} offsetBWORK - starting index for BWORK
* @returns {integer} info (0=success, >0 eigenvalue computation failed, N+1/N+2 sorting issues)
*/
function dgees( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VS, strideVS1, strideVS2, offsetVS, WORK, strideWORK, offsetWORK, lwork, BWORK, strideBWORK, offsetBWORK ) {
	var wantvs;
	var wantst;
	var scalea;
	var cscale;
	var lastsl;
	var lst2sl;
	var balRes;
	var cursl;
	var icond;
	var ieval;
	var anrm;
	var ierr;
	var info;
	var ibal;
	var itau;
	var iwrk;
	var inxt;
	var IDUM;
	var ilo;
	var ihi;
	var DUM;
	var SEP;
	var ip;
	var i1;
	var i2;
	var i;
	var M;
	var S;

	info = 0;
	wantvs = ( jobvs === 'compute-vectors' );
	wantst = ( sort === 'sort' );

	// Quick return
	if ( N === 0 ) {
		sdim[ 0 ] = 0;
		return info;
	}

	// Scale matrix
	DUM = new Float64Array( 1 );
	anrm = dlange( 'max', N, N, A, strideA1, strideA2, offsetA, DUM, 1, 0 );
	scalea = false;
	cscale = ONE;
	if ( anrm > ZERO && anrm < SMLNUM ) {
		scalea = true;
		cscale = SMLNUM;
	} else if ( anrm > BIGNUM ) {
		scalea = true;
		cscale = BIGNUM;
	}
	if ( scalea ) {
		dlascl( 'general', 0, 0, anrm, cscale, N, N, A, strideA1, strideA2, offsetA );
	}

	// Balance the matrix
	// WORK layout: [SCALE(0..N-1), TAU(0..N-1), workspace...]
	ibal = 0; // offset in WORK for SCALE from dgebal
	balRes = dgebal( 'permute', N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK + ibal * strideWORK );
	ilo = balRes.ilo; // 1-based
	ihi = balRes.ihi; // 1-based

	// Reduce to upper Hessenberg form
	itau = N + ibal; // offset in WORK for TAU
	iwrk = N + itau; // offset in WORK for workspace
	dgehrd( N, ilo, ihi, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK + itau * strideWORK, WORK, strideWORK, offsetWORK + iwrk * strideWORK );

	if ( wantvs ) {
		// Copy Hessenberg form to VS
		dlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VS, strideVS1, strideVS2, offsetVS );

		// Generate orthogonal matrix in VS
		dorghr( N, ilo, ihi, VS, strideVS1, strideVS2, offsetVS, WORK, strideWORK, offsetWORK + itau * strideWORK, WORK, strideWORK, offsetWORK + iwrk * strideWORK, lwork - iwrk );
	}

	sdim[ 0 ] = 0;

	// Compute Schur form (reduce Hessenberg to quasi-triangular)
	iwrk = itau;
	ieval = dhseqr( 'schur', ( wantvs ) ? 'update' : 'none', N, ilo, ihi, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VS, strideVS1, strideVS2, offsetVS );
	if ( ieval > 0 ) {
		info = ieval;
	}

	// Sort eigenvalues if requested
	if ( wantst && info === 0 ) {
		if ( scalea ) {
			dlascl( 'general', 0, 0, cscale, anrm, N, 1, WR, 1, strideWR, offsetWR );
			dlascl( 'general', 0, 0, cscale, anrm, N, 1, WI, 1, strideWI, offsetWI );
		}
		for ( i = 0; i < N; i++ ) {
			BWORK[ offsetBWORK + i * strideBWORK ] = ( select( WR[ offsetWR + i * strideWR ], WI[ offsetWI + i * strideWI ] ) ) ? 1 : 0;
		}

		// Reorder Schur form
		M = new Float64Array( 1 );
		S = new Float64Array( 1 );
		SEP = new Float64Array( 1 );
		IDUM = new Int32Array( 1 );
		icond = dtrsen( 'none', ( wantvs ) ? 'update' : 'none', BWORK, strideBWORK, offsetBWORK, N, A, strideA1, strideA2, offsetA, VS, strideVS1, strideVS2, offsetVS, WR, strideWR, offsetWR, WI, strideWI, offsetWI, M, S, SEP, WORK, strideWORK, offsetWORK + iwrk * strideWORK, lwork - iwrk, IDUM, 1, 0, 1 );
		sdim[ 0 ] = M[ 0 ];
		if ( icond > 0 ) {
			info = N + icond;
		}
	}

	if ( wantvs ) {
		// Undo balancing of Schur vectors
		dgebak( 'permute', 'right', N, ilo, ihi, WORK, strideWORK, offsetWORK + ibal * strideWORK, N, VS, strideVS1, strideVS2, offsetVS );
	}

	if ( scalea ) {
		// Undo scaling
		dlascl( 'upper-hessenberg', 0, 0, cscale, anrm, N, N, A, strideA1, strideA2, offsetA );

		// Re-extract diagonal eigenvalues
		dcopy( N, A, strideA1 + strideA2, offsetA, WR, strideWR, offsetWR );
		if ( cscale === SMLNUM ) {
			// If eigenvalues are scaled up, the imaginary parts need fixing
			if ( ieval > 0 ) {
				i1 = ieval; // 0-based: ieval is 1-based count of unconverged
				i2 = ihi - 2; // 0-based: IHI-1 (1-based) - 1

				// Scale WI for converged eigenvalues below ILO
				dlascl( 'general', 0, 0, cscale, anrm, ilo - 1, 1, WI, 1, strideWI, offsetWI );
			} else if ( wantst ) {
				i1 = 0;
				i2 = N - 2;
			} else {
				i1 = ilo - 1; // 0-based
				i2 = ihi - 2; // 0-based
			}
			inxt = i1 - 1;
			for ( i = i1; i <= i2; i++ ) {
				if ( i < inxt ) {
					continue;
				}
				if ( WI[ offsetWI + i * strideWI ] === ZERO ) {
					inxt = i + 1;
				} else {
					if ( A[ offsetA + (i + 1) * strideA1 + i * strideA2 ] === ZERO ) {
						WI[ offsetWI + i * strideWI ] = ZERO;
						WI[ offsetWI + (i + 1) * strideWI ] = ZERO;
					} else if ( A[ offsetA + (i + 1) * strideA1 + i * strideA2 ] !== ZERO && A[ offsetA + i * strideA1 + (i + 1) * strideA2 ] === ZERO ) {
						WI[ offsetWI + i * strideWI ] = ZERO;
						WI[ offsetWI + (i + 1) * strideWI ] = ZERO;
						if ( i > 0 ) {
							dswap( i, A, strideA1, offsetA + i * strideA2, A, strideA1, offsetA + (i + 1) * strideA2 );
						}
						if ( N > i + 2 ) {
							dswap( N - i - 2, A, strideA2, offsetA + i * strideA1 + (i + 2) * strideA2, A, strideA2, offsetA + (i + 1) * strideA1 + (i + 2) * strideA2 );
						}
						if ( wantvs ) {
							dswap( N, VS, strideVS1, offsetVS + i * strideVS2, VS, strideVS1, offsetVS + (i + 1) * strideVS2 );
						}
						A[ offsetA + i * strideA1 + (i + 1) * strideA2 ] = A[ offsetA + (i + 1) * strideA1 + i * strideA2 ];
						A[ offsetA + (i + 1) * strideA1 + i * strideA2 ] = ZERO;
					}
					inxt = i + 2;
				}
			}
		}
		// Scale remaining WI
		dlascl( 'general', 0, 0, cscale, anrm, N - ieval, 1, WI, 1, strideWI, offsetWI + ieval * strideWI );
	}

	if ( wantst && info === 0 ) {
		// Recount SDIM after final eigenvalue adjustments
		lastsl = true;
		lst2sl = true;
		sdim[ 0 ] = 0;
		ip = 0;
		for ( i = 0; i < N; i++ ) {
			cursl = select( WR[ offsetWR + i * strideWR ], WI[ offsetWI + i * strideWI ] );
			if ( WI[ offsetWI + i * strideWI ] === ZERO ) {
				if ( cursl ) {
					sdim[ 0 ] += 1;
				}
				ip = 0;
				if ( cursl && !lastsl ) {
					info = N + 2;
				}
			} else if ( ip === 1 ) {
				// Second eigenvalue of conjugate pair
				cursl = cursl || lastsl;
				lastsl = cursl;
				if ( cursl ) {
					sdim[ 0 ] += 2;
				}
				ip = -1;
				if ( cursl && !lst2sl ) {
					info = N + 2;
				}
			} else {
				// First eigenvalue of conjugate pair
				ip = 1;
			}
			lst2sl = lastsl;
			lastsl = cursl;
		}
	}

	return info;
}


// EXPORTS //

export default dgees;
