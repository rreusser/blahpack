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
import dgeqrf from '../../dgeqrf/lib/base.js';
import dormqr from '../../dormqr/lib/base.js';
import dgelqf from '../../dgelqf/lib/base.js';
import dormlq from '../../dormlq/lib/base.js';
import dgebrd from '../../dgebrd/lib/base.js';
import dormbr from '../../dormbr/lib/base.js';
import dorgbr from '../../dorgbr/lib/base.js';
import dbdsqr from '../../dbdsqr/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import drscl from '../../drscl/lib/base.js';


// VARIABLES //

var MNTHR_RATIO = 1.6;  // ILAENV(6, 'DGELSS') threshold ratio M/N


// MAIN //

/**
* Computes the minimum norm solution to a real linear least squares problem:.
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
* @param {Float64Array} A - M-by-N matrix, overwritten on exit
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - on entry, M-by-NRHS (or max(M,N)-by-NRHS) RHS matrix;
* on exit, N-by-NRHS solution matrix (rows max(M,N)+1..N zeroed if M < N)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} S - output array of singular values in decreasing order (length min(M,N))
* @param {integer} strideS - stride length for S
* @param {NonNegativeInteger} offsetS - starting index for S
* @param {number} rcond - used to determine the effective rank of A.
* Singular values S(i) <= RCOND*S(1) are treated as zero.
* If RCOND < 0, machine precision is used instead.
* @param {Array} rank - output array; rank[0] set to the effective rank of A
* @param {Float64Array} WORK - caller-provided workspace. Must be at least
* `lwork` elements long when accessed with the provided stride/offset.
* Minimum required size (LAPACK MINWRK):
*   `MAX( 1, 3*min(M,N) + MAX( 2*min(M,N), MAX(M,N), NRHS ), 5*min(M,N) )`
* Larger values enable faster code paths (block-size NB=32 is used internally;
* see also the path-2a LQ-copy gating which requires
* `(4*M) + (M*M) + max(M, 2*M-4, NRHS, N-3*M)` when N >> M).
* @param {integer} strideWORK - stride length for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - length of WORK array (at least the MINWRK above)
* @returns {integer} info - 0 if successful, >0 if DBDSQR did not converge
*/
function dgelss( M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, S, strideS, offsetS, rcond, rank, WORK, strideWORK, offsetWORK, lwork ) {
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

	// Get machine parameters
	eps = dlamch( 'precision' );
	sfmin = dlamch( 'safe-minimum' );
	smlnum = sfmin / eps;
	bignum = 1.0 / smlnum;

	// DUM is a dummy array for dbdsqr (unused VT/U matrix when ncvt=0 or nru=0)
	DUM = new Float64Array( 1 );

	// Scale A if max element is outside [smlnum, bignum]
	anrm = dlange( 'max', M, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK );
	iascl = 0;
	if ( anrm > 0.0 && anrm < smlnum ) {
		// Scale matrix norm up to smlnum
		dlascl( 'general', 0, 0, anrm, smlnum, M, N, A, strideA1, strideA2, offsetA );
		iascl = 1;
	} else if ( anrm > bignum ) {
		// Scale matrix norm down to bignum
		dlascl( 'general', 0, 0, anrm, bignum, M, N, A, strideA1, strideA2, offsetA );
		iascl = 2;
	} else if ( anrm === 0.0 ) {
		// Matrix all zero. Return zero solution.
		dlaset( 'full', maxmn, nrhs, 0.0, 0.0, B, strideB1, strideB2, offsetB );
		dlaset( 'full', minmn, 1, 0.0, 0.0, S, strideS, 1, offsetS );
		rank[ 0 ] = 0;
		return 0;
	}

	// Scale B
	bnrm = dlange( 'max', M, nrhs, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK );
	ibscl = 0;
	if ( bnrm > 0.0 && bnrm < smlnum ) {
		// Scale matrix norm up to smlnum
		dlascl( 'general', 0, 0, bnrm, smlnum, M, nrhs, B, strideB1, strideB2, offsetB );
		ibscl = 1;
	} else if ( bnrm > bignum ) {
		// Scale matrix norm down to bignum
		dlascl( 'general', 0, 0, bnrm, bignum, M, nrhs, B, strideB1, strideB2, offsetB );
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
			itau = 0;       // TAU starts at WORK[0], length N
			iwork = itau + N;

			// Compute A = Q * R
			dgeqrf( M, N, A, strideA1, strideA2, offsetA, WORK, 1, itau, WORK, 1, iwork );

			// Multiply B := Q^T * B
			dormqr('left', 'transpose', M, nrhs, N, A, strideA1, strideA2, offsetA, WORK, 1, itau, B, strideB1, strideB2, offsetB, WORK, 1, iwork );

			// Zero out below-diagonal of R
			if ( N > 1 ) {
				dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, A, strideA1, strideA2, offsetA + strideA1 );
			}
		}

		ie = 0;          // E starts at WORK[0], length N
		itauq = ie + N;  // TAUQ starts at WORK[ie+N], length N
		itaup = itauq + N; // TAUP starts at WORK[itauq+N], length N
		iwork = itaup + N; // scratch space after TAUP

		// Bidiagonal reduction: A = Q_b * B_bd * P_b^T (of the mm-by-N matrix)
		dgebrd( mm, N, A, strideA1, strideA2, offsetA, S, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork, lwork - iwork );

		// Multiply B by transpose of left bidiagonal transformation: B := Q_b^T * B
		dormbr('apply-Q', 'left', 'transpose', mm, nrhs, N, A, strideA1, strideA2, offsetA, WORK, 1, itauq, B, strideB1, strideB2, offsetB, WORK, 1, iwork );

		// Generate right bidiagonal transformation: P_b^T stored in A
		dorgbr('apply-P', N, N, N, A, strideA1, strideA2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
		iwork = ie + N;

		// Compute SVD of bidiagonal: S = singular values, A = P_b^T (right singular vectors)

		// B is multiplied by Q_b^T on the left
		info = dbdsqr( 'upper', N, N, 0, nrhs, S, strideS, offsetS, WORK, 1, ie, A, strideA1, strideA2, offsetA, DUM, 1, 1, 0, B, strideB1, strideB2, offsetB, WORK, 1, iwork );
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
				drscl( nrhs, S[ offsetS + (i * strideS) ], B, strideB2, offsetB + (i * strideB1) );
				rank[ 0 ] += 1;
			} else {
				// Zero out the corresponding row of B
				dlaset( 'full', 1, nrhs, 0.0, 0.0, B, strideB1, strideB2, offsetB + (i * strideB1) );
			}
		}

		// Multiply by right singular vectors: X = V^T * (Sigma^+ * Q_b^T * B)
		// A now contains V^T (the right singular vectors), so X = A^T * B
		if ( lwork >= strideB2 * nrhs && nrhs > 1 ) {
			dgemm( 'transpose', 'no-transpose', N, nrhs, N, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, 0.0, WORK, 1, N, 0 );
			dlacpy( 'full', N, nrhs, WORK, 1, N, 0, B, strideB1, strideB2, offsetB );
		} else if ( nrhs > 1 ) {
			chunk = Math.max( 1, Math.floor( lwork / N ) );
			for ( i = 0; i < nrhs; i += chunk ) {
				bl = Math.min( nrhs - i, chunk );
				dgemm( 'transpose', 'no-transpose', N, bl, N, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB + (i * strideB2), 0.0, WORK, 1, N, 0 );
				dlacpy( 'full', N, bl, WORK, 1, N, 0, B, strideB1, strideB2, offsetB + (i * strideB2) );
			}
		} else if ( nrhs === 1 ) {
			dgemv( 'transpose', N, N, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, offsetB, 0.0, WORK, 1, 0 );
			dcopy( N, WORK, 1, 0, B, strideB1, offsetB );
		}
	} else if ( N >= mnthr && lwork >= (4 * M) + (M * M) + Math.max( M, (2 * M) - 4, nrhs, N - (3 * M) ) ) {
		// ==========================================
		// Path 2a: N >> M — LQ factorization with workspace copy
		// ==========================================
		ldwork = M;

		// Check if we can use a larger ldwork for better performance
		if ( lwork >= Math.max( (4 * M) + (M * M) + Math.max( M, (2 * M) - 4, nrhs, N - (3 * M) ), (M * M) + M + (M * nrhs) ) ) {
			ldwork = Math.max( M, Math.floor( Math.sqrt( lwork - (3 * M) ) ) );

			// Cap ldwork to a reasonable value
			if ( ldwork > M ) {
				ldwork = M; // keep simple — no LDA optimization needed in JS
			}
		}

		itau = 0;        // TAU starts at WORK[0], length M
		iwork = M;       // scratch after TAU

		// Compute A = L * Q
		dgelqf(M, N, A, strideA1, strideA2, offsetA, WORK, 1, itau, WORK, 1, iwork );

		il = iwork; // IL: copy of L starts here, ldwork-by-M stored column-major

		// Copy L into workspace and zero it in A
		dlacpy( 'lower', M, M, A, strideA1, strideA2, offsetA, WORK, 1, ldwork, il );
		dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WORK, 1, ldwork, il + ldwork );

		ie = il + (ldwork * M);
		itauq = ie + M;
		itaup = itauq + M;
		iwork = itaup + M;

		// Bidiagonal reduction of L (M-by-M)
		dgebrd( M, M, WORK, 1, ldwork, il, S, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork, lwork - iwork );

		// Multiply B by transpose of left bidiagonal transformation: B := Q_b^T * B
		dormbr('apply-Q', 'left', 'transpose', M, nrhs, M, WORK, 1, ldwork, il, WORK, 1, itauq, B, strideB1, strideB2, offsetB, WORK, 1, iwork );

		// Generate right bidiagonal transformation of L
		dorgbr('apply-P', M, M, M, WORK, 1, ldwork, il, WORK, 1, itaup, WORK, 1, iwork );
		iwork = ie + M;

		// Compute SVD of bidiagonal of L
		info = dbdsqr( 'upper', M, M, 0, nrhs, S, strideS, offsetS, WORK, 1, ie, WORK, 1, ldwork, il, DUM, 1, 1, 0, B, strideB1, strideB2, offsetB, WORK, 1, iwork );
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
				drscl( nrhs, S[ offsetS + (i * strideS) ], B, strideB2, offsetB + (i * strideB1) );
				rank[ 0 ] += 1;
			} else {
				dlaset( 'full', 1, nrhs, 0.0, 0.0, B, strideB1, strideB2, offsetB + (i * strideB1) );
			}
		}
		iwork = ie;

		// Multiply by right singular vectors of L: X_L = V_L^T * (Sigma^+ * ...)
		if ( lwork >= iwork + (M * nrhs) && nrhs > 1 ) {
			dgemm( 'transpose', 'no-transpose', M, nrhs, M, 1.0, WORK, 1, ldwork, il, B, strideB1, strideB2, offsetB, 0.0, WORK, 1, M, iwork );
			dlacpy( 'full', M, nrhs, WORK, 1, M, iwork, B, strideB1, strideB2, offsetB );
		} else if ( nrhs > 1 ) {
			chunk = Math.max( 1, Math.floor( ( lwork - iwork ) / M ) );
			for ( i = 0; i < nrhs; i += chunk ) {
				bl = Math.min( nrhs - i, chunk );
				dgemm( 'transpose', 'no-transpose', M, bl, M, 1.0, WORK, 1, ldwork, il, B, strideB1, strideB2, offsetB + (i * strideB2), 0.0, WORK, 1, M, iwork );
				dlacpy( 'full', M, bl, WORK, 1, M, iwork, B, strideB1, strideB2, offsetB + (i * strideB2) );
			}
		} else if ( nrhs === 1 ) {
			dgemv( 'transpose', M, M, 1.0, WORK, 1, ldwork, il, B, strideB1, offsetB, 0.0, WORK, 1, iwork );
			dcopy( M, WORK, 1, iwork, B, strideB1, offsetB );
		}

		// Zero out B(M+1:N, 1:NRHS)
		dlaset( 'full', N - M, nrhs, 0.0, 0.0, B, strideB1, strideB2, offsetB + (M * strideB1) );

		// Multiply by Q^T from LQ factorization: X = Q^T * [X_L; 0]
		iwork = itau + M;
		dormlq('left', 'transpose', N, nrhs, M, A, strideA1, strideA2, offsetA, WORK, 1, itau, B, strideB1, strideB2, offsetB, WORK, 1, iwork );
	} else {
		// ==========================================
		// Path 2b: N > M, not enough workspace for LQ+copy — direct bidiag
		// ==========================================
		ie = 0;
		itauq = ie + M;
		itaup = itauq + M;
		iwork = itaup + M;

		// Bidiagonal reduction of A (M-by-N)
		dgebrd( M, N, A, strideA1, strideA2, offsetA, S, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork, lwork - iwork );

		// Multiply B by transpose of left bidiagonal transformation
		dormbr('apply-Q', 'left', 'transpose', M, nrhs, N, A, strideA1, strideA2, offsetA, WORK, 1, itauq, B, strideB1, strideB2, offsetB, WORK, 1, iwork );

		// Generate right bidiagonal transformation
		dorgbr('apply-P', M, N, M, A, strideA1, strideA2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
		iwork = ie + M;

		// Compute SVD of bidiagonal (lower bidiagonal for M < N)
		info = dbdsqr( 'lower', M, N, 0, nrhs, S, strideS, offsetS, WORK, 1, ie, A, strideA1, strideA2, offsetA, DUM, 1, 1, 0, B, strideB1, strideB2, offsetB, WORK, 1, iwork );
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
				drscl( nrhs, S[ offsetS + (i * strideS) ], B, strideB2, offsetB + (i * strideB1) );
				rank[ 0 ] += 1;
			} else {
				dlaset( 'full', 1, nrhs, 0.0, 0.0, B, strideB1, strideB2, offsetB + (i * strideB1) );
			}
		}

		// Multiply by right singular vectors: X = V^T * (Sigma^+ * ...)
		if ( lwork >= strideB2 * nrhs && nrhs > 1 ) {
			dgemm( 'transpose', 'no-transpose', N, nrhs, M, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, 0.0, WORK, 1, N, 0 );
			dlacpy( 'full', N, nrhs, WORK, 1, N, 0, B, strideB1, strideB2, offsetB );
		} else if ( nrhs > 1 ) {
			chunk = Math.max( 1, Math.floor( lwork / N ) );
			for ( i = 0; i < nrhs; i += chunk ) {
				bl = Math.min( nrhs - i, chunk );
				dgemm( 'transpose', 'no-transpose', N, bl, M, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB + (i * strideB2), 0.0, WORK, 1, N, 0 );
				dlacpy( 'full', N, bl, WORK, 1, N, 0, B, strideB1, strideB2, offsetB + (i * strideB2) );
			}
		} else if ( nrhs === 1 ) {
			dgemv( 'transpose', M, N, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, offsetB, 0.0, WORK, 1, 0 );
			dcopy( N, WORK, 1, 0, B, strideB1, offsetB );
		}
	}

	// Undo scaling
	if ( iascl === 1 ) {
		dlascl( 'general', 0, 0, anrm, smlnum, N, nrhs, B, strideB1, strideB2, offsetB );
		dlascl( 'general', 0, 0, smlnum, anrm, minmn, 1, S, strideS, 1, offsetS );
	} else if ( iascl === 2 ) {
		dlascl( 'general', 0, 0, anrm, bignum, N, nrhs, B, strideB1, strideB2, offsetB );
		dlascl( 'general', 0, 0, bignum, anrm, minmn, 1, S, strideS, 1, offsetS );
	}
	if ( ibscl === 1 ) {
		dlascl( 'general', 0, 0, smlnum, bnrm, N, nrhs, B, strideB1, strideB2, offsetB );
	} else if ( ibscl === 2 ) {
		dlascl( 'general', 0, 0, bignum, bnrm, N, nrhs, B, strideB1, strideB2, offsetB );
	}

	return 0;
}


// EXPORTS //

export default dgelss;
