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

/* eslint-disable max-len, max-params, max-lines-per-function, max-statements, max-lines */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dgeqrf from '../../dgeqrf/lib/base.js';
import dorgqr from '../../dorgqr/lib/base.js';
import dgelqf from '../../dgelqf/lib/base.js';
import dorglq from '../../dorglq/lib/base.js';
import dgebrd from '../../dgebrd/lib/base.js';
import dorgbr from '../../dorgbr/lib/base.js';
import dbdsqr from '../../dbdsqr/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';


// VARIABLES //

var MNTHR_FAC = 1.6; // crossover ratio: if M >= MNTHR_FAC * N, use QR path


// MAIN //

/**
* Computes the singular value decomposition (SVD) of a real M-by-N matrix, optionally computing the left and/or right singular vectors.
*
* The SVD is written: `A = U*SIGMA*V^T`
*
* where SIGMA is an M-by-N matrix which is zero except for its min(M,N) diagonal
* elements, U is an M-by-M orthogonal matrix, and V is an N-by-N orthogonal matrix.
* The diagonal elements of SIGMA are the singular values of A; they are real and
* non-negative, and are returned in descending order. The first min(M,N) columns
* of U and V are the left and right singular vectors of A.
*
* @private
* @param {string} jobu - `'all-columns'`: all M columns of U returned, `'economy'`: first min(M,N) columns, `'overwrite'`: overwrite A, `'none'`: no U
* @param {string} jobvt - `'all-rows'`: all N rows of V^T returned, `'economy'`: first min(M,N) rows, `'overwrite'`: overwrite A, `'none'`: no VT
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} s - output array of singular values (length min(M,N))
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - starting index for s
* @param {Float64Array} U - output matrix for left singular vectors
* @param {integer} strideU1 - stride of the first dimension of U
* @param {integer} strideU2 - stride of the second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Float64Array} VT - output matrix for right singular vectors (V^T)
* @param {integer} strideVT1 - stride of the first dimension of VT
* @param {integer} strideVT2 - stride of the second dimension of VT
* @param {NonNegativeInteger} offsetVT - starting index for VT
* @param {Float64Array} work - caller-provided workspace array (length >= wsz, where wsz = max(1, 5*min(M,N), 3*min(M,N)+max(M,N), 2*max(M,N)^2 + 3*max(M,N) + max(M,N)))
* @param {integer} strideWork - stride for work
* @param {NonNegativeInteger} offsetWork - starting index for work
* @returns {integer} info - 0 if successful, >0 if DBDSQR did not converge
*/
function dgesvd( jobu, jobvt, M, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, U, strideU1, strideU2, offsetU, VT, strideVT1, strideVT2, offsetVT, work, strideWork, offsetWork ) { // eslint-disable-line no-unused-vars
	var wntuas;
	var wntvas;
	var bignum;
	var smlnum;
	var ldwrkr;
	var ldwrku;
	var wntua;
	var wntus;
	var wntuo;
	var wntun;
	var wntva;
	var wntvs;
	var wntvo;
	var wntvn;
	var minmn;
	var mnthr;
	var itauq;
	var itaup;
	var iwork;
	var chunk;
	var anrm;
	var iscl;
	var info;
	var ncvt;
	var nrvt;
	var itau;
	var svt1;
	var svt2;
	var eps;
	var ncu;
	var nru;
	var blk;
	var sa1;
	var sa2;
	var su1;
	var su2;
	var wsz;
	var DUM;
	var ie;
	var ir;
	var iu;
	var WK;
	var i;

	// Use work starting at offsetWork; create a view so all internal integer offsets remain zero-based
	WK = ( offsetWork === 0 ) ? work : work.subarray( offsetWork );
	sa1 = strideA1;
	sa2 = strideA2;
	su1 = strideU1;
	su2 = strideU2;
	svt1 = strideVT1;
	svt2 = strideVT2;

	info = 0;
	minmn = Math.min( M, N );

	wntua = ( jobu === 'all-columns' );
	wntus = ( jobu === 'economy' );
	wntuas = wntua || wntus;
	wntuo = ( jobu === 'overwrite' );
	wntun = ( jobu === 'none' );
	wntva = ( jobvt === 'all-rows' );
	wntvs = ( jobvt === 'economy' );
	wntvas = wntva || wntvs;
	wntvo = ( jobvt === 'overwrite' );
	wntvn = ( jobvt === 'none' );

	// Quick return if possible
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// Compute workspace size (for DUM only; WK is caller-provided)
	wsz = Math.max( 1, 5 * minmn, ( 3 * minmn ) + Math.max( M, N ), ( 2 * Math.max( M, N ) * Math.max( M, N ) ) + ( 3 * Math.max( M, N ) ) + Math.max( M, N ) );
	DUM = new Float64Array( 1 );

	// Compute machine parameters
	eps = dlamch( 'precision' );
	smlnum = Math.sqrt( dlamch( 'safe-minimum' ) ) / eps;
	bignum = 1.0 / smlnum;

	// Scale A if max element outside range [smlnum, bignum]
	anrm = dlange( 'max', M, N, A, sa1, sa2, offsetA, DUM, 1, 0 );
	iscl = 0;
	if ( anrm > 0.0 && anrm < smlnum ) {
		iscl = 1;
		dlascl( 'general', 0, 0, anrm, smlnum, M, N, A, sa1, sa2, offsetA );
	} else if ( anrm > bignum ) {
		iscl = 1;
		dlascl( 'general', 0, 0, anrm, bignum, M, N, A, sa1, sa2, offsetA );
	}

	mnthr = Math.floor( MNTHR_FAC * Math.min( M, N ) );

	if ( M >= N ) {
		// -------------------------------------------------------------------
		// M >= N: A has at least as many rows as columns
		// -------------------------------------------------------------------

		if ( M >= mnthr ) {
			// M is "much larger" than N — use QR factorization path
			// QR-factorize A, then work on the N-by-N upper triangular R

			if ( wntun ) {
				// -------------------------------------------------------
				// Path 1: JOBU='N', no left singular vectors
				// -------------------------------------------------------
				itau = 0;
				iwork = itau + N;

				// Compute A = Q*R
				dgeqrf( M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				// Zero out below R
				if ( N > 1 ) {
					dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, A, sa1, sa2, offsetA + sa1 );
				}
				ie = 0;
				itauq = ie + N;
				itaup = itauq + N;
				iwork = itaup + N;

				// Bidiagonalize R in A
				dgebrd( N, N, A, sa1, sa2, offsetA, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

				ncvt = 0;
				if ( wntvo || wntvas ) {
					// Generate P^T in A
					dorgbr('apply-P', N, N, N, A, sa1, sa2, offsetA, WK, 1, itaup, WK, 1, iwork );
					ncvt = N;
				}
				iwork = ie + N;

				// Perform bidiagonal QR iteration. VT is in A (or dummy if ncvt=0); U and C are dummies (nru=0, ncc=0).
				info = dbdsqr( 'upper', N, ncvt, 0, 0, s, strideS, offsetS, WK, 1, ie, A, sa1, sa2, offsetA, DUM, 1, 1, 0, DUM, 1, 1, 0, WK, 1, iwork );

				// Copy right singular vectors to VT if desired
				if ( wntvas ) {
					dlacpy( 'full', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
				}
			} else if ( wntuo && wntvn ) {
				// -------------------------------------------------------
				// Path 2: JOBU='O', JOBVT='N'
				// Left singular vectors overwrite A, no right vectors
				// -------------------------------------------------------
				// Sufficient workspace path: use QR + temp matrix
				ir = 0;
				ldwrkr = N;
				itau = ir + (ldwrkr * N);
				iwork = itau + N;

				// Compute A = Q*R
				dgeqrf( M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				// Copy R to WORK(IR), zero out below it
				dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WK, 1, ldwrkr, ir );
				dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WK, 1, ldwrkr, ir + 1 );

				// Generate Q in A
				dorgqr(M, N, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				ie = itau;
				itauq = ie + N;
				itaup = itauq + N;
				iwork = itaup + N;

				// Bidiagonalize R in WORK(IR)
				dgebrd( N, N, WK, 1, ldwrkr, ir, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

				// Generate left bidiag vectors in WORK(IR)
				dorgbr('apply-Q', N, N, N, WK, 1, ldwrkr, ir, WK, 1, itauq, WK, 1, iwork );
				iwork = ie + N;

				// Perform bidiagonal QR iteration. VT is a dummy; U lives in WORK(IR); C is a dummy.
				info = dbdsqr( 'upper', N, 0, N, 0, s, strideS, offsetS, WK, 1, ie, DUM, 1, 1, 0, WK, 1, ldwrkr, ir, DUM, 1, 1, 0, WK, 1, iwork );

				// Multiply Q by left bidiag vectors: A = Q * WORK(IR)

				// Process in chunks
				iu = ie + N;
				ldwrku = N;
				for ( i = 0; i < M; i += ldwrku ) {
					chunk = Math.min( M - i, ldwrku );
					dgemm( 'no-transpose', 'no-transpose', chunk, N, N, 1.0, A, sa1, sa2, offsetA + (i * sa1), WK, 1, ldwrkr, ir, 0.0, WK, 1, ldwrku, iu );
					dlacpy( 'full', chunk, N, WK, 1, ldwrku, iu, A, sa1, sa2, offsetA + (i * sa1) );
				}
			} else if ( wntuo && wntvas ) {
				// -------------------------------------------------------
				// Path 3: JOBU='O', JOBVT='S' or 'A'
				// Left singular vectors overwrite A, right vectors in VT
				// -------------------------------------------------------
				ir = 0;
				ldwrkr = N;
				itau = ir + (ldwrkr * N);
				iwork = itau + N;

				// Compute A = Q*R
				dgeqrf( M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				// Copy R to VT, zero below
				dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
				if ( N > 1 ) {
					dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, VT, svt1, svt2, offsetVT + svt1 );
				}

				// Generate Q in A
				dorgqr(M, N, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				ie = itau;
				itauq = ie + N;
				itaup = itauq + N;
				iwork = itaup + N;

				// Bidiagonalize R in VT
				dgebrd( N, N, VT, svt1, svt2, offsetVT, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

				// Copy lower bidiag of VT to WORK(IR) for left vectors
				dlacpy( 'lower', N, N, VT, svt1, svt2, offsetVT, WK, 1, ldwrkr, ir );

				// Generate left bidiag vectors in WORK(IR)
				dorgbr('apply-Q', N, N, N, WK, 1, ldwrkr, ir, WK, 1, itauq, WK, 1, iwork );

				// Generate right bidiag vectors in VT
				dorgbr('apply-P', N, N, N, VT, svt1, svt2, offsetVT, WK, 1, itaup, WK, 1, iwork );
				iwork = ie + N;

				// Perform bidiagonal QR iteration
				info = dbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, WK, 1, ie, VT, svt1, svt2, offsetVT, WK, 1, ldwrkr, ir, DUM, 1, 1, 0, WK, 1, iwork );

				// Multiply Q by left bidiag vectors
				iu = ie + N;
				ldwrku = N;
				for ( i = 0; i < M; i += ldwrku ) {
					chunk = Math.min( M - i, ldwrku );
					dgemm( 'no-transpose', 'no-transpose', chunk, N, N, 1.0, A, sa1, sa2, offsetA + (i * sa1), WK, 1, ldwrkr, ir, 0.0, WK, 1, ldwrku, iu );
					dlacpy( 'full', chunk, N, WK, 1, ldwrku, iu, A, sa1, sa2, offsetA + (i * sa1) );
				}
			} else if ( wntus ) {
				if ( wntvn ) {
					// -------------------------------------------------------
					// Path 4: JOBU='S', JOBVT='N'
					// Left singular vectors in U, no right vectors
					// -------------------------------------------------------
					ir = 0;
					ldwrkr = N;
					itau = ir + (ldwrkr * N);
					iwork = itau + N;

					// Compute A = Q*R
					dgeqrf( M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

					// Copy R to WORK(IR), zero below
					dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WK, 1, ldwrkr, ir );
					dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WK, 1, ldwrkr, ir + 1 );

					// Generate Q in A
					dorgqr(M, N, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

					ie = itau;
					itauq = ie + N;
					itaup = itauq + N;
					iwork = itaup + N;

					// Bidiagonalize R in WORK(IR)
					dgebrd( N, N, WK, 1, ldwrkr, ir, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

					// Generate left bidiag vectors in WORK(IR)
					dorgbr('apply-Q', N, N, N, WK, 1, ldwrkr, ir, WK, 1, itauq, WK, 1, iwork );
					iwork = ie + N;

					// Perform bidiagonal QR iteration
					info = dbdsqr( 'upper', N, 0, N, 0, s, strideS, offsetS, WK, 1, ie, DUM, 1, 1, 0, WK, 1, ldwrkr, ir, DUM, 1, 1, 0, WK, 1, iwork );

					// Multiply Q in A by bidiag vectors in WORK(IR) → U
					dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, A, sa1, sa2, offsetA, WK, 1, ldwrkr, ir, 0.0, U, su1, su2, offsetU );
				} else if ( wntvo ) {
					// -------------------------------------------------------
					// Path 5: JOBU='S', JOBVT='O'
					// Left vectors in U, right vectors overwrite A
					// -------------------------------------------------------
					iu = 0;
					ldwrku = N;
					ir = iu + (ldwrku * N);
					ldwrkr = N;
					itau = ir + (ldwrkr * N);
					iwork = itau + N;

					// Compute A = Q*R
					dgeqrf( M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

					// Copy R to WORK(IU), zero below
					dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WK, 1, ldwrku, iu );
					dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WK, 1, ldwrku, iu + 1 );

					// Generate Q in A
					dorgqr(M, N, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

					ie = itau;
					itauq = ie + N;
					itaup = itauq + N;
					iwork = itaup + N;

					// Bidiagonalize R in WORK(IU)
					dgebrd( N, N, WK, 1, ldwrku, iu, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

					// Copy upper bidiag to WORK(IR) for right vectors
					dlacpy( 'upper', N, N, WK, 1, ldwrku, iu, WK, 1, ldwrkr, ir );

					// Generate left bidiag vectors Q in WORK(IU)
					dorgbr('apply-Q', N, N, N, WK, 1, ldwrku, iu, WK, 1, itauq, WK, 1, iwork );

					// Generate right bidiag vectors P^T in WORK(IR)
					dorgbr('apply-P', N, N, N, WK, 1, ldwrkr, ir, WK, 1, itaup, WK, 1, iwork );
					iwork = ie + N;

					// Perform bidiagonal QR iteration. VT lives in WORK(IR); U lives in WORK(IU).
					info = dbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, WK, 1, ie, WK, 1, ldwrkr, ir, WK, 1, ldwrku, iu, DUM, 1, 1, 0, WK, 1, iwork );

					// Multiply Q by WORK(IU) → U
					dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, A, sa1, sa2, offsetA, WK, 1, ldwrku, iu, 0.0, U, su1, su2, offsetU );

					// Copy WORK(IR) (right vectors) → A
					dlacpy( 'full', N, N, WK, 1, ldwrkr, ir, A, sa1, sa2, offsetA );
				} else if ( wntvas ) {
					// -------------------------------------------------------
					// Path 6: JOBU='S', JOBVT='S' or 'A'
					// Left vectors in U, right vectors in VT
					// -------------------------------------------------------
					iu = 0;
					ldwrku = N;
					itau = iu + (ldwrku * N);
					iwork = itau + N;

					// Compute A = Q*R
					dgeqrf( M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

					// Copy R to WORK(IU), zero below
					dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WK, 1, ldwrku, iu );
					dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WK, 1, ldwrku, iu + 1 );

					// Generate Q in A
					dorgqr(M, N, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

					ie = itau;
					itauq = ie + N;
					itaup = itauq + N;
					iwork = itaup + N;

					// Bidiagonalize R in WORK(IU)
					dgebrd( N, N, WK, 1, ldwrku, iu, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

					// Copy upper bidiag to VT
					dlacpy( 'upper', N, N, WK, 1, ldwrku, iu, VT, svt1, svt2, offsetVT );

					// Generate left bidiag vectors in WORK(IU)
					dorgbr('apply-Q', N, N, N, WK, 1, ldwrku, iu, WK, 1, itauq, WK, 1, iwork );

					// Generate right bidiag vectors in VT
					dorgbr('apply-P', N, N, N, VT, svt1, svt2, offsetVT, WK, 1, itaup, WK, 1, iwork );
					iwork = ie + N;

					// Perform bidiagonal QR iteration
					info = dbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, WK, 1, ie, VT, svt1, svt2, offsetVT, WK, 1, ldwrku, iu, DUM, 1, 1, 0, WK, 1, iwork );

					// Multiply Q by WORK(IU) → U
					dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, A, sa1, sa2, offsetA, WK, 1, ldwrku, iu, 0.0, U, su1, su2, offsetU );
				}
			} else if ( wntua ) {
				if ( wntvn ) {
					// -------------------------------------------------------
					// Path 7: JOBU='A', JOBVT='N'
					// All M columns of U, no right vectors
					// -------------------------------------------------------
					ir = 0;
					ldwrkr = N;
					itau = ir + (ldwrkr * N);
					iwork = itau + N;

					// Compute A = Q*R
					dgeqrf( M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

					// Copy lower triangle of A to U
					dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );

					// Copy R to WORK(IR), zero below
					dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WK, 1, ldwrkr, ir );
					dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WK, 1, ldwrkr, ir + 1 );

					// Generate Q in U (M-by-M)
					dorgqr(M, M, N, U, su1, su2, offsetU, WK, 1, itau, WK, 1, iwork );

					ie = itau;
					itauq = ie + N;
					itaup = itauq + N;
					iwork = itaup + N;

					// Bidiagonalize R in WORK(IR)
					dgebrd( N, N, WK, 1, ldwrkr, ir, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

					// Generate left bidiag vectors in WORK(IR)
					dorgbr('apply-Q', N, N, N, WK, 1, ldwrkr, ir, WK, 1, itauq, WK, 1, iwork );
					iwork = ie + N;

					// Perform bidiagonal QR iteration
					info = dbdsqr( 'upper', N, 0, N, 0, s, strideS, offsetS, WK, 1, ie, DUM, 1, 1, 0, WK, 1, ldwrkr, ir, DUM, 1, 1, 0, WK, 1, iwork );

					// Multiply Q in U by bidiag vectors WORK(IR)

					// U = U * WORK(IR) — need temp space
					dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, U, su1, su2, offsetU, WK, 1, ldwrkr, ir, 0.0, A, sa1, sa2, offsetA );

					// Copy result back to U
					dlacpy( 'full', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
				} else if ( wntvo ) {
					// -------------------------------------------------------
					// Path 8: JOBU='A', JOBVT='O'
					// All M columns of U, right vectors overwrite A
					// -------------------------------------------------------
					iu = 0;
					ldwrku = N;
					ir = iu + (ldwrku * N);
					ldwrkr = N;
					itau = ir + (ldwrkr * N);
					iwork = itau + N;

					// Compute A = Q*R
					dgeqrf( M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

					// Copy lower triangle to U
					dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );

					// Generate Q in U (M-by-M)
					dorgqr(M, M, N, U, su1, su2, offsetU, WK, 1, itau, WK, 1, iwork );

					// Copy R to WORK(IU), zero below
					dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WK, 1, ldwrku, iu );
					dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WK, 1, ldwrku, iu + 1 );

					ie = itau;
					itauq = ie + N;
					itaup = itauq + N;
					iwork = itaup + N;

					// Bidiagonalize R in WORK(IU)
					dgebrd( N, N, WK, 1, ldwrku, iu, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

					// Copy upper bidiag to WORK(IR)
					dlacpy( 'upper', N, N, WK, 1, ldwrku, iu, WK, 1, ldwrkr, ir );

					// Generate left bidiag vectors in WORK(IU)
					dorgbr('apply-Q', N, N, N, WK, 1, ldwrku, iu, WK, 1, itauq, WK, 1, iwork );

					// Generate right bidiag vectors in WORK(IR)
					dorgbr('apply-P', N, N, N, WK, 1, ldwrkr, ir, WK, 1, itaup, WK, 1, iwork );
					iwork = ie + N;

					// Perform bidiagonal QR iteration
					info = dbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, WK, 1, ie, WK, 1, ldwrkr, ir, WK, 1, ldwrku, iu, DUM, 1, 1, 0, WK, 1, iwork );

					// U = U_full * WORK(IU) — use A as temp
					dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, U, su1, su2, offsetU, WK, 1, ldwrku, iu, 0.0, A, sa1, sa2, offsetA );
					dlacpy( 'full', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );

					// Copy WORK(IR) to A (right vectors overwrite A)
					dlacpy( 'full', N, N, WK, 1, ldwrkr, ir, A, sa1, sa2, offsetA );
				} else if ( wntvas ) {
					// -------------------------------------------------------
					// Path 9: JOBU='A', JOBVT='S' or 'A'
					// All M columns of U, right vectors in VT
					// -------------------------------------------------------
					iu = 0;
					ldwrku = N;
					itau = iu + (ldwrku * N);
					iwork = itau + N;

					// Compute A = Q*R
					dgeqrf( M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

					// Copy lower triangle to U
					dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );

					// Generate Q in U (M-by-M)
					dorgqr(M, M, N, U, su1, su2, offsetU, WK, 1, itau, WK, 1, iwork );

					// Copy R to WORK(IU), zero below
					dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WK, 1, ldwrku, iu );
					dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WK, 1, ldwrku, iu + 1 );

					ie = itau;
					itauq = ie + N;
					itaup = itauq + N;
					iwork = itaup + N;

					// Bidiagonalize R in WORK(IU)
					dgebrd( N, N, WK, 1, ldwrku, iu, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

					// Copy upper bidiag to VT
					dlacpy( 'upper', N, N, WK, 1, ldwrku, iu, VT, svt1, svt2, offsetVT );

					// Generate left bidiag vectors in WORK(IU)
					dorgbr('apply-Q', N, N, N, WK, 1, ldwrku, iu, WK, 1, itauq, WK, 1, iwork );

					// Generate right bidiag vectors in VT
					dorgbr('apply-P', N, N, N, VT, svt1, svt2, offsetVT, WK, 1, itaup, WK, 1, iwork );
					iwork = ie + N;

					// Perform bidiagonal QR iteration
					info = dbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, WK, 1, ie, VT, svt1, svt2, offsetVT, WK, 1, ldwrku, iu, DUM, 1, 1, 0, WK, 1, iwork );

					// U = U_full * WORK(IU) — use A as temp
					dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, U, su1, su2, offsetU, WK, 1, ldwrku, iu, 0.0, A, sa1, sa2, offsetA );
					dlacpy( 'full', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
				}
			}
		} else {
			// ---------------------------------------------------------------
			// Path 10: M >= N but M is not much larger than N
			// Direct bidiagonal reduction without QR
			// ---------------------------------------------------------------
			ie = 0;
			itauq = ie + N;
			itaup = itauq + N;
			iwork = itaup + N;

			// Bidiagonalize A
			dgebrd( M, N, A, sa1, sa2, offsetA, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

			if ( wntuas ) {
				// Copy lower triangle of A to U, generate Q
				dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
				ncu = ( wntus ) ? N : M;
				dorgbr('apply-Q', M, ncu, N, U, su1, su2, offsetU, WK, 1, itauq, WK, 1, iwork );
			}
			if ( wntvas ) {
				// Copy upper triangle of A to VT, generate P^T
				dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
				dorgbr('apply-P', N, N, N, VT, svt1, svt2, offsetVT, WK, 1, itaup, WK, 1, iwork );
			}
			if ( wntuo ) {
				// Generate Q in A
				dorgbr('apply-Q', M, N, N, A, sa1, sa2, offsetA, WK, 1, itauq, WK, 1, iwork );
			}
			if ( wntvo ) {
				// Generate P^T in A
				dorgbr('apply-P', N, N, N, A, sa1, sa2, offsetA, WK, 1, itaup, WK, 1, iwork );
			}
			iwork = ie + N;

			// Determine dimensions for DBDSQR
			nru = 0;
			ncvt = 0;
			if ( wntuas || wntuo ) {
				nru = M;
			}
			if ( wntvas || wntvo ) {
				ncvt = N;
			}

			// Perform bidiagonal SVD
			if ( !wntuo && !wntvo ) {
				// Neither U nor VT overwrite A
				info = dbdsqr( 'upper', N, ncvt, nru, 0, s, strideS, offsetS, WK, 1, ie, VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, DUM, 1, 1, 0, WK, 1, iwork );
			} else if ( !wntuo && wntvo ) {
				// VT overwrites A
				info = dbdsqr( 'upper', N, ncvt, nru, 0, s, strideS, offsetS, WK, 1, ie, A, sa1, sa2, offsetA, U, su1, su2, offsetU, DUM, 1, 1, 0, WK, 1, iwork );
			} else {
				// U overwrites A (wntuo), VT may be VT or A(wntvo)
				info = dbdsqr( 'upper', N, ncvt, nru, 0, s, strideS, offsetS, WK, 1, ie, VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, DUM, 1, 1, 0, WK, 1, iwork );
			}
		}
	} else if ( N >= mnthr ) {
		// -------------------------------------------------------------------
		// M < N: A has more columns than rows
		// -------------------------------------------------------------------

		// N is "much larger" than M — use LQ factorization path

		if ( wntvn ) {
			// -------------------------------------------------------
			// Path 1t: JOBVT='N', no right singular vectors
			// -------------------------------------------------------
			itau = 0;
			iwork = itau + M;

			// Compute A = L*Q
			dgelqf(M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

			// Zero out above L (upper triangle of first M columns)
			if ( M > 1 ) {
				dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, A, sa1, sa2, offsetA + sa2 );
			}
			ie = 0;
			itauq = ie + M;
			itaup = itauq + M;
			iwork = itaup + M;

			// Bidiagonalize L in A
			dgebrd( M, M, A, sa1, sa2, offsetA, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

			if ( wntuo || wntuas ) {
				// Generate Q from bidiag in A
				dorgbr('apply-Q', M, M, M, A, sa1, sa2, offsetA, WK, 1, itauq, WK, 1, iwork );
			}
			iwork = ie + M;
			nru = 0;
			if ( wntuo || wntuas ) {
				nru = M;
			}

			// Perform bidiagonal QR iteration
			info = dbdsqr( 'upper', M, 0, nru, 0, s, strideS, offsetS, WK, 1, ie, DUM, 1, 1, 0, A, sa1, sa2, offsetA, DUM, 1, 1, 0, WK, 1, iwork );

			// Copy U to the desired location
			if ( wntuas ) {
				dlacpy( 'full', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
			}
		} else if ( wntvo && wntun ) {
			// -------------------------------------------------------
			// Path 2t: JOBVT='O', JOBU='N'
			// Right vectors overwrite A, no left vectors
			// -------------------------------------------------------
			ir = 0;
			ldwrkr = M;
			itau = ir + (ldwrkr * M);
			iwork = itau + M;

			// Compute A = L*Q
			dgelqf(M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

			// Copy L to WORK(IR), zero above
			dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WK, 1, ldwrkr, ir );
			dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WK, 1, ldwrkr, ir + ldwrkr );

			// Generate Q in A
			dorglq(M, N, M, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

			ie = itau;
			itauq = ie + M;
			itaup = itauq + M;
			iwork = itaup + M;

			// Bidiagonalize L in WORK(IR)
			dgebrd( M, M, WK, 1, ldwrkr, ir, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

			// Generate right bidiag vectors P^T in WORK(IR)
			dorgbr('apply-P', M, M, M, WK, 1, ldwrkr, ir, WK, 1, itaup, WK, 1, iwork );
			iwork = ie + M;

			// Perform bidiagonal QR iteration
			info = dbdsqr( 'upper', M, M, 0, 0, s, strideS, offsetS, WK, 1, ie, WK, 1, ldwrkr, ir, DUM, 1, 1, 0, DUM, 1, 1, 0, WK, 1, iwork );

			// Multiply right vectors by Q: A = WORK(IR) * Q_stored_in_A

			// Process columns in chunks
			iu = ie + M;
			ldwrku = M;
			chunk = Math.max( 1, Math.floor( ( wsz - iu ) / M ) );
			for ( i = 0; i < N; i += chunk ) {
				blk = Math.min( N - i, chunk );
				dgemm( 'no-transpose', 'no-transpose', M, blk, M, 1.0, WK, 1, ldwrkr, ir, A, sa1, sa2, offsetA + (i * sa2), 0.0, WK, 1, ldwrku, iu );
				dlacpy( 'full', M, blk, WK, 1, ldwrku, iu, A, sa1, sa2, offsetA + (i * sa2) );
			}
		} else if ( wntvo && wntuas ) {
			// -------------------------------------------------------
			// Path 3t: JOBVT='O', JOBU='S' or 'A'
			// Right vectors overwrite A, left vectors in U
			// -------------------------------------------------------
			ir = 0;
			ldwrkr = M;
			itau = ir + (ldwrkr * M);
			iwork = itau + M;

			// Compute A = L*Q
			dgelqf(M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

			// Copy L to U, zero above
			dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
			dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, U, su1, su2, offsetU + su2 );

			// Generate Q in A
			dorglq(M, N, M, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

			ie = itau;
			itauq = ie + M;
			itaup = itauq + M;
			iwork = itaup + M;

			// Bidiagonalize L in U
			dgebrd( M, M, U, su1, su2, offsetU, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

			// Copy upper bidiag from U to WORK(IR)
			dlacpy( 'upper', M, M, U, su1, su2, offsetU, WK, 1, ldwrkr, ir );

			// Generate right bidiag vectors P^T in WORK(IR)
			dorgbr('apply-P', M, M, M, WK, 1, ldwrkr, ir, WK, 1, itaup, WK, 1, iwork );

			// Generate left bidiag vectors Q in U
			dorgbr('apply-Q', M, M, M, U, su1, su2, offsetU, WK, 1, itauq, WK, 1, iwork );
			iwork = ie + M;

			// Perform bidiagonal QR iteration
			info = dbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, WK, 1, ie, WK, 1, ldwrkr, ir, U, su1, su2, offsetU, DUM, 1, 1, 0, WK, 1, iwork );

			// Multiply right vectors by Q in A → A
			iu = ie + M;
			ldwrku = M;
			chunk = Math.max( 1, Math.floor( ( wsz - iu ) / M ) );
			for ( i = 0; i < N; i += chunk ) {
				blk = Math.min( N - i, chunk );
				dgemm( 'no-transpose', 'no-transpose', M, blk, M, 1.0, WK, 1, ldwrkr, ir, A, sa1, sa2, offsetA + (i * sa2), 0.0, WK, 1, ldwrku, iu );
				dlacpy( 'full', M, blk, WK, 1, ldwrku, iu, A, sa1, sa2, offsetA + (i * sa2) );
			}
		} else if ( wntvs ) {
			if ( wntun ) {
				// -------------------------------------------------------
				// Path 4t: JOBVT='S', JOBU='N'
				// Right vectors in VT (first M rows), no left vectors
				// -------------------------------------------------------
				ir = 0;
				ldwrkr = M;
				itau = ir + (ldwrkr * M);
				iwork = itau + M;

				// Compute A = L*Q
				dgelqf(M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				// Copy L to WORK(IR), zero above
				dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WK, 1, ldwrkr, ir );
				dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WK, 1, ldwrkr, ir + ldwrkr );

				// Generate Q (M rows) in A
				dorglq(M, N, M, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				ie = itau;
				itauq = ie + M;
				itaup = itauq + M;
				iwork = itaup + M;

				// Bidiagonalize L in WORK(IR)
				dgebrd( M, M, WK, 1, ldwrkr, ir, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

				// Generate right bidiag vectors P^T in WORK(IR)
				dorgbr('apply-P', M, M, M, WK, 1, ldwrkr, ir, WK, 1, itaup, WK, 1, iwork );
				iwork = ie + M;

				// Perform bidiagonal QR iteration
				info = dbdsqr( 'upper', M, M, 0, 0, s, strideS, offsetS, WK, 1, ie, WK, 1, ldwrkr, ir, DUM, 1, 1, 0, DUM, 1, 1, 0, WK, 1, iwork );

				// Multiply VT = WORK(IR) * Q (in A)
				dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, WK, 1, ldwrkr, ir, A, sa1, sa2, offsetA, 0.0, VT, svt1, svt2, offsetVT );
			} else if ( wntuo ) {
				// -------------------------------------------------------
				// Path 5t: JOBVT='S', JOBU='O'
				// Right vectors in VT, left vectors overwrite A
				// -------------------------------------------------------
				iu = 0;
				ldwrku = M;
				ir = iu + (ldwrku * M);
				ldwrkr = M;
				itau = ir + (ldwrkr * M);
				iwork = itau + M;

				// Compute A = L*Q
				dgelqf(M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				// Copy L to WORK(IU), zero above
				dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WK, 1, ldwrku, iu );
				dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WK, 1, ldwrku, iu + ldwrku );

				// Generate Q in A
				dorglq(M, N, M, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				ie = itau;
				itauq = ie + M;
				itaup = itauq + M;
				iwork = itaup + M;

				// Bidiagonalize L in WORK(IU)
				dgebrd( M, M, WK, 1, ldwrku, iu, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

				// Copy lower bidiag to WORK(IR) for left vectors
				dlacpy( 'lower', M, M, WK, 1, ldwrku, iu, WK, 1, ldwrkr, ir );

				// Generate right bidiag vectors P^T in WORK(IU)
				dorgbr('apply-P', M, M, M, WK, 1, ldwrku, iu, WK, 1, itaup, WK, 1, iwork );

				// Generate left bidiag vectors Q in WORK(IR)
				dorgbr('apply-Q', M, M, M, WK, 1, ldwrkr, ir, WK, 1, itauq, WK, 1, iwork );
				iwork = ie + M;

				// Perform bidiagonal QR iteration
				info = dbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, WK, 1, ie, WK, 1, ldwrku, iu, WK, 1, ldwrkr, ir, DUM, 1, 1, 0, WK, 1, iwork );

				// Multiply VT = WORK(IU) * Q (in A)
				dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, WK, 1, ldwrku, iu, A, sa1, sa2, offsetA, 0.0, VT, svt1, svt2, offsetVT );

				// Copy WORK(IR) to A (left vectors overwrite A)
				dlacpy( 'full', M, M, WK, 1, ldwrkr, ir, A, sa1, sa2, offsetA );
			} else if ( wntuas ) {
				// -------------------------------------------------------
				// Path 6t: JOBVT='S', JOBU='S' or 'A'
				// Right vectors in VT, left vectors in U
				// -------------------------------------------------------
				iu = 0;
				ldwrku = M;
				itau = iu + (ldwrku * M);
				iwork = itau + M;

				// Compute A = L*Q
				dgelqf(M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				// Copy L to WORK(IU), zero above
				dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WK, 1, ldwrku, iu );
				dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WK, 1, ldwrku, iu + ldwrku );

				// Generate Q in A
				dorglq(M, N, M, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				ie = itau;
				itauq = ie + M;
				itaup = itauq + M;
				iwork = itaup + M;

				// Bidiagonalize L in WORK(IU)
				dgebrd( M, M, WK, 1, ldwrku, iu, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

				// Copy lower bidiag to U
				dlacpy( 'lower', M, M, WK, 1, ldwrku, iu, U, su1, su2, offsetU );

				// Generate right bidiag vectors P^T in WORK(IU)
				dorgbr('apply-P', M, M, M, WK, 1, ldwrku, iu, WK, 1, itaup, WK, 1, iwork );

				// Generate left bidiag vectors Q in U
				dorgbr('apply-Q', M, M, M, U, su1, su2, offsetU, WK, 1, itauq, WK, 1, iwork );
				iwork = ie + M;

				// Perform bidiagonal QR iteration
				info = dbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, WK, 1, ie, WK, 1, ldwrku, iu, U, su1, su2, offsetU, DUM, 1, 1, 0, WK, 1, iwork );

				// Multiply VT = WORK(IU) * Q
				dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, WK, 1, ldwrku, iu, A, sa1, sa2, offsetA, 0.0, VT, svt1, svt2, offsetVT );
			}
		} else if ( wntva ) {
			if ( wntun ) {
				// -------------------------------------------------------
				// Path 7t: JOBVT='A', JOBU='N'
				// All N rows of V^T, no left vectors
				// -------------------------------------------------------
				ir = 0;
				ldwrkr = M;
				itau = ir + (ldwrkr * M);
				iwork = itau + M;

				// Compute A = L*Q
				dgelqf(M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				// Copy upper triangle of A to VT
				dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );

				// Copy L to WORK(IR), zero above
				dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WK, 1, ldwrkr, ir );
				dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WK, 1, ldwrkr, ir + ldwrkr );

				// Generate Q (N-by-N) in VT
				dorglq(N, N, M, VT, svt1, svt2, offsetVT, WK, 1, itau, WK, 1, iwork );

				ie = itau;
				itauq = ie + M;
				itaup = itauq + M;
				iwork = itaup + M;

				// Bidiagonalize L in WORK(IR)
				dgebrd( M, M, WK, 1, ldwrkr, ir, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

				// Generate right bidiag vectors P^T in WORK(IR)
				dorgbr('apply-P', M, M, M, WK, 1, ldwrkr, ir, WK, 1, itaup, WK, 1, iwork );
				iwork = ie + M;

				// Perform bidiagonal QR iteration
				info = dbdsqr( 'upper', M, M, 0, 0, s, strideS, offsetS, WK, 1, ie, WK, 1, ldwrkr, ir, DUM, 1, 1, 0, DUM, 1, 1, 0, WK, 1, iwork );

				// Multiply VT = WORK(IR) * VT — use A as temp
				dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, WK, 1, ldwrkr, ir, VT, svt1, svt2, offsetVT, 0.0, A, sa1, sa2, offsetA );
				dlacpy( 'full', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
			} else if ( wntuo ) {
				// -------------------------------------------------------
				// Path 8t: JOBVT='A', JOBU='O'
				// All N rows of V^T, left vectors overwrite A
				// -------------------------------------------------------
				iu = 0;
				ldwrku = M;
				ir = iu + (ldwrku * M);
				ldwrkr = M;
				itau = ir + (ldwrkr * M);
				iwork = itau + M;

				// Compute A = L*Q
				dgelqf(M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				// Copy upper triangle to VT
				dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );

				// Generate Q (N-by-N) in VT
				dorglq(N, N, M, VT, svt1, svt2, offsetVT, WK, 1, itau, WK, 1, iwork );

				// Copy L to WORK(IU), zero above
				dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WK, 1, ldwrku, iu );
				dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WK, 1, ldwrku, iu + ldwrku );

				ie = itau;
				itauq = ie + M;
				itaup = itauq + M;
				iwork = itaup + M;

				// Bidiagonalize L in WORK(IU)
				dgebrd( M, M, WK, 1, ldwrku, iu, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

				// Copy lower bidiag to WORK(IR)
				dlacpy( 'lower', M, M, WK, 1, ldwrku, iu, WK, 1, ldwrkr, ir );

				// Generate right bidiag vectors P^T in WORK(IU)
				dorgbr('apply-P', M, M, M, WK, 1, ldwrku, iu, WK, 1, itaup, WK, 1, iwork );

				// Generate left bidiag vectors Q in WORK(IR)
				dorgbr('apply-Q', M, M, M, WK, 1, ldwrkr, ir, WK, 1, itauq, WK, 1, iwork );
				iwork = ie + M;

				// Perform bidiagonal QR iteration
				info = dbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, WK, 1, ie, WK, 1, ldwrku, iu, WK, 1, ldwrkr, ir, DUM, 1, 1, 0, WK, 1, iwork );

				// Multiply VT = WORK(IU) * VT — use A as temp
				dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, WK, 1, ldwrku, iu, VT, svt1, svt2, offsetVT, 0.0, A, sa1, sa2, offsetA );
				dlacpy( 'full', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );

				// Copy WORK(IR) to A (left vectors overwrite A)
				dlacpy( 'full', M, M, WK, 1, ldwrkr, ir, A, sa1, sa2, offsetA );
			} else if ( wntuas ) {
				// -------------------------------------------------------
				// Path 9t: JOBVT='A', JOBU='S' or 'A'
				// All N rows of V^T, left vectors in U
				// -------------------------------------------------------
				iu = 0;
				ldwrku = M;
				itau = iu + (ldwrku * M);
				iwork = itau + M;

				// Compute A = L*Q
				dgelqf(M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork );

				// Copy upper triangle to VT
				dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );

				// Generate Q (N-by-N) in VT
				dorglq(N, N, M, VT, svt1, svt2, offsetVT, WK, 1, itau, WK, 1, iwork );

				// Copy L to WORK(IU), zero above
				dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WK, 1, ldwrku, iu );
				dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WK, 1, ldwrku, iu + ldwrku );

				ie = itau;
				itauq = ie + M;
				itaup = itauq + M;
				iwork = itaup + M;

				// Bidiagonalize L in WORK(IU)
				dgebrd( M, M, WK, 1, ldwrku, iu, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

				// Copy lower bidiag to U
				dlacpy( 'lower', M, M, WK, 1, ldwrku, iu, U, su1, su2, offsetU );

				// Generate right bidiag vectors P^T in WORK(IU)
				dorgbr('apply-P', M, M, M, WK, 1, ldwrku, iu, WK, 1, itaup, WK, 1, iwork );

				// Generate left bidiag vectors Q in U
				dorgbr('apply-Q', M, M, M, U, su1, su2, offsetU, WK, 1, itauq, WK, 1, iwork );
				iwork = ie + M;

				// Perform bidiagonal QR iteration
				info = dbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, WK, 1, ie, WK, 1, ldwrku, iu, U, su1, su2, offsetU, DUM, 1, 1, 0, WK, 1, iwork );

				// Multiply VT = WORK(IU) * VT — use A as temp
				dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, WK, 1, ldwrku, iu, VT, svt1, svt2, offsetVT, 0.0, A, sa1, sa2, offsetA );
				dlacpy( 'full', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
			}
		}
	} else {
		// ---------------------------------------------------------------
		// Path 10t: M < N but N is not much larger than M
		// Direct bidiagonal reduction without LQ
		// ---------------------------------------------------------------
		ie = 0;
		itauq = ie + M;
		itaup = itauq + M;
		iwork = itaup + M;

		// Bidiagonalize A (lower bidiagonal when M < N)
		dgebrd( M, N, A, sa1, sa2, offsetA, s, strideS, offsetS, WK, 1, ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork );

		if ( wntuas ) {
			// Copy lower triangle of A to U, generate Q
			dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
			dorgbr('apply-Q', M, M, N, U, su1, su2, offsetU, WK, 1, itauq, WK, 1, iwork );
		}
		if ( wntvas ) {
			// Copy upper triangle of A to VT, generate P^T
			dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
			nrvt = ( wntva ) ? N : M;
			dorgbr('apply-P', nrvt, N, M, VT, svt1, svt2, offsetVT, WK, 1, itaup, WK, 1, iwork );
		}
		if ( wntuo ) {
			// Generate Q in A
			dorgbr('apply-Q', M, M, N, A, sa1, sa2, offsetA, WK, 1, itauq, WK, 1, iwork );
		}
		if ( wntvo ) {
			// Generate P^T in A
			dorgbr('apply-P', M, N, M, A, sa1, sa2, offsetA, WK, 1, itaup, WK, 1, iwork );
		}
		iwork = ie + M;

		// Determine dimensions for DBDSQR
		nru = 0;
		ncvt = 0;
		if ( wntuas || wntuo ) {
			nru = M;
		}
		if ( wntvas || wntvo ) {
			ncvt = N;
		}

		// Perform bidiagonal SVD (lower bidiagonal when M < N)
		if ( !wntuo && !wntvo ) {
			info = dbdsqr( 'lower', M, ncvt, nru, 0, s, strideS, offsetS, WK, 1, ie, VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, DUM, 1, 1, 0, WK, 1, iwork );
		} else if ( !wntuo && wntvo ) {
			info = dbdsqr( 'lower', M, ncvt, nru, 0, s, strideS, offsetS, WK, 1, ie, A, sa1, sa2, offsetA, U, su1, su2, offsetU, DUM, 1, 1, 0, WK, 1, iwork );
		} else {
			info = dbdsqr( 'lower', M, ncvt, nru, 0, s, strideS, offsetS, WK, 1, ie, VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, DUM, 1, 1, 0, WK, 1, iwork );
		}
	}

	// Undo scaling if necessary
	if ( iscl === 1 ) {
		if ( anrm > bignum ) {
			dlascl( 'general', 0, 0, bignum, anrm, minmn, 1, s, strideS, 1, offsetS );
		}
		if ( info !== 0 && anrm > bignum ) {
			dlascl( 'general', 0, 0, bignum, anrm, minmn - 1, 1, WK, 1, 1, ie );
		}
		if ( anrm < smlnum ) {
			dlascl( 'general', 0, 0, smlnum, anrm, minmn, 1, s, strideS, 1, offsetS );
		}
		if ( info !== 0 && anrm < smlnum ) {
			dlascl( 'general', 0, 0, smlnum, anrm, minmn - 1, 1, WK, 1, 1, ie );
		}
	}

	return info;
}


// EXPORTS //

export default dgesvd;
