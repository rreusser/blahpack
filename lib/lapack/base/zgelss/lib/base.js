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

/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgeqrf from '../../zgeqrf/lib/base.js';
import zunmqr from '../../zunmqr/lib/base.js';
import zgelqf from '../../zgelqf/lib/base.js';
import zunmlq from '../../zunmlq/lib/base.js';
import zgebrd from '../../zgebrd/lib/base.js';
import zunmbr from '../../zunmbr/lib/base.js';
import zungbr from '../../zungbr/lib/base.js';
import zbdsqr from '../../zbdsqr/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zdrscl from '../../zdrscl/lib/base.js';


// VARIABLES //

var NB = 32;            // Hardcoded block size (replaces ILAENV queries)
var MNTHR_RATIO = 1.6;  // ILAENV(6, 'ZGELSS') threshold ratio M/N
var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Computes the minimum norm solution to a complex linear least squares problem:.
*
* minimize 2-norm(|| b - A*x ||)
*
* using the singular value decomposition (SVD) of A. A is an M-by-N matrix
* which may be rank-deficient.
*
* Several right hand side vectors b and solution vectors x can be handled
* in a single call; they are stored as the columns of the M-by-NRHS right
* hand side matrix B and the N-by-NRHS solution matrix X.
*
* The effective rank of A is determined by treating as zero those singular
* values which are less than RCOND times the largest singular value.
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Complex128Array} A - M-by-N matrix, overwritten on exit
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - on entry, M-by-NRHS (or max(M,N)-by-NRHS) RHS matrix;
* on exit, N-by-NRHS solution matrix (rows max(M,N)+1..N zeroed if M < N)
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Float64Array} S - output array of singular values in decreasing order (length min(M,N))
* @param {integer} strideS - stride length for S
* @param {NonNegativeInteger} offsetS - starting index for S
* @param {number} rcond - used to determine the effective rank of A.
* Singular values S(i) <= RCOND*S(1) are treated as zero.
* If RCOND < 0, machine precision is used instead.
* @param {Array} rank - output array; rank[0] set to the effective rank of A
* @param {Complex128Array} WORK - workspace array (if null, allocated internally)
* @param {integer} strideWork - stride length for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @param {integer} lwork - length of WORK array in complex elements (if 0 or WORK is null, auto-sized)
* @param {Float64Array} RWORK - real workspace array (if null, allocated internally)
* @param {integer} strideRWork - stride length for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} info - 0 if successful, >0 if ZBDSQR did not converge
*/
function zgelss( M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, S, strideS, offsetS, rcond, rank, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork ) {
	var irwork;
	var ldwork;
	var bignum;
	var smlnum;
	var minmn;
	var maxmn;
	var mnthr;
	var iascl;
	var ibscl;
	var itauq;
	var itaup;
	var iwork;
	var chunk;
	var sfmin;
	var anrm;
	var bnrm;
	var info;
	var itau;
	var DUM;
	var thr;
	var eps;
	var mm;
	var ie;
	var il;
	var bl;
	var i;

	minmn = Math.min( M, N );
	maxmn = Math.max( M, N );
	mnthr = Math.round( MNTHR_RATIO * Math.min( M, N ) );

	// Quick return if dimensions are zero
	if ( M === 0 || N === 0 ) {
		rank[ 0 ] = 0;
		return 0;
	}

	// Allocate workspace if not provided
	if ( !WORK || lwork === 0 ) {
		lwork = computeWorkSize( M, N, nrhs, mnthr );
		WORK = new Complex128Array( lwork );
		strideWork = 1;
		offsetWork = 0;
	}

	// Allocate RWORK if not provided
	if ( !RWORK ) {
		RWORK = new Float64Array( 5 * minmn );
		strideRWork = 1;
		offsetRWork = 0;
	}

	// Get machine parameters
	eps = dlamch( 'precision' );
	sfmin = dlamch( 'safe-minimum' );
	smlnum = sfmin / eps;
	bignum = 1.0 / smlnum;

	// DUM is a dummy complex array for zbdsqr (unused VT/U matrix when ncvt=0 or nru=0)
	DUM = new Complex128Array( 1 );

	// Scale A if max element is outside [smlnum, bignum]
	anrm = zlange( 'max', M, N, A, strideA1, strideA2, offsetA, RWORK, strideRWork, offsetRWork );
	iascl = 0;
	if ( anrm > 0.0 && anrm < smlnum ) {
		// Scale matrix norm up to smlnum
		zlascl( 'general', 0, 0, anrm, smlnum, M, N, A, strideA1, strideA2, offsetA );
		iascl = 1;
	} else if ( anrm > bignum ) {
		// Scale matrix norm down to bignum
		zlascl( 'general', 0, 0, anrm, bignum, M, N, A, strideA1, strideA2, offsetA );
		iascl = 2;
	} else if ( anrm === 0.0 ) {
		// Matrix all zero. Return zero solution.
		zlaset( 'full', maxmn, nrhs, CZERO, CZERO, B, strideB1, strideB2, offsetB );
		dlaset( 'full', minmn, 1, 0.0, 0.0, S, strideS, 1, offsetS );
		rank[ 0 ] = 0;
		return 0;
	}

	// Scale B
	bnrm = zlange( 'max', M, nrhs, B, strideB1, strideB2, offsetB, RWORK, strideRWork, offsetRWork );
	ibscl = 0;
	if ( bnrm > 0.0 && bnrm < smlnum ) {
		// Scale matrix norm up to smlnum
		zlascl( 'general', 0, 0, bnrm, smlnum, M, nrhs, B, strideB1, strideB2, offsetB );
		ibscl = 1;
	} else if ( bnrm > bignum ) {
		// Scale matrix norm down to bignum
		zlascl( 'general', 0, 0, bnrm, bignum, M, nrhs, B, strideB1, strideB2, offsetB );
		ibscl = 2;
	}

	// ==========================================
	// Path 1: M >= N
	// ==========================================
	if ( M >= N ) {
		mm = M;
		if ( M >= mnthr ) {
			// Path 1a: M >> N — QR factorization first to reduce to N-by-N
			mm = N;
			itau = 0;       // TAU starts at WORK[0], length N (complex)
			iwork = itau + N;

			// Compute A = Q * R
			zgeqrf( M, N, A, strideA1, strideA2, offsetA, WORK, 1, itau, WORK, 1, iwork );

			// Multiply B := Q^H * B
			zunmqr( 'left', 'conjugate-transpose', M, nrhs, N, A, strideA1, strideA2, offsetA, WORK, 1, itau, B, strideB1, strideB2, offsetB, WORK, 1, iwork );

			// Zero out below-diagonal of R
			if ( N > 1 ) {
				zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, A, strideA1, strideA2, offsetA + strideA1 );
			}
		}

		// Real workspace for bidiagonal off-diagonal
		ie = 0;                      // E in RWORK[0..N-1] (real)

		// Complex workspace for TAUQ, TAUP
		itauq = 0;                   // TAUQ at WORK[0], length N (complex)
		itaup = itauq + N;           // TAUP at WORK[N], length N (complex)
		iwork = itaup + N;           // scratch after TAUP

		// Bidiagonal reduction: A = Q_b * B_bd * P_b^H (of the mm-by-N matrix)
		zgebrd( mm, N, A, strideA1, strideA2, offsetA, S, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork, lwork - iwork );

		// Multiply B by conjugate-transpose of left bidiagonal transformation: B := Q_b^H * B
		zunmbr( 'apply-Q', 'left', 'conjugate-transpose', mm, nrhs, N, A, strideA1, strideA2, offsetA, WORK, 1, itauq, B, strideB1, strideB2, offsetB, WORK, 1, iwork );

		// Generate right bidiagonal transformation: P_b^H stored in A
		zungbr( 'apply-P', N, N, N, A, strideA1, strideA2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
		irwork = ie + N;

		// Compute SVD of bidiagonal: S = singular values, A = P_b^H (right singular vectors)

		// B is multiplied by Q_b^H on the left
		info = zbdsqr( 'upper', N, N, 0, nrhs, S, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, A, strideA1, strideA2, offsetA, DUM, 1, 1, 0, B, strideB1, strideB2, offsetB, RWORK, strideRWork, offsetRWork + irwork );
		if ( info !== 0 ) {
			rank[ 0 ] = 0;
			return info;
		}

		// Threshold for rank determination
		thr = Math.max( rcond * S[ offsetS ], sfmin );
		if ( rcond < 0.0 ) {
			thr = Math.max( eps * S[ offsetS ], sfmin );
		}
		rank[ 0 ] = 0;
		for ( i = 0; i < N; i++ ) {
			if ( S[ offsetS + (i * strideS) ] > thr ) {
				// Scale the corresponding row of B by 1/S(i)
				zdrscl( nrhs, S[ offsetS + (i * strideS) ], B, strideB2, offsetB + (i * strideB1) );
				rank[ 0 ] += 1;
			} else {
				// Zero out the corresponding row of B
				zlaset( 'full', 1, nrhs, CZERO, CZERO, B, strideB1, strideB2, offsetB + (i * strideB1) );
			}
		}

		// Multiply by right singular vectors: X = V^H^T * (Sigma^+ * Q_b^H * B)
		// A now contains V^H (the right singular vectors in rows), so X = A^H * B
		if ( lwork >= strideB2 * nrhs && nrhs > 1 ) {
			zgemm( 'conjugate-transpose', 'no-transpose', N, nrhs, N, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, CZERO, WORK, 1, N, 0 );
			zlacpy( 'full', N, nrhs, WORK, 1, N, 0, B, strideB1, strideB2, offsetB );
		} else if ( nrhs > 1 ) {
			chunk = Math.max( 1, Math.floor( lwork / N ) );
			for ( i = 0; i < nrhs; i += chunk ) {
				bl = Math.min( nrhs - i, chunk );
				zgemm( 'conjugate-transpose', 'no-transpose', N, bl, N, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB + (i * strideB2), CZERO, WORK, 1, N, 0 );
				zlacpy( 'full', N, bl, WORK, 1, N, 0, B, strideB1, strideB2, offsetB + (i * strideB2) );
			}
		} else if ( nrhs === 1 ) {
			zgemv( 'conjugate-transpose', N, N, CONE, A, strideA1, strideA2, offsetA, B, strideB1, offsetB, CZERO, WORK, 1, 0 );
			zcopy( N, WORK, 1, 0, B, strideB1, offsetB );
		}
	} else if ( N >= mnthr && lwork >= (3 * M) + (M * M) + Math.max( M, nrhs, N - (2 * M) ) ) {
		// ==========================================
		// Path 2a: N >> M — LQ factorization with workspace copy
		// ==========================================
		ldwork = M;

		itau = 0;        // TAU starts at WORK[0], length M (complex)
		iwork = M;       // scratch after TAU

		// Compute A = L * Q
		zgelqf( M, N, A, strideA1, strideA2, offsetA, WORK, 1, itau, WORK, 1, iwork );

		il = iwork; // IL: copy of L starts here, ldwork-by-M stored column-major

		// Copy L into workspace and zero it in A
		zlacpy( 'lower', M, M, A, strideA1, strideA2, offsetA, WORK, 1, ldwork, il );
		zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, WORK, 1, ldwork, il + ldwork );

		// Real workspace for bidiagonal off-diagonal
		ie = 0;

		// Complex workspace for TAUQ, TAUP
		itauq = il + (ldwork * M);
		itaup = itauq + M;
		iwork = itaup + M;

		// Bidiagonal reduction of L (M-by-M)
		zgebrd( M, M, WORK, 1, ldwork, il, S, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork, lwork - iwork );

		// Multiply B by conjugate-transpose of left bidiagonal transformation: B := Q_b^H * B
		zunmbr( 'apply-Q', 'left', 'conjugate-transpose', M, nrhs, M, WORK, 1, ldwork, il, WORK, 1, itauq, B, strideB1, strideB2, offsetB, WORK, 1, iwork );

		// Generate right bidiagonal transformation of L
		zungbr( 'apply-P', M, M, M, WORK, 1, ldwork, il, WORK, 1, itaup, WORK, 1, iwork );
		irwork = ie + M;

		// Compute SVD of bidiagonal of L
		info = zbdsqr( 'upper', M, M, 0, nrhs, S, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, WORK, 1, ldwork, il, DUM, 1, 1, 0, B, strideB1, strideB2, offsetB, RWORK, strideRWork, offsetRWork + irwork );
		if ( info !== 0 ) {
			rank[ 0 ] = 0;
			return info;
		}

		// Threshold for rank determination
		thr = Math.max( rcond * S[ offsetS ], sfmin );
		if ( rcond < 0.0 ) {
			thr = Math.max( eps * S[ offsetS ], sfmin );
		}
		rank[ 0 ] = 0;
		for ( i = 0; i < M; i++ ) {
			if ( S[ offsetS + (i * strideS) ] > thr ) {
				zdrscl( nrhs, S[ offsetS + (i * strideS) ], B, strideB2, offsetB + (i * strideB1) );
				rank[ 0 ] += 1;
			} else {
				zlaset( 'full', 1, nrhs, CZERO, CZERO, B, strideB1, strideB2, offsetB + (i * strideB1) );
			}
		}
		iwork = il + (M * ldwork);

		// Multiply by right singular vectors of L: X_L = V_L^H^T * (Sigma^+ * ...)
		if ( lwork >= iwork + (M * nrhs) && nrhs > 1 ) {
			zgemm( 'conjugate-transpose', 'no-transpose', M, nrhs, M, CONE, WORK, 1, ldwork, il, B, strideB1, strideB2, offsetB, CZERO, WORK, 1, M, iwork );
			zlacpy( 'full', M, nrhs, WORK, 1, M, iwork, B, strideB1, strideB2, offsetB );
		} else if ( nrhs > 1 ) {
			chunk = Math.max( 1, Math.floor( ( lwork - iwork ) / M ) );
			for ( i = 0; i < nrhs; i += chunk ) {
				bl = Math.min( nrhs - i, chunk );
				zgemm( 'conjugate-transpose', 'no-transpose', M, bl, M, CONE, WORK, 1, ldwork, il, B, strideB1, strideB2, offsetB + (i * strideB2), CZERO, WORK, 1, M, iwork );
				zlacpy( 'full', M, bl, WORK, 1, M, iwork, B, strideB1, strideB2, offsetB + (i * strideB2) );
			}
		} else if ( nrhs === 1 ) {
			zgemv( 'conjugate-transpose', M, M, CONE, WORK, 1, ldwork, il, B, strideB1, offsetB, CZERO, WORK, 1, iwork );
			zcopy( M, WORK, 1, iwork, B, strideB1, offsetB );
		}

		// Zero out B(M+1:N, 1:NRHS)
		zlaset( 'full', N - M, nrhs, CZERO, CZERO, B, strideB1, strideB2, offsetB + (M * strideB1) );

		// Multiply by Q^H from LQ factorization: X = Q^H * [X_L; 0]
		iwork = itau + M;
		zunmlq( 'left', 'conjugate-transpose', N, nrhs, M, A, strideA1, strideA2, offsetA, WORK, 1, itau, B, strideB1, strideB2, offsetB, WORK, 1, iwork );
	} else {
		// ==========================================
		// Path 2b: N > M, not enough workspace for LQ+copy — direct bidiag
		// ==========================================

		// Real workspace for bidiagonal off-diagonal
		ie = 0;

		// Complex workspace for TAUQ, TAUP
		itauq = 0;
		itaup = itauq + M;
		iwork = itaup + M;

		// Bidiagonal reduction of A (M-by-N)
		zgebrd( M, N, A, strideA1, strideA2, offsetA, S, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork, lwork - iwork );

		// Multiply B by conjugate-transpose of left bidiagonal transformation
		zunmbr( 'apply-Q', 'left', 'conjugate-transpose', M, nrhs, N, A, strideA1, strideA2, offsetA, WORK, 1, itauq, B, strideB1, strideB2, offsetB, WORK, 1, iwork );

		// Generate right bidiagonal transformation
		zungbr( 'apply-P', M, N, M, A, strideA1, strideA2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
		irwork = ie + M;

		// Compute SVD of bidiagonal (lower bidiagonal for M < N)
		info = zbdsqr( 'lower', M, N, 0, nrhs, S, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, A, strideA1, strideA2, offsetA, DUM, 1, 1, 0, B, strideB1, strideB2, offsetB, RWORK, strideRWork, offsetRWork + irwork );
		if ( info !== 0 ) {
			rank[ 0 ] = 0;
			return info;
		}

		// Threshold for rank determination
		thr = Math.max( rcond * S[ offsetS ], sfmin );
		if ( rcond < 0.0 ) {
			thr = Math.max( eps * S[ offsetS ], sfmin );
		}
		rank[ 0 ] = 0;
		for ( i = 0; i < M; i++ ) {
			if ( S[ offsetS + (i * strideS) ] > thr ) {
				zdrscl( nrhs, S[ offsetS + (i * strideS) ], B, strideB2, offsetB + (i * strideB1) );
				rank[ 0 ] += 1;
			} else {
				zlaset( 'full', 1, nrhs, CZERO, CZERO, B, strideB1, strideB2, offsetB + (i * strideB1) );
			}
		}

		// Multiply by right singular vectors: X = V^H^T * (Sigma^+ * ...)
		if ( lwork >= strideB2 * nrhs && nrhs > 1 ) {
			zgemm( 'conjugate-transpose', 'no-transpose', N, nrhs, M, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, CZERO, WORK, 1, N, 0 );
			zlacpy( 'full', N, nrhs, WORK, 1, N, 0, B, strideB1, strideB2, offsetB );
		} else if ( nrhs > 1 ) {
			chunk = Math.max( 1, Math.floor( lwork / N ) );
			for ( i = 0; i < nrhs; i += chunk ) {
				bl = Math.min( nrhs - i, chunk );
				zgemm( 'conjugate-transpose', 'no-transpose', N, bl, M, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB + (i * strideB2), CZERO, WORK, 1, N, 0 );
				zlacpy( 'full', N, bl, WORK, 1, N, 0, B, strideB1, strideB2, offsetB + (i * strideB2) );
			}
		} else if ( nrhs === 1 ) {
			zgemv( 'conjugate-transpose', M, N, CONE, A, strideA1, strideA2, offsetA, B, strideB1, offsetB, CZERO, WORK, 1, 0 );
			zcopy( N, WORK, 1, 0, B, strideB1, offsetB );
		}
	}

	// Undo scaling
	if ( iascl === 1 ) {
		zlascl( 'general', 0, 0, anrm, smlnum, N, nrhs, B, strideB1, strideB2, offsetB );
		dlascl( 'general', 0, 0, smlnum, anrm, minmn, 1, S, strideS, 1, offsetS );
	} else if ( iascl === 2 ) {
		zlascl( 'general', 0, 0, anrm, bignum, N, nrhs, B, strideB1, strideB2, offsetB );
		dlascl( 'general', 0, 0, bignum, anrm, minmn, 1, S, strideS, 1, offsetS );
	}
	if ( ibscl === 1 ) {
		zlascl( 'general', 0, 0, smlnum, bnrm, N, nrhs, B, strideB1, strideB2, offsetB );
	} else if ( ibscl === 2 ) {
		zlascl( 'general', 0, 0, bignum, bnrm, N, nrhs, B, strideB1, strideB2, offsetB );
	}

	return 0;
}

