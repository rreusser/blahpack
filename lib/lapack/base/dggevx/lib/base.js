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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, no-unused-vars */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dggbal from '../../dggbal/lib/base.js';
import dggbak from '../../dggbak/lib/base.js';
import dgeqrf from '../../dgeqrf/lib/base.js';
import dormqr from '../../dormqr/lib/base.js';
import dorgqr from '../../dorgqr/lib/base.js';
import dgghrd from '../../dgghrd/lib/base.js';
import dhgeqz from '../../dhgeqz/lib/base.js';
import dtgevc from '../../dtgevc/lib/base.js';
import dtgsna from '../../dtgsna/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

// Machine constants (hoisted to module scope)
var EPS = dlamch( 'precision' );
var SMLNUM_BASE = dlamch( 'safe-minimum' );
var SMLNUM = Math.sqrt( SMLNUM_BASE ) / EPS;
var BIGNUM = ONE / SMLNUM;


// MAIN //

/**
* Computes for a pair of N-by-N real nonsymmetric matrices (A,B) the generalized eigenvalues, and optionally, the left and/or right generalized eigenvectors. Optionally also computes a balancing transformation to improve the conditioning of the eigenvalues and eigenvectors (ILO, IHI, LSCALE, RSCALE, ABNRM, and BBNRM), reciprocal condition numbers for the eigenvalues (RCONDE), and reciprocal condition numbers for the right eigenvectors (RCONDV).
*
* @private
* @param {string} balanc - balancing option (`'none'`, `'permute'`, `'scale'`, or `'both'`)
* @param {string} jobvl - `'compute-vectors'` to compute left eigenvectors, `'no-vectors'` otherwise
* @param {string} jobvr - `'compute-vectors'` to compute right eigenvectors, `'no-vectors'` otherwise
* @param {string} sense - reciprocal condition numbers to compute (`'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`)
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input matrix A (N x N), overwritten on exit
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - input matrix B (N x N), overwritten on exit
* @param {integer} strideB1 - first dimension stride of B
* @param {integer} strideB2 - second dimension stride of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} ALPHAR - output: real parts of alpha (length N)
* @param {integer} strideALPHAR - stride for ALPHAR
* @param {NonNegativeInteger} offsetALPHAR - offset for ALPHAR
* @param {Float64Array} ALPHAI - output: imaginary parts of alpha (length N)
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {NonNegativeInteger} offsetALPHAI - offset for ALPHAI
* @param {Float64Array} BETA - output: beta values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - offset for BETA
* @param {Float64Array} VL - output: left eigenvectors (N x N)
* @param {integer} strideVL1 - first dimension stride of VL
* @param {integer} strideVL2 - second dimension stride of VL
* @param {NonNegativeInteger} offsetVL - offset for VL
* @param {Float64Array} VR - output: right eigenvectors (N x N)
* @param {integer} strideVR1 - first dimension stride of VR
* @param {integer} strideVR2 - second dimension stride of VR
* @param {NonNegativeInteger} offsetVR - offset for VR
* @param {Float64Array} LSCALE - output: left permutation/scaling factors (length N)
* @param {integer} strideLSCALE - stride for LSCALE
* @param {NonNegativeInteger} offsetLSCALE - offset for LSCALE
* @param {Float64Array} RSCALE - output: right permutation/scaling factors (length N)
* @param {integer} strideRSCALE - stride for RSCALE
* @param {NonNegativeInteger} offsetRSCALE - offset for RSCALE
* @param {Float64Array} RCONDE - output: reciprocal condition numbers of eigenvalues (length N)
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - offset for RCONDE
* @param {Float64Array} RCONDV - output: reciprocal condition numbers of right eigenvectors (length N)
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - offset for RCONDV
* @returns {Object} object with `info`, `ilo`, `ihi`, `abnrm`, and `bbnrm`
*/
function dggevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV ) {
	var iwrk1Len;
	var SNSWORK;
	var rcondeS;
	var rcondvS;
	var workVL;
	var workVR;
	var workCN;
	var snaJob;
	var wantse;
	var wantsv;
	var wantsb;
	var oVLdst;
	var SELECT;
	var ilascl;
	var ilbscl;
	var anrmto;
	var bnrmto;
	var chtemp;
	var compvl;
	var compvr;
	var wantsn;
	var BWORK;
	var sInfo;
	var IWORK;
	var oBsrc;
	var irows;
	var icols;
	var abnrm;
	var bbnrm;
	var MCNT;
	var pair;
	var jVal;
	var iIdx;
	var WORK;
	var oVLI;
	var anrm;
	var bnrm;
	var ilvl;
	var ilvr;
	var ierr;
	var info;
	var TAU;
	var oBI;
	var oAI;
	var ilo;
	var ihi;
	var ilv;
	var bal;
	var mm;

	ilvl = ( jobvl === 'compute-vectors' );
	ilvr = ( jobvr === 'compute-vectors' );
	ilv = ilvl || ilvr;
	wantsn = ( sense === 'none' );
	wantse = ( sense === 'eigenvalues' );
	wantsv = ( sense === 'right-vectors' );
	wantsb = ( sense === 'both' );

	info = 0;
	abnrm = ZERO;
	bbnrm = ZERO;

	// Quick return
	if ( N === 0 ) {
		return {
			'info': 0,
			'ilo': 1,
			'ihi': 0,
			'abnrm': ZERO,
			'bbnrm': ZERO
		};
	}

	// Allocate workspace
	TAU = new Float64Array( N );
	WORK = new Float64Array( Math.max( 8 * N, 1 ) );
	SELECT = new Uint8Array( 1 ); // unused but required by dtgevc

	// Scale A if max element outside range [SMLNUM, BIGNUM]
	anrm = dlange( 'max', N, N, A, strideA1, strideA2, offsetA, WORK, 1, 0 );
	ilascl = false;
	anrmto = 0.0;
	if ( anrm > ZERO && anrm < SMLNUM ) {
		anrmto = SMLNUM;
		ilascl = true;
	} else if ( anrm > BIGNUM ) {
		anrmto = BIGNUM;
		ilascl = true;
	}
	if ( ilascl ) {
		dlascl( 'general', 0, 0, anrm, anrmto, N, N, A, strideA1, strideA2, offsetA );
	}

	// Scale B if max element outside range [SMLNUM, BIGNUM]
	bnrm = dlange( 'max', N, N, B, strideB1, strideB2, offsetB, WORK, 1, 0 );
	ilbscl = false;
	bnrmto = 0.0;
	if ( bnrm > ZERO && bnrm < SMLNUM ) {
		bnrmto = SMLNUM;
		ilbscl = true;
	} else if ( bnrm > BIGNUM ) {
		bnrmto = BIGNUM;
		ilbscl = true;
	}
	if ( ilbscl ) {
		dlascl( 'general', 0, 0, bnrm, bnrmto, N, N, B, strideB1, strideB2, offsetB );
	}

	// Permute and/or scale A, B to isolate and balance eigenvalues
	bal = dggbal( balanc, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, WORK, 1, 0 );
	ilo = bal.ilo; // 1-based
	ihi = bal.ihi; // 1-based

	// Compute ABNRM (and BBNRM) from the (possibly scaled) matrix A (and B) using the 1-norm. If A was scaled, unscale the norm back to the original space.
	abnrm = dlange( 'one-norm', N, N, A, strideA1, strideA2, offsetA, WORK, 1, 0 );
	if ( ilascl ) {
		WORK[ 0 ] = abnrm;
		dlascl( 'general', 0, 0, anrmto, anrm, 1, 1, WORK, 1, 1, 0 );
		abnrm = WORK[ 0 ];
	}
	bbnrm = dlange( 'one-norm', N, N, B, strideB1, strideB2, offsetB, WORK, 1, 0 );
	if ( ilbscl ) {
		WORK[ 0 ] = bbnrm;
		dlascl( 'general', 0, 0, bnrmto, bnrm, 1, 1, WORK, 1, 1, 0 );
		bbnrm = WORK[ 0 ];
	}

	// Compute number of rows and columns of the submatrices to work on
	irows = ihi + 1 - ilo;
	if ( ilv || !wantsn ) {
		icols = N + 1 - ilo;
	} else {
		icols = irows;
	}

	// Compute offsets for submatrix (ilo-1, ilo-1) in 0-based indexing
	oBI = offsetB + ( ( ilo - 1 ) * strideB1 ) + ( ( ilo - 1 ) * strideB2 );
	oAI = offsetA + ( ( ilo - 1 ) * strideA1 ) + ( ( ilo - 1 ) * strideA2 );

	// QR factorize the submatrix B(ilo:ihi, ilo:N) (or B(ilo:ihi, ilo:ihi))
	dgeqrf( irows, icols, B, strideB1, strideB2, oBI, TAU, 1, 0, WORK, 1, 0 );

	// Apply the orthogonal transformation to A: A(ilo:ihi, ilo:...) = Q^T * A(ilo:ihi, ilo:...)
	dormqr( 'left', 'transpose', irows, icols, irows, B, strideB1, strideB2, oBI, TAU, 1, 0, A, strideA1, strideA2, oAI, WORK, 1, 0 );

	// Initialize VL and/or VR
	if ( ilvl ) {
		// Set VL to identity
		dlaset( 'full', N, N, ZERO, ONE, VL, strideVL1, strideVL2, offsetVL );

		// Copy lower triangular part of B(ilo+1:ihi, ilo:ihi-1) to VL
		if ( irows > 1 ) {
			oBsrc = offsetB + ( ilo * strideB1 ) + ( ( ilo - 1 ) * strideB2 );
			oVLdst = offsetVL + ( ilo * strideVL1 ) + ( ( ilo - 1 ) * strideVL2 );
			dlacpy( 'lower', irows - 1, irows - 1, B, strideB1, strideB2, oBsrc, VL, strideVL1, strideVL2, oVLdst );
		}
		// Generate orthogonal matrix Q from the QR factorization
		oVLI = offsetVL + ( ( ilo - 1 ) * strideVL1 ) + ( ( ilo - 1 ) * strideVL2 );
		dorgqr( irows, irows, irows, VL, strideVL1, strideVL2, oVLI, TAU, 1, 0, WORK, 1, 0 );
	}
	if ( ilvr ) {
		dlaset( 'full', N, N, ZERO, ONE, VR, strideVR1, strideVR2, offsetVR );
	}

	// Reduce to generalized Hessenberg form
	if ( ilv || !wantsn ) {
		compvl = ( ilvl ) ? 'update' : 'none';
		compvr = ( ilvr ) ? 'update' : 'none';
		dgghrd( compvl, compvr, N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
	} else {
		dgghrd( 'none', 'none', irows, 1, irows, A, strideA1, strideA2, oAI, B, strideB1, strideB2, oBI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
	}

	// Perform QZ iteration, computing Schur form. dhgeqz takes 0-based ilo/ihi.
	if ( ilv || !wantsn ) {
		chtemp = 'schur';
	} else {
		chtemp = 'eigenvalues';
	}
	compvl = ( ilvl ) ? 'update' : 'none';
	compvr = ( ilvr ) ? 'update' : 'none';

	// Note: dhgeqz is always called with the full matrix A/B and 0-based ilo..ihi.
	ierr = dhgeqz( chtemp, compvl, compvr, N, ilo - 1, ihi - 1, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, 1, 0, WORK.length );
	if ( ierr !== 0 ) {
		if ( ierr > 0 && ierr <= N ) {
			info = ierr;
		} else if ( ierr > N && ierr <= 2 * N ) {
			info = ierr - N;
		} else {
			info = N + 1;
		}
		return cleanup( info, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, ilo, ihi, abnrm, bbnrm );
	}

	// Compute eigenvectors
	if ( ilv || !wantsn ) {
		if ( ilv ) {
			if ( ilvl ) {
				chtemp = ( ilvr ) ? 'both' : 'left';
			} else {
				chtemp = 'right';
			}
			ierr = dtgevc( chtemp, 'backtransform', SELECT, 1, 0, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, N, 0, WORK, 1, 0 );
			if ( ierr !== 0 ) {
				info = N + 2;
				return cleanup( info, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, ilo, ihi, abnrm, bbnrm );
			}
		}
		if ( !wantsn ) {
			// Compute reciprocal condition numbers one eigenvalue at a time, using DTGEVC (in 'selected' mode) to recompute a pair of eigenvectors and DTGSNA to estimate their condition numbers. We cannot reuse VL/VR because DTGSNA requires eigenvectors of the Schur form (S,T), not the back-transformed eigenvectors.

			// Workspace layout:
			//   workVL  : up to 2 columns of length N for left eigenvectors (col-major, ld=N)
			//   workVR  : up to 2 columns of length N for right eigenvectors (col-major, ld=N)
			//   SNSWORK : DTGSNA workspace — 2*N*(N+2)+16 for 'eigenvectors'/'both', N otherwise
			// Map dggevx SENSE to dtgsna JOB: 'right-vectors' → 'eigenvectors'.
			if ( wantse ) {
				snaJob = 'eigenvalues';
			} else if ( wantsv ) {
				snaJob = 'eigenvectors';
			} else {
				snaJob = 'both';
			}
			workVL = new Float64Array( 2 * N );
			workVR = new Float64Array( 2 * N );
			if ( wantsv || wantsb ) {
				iwrk1Len = ( 2 * N * ( N + 2 ) ) + 16;
			} else {
				iwrk1Len = Math.max( N, 1 );
			}
			SNSWORK = new Float64Array( iwrk1Len );
			workCN = new Float64Array( Math.max( 6 * N, 1 ) ); // workspace for dtgevc
			BWORK = new Uint8Array( N );
			IWORK = new Int32Array( Math.max( N + 6, 1 ) );
			MCNT = new Int32Array( 1 );
			rcondeS = new Float64Array( 2 );
			rcondvS = new Float64Array( 2 );
			pair = false;
			for ( iIdx = 0; iIdx < N; iIdx++ ) {
				if ( pair ) {
					pair = false;
					continue; // eslint-disable-line no-continue
				}
				mm = 1;
				if ( iIdx < N - 1 ) {
					if ( A[ offsetA + ( ( iIdx + 1 ) * strideA1 ) + ( iIdx * strideA2 ) ] !== ZERO ) {
						pair = true;
						mm = 2;
					}
				}
				for ( jVal = 0; jVal < N; jVal++ ) {
					BWORK[ jVal ] = 0;
				}
				BWORK[ iIdx ] = 1;
				if ( mm === 2 ) {
					BWORK[ iIdx + 1 ] = 1;
				}

				// Compute a pair of eigenvectors of (S,T) for DTGSNA.
				if ( wantse || wantsb ) {
					ierr = dtgevc( 'both', 'selected', BWORK, 1, 0, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, workVL, 1, N, 0, workVR, 1, N, 0, mm, 0, workCN, 1, 0 );
					if ( ierr !== 0 ) {
						info = N + 2;
						return cleanup( info, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, ilo, ihi, abnrm, bbnrm );
					}
				}

				rcondeS[ 0 ] = ZERO;
				rcondeS[ 1 ] = ZERO;
				rcondvS[ 0 ] = ZERO;
				rcondvS[ 1 ] = ZERO;
				MCNT[ 0 ] = 0;
				sInfo = dtgsna( snaJob, 'selected', BWORK, 1, 0, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, workVL, 1, N, 0, workVR, 1, N, 0, rcondeS, 1, 0, rcondvS, 1, 0, mm, MCNT, SNSWORK, 1, 0, iwrk1Len, IWORK, 1, 0 );
				if ( sInfo < 0 ) {
					info = N + 2;
					return cleanup( info, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, ilo, ihi, abnrm, bbnrm );
				}

				// Copy per-eigenvalue results back into caller's output arrays.
				if ( wantse || wantsb ) {
					RCONDE[ offsetRCONDE + ( iIdx * strideRCONDE ) ] = rcondeS[ 0 ];
					if ( mm === 2 ) {
						RCONDE[ offsetRCONDE + ( ( iIdx + 1 ) * strideRCONDE ) ] = rcondeS[ 1 ];
					}
				}
				if ( wantsv || wantsb ) {
					RCONDV[ offsetRCONDV + ( iIdx * strideRCONDV ) ] = rcondvS[ 0 ];
					if ( mm === 2 ) {
						RCONDV[ offsetRCONDV + ( ( iIdx + 1 ) * strideRCONDV ) ] = rcondvS[ 1 ];
					}
				}
			}
		}
	}

	// Undo balancing on VL and VR, and normalize eigenvectors
	if ( ilvl ) {
		dggbak( balanc, 'left', N, ilo, ihi, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, N, VL, strideVL1, strideVL2, offsetVL );
		normalizeEigenvectors( N, ALPHAI, strideALPHAI, offsetALPHAI, VL, strideVL1, strideVL2, offsetVL );
	}
	if ( ilvr ) {
		dggbak( balanc, 'right', N, ilo, ihi, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, N, VR, strideVR1, strideVR2, offsetVR );
		normalizeEigenvectors( N, ALPHAI, strideALPHAI, offsetALPHAI, VR, strideVR1, strideVR2, offsetVR );
	}

	return cleanup( info, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, ilo, ihi, abnrm, bbnrm );
}

/**
* Undoes scaling on eigenvalue output arrays and packages the return value.
*
* @private
* @param {integer} info - info code
* @param {boolean} ilascl - whether A was scaled
* @param {boolean} ilbscl - whether B was scaled
* @param {number} anrmto - scaled norm of A
* @param {number} anrm - original norm of A
* @param {number} bnrmto - scaled norm of B
* @param {number} bnrm - original norm of B
* @param {NonNegativeInteger} N - problem size
* @param {Float64Array} ALPHAR - real parts of alpha
* @param {integer} strideALPHAR - stride for ALPHAR
* @param {NonNegativeInteger} offsetALPHAR - offset for ALPHAR
* @param {Float64Array} ALPHAI - imaginary parts of alpha
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {NonNegativeInteger} offsetALPHAI - offset for ALPHAI
* @param {Float64Array} BETA - beta values
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - offset for BETA
* @param {integer} ilo - ilo output
* @param {integer} ihi - ihi output
* @param {number} abnrm - abnrm output
* @param {number} bbnrm - bbnrm output
* @returns {Object} result object
*/
function cleanup( info, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, ilo, ihi, abnrm, bbnrm ) {
	if ( ilascl ) {
		dlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHAR, strideALPHAR, 1, offsetALPHAR );
		dlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHAI, strideALPHAI, 1, offsetALPHAI );
	}
	if ( ilbscl ) {
		dlascl( 'general', 0, 0, bnrmto, bnrm, N, 1, BETA, strideBETA, 1, offsetBETA );
	}
	return {
		'info': info,
		'ilo': ilo,
		'ihi': ihi,
		'abnrm': abnrm,
		'bbnrm': bbnrm
	};
}

