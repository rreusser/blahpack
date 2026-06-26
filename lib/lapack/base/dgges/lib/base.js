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

import Float64Array from '@stdlib/array/float64/lib/index.js';
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
import dtgsen from '../../dtgsen/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

// Machine constants (hoisted to module scope)
var EPS = dlamch( 'precision' );
var SAFMIN = dlamch( 'safe-minimum' );
var SAFMAX = ONE / SAFMIN;
var SMLNUM = Math.sqrt( SAFMIN ) / EPS;
var BIGNUM = ONE / SMLNUM;


// MAIN //

/**
* Computes the generalized eigenvalues, the generalized real Schur form (S,T).
* and optionally the left and/or right matrices of Schur vectors for a pair of
* N-by-N real nonsymmetric matrices (A,B).
*
* Optionally, it also orders the eigenvalues so that a selected cluster of
* eigenvalues appears in the leading diagonal blocks of the output (S,T).
*
* ## Notes
*
* -   On exit, `A` is overwritten by the quasi-upper-triangular matrix S of the
*     generalized Schur form, and `B` is overwritten by the upper-triangular
*     matrix T.
*
* -   SDIM is the number of eigenvalues (after sorting) for which SELCTG is true.
*     (Complex conjugate pairs for which SELCTG is true for either eigenvalue
*     count as 2.)
*
* @private
* @param {string} jobvsl - `'compute-vectors'` to compute left Schur vectors, `'no-vectors'` to not
* @param {string} jobvsr - `'compute-vectors'` to compute right Schur vectors, `'no-vectors'` to not
* @param {string} sort - `'sorted'` to order eigenvalues, `'not-sorted'` to not
* @param {Function} selctg - selection function `(alphar, alphai, beta) => boolean`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input matrix A (N x N), overwritten by Schur form S on exit
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - input matrix B (N x N), overwritten by triangular form T on exit
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
* @param {Float64Array} VSL - output: left Schur vectors (N x N)
* @param {integer} strideVSL1 - first dimension stride of VSL
* @param {integer} strideVSL2 - second dimension stride of VSL
* @param {NonNegativeInteger} offsetVSL - starting index for VSL
* @param {Float64Array} VSR - output: right Schur vectors (N x N)
* @param {integer} strideVSR1 - first dimension stride of VSR
* @param {integer} strideVSR2 - second dimension stride of VSR
* @param {NonNegativeInteger} offsetVSR - starting index for VSR
* @param {Float64Array} WORK - caller-provided workspace of length at least max(8*N, 6*N+16, 1)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Uint8Array} BWORK - caller-provided logical workspace of length at least N (used when sort='sorted')
* @param {integer} strideBwork - stride for BWORK
* @param {NonNegativeInteger} offsetBwork - starting index for BWORK
* @returns {Object} result with properties: info (integer status code), sdim (number of sorted eigenvalues)
*/
function dgges( jobvsl, jobvsr, sort, selctg, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR, WORK, strideWork, offsetWork, BWORK, strideBwork, offsetBwork ) {
	var LSCALE;
	var RSCALE;
	var SELECT;
	var ilascl;
	var ilbscl;
	var anrmto;
	var bnrmto;
	var wantst;
	var irows;
	var icols;
	var ilvsl;
	var ilvsr;
	var IWORK;
	var anrm;
	var bnrm;
	var ierr;
	var info;
	var sdim;
	var DIF;
	var oBI;
	var oAI;
	var TAU;
	var ilo;
	var ihi;
	var bal;
	var PL;
	var PR;
	var M;
	var i;

	ilvsl = ( jobvsl === 'compute-vectors' );
	ilvsr = ( jobvsr === 'compute-vectors' );
	wantst = ( sort === 'sorted' );

	info = 0;
	sdim = 0;

	// Quick return
	if ( N === 0 ) {
		return {
			'info': 0,
			'sdim': 0
		};
	}

	// Allocate internal workspace
	LSCALE = new Float64Array( N );
	RSCALE = new Float64Array( N );
	TAU = new Float64Array( N );
	DIF = new Float64Array( 2 );
	PL = new Float64Array( 1 );
	PR = new Float64Array( 1 );
	M = new Int32Array( 1 );
	IWORK = new Int32Array( 1 );

	// BWORK (SELECT) is caller-provided
	SELECT = BWORK;

	// Scale A if max element outside range [SMLNUM, BIGNUM]
	anrm = dlange( 'max', N, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork );
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
	bnrm = dlange( 'max', N, N, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork );
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

	// Permute the matrices A, B to isolate eigenvalues
	bal = dggbal( 'permute', N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, LSCALE, 1, 0, RSCALE, 1, 0, WORK, strideWork, offsetWork );
	ilo = bal.ilo; // 1-based
	ihi = bal.ihi; // 1-based

	// Compute number of rows and columns of the submatrices to work on
	irows = ihi + 1 - ilo;
	icols = N + 1 - ilo;

	// Compute offsets for submatrix (ilo-1, ilo-1) in 0-based indexing
	oBI = offsetB + ( ( ilo - 1 ) * strideB1 ) + ( ( ilo - 1 ) * strideB2 );
	oAI = offsetA + ( ( ilo - 1 ) * strideA1 ) + ( ( ilo - 1 ) * strideA2 );

	// QR factorize the submatrix B(ilo:ihi, ilo:N)
	dgeqrf( irows, icols, B, strideB1, strideB2, oBI, TAU, 1, 0, WORK, strideWork, offsetWork );

	// Apply the orthogonal transformation to A: A(ilo:ihi, ilo:N) = Q^T * A(ilo:ihi, ilo:N)
	dormqr( 'left', 'transpose', irows, icols, irows, B, strideB1, strideB2, oBI, TAU, 1, 0, A, strideA1, strideA2, oAI, WORK, strideWork, offsetWork );

	// Initialize VSL
	if ( ilvsl ) {
		dlaset( 'full', N, N, ZERO, ONE, VSL, strideVSL1, strideVSL2, offsetVSL );

		// Copy lower triangular part of B(ilo+1:ihi, ilo:ihi-1) to VSL
		if ( irows > 1 ) {
			dlacpy( 'lower', irows - 1, irows - 1, B, strideB1, strideB2, offsetB + ( ilo * strideB1 ) + ( ( ilo - 1 ) * strideB2 ), VSL, strideVSL1, strideVSL2, offsetVSL + ( ilo * strideVSL1 ) + ( ( ilo - 1 ) * strideVSL2 ) );
		}

		// Generate orthogonal matrix Q from the QR factorization
		dorgqr( irows, irows, irows, VSL, strideVSL1, strideVSL2, offsetVSL + ( ( ilo - 1 ) * strideVSL1 ) + ( ( ilo - 1 ) * strideVSL2 ), TAU, 1, 0, WORK, strideWork, offsetWork );
	}

	// Initialize VSR to identity
	if ( ilvsr ) {
		dlaset( 'full', N, N, ZERO, ONE, VSR, strideVSR1, strideVSR2, offsetVSR );
	}

	// Reduce to generalized Hessenberg form
	dgghrd( ( ilvsl ) ? 'update' : 'none', ( ilvsr ) ? 'update' : 'none', N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR );

	// Perform QZ iteration, computing Schur form

	// Note: dhgeqz takes 0-based ilo/ihi (following dggev convention)
	ierr = dhgeqz( 'schur', ( ilvsl ) ? 'update' : 'none', ( ilvsr ) ? 'update' : 'none', N, ilo - 1, ihi - 1, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR, WORK, strideWork, offsetWork, WORK.length - offsetWork );
	if ( ierr !== 0 ) {
		if ( ierr > 0 && ierr <= N ) {
			info = ierr;
		} else if ( ierr > N && ierr <= 2 * N ) {
			info = ierr - N;
		} else {
			info = N + 1;
		}
		return finalize( info, sdim, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, wantst, selctg, SAFMAX );
	}

	// Eigenvalue sorting
	sdim = 0;
	if ( wantst ) {
		// Undo scaling on eigenvalues before selection
		if ( ilascl ) {
			dlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHAR, strideALPHAR, 1, offsetALPHAR );
			dlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHAI, strideALPHAI, 1, offsetALPHAI );
		}
		if ( ilbscl ) {
			dlascl( 'general', 0, 0, bnrmto, bnrm, N, 1, BETA, strideBETA, 1, offsetBETA );
		}

		// Evaluate selection function for each eigenvalue
		for ( i = 0; i < N; i++ ) {
			SELECT[ offsetBwork + ( i * strideBwork ) ] = ( selctg( ALPHAR[ offsetALPHAR + ( i * strideALPHAR ) ], ALPHAI[ offsetALPHAI + ( i * strideALPHAI ) ], BETA[ offsetBETA + ( i * strideBETA ) ] ) ) ? 1 : 0;
		}

		// Reorder eigenvalues using dtgsen (ijob=0, simplest mode)
		// M is an Int32Array output: M[0] = number of selected eigenvalues
		ierr = dtgsen( 0, ilvsl, ilvsr, SELECT, strideBwork, offsetBwork, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR, M, PL, PR, DIF, 1, 0, WORK, strideWork, offsetWork, WORK.length - offsetWork, IWORK, 1, 0, 1 );
		if ( ierr === 1 ) {
			info = N + 3;
		}
	}

	// Undo balancing on VSL and VSR
	if ( ilvsl ) {
		dggbak( 'permute', 'left', N, ilo, ihi, LSCALE, 1, 0, RSCALE, 1, 0, N, VSL, strideVSL1, strideVSL2, offsetVSL );
	}
	if ( ilvsr ) {
		dggbak( 'permute', 'right', N, ilo, ihi, LSCALE, 1, 0, RSCALE, 1, 0, N, VSR, strideVSR1, strideVSR2, offsetVSR );
	}

	return finalize( info, sdim, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, wantst, selctg, SAFMAX );
}

