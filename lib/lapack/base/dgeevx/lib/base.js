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

/* eslint-disable max-len, max-params, max-statements, no-var */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dnrm2 from '../../../../blas/base/dnrm2/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import drot from '../../../../blas/base/drot/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dgebal from '../../dgebal/lib/base.js';
import dgebak from '../../dgebak/lib/base.js';
import dgehrd from '../../dgehrd/lib/base.js';
import dorghr from '../../dorghr/lib/base.js';
import dhseqr from '../../dhseqr/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';
import dtrevc3 from '../../dtrevc3/lib/base.js';
import dtrsna from '../../dtrsna/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

// Machine constants (hoisted to module scope)
var EPS = dlamch( 'precision' );
var SMLNUM_BASE = dlamch( 'safe-minimum' );
var SMLNUM = Math.sqrt( SMLNUM_BASE ) / EPS;
var BIGNUM = ONE / SMLNUM;

// Scratch arrays
var DLARTG_OUT = new Float64Array( 3 );


// MAIN //

/**
* Computes eigenvalues and, optionally, the left and/or right eigenvectors of a real N-by-N nonsymmetric matrix A.
*
* ## Notes
*
* -   Optionally also computes a balancing transformation (`balanc`), reciprocal condition numbers for the eigenvalues (`RCONDE`), and reciprocal condition numbers for the right eigenvectors (`RCONDV`).
* -   On entry, `A` contains the N-by-N matrix. On exit, `A` has been overwritten. If `jobvl='compute-vectors'` or `jobvr='compute-vectors'`, `A` contains the real Schur form of the balanced version of the input matrix; otherwise `A` is overwritten with intermediate data.
* -   Computed eigenvalues are stored in (`WR`, `WI`) as real and imaginary parts. Complex conjugate pairs appear consecutively with the eigenvalue having the positive imaginary part first.
* -   `sense` values `'eigenvalues'`, `'right-vectors'`, and `'both'` require both `jobvl='compute-vectors'` and `jobvr='compute-vectors'` to also be set so that DTRSNA has both left and right eigenvectors to form condition numbers from.
* -   The caller must supply `work` with at least `max(1, N*(N+7))` elements and `iwork` with at least `max(1, 2*(N-1))` elements. The `work` array is partitioned internally: the first `N` elements are used as TAU for `dgehrd`; the remaining elements provide workspace for `dgehrd`, `dorghr`, `dhseqr`, `dtrevc3`, and `dtrsna`.
*
* @private
* @param {string} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {string} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input matrix (N x N), overwritten on exit
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} WR - output: real parts of eigenvalues (length N)
* @param {integer} strideWR - stride for WR
* @param {NonNegativeInteger} offsetWR - offset for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues (length N)
* @param {integer} strideWI - stride for WI
* @param {NonNegativeInteger} offsetWI - offset for WI
* @param {Float64Array} VL - output: left eigenvectors (N x N); not referenced if jobvl='no-vectors'
* @param {integer} strideVL1 - first dimension stride of VL
* @param {integer} strideVL2 - second dimension stride of VL
* @param {NonNegativeInteger} offsetVL - offset for VL
* @param {Float64Array} VR - output: right eigenvectors (N x N); not referenced if jobvr='no-vectors'
* @param {integer} strideVR1 - first dimension stride of VR
* @param {integer} strideVR2 - second dimension stride of VR
* @param {NonNegativeInteger} offsetVR - offset for VR
* @param {Float64Array} SCALE - output: details of permutations and scaling (length N)
* @param {integer} strideSCALE - stride for SCALE
* @param {NonNegativeInteger} offsetSCALE - offset for SCALE
* @param {Float64Array} RCONDE - output: reciprocal condition numbers for eigenvalues (length N)
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - offset for RCONDE
* @param {Float64Array} RCONDV - output: reciprocal condition numbers for right eigenvectors (length N)
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - offset for RCONDV
* @param {Float64Array} work - caller-provided workspace (size >= max(1, N*(N+7))); first N elements used as TAU, remainder as general workspace
* @param {integer} strideWork - stride for work
* @param {NonNegativeInteger} offsetWork - starting index for work
* @param {Int32Array} iwork - caller-provided integer workspace (size >= max(1, 2*(N-1))); only referenced when sense != 'none'
* @param {integer} strideIwork - stride for iwork
* @param {NonNegativeInteger} offsetIwork - starting index for iwork
* @returns {Object} result object: `{ info, ilo, ihi, abnrm }`
*/
function dgeevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, SCALE, strideSCALE, offsetSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, work, strideWork, offsetWork, iwork, strideIwork, offsetIwork ) {
	var dtrsnaJob;
	var wantvl;
	var wantvr;
	var wntsnn;
	var wntsnv;
	var wntsnb;
	var scalea;
	var cscale;
	var SELECT;
	var abnrm;
	var anrm;
	var info;
	var side;
	var ilo;
	var ihi;
	var TAU;
	var WORK;
	var scl;
	var bal;
	var dum;
	var cs;
	var sn;
	var k;
	var i;

	wantvl = ( jobvl === 'compute-vectors' );
	wantvr = ( jobvr === 'compute-vectors' );
	wntsnn = ( sense === 'none' );
	wntsnv = ( sense === 'right-vectors' );
	wntsnb = ( sense === 'both' );

	info = 0;
	ilo = 0;
	ihi = 0;
	abnrm = ZERO;

	// Quick return
	if ( N === 0 ) {
		return {
			'info': 0,
			'ilo': 1,
			'ihi': 0,
			'abnrm': ZERO
		};
	}

	// Handle N=1 case
	if ( N === 1 ) {
		WR[ offsetWR ] = A[ offsetA ];
		WI[ offsetWI ] = ZERO;
		SCALE[ offsetSCALE ] = ONE;
		abnrm = Math.abs( A[ offsetA ] );
		if ( wantvl ) {
			VL[ offsetVL ] = ONE;
		}
		if ( wantvr ) {
			VR[ offsetVR ] = ONE;
		}
		if ( !wntsnn ) {
			RCONDE[ offsetRCONDE ] = ONE;
			RCONDV[ offsetRCONDV ] = ONE;
		}
		return {
			'info': 0,
			'ilo': 1,
			'ihi': 1,
			'abnrm': abnrm
		};
	}

	// Partition work to match Fortran layout:
	// - work[offsetWork .. offsetWork+N-1]   = TAU (for dgehrd/dorghr)
	// - work[offsetWork+N .. end]            = general workspace (for dgehrd/dorghr/dhseqr/dtrevc3)
	// After dorghr, TAU is no longer needed, so dhseqr/dtrevc3/dtrsna may reuse the full buffer from offsetWork.
	TAU = work;
	WORK = work;

	SELECT = new Uint8Array( 1 );

	// Scale A if max element outside range [SMLNUM, BIGNUM]
	dum = new Float64Array( 1 );
	anrm = dlange( 'max', N, N, A, strideA1, strideA2, offsetA, dum, 1, 0 );
	scalea = false;
	cscale = ZERO;
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

	// Balance the matrix and compute ABNRM
	bal = dgebal( balanc, N, A, strideA1, strideA2, offsetA, SCALE, strideSCALE, offsetSCALE );
	ilo = bal.ilo;
	ihi = bal.ihi;
	abnrm = dlange( 'one-norm', N, N, A, strideA1, strideA2, offsetA, dum, 1, 0 );
	if ( scalea ) {
		dum[ 0 ] = abnrm;
		dlascl( 'general', 0, 0, cscale, anrm, 1, 1, dum, 1, 1, 0 );
		abnrm = dum[ 0 ];
	}

	// Reduce to upper Hessenberg form.
	// TAU occupies work[offsetWork .. offsetWork+N-1].
	// Dgehrd workspace starts at work[offsetWork+N].
	dgehrd( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideWork, offsetWork, WORK, strideWork, offsetWork + N );

	if ( wantvl ) {
		side = 'left';

		// Copy Householder vectors to VL
		dlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VL, strideVL1, strideVL2, offsetVL );

		// Generate orthogonal matrix in VL
		dorghr( N, ilo, ihi, VL, strideVL1, strideVL2, offsetVL, TAU, strideWork, offsetWork, WORK, strideWork, offsetWork + N, work.length - offsetWork - N );

		// QR iteration accumulating Schur vectors in VL.

		// TAU space is no longer needed; dhseqr reuses from offsetWork.
		info = dhseqr( 'schur', 'update', N, ilo, ihi, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, WORK, strideWork, offsetWork );

		if ( wantvr ) {
			side = 'both';

			// Copy Schur vectors to VR
			dlacpy( 'full', N, N, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
		}
	} else if ( wantvr ) {
		side = 'right';

		// Copy Householder vectors to VR
		dlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VR, strideVR1, strideVR2, offsetVR );

		// Generate orthogonal matrix in VR
		dorghr( N, ilo, ihi, VR, strideVR1, strideVR2, offsetVR, TAU, strideWork, offsetWork, WORK, strideWork, offsetWork + N, work.length - offsetWork - N );

		// QR iteration accumulating Schur vectors in VR.

		// TAU space is no longer needed; dhseqr reuses from offsetWork.
		info = dhseqr( 'schur', 'update', N, ilo, ihi, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork );
	} else {
		// Compute eigenvalues only. With SENSE='none', job is 'E'; otherwise 'S' (Schur form needed by DTRSNA).
		// TAU space is not yet used when no vectors are wanted; dhseqr uses from offsetWork.
		info = dhseqr( 'eigenvalues', 'none', N, ilo, ihi, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork );
	}

	// If DHSEQR failed, skip remaining computation but still undo scaling
	if ( info === 0 ) {
		if ( wantvl || wantvr ) {
			// Compute eigenvectors from the Schur form.
			// dtrevc3 reuses work from offsetWork (TAU no longer needed).
			dtrevc3( side, 'backtransform', SELECT, 1, 0, N, A, strideA1, strideA2, offsetA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, N, 0, WORK, strideWork, offsetWork, work.length - offsetWork );
		}

		// Compute condition numbers (DTRSNA) before back-transforming / normalizing eigenvectors.
		if ( !wntsnn ) {
			if ( sense === 'eigenvalues' ) {
				dtrsnaJob = 'eigenvalues';
			} else if ( wntsnv ) {
				dtrsnaJob = 'eigenvectors';
			} else {
				dtrsnaJob = 'both';
			}
			// DTRSNA needs a 2-D WORK of shape (N, N+6) and IWORK of length 2*(N-1).
			// Dtrsna reuses work from offsetWork (N*(N+6) elements, leading dimension N).
			dtrsna( dtrsnaJob, 'all', SELECT, 1, 0, N, A, strideA1, strideA2, offsetA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, N, WORK, strideWork, N, offsetWork, iwork, strideIwork, offsetIwork );
		}

		// Normalize left eigenvectors
		if ( wantvl ) {
			dgebak( balanc, 'left', N, ilo, ihi, SCALE, strideSCALE, offsetSCALE, N, VL, strideVL1, strideVL2, offsetVL );
			for ( i = 0; i < N; i++ ) {
				if ( WI[ offsetWI + ( i * strideWI ) ] === ZERO ) {
					scl = ONE / dnrm2( N, VL, strideVL1, offsetVL + ( i * strideVL2 ) );
					dscal( N, scl, VL, strideVL1, offsetVL + ( i * strideVL2 ) );
				} else if ( WI[ offsetWI + ( i * strideWI ) ] > ZERO ) {
					scl = ONE / dlapy2(dnrm2( N, VL, strideVL1, offsetVL + ( i * strideVL2 ) ), dnrm2( N, VL, strideVL1, offsetVL + ( ( i + 1 ) * strideVL2 ) ));
					dscal( N, scl, VL, strideVL1, offsetVL + ( i * strideVL2 ) );
					dscal( N, scl, VL, strideVL1, offsetVL + ( ( i + 1 ) * strideVL2 ) );
					for ( k = 0; k < N; k++ ) {
						work[ offsetWork + k ] = ( VL[ offsetVL + ( k * strideVL1 ) + ( i * strideVL2 ) ] * VL[ offsetVL + ( k * strideVL1 ) + ( i * strideVL2 ) ] ) +
							( VL[ offsetVL + ( k * strideVL1 ) + ( ( i + 1 ) * strideVL2 ) ] * VL[ offsetVL + ( k * strideVL1 ) + ( ( i + 1 ) * strideVL2 ) ] );
					}
					k = idamax( N, work, strideWork, offsetWork );
					dlartg( VL[ offsetVL + ( k * strideVL1 ) + ( i * strideVL2 ) ], VL[ offsetVL + ( k * strideVL1 ) + ( ( i + 1 ) * strideVL2 ) ], DLARTG_OUT );
					cs = DLARTG_OUT[ 0 ];
					sn = DLARTG_OUT[ 1 ];
					drot( N, VL, strideVL1, offsetVL + ( i * strideVL2 ), VL, strideVL1, offsetVL + ( ( i + 1 ) * strideVL2 ), cs, sn );
					VL[ offsetVL + ( k * strideVL1 ) + ( ( i + 1 ) * strideVL2 ) ] = ZERO;
				}
			}
		}

		// Normalize right eigenvectors
		if ( wantvr ) {
			dgebak( balanc, 'right', N, ilo, ihi, SCALE, strideSCALE, offsetSCALE, N, VR, strideVR1, strideVR2, offsetVR );
			for ( i = 0; i < N; i++ ) {
				if ( WI[ offsetWI + ( i * strideWI ) ] === ZERO ) {
					scl = ONE / dnrm2( N, VR, strideVR1, offsetVR + ( i * strideVR2 ) );
					dscal( N, scl, VR, strideVR1, offsetVR + ( i * strideVR2 ) );
				} else if ( WI[ offsetWI + ( i * strideWI ) ] > ZERO ) {
					scl = ONE / dlapy2(dnrm2( N, VR, strideVR1, offsetVR + ( i * strideVR2 ) ), dnrm2( N, VR, strideVR1, offsetVR + ( ( i + 1 ) * strideVR2 ) ));
					dscal( N, scl, VR, strideVR1, offsetVR + ( i * strideVR2 ) );
					dscal( N, scl, VR, strideVR1, offsetVR + ( ( i + 1 ) * strideVR2 ) );
					for ( k = 0; k < N; k++ ) {
						work[ offsetWork + k ] = ( VR[ offsetVR + ( k * strideVR1 ) + ( i * strideVR2 ) ] * VR[ offsetVR + ( k * strideVR1 ) + ( i * strideVR2 ) ] ) +
							( VR[ offsetVR + ( k * strideVR1 ) + ( ( i + 1 ) * strideVR2 ) ] * VR[ offsetVR + ( k * strideVR1 ) + ( ( i + 1 ) * strideVR2 ) ] );
					}
					k = idamax( N, work, strideWork, offsetWork );
					dlartg( VR[ offsetVR + ( k * strideVR1 ) + ( i * strideVR2 ) ], VR[ offsetVR + ( k * strideVR1 ) + ( ( i + 1 ) * strideVR2 ) ], DLARTG_OUT );
					cs = DLARTG_OUT[ 0 ];
					sn = DLARTG_OUT[ 1 ];
					drot( N, VR, strideVR1, offsetVR + ( i * strideVR2 ), VR, strideVR1, offsetVR + ( ( i + 1 ) * strideVR2 ), cs, sn );
					VR[ offsetVR + ( k * strideVR1 ) + ( ( i + 1 ) * strideVR2 ) ] = ZERO;
				}
			}
		}
	}

	// Undo scaling if necessary
	if ( scalea ) {
		dlascl( 'general', 0, 0, cscale, anrm, N - info, 1, WR, strideWR, 1, offsetWR + ( info * strideWR ) );
		dlascl( 'general', 0, 0, cscale, anrm, N - info, 1, WI, strideWI, 1, offsetWI + ( info * strideWI ) );
		if ( info === 0 ) {
			if ( wntsnv || wntsnb ) {
				dlascl( 'general', 0, 0, cscale, anrm, N, 1, RCONDV, strideRCONDV, 1, offsetRCONDV );
			}
		} else {
			dlascl( 'general', 0, 0, cscale, anrm, ilo - 1, 1, WR, strideWR, 1, offsetWR );
			dlascl( 'general', 0, 0, cscale, anrm, ilo - 1, 1, WI, strideWI, 1, offsetWI );
		}
	}

	return {
		'info': info,
		'ilo': ilo,
		'ihi': ihi,
		'abnrm': abnrm
	};
}


// EXPORTS //

export default dgeevx;
