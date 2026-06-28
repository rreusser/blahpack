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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zggbal from '../../zggbal/lib/base.js';
import zggbak from '../../zggbak/lib/base.js';
import zgeqrf from '../../zgeqrf/lib/base.js';
import zunmqr from '../../zunmqr/lib/base.js';
import zungqr from '../../zungqr/lib/base.js';
import zgghrd from '../../zgghrd/lib/base.js';
import zhgeqz from '../../zhgeqz/lib/base.js';
import ztgsen from '../../ztgsen/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

// Machine constants (hoisted to module scope)
var EPS = dlamch( 'precision' );
var SAFMIN = dlamch( 'safe-minimum' );
var SMLNUM = Math.sqrt( SAFMIN ) / EPS;
var BIGNUM = ONE / SMLNUM;
var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Computes the generalized eigenvalues, the generalized complex Schur form.
* (S,T), and optionally the left and/or right matrices of Schur vectors for
* a pair of N-by-N complex nonsymmetric matrices (A,B).
*
* Optionally, it also orders the eigenvalues so that a selected cluster of
* eigenvalues appears in the leading diagonal blocks of the output (S,T).
*
* ## Notes
*
* -   On exit, `A` is overwritten by the upper-triangular matrix S of the
*     generalized Schur form, and `B` is overwritten by the upper-triangular
*     matrix T.
*
* -   SDIM is the number of eigenvalues (after sorting) for which SELCTG is
*     true.
*
* -   A, B, VSL, VSR are Complex128Array. ALPHA, BETA are Complex128Array.
*     Strides and offsets are in complex elements.
*
* -   SELCTG callback receives `(alphaRe, alphaIm, betaRe, betaIm)` and
*     returns boolean.
*
* @private
* @param {string} jobvsl - `'compute-vectors'` to compute left Schur vectors, `'no-vectors'` to not
* @param {string} jobvsr - `'compute-vectors'` to compute right Schur vectors, `'no-vectors'` to not
* @param {string} sort - `'sorted'` to order eigenvalues, `'not-sorted'` to not
* @param {Function} selctg - selection function `(alphaRe, alphaIm, betaRe, betaIm) => boolean`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - input matrix A (N x N), overwritten by Schur form S on exit
* @param {integer} strideA1 - first dimension stride of A (complex elements)
* @param {integer} strideA2 - second dimension stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - input matrix B (N x N), overwritten by triangular form T on exit
* @param {integer} strideB1 - first dimension stride of B (complex elements)
* @param {integer} strideB2 - second dimension stride of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} ALPHA - output: eigenvalue numerators (length N)
* @param {integer} strideALPHA - stride for ALPHA (complex elements)
* @param {NonNegativeInteger} offsetALPHA - offset for ALPHA (complex elements)
* @param {Complex128Array} BETA - output: eigenvalue denominators (length N)
* @param {integer} strideBETA - stride for BETA (complex elements)
* @param {NonNegativeInteger} offsetBETA - offset for BETA (complex elements)
* @param {Complex128Array} VSL - output: left Schur vectors (N x N)
* @param {integer} strideVSL1 - first dimension stride of VSL (complex elements)
* @param {integer} strideVSL2 - second dimension stride of VSL (complex elements)
* @param {NonNegativeInteger} offsetVSL - starting index for VSL (complex elements)
* @param {Complex128Array} VSR - output: right Schur vectors (N x N)
* @param {integer} strideVSR1 - first dimension stride of VSR (complex elements)
* @param {integer} strideVSR2 - second dimension stride of VSR (complex elements)
* @param {NonNegativeInteger} offsetVSR - starting index for VSR (complex elements)
* @returns {Object} result with properties: info (integer status code), sdim (number of sorted eigenvalues)
*/
function zgges( jobvsl, jobvsr, sort, selctg, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR ) {
	var ALPHAv;
	var LSCALE;
	var RSCALE;
	var SELECT;
	var ilascl;
	var ilbscl;
	var anrmto;
	var bnrmto;
	var wantst;
	var BETAv;
	var irows;
	var icols;
	var ilvsl;
	var ilvsr;
	var IWORK;
	var RWORK;
	var anrm;
	var bnrm;
	var ierr;
	var info;
	var sdim;
	var WORK;
	var DIF;
	var TAU;
	var bal;
	var ilo;
	var ihi;
	var oBI;
	var oAI;
	var sAL;
	var sBE;
	var oAL;
	var oBE;
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

	// Allocate workspace
	LSCALE = new Float64Array( N );
	RSCALE = new Float64Array( N );
	TAU = new Complex128Array( N );
	WORK = new Complex128Array( Math.max( 8 * N, 1 ) );
	RWORK = new Float64Array( 8 * N );
	DIF = new Float64Array( 2 );
	PL = new Float64Array( 1 );
	PR = new Float64Array( 1 );
	M = new Int32Array( 1 );
	IWORK = new Int32Array( 1 );
	SELECT = new Uint8Array( N );

	ALPHAv = reinterpret( ALPHA, 0 );
	BETAv = reinterpret( BETA, 0 );
	sAL = strideALPHA * 2;
	sBE = strideBETA * 2;
	oAL = offsetALPHA * 2;
	oBE = offsetBETA * 2;

	// Scale A if max element outside range [SMLNUM, BIGNUM]
	anrm = zlange( 'max', N, N, A, strideA1, strideA2, offsetA, RWORK, 1, 0 );
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
		zlascl( 'general', 0, 0, anrm, anrmto, N, N, A, strideA1, strideA2, offsetA );
	}

	// Scale B if max element outside range [SMLNUM, BIGNUM]
	bnrm = zlange( 'max', N, N, B, strideB1, strideB2, offsetB, RWORK, 1, 0 );
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
		zlascl( 'general', 0, 0, bnrm, bnrmto, N, N, B, strideB1, strideB2, offsetB );
	}

	// Permute the matrices A, B to isolate eigenvalues
	// Zggbal returns 1-based ilo/ihi
	bal = zggbal( 'permute', N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, LSCALE, 1, 0, RSCALE, 1, 0, RWORK, 1, 0 );
	ilo = bal.ilo; // 1-based
	ihi = bal.ihi; // 1-based

	// Compute number of rows and columns of the submatrices to work on
	irows = ihi + 1 - ilo;
	icols = N + 1 - ilo;

	// Compute offsets for submatrix (ilo-1, ilo-1) in complex elements
	oBI = offsetB + ( ( ilo - 1 ) * strideB1 ) + ( ( ilo - 1 ) * strideB2 );
	oAI = offsetA + ( ( ilo - 1 ) * strideA1 ) + ( ( ilo - 1 ) * strideA2 );

	// QR factorize the submatrix B(ilo:ihi, ilo:N)
	zgeqrf( irows, icols, B, strideB1, strideB2, oBI, TAU, 1, 0, WORK, 1, 0 );

	// Apply the unitary transformation to A: A(ilo:ihi, ilo:N) = Q^H * A(ilo:ihi, ilo:N)
	zunmqr( 'left', 'conjugate-transpose', irows, icols, irows, B, strideB1, strideB2, oBI, TAU, 1, 0, A, strideA1, strideA2, oAI, WORK, 1, 0 );

	// Initialize VSL
	if ( ilvsl ) {
		zlaset( 'full', N, N, CZERO, CONE, VSL, strideVSL1, strideVSL2, offsetVSL );

		// Copy lower triangular part of B(ilo+1:ihi, ilo:ihi-1) to VSL
		if ( irows > 1 ) {
			zlacpy( 'lower', irows - 1, irows - 1, B, strideB1, strideB2, offsetB + ( ilo * strideB1 ) + ( ( ilo - 1 ) * strideB2 ), VSL, strideVSL1, strideVSL2, offsetVSL + ( ilo * strideVSL1 ) + ( ( ilo - 1 ) * strideVSL2 ) );
		}

		// Generate unitary matrix Q from the QR factorization
		zungqr( irows, irows, irows, VSL, strideVSL1, strideVSL2, offsetVSL + ( ( ilo - 1 ) * strideVSL1 ) + ( ( ilo - 1 ) * strideVSL2 ), TAU, 1, 0, WORK, 1, 0 );
	}

	// Initialize VSR to identity
	if ( ilvsr ) {
		zlaset( 'full', N, N, CZERO, CONE, VSR, strideVSR1, strideVSR2, offsetVSR );
	}

	// Reduce to generalized Hessenberg form
	// Zgghrd takes 1-based ilo/ihi
	zgghrd( ( ilvsl ) ? 'update' : 'none', ( ilvsr ) ? 'update' : 'none', N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR );

	sdim = 0;

	// Perform QZ iteration, computing Schur form

	// Zhgeqz takes 1-based ilo/ihi
	ierr = zhgeqz( 'schur', ( ilvsl ) ? 'update' : 'none', ( ilvsr ) ? 'update' : 'none', N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR, WORK, 1, 0, WORK.length, RWORK, 1, 0 );
	if ( ierr !== 0 ) {
		if ( ierr > 0 && ierr <= N ) {
			info = ierr;
		} else if ( ierr > N && ierr <= 2 * N ) {
			info = ierr - N;
		} else {
			info = N + 1;
		}
		return finalize( info, sdim, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, ALPHAv, sAL, oAL, BETAv, sBE, oBE, wantst, selctg );
	}

	// Eigenvalue sorting
	if ( wantst ) {
		// Undo scaling on eigenvalues before selection
		if ( ilascl ) {
			zlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHA, strideALPHA, 1, offsetALPHA );
		}
		if ( ilbscl ) {
			zlascl( 'general', 0, 0, bnrmto, bnrm, N, 1, BETA, strideBETA, 1, offsetBETA );
		}

		// Evaluate selection function for each eigenvalue
		for ( i = 0; i < N; i++ ) {
			SELECT[ i ] = ( selctg( ALPHAv[ oAL + ( i * sAL ) ], ALPHAv[ oAL + ( i * sAL ) + 1 ], BETAv[ oBE + ( i * sBE ) ], BETAv[ oBE + ( i * sBE ) + 1 ] ) ) ? 1 : 0;
		}

		// Reorder eigenvalues using ztgsen (ijob=0, simplest mode)
		ierr = ztgsen( 0, ilvsl, ilvsr, SELECT, 1, 0, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR, M, PL, PR, DIF, 1, 0, WORK, 1, 0, WORK.length, IWORK, 1, 0, 1 );
		if ( ierr === 1 ) {
			info = N + 3;
		}
	}

	// Undo balancing on VSL and VSR
	// Zggbak takes 1-based ilo/ihi
	if ( ilvsl ) {
		zggbak( 'permute', 'left', N, ilo, ihi, LSCALE, 1, 0, RSCALE, 1, 0, N, VSL, strideVSL1, strideVSL2, offsetVSL );
	}
	if ( ilvsr ) {
		zggbak( 'permute', 'right', N, ilo, ihi, LSCALE, 1, 0, RSCALE, 1, 0, N, VSR, strideVSR1, strideVSR2, offsetVSR );
	}

	return finalize( info, sdim, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, ALPHAv, sAL, oAL, BETAv, sBE, oBE, wantst, selctg );
}