/**
* Normalizes eigenvectors by their infinity norm, handling complex conjugate pairs.
*
* @private
* @param {NonNegativeInteger} N - problem size
* @param {Float64Array} ALPHAI - imaginary parts of eigenvalues
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {NonNegativeInteger} offsetALPHAI - offset for ALPHAI
* @param {Float64Array} V - eigenvector matrix
* @param {integer} strideV1 - first dimension stride of V
* @param {integer} strideV2 - second dimension stride of V
* @param {NonNegativeInteger} offsetV - offset for V
*/
function normalizeEigenvectors( N, ALPHAI, strideALPHAI, offsetALPHAI, V, strideV1, strideV2, offsetV ) {
	var temp;
	var jc;
	var jr;

	for ( jc = 0; jc < N; jc++ ) {
		if ( ALPHAI[ offsetALPHAI + ( jc * strideALPHAI ) ] < ZERO ) {
			continue;
		}
		temp = ZERO;
		if ( ALPHAI[ offsetALPHAI + ( jc * strideALPHAI ) ] === ZERO ) {
			for ( jr = 0; jr < N; jr++ ) {
				temp = Math.max( temp, Math.abs( V[ offsetV + ( jr * strideV1 ) + ( jc * strideV2 ) ] ) );
			}
		} else {
			for ( jr = 0; jr < N; jr++ ) {
				temp = Math.max( temp, Math.abs( V[ offsetV + ( jr * strideV1 ) + ( jc * strideV2 ) ] ) + Math.abs( V[ offsetV + ( jr * strideV1 ) + ( ( jc + 1 ) * strideV2 ) ] ) );
			}
		}
		if ( temp < SMLNUM ) {
			continue;
		}
		temp = ONE / temp;
		if ( ALPHAI[ offsetALPHAI + ( jc * strideALPHAI ) ] === ZERO ) {
			for ( jr = 0; jr < N; jr++ ) {
				V[ offsetV + ( jr * strideV1 ) + ( jc * strideV2 ) ] *= temp;
			}
		} else {
			for ( jr = 0; jr < N; jr++ ) {
				V[ offsetV + ( jr * strideV1 ) + ( jc * strideV2 ) ] *= temp;
				V[ offsetV + ( jr * strideV1 ) + ( ( jc + 1 ) * strideV2 ) ] *= temp;
			}
		}
	}
}


// EXPORTS //

export default dggevx;