/**
* Undo scaling on Schur form and eigenvalue arrays and count sorted eigenvalues.
*
* @private
* @param {integer} info - info code
* @param {integer} sdim - preliminary sdim from dtgsen
* @param {boolean} ilascl - whether A was scaled
* @param {boolean} ilbscl - whether B was scaled
* @param {number} anrmto - scaled norm of A
* @param {number} anrm - original norm of A
* @param {number} bnrmto - scaled norm of B
* @param {number} bnrm - original norm of B
* @param {NonNegativeInteger} N - problem size
* @param {Float64Array} A - Schur form matrix
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - offset for A
* @param {Float64Array} B - triangular form matrix
* @param {integer} strideB1 - first dimension stride of B
* @param {integer} strideB2 - second dimension stride of B
* @param {NonNegativeInteger} offsetB - offset for B
* @param {Float64Array} ALPHAR - real parts of alpha
* @param {integer} strideALPHAR - stride for ALPHAR
* @param {NonNegativeInteger} offsetALPHAR - offset for ALPHAR
* @param {Float64Array} ALPHAI - imaginary parts of alpha
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {NonNegativeInteger} offsetALPHAI - offset for ALPHAI
* @param {Float64Array} BETA - beta values
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - offset for BETA
* @param {boolean} wantst - whether eigenvalue sorting was requested
* @param {Function} selctg - selection function
* @param {number} safmax - safe maximum value
* @returns {Object} result with info and sdim
*/
function finalize( info, sdim, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, wantst, selctg, safmax ) { // eslint-disable-line max-params
	var alphai;
	var alphar;
	var lastsl;
	var lst2sl;
	var cursl;
	var beta;
	var temp;
	var ip;
	var i;

	// Undo scaling for eigenvalues with complex parts (A scaling)
	if ( ilascl ) {
		for ( i = 0; i < N; i++ ) {
			alphar = ALPHAR[ offsetALPHAR + ( i * strideALPHAR ) ];
			alphai = ALPHAI[ offsetALPHAI + ( i * strideALPHAI ) ];
			if ( alphai !== ZERO ) {
				if ( ( alphar / safmax ) > ( anrmto / anrm ) || ( SAFMIN / alphar ) > ( anrm / anrmto ) ) {
					temp = Math.abs( A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] / alphar );
					BETA[ offsetBETA + ( i * strideBETA ) ] *= temp;
					ALPHAR[ offsetALPHAR + ( i * strideALPHAR ) ] *= temp;
					ALPHAI[ offsetALPHAI + ( i * strideALPHAI ) ] *= temp;
				} else if ( ( alphai / safmax ) > ( anrmto / anrm ) || ( SAFMIN / alphai ) > ( anrm / anrmto ) ) {
					temp = Math.abs( A[ offsetA + ( i * strideA1 ) + ( ( i + 1 ) * strideA2 ) ] / alphai );
					BETA[ offsetBETA + ( i * strideBETA ) ] *= temp;
					ALPHAR[ offsetALPHAR + ( i * strideALPHAR ) ] *= temp;
					ALPHAI[ offsetALPHAI + ( i * strideALPHAI ) ] *= temp;
				}
			}
		}
	}

	// Undo scaling for eigenvalues with complex parts (B scaling)
	if ( ilbscl ) {
		for ( i = 0; i < N; i++ ) {
			alphai = ALPHAI[ offsetALPHAI + ( i * strideALPHAI ) ];
			beta = BETA[ offsetBETA + ( i * strideBETA ) ];
			if ( alphai !== ZERO ) {
				if ( ( beta / safmax ) > ( bnrmto / bnrm ) || ( SAFMIN / beta ) > ( bnrm / bnrmto ) ) {
					temp = Math.abs( B[ offsetB + ( i * strideB1 ) + ( i * strideB2 ) ] / beta );
					BETA[ offsetBETA + ( i * strideBETA ) ] *= temp;
					ALPHAR[ offsetALPHAR + ( i * strideALPHAR ) ] *= temp;
					ALPHAI[ offsetALPHAI + ( i * strideALPHAI ) ] *= temp;
				}
			}
		}
	}

	// Undo scaling on Schur form matrices
	if ( ilascl ) {
		dlascl( 'hessenberg', 0, 0, anrmto, anrm, N, N, A, strideA1, strideA2, offsetA );
		dlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHAR, strideALPHAR, 1, offsetALPHAR );
		dlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHAI, strideALPHAI, 1, offsetALPHAI );
	}
	if ( ilbscl ) {
		dlascl( 'upper', 0, 0, bnrmto, bnrm, N, N, B, strideB1, strideB2, offsetB );
		dlascl( 'general', 0, 0, bnrmto, bnrm, N, 1, BETA, strideBETA, 1, offsetBETA );
	}

	// Recount SDIM after all unscaling
	if ( wantst ) {
		lastsl = true;
		lst2sl = true;
		sdim = 0;
		ip = 0;
		for ( i = 0; i < N; i++ ) {
			cursl = selctg( ALPHAR[ offsetALPHAR + ( i * strideALPHAR ) ], ALPHAI[ offsetALPHAI + ( i * strideALPHAI ) ], BETA[ offsetBETA + ( i * strideBETA ) ] );
			alphai = ALPHAI[ offsetALPHAI + ( i * strideALPHAI ) ];
			if ( alphai === ZERO ) {
				if ( cursl ) {
					sdim += 1;
				}
				ip = 0;
				if ( cursl && !lastsl ) {
					info = N + 2;
				}
			} else if ( ip === 1 ) {
				// Second of a complex conjugate pair
				cursl = cursl || lastsl;
				lastsl = cursl;
				if ( cursl ) {
					sdim += 2;
				}
				ip = -1;
				if ( cursl && !lst2sl ) {
					info = N + 2;
				}
			} else {
				// First of a potential complex conjugate pair
				ip = 1;
			}
			lst2sl = lastsl;
			lastsl = cursl;
		}
	}

	return {
		'info': info,
		'sdim': sdim
	};
}


// EXPORTS //

export default dgges;