/**
* Computes the workspace size needed for zgelss.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {NonNegativeInteger} mnthr - threshold for switching paths
* @returns {integer} workspace size (in complex elements)
*/
function computeWorkSize( M, N, nrhs, mnthr ) {
	var bdspac;
	var minmn;
	var wsize;
	var mm;

	minmn = Math.min( M, N );
	if ( minmn === 0 ) {
		return 1;
	}

	// Generous workspace allocation covering all code paths
	mm = M;
	wsize = 1;
	bdspac = Math.max( 1, 5 * minmn );

	if ( M >= N ) {
		if ( M >= mnthr ) {
			mm = N;

			// QR path workspace: N (TAU) + max(N*NB for QR, N*NB for UNMQR)
			wsize = Math.max( wsize, N + (N * NB) );
		}
		// Bidiag workspace: 2*N + max(mm*NB, N*NB)
		wsize = Math.max( wsize, (2 * N) + (Math.max( mm, N ) * NB) );
		wsize = Math.max( wsize, (2 * N) + nrhs );
		wsize = Math.max( wsize, bdspac );
		wsize = Math.max( wsize, N * nrhs );
	} else {
		bdspac = Math.max( 1, 5 * M );
		if ( N >= mnthr ) {
			// LQ path with workspace copy
			wsize = M + (M * NB); // LQ
			wsize = Math.max( wsize, (M * M) + (3 * M) + (M * NB) ); // bidiag of L
			wsize = Math.max( wsize, (M * M) + M + bdspac ); // BDSQR
			wsize = Math.max( wsize, (M * M) + M + (M * nrhs) ); // GEMM
			wsize = Math.max( wsize, M + (N * NB) ); // UNMLQ
		} else {
			// Direct bidiag
			wsize = Math.max( wsize, (2 * M) + (N * NB) );
			wsize = Math.max( wsize, (2 * M) + nrhs );
			wsize = Math.max( wsize, bdspac );
			wsize = Math.max( wsize, N * nrhs );
		}
	}

	return wsize;
}


// EXPORTS //

export default zgelss;