/**
* Undo scaling on Schur form and eigenvalue arrays and count sorted eigenvalues.
*
* @private
* @param {integer} info - info code
* @param {integer} sdim - preliminary sdim from ztgsen
* @param {boolean} ilascl - whether A was scaled
* @param {boolean} ilbscl - whether B was scaled
* @param {number} anrmto - scaled norm of A
* @param {number} anrm - original norm of A
* @param {number} bnrmto - scaled norm of B
* @param {number} bnrm - original norm of B
* @param {NonNegativeInteger} N - problem size
* @param {Complex128Array} A - Schur form matrix
* @param {integer} strideA1 - first dimension stride of A (complex elements)
* @param {integer} strideA2 - second dimension stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - offset for A (complex elements)
* @param {Complex128Array} B - triangular form matrix
* @param {integer} strideB1 - first dimension stride of B (complex elements)
* @param {integer} strideB2 - second dimension stride of B (complex elements)
* @param {NonNegativeInteger} offsetB - offset for B (complex elements)
* @param {Complex128Array} ALPHA - alpha eigenvalue numerators
* @param {integer} strideALPHA - stride for ALPHA (complex elements)
* @param {NonNegativeInteger} offsetALPHA - offset for ALPHA (complex elements)
* @param {Complex128Array} BETA - beta eigenvalue denominators
* @param {integer} strideBETA - stride for BETA (complex elements)
* @param {NonNegativeInteger} offsetBETA - offset for BETA (complex elements)
* @param {Float64Array} ALPHAv - reinterpreted alpha view (Float64)
* @param {integer} sAL - stride for ALPHAv (Float64)
* @param {NonNegativeInteger} oAL - offset for ALPHAv (Float64)
* @param {Float64Array} BETAv - reinterpreted beta view (Float64)
* @param {integer} sBE - stride for BETAv (Float64)
* @param {NonNegativeInteger} oBE - offset for BETAv (Float64)
* @param {boolean} wantst - whether eigenvalue sorting was requested
* @param {Function} selctg - selection function
* @returns {Object} result with info and sdim
*/
function finalize( info, sdim, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, ALPHAv, sAL, oAL, BETAv, sBE, oBE, wantst, selctg ) { // eslint-disable-line max-params
	var lastsl;
	var cursl;
	var i;

	// Undo scaling on Schur form matrices and eigenvalue arrays
	if ( ilascl ) {
		zlascl( 'upper', 0, 0, anrmto, anrm, N, N, A, strideA1, strideA2, offsetA );
		zlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHA, strideALPHA, 1, offsetALPHA );
	}
	if ( ilbscl ) {
		zlascl( 'upper', 0, 0, bnrmto, bnrm, N, N, B, strideB1, strideB2, offsetB );
		zlascl( 'general', 0, 0, bnrmto, bnrm, N, 1, BETA, strideBETA, 1, offsetBETA );
	}

	// Recount SDIM after all unscaling
	if ( wantst ) {
		lastsl = true;
		sdim = 0;
		for ( i = 0; i < N; i++ ) {
			cursl = selctg( ALPHAv[ oAL + ( i * sAL ) ], ALPHAv[ oAL + ( i * sAL ) + 1 ], BETAv[ oBE + ( i * sBE ) ], BETAv[ oBE + ( i * sBE ) + 1 ] );
			if ( cursl ) {
				sdim += 1;
			}
			if ( cursl && !lastsl ) {
				info = N + 2;
			}
			lastsl = cursl;
		}
	}

	return {
		'info': info,
		'sdim': sdim
	};
}


// EXPORTS //

export default zgges;
