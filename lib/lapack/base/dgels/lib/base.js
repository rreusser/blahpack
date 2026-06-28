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

/* eslint-disable max-len, max-params */

// MODULES //

import dgeqrf from '../../dgeqrf/lib/base.js';
import dgelqf from '../../dgelqf/lib/base.js';
import dormqr from '../../dormqr/lib/base.js';
import dormlq from '../../dormlq/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dtrtrs from '../../dtrtrs/lib/base.js';


// MAIN //

/**
* Solves overdetermined or underdetermined real linear systems involving an.
* M-by-N matrix A, or its transpose, using a QR or LQ factorization of A.
*
* It is assumed that A has full rank.
*
* The following options are provided:
*
* 1.  If TRANS = 'N' and M >= N: find the least squares solution of an
*     overdetermined system, i.e., solve the least squares problem:
*     minimize || B - A*X ||
*
* 2.  If TRANS = 'N' and M < N: find the minimum norm solution of an
*     underdetermined system A * X = B.
*
* 3.  If TRANS = 'T' and M >= N: find the minimum norm solution of an
*     underdetermined system A^T * X = B.
*
* 4.  If TRANS = 'T' and M < N: find the least squares solution of an
*     overdetermined system, i.e., solve the least squares problem:
*     minimize || B - A^T * X ||
*
* Several right hand side vectors b and solution vectors x can be handled
* in a single call; they are stored as columns of the M-by-NRHS right
* hand side matrix B and the N-by-NRHS solution matrix X.
*
* @private
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} A - M-by-N matrix, overwritten with factorization on exit
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - on entry, M-by-NRHS (or N-by-NRHS) RHS matrix; on exit, solution
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} work - caller-provided workspace array of length at least `MN + max(MN,nrhs)*NB`
* @param {integer} strideWork - stride for work
* @param {NonNegativeInteger} offsetWork - starting index for work
* @returns {integer} info - 0 if successful, >0 if the i-th diagonal element of the triangular factor is zero (matrix not full rank)
*/
function dgels( trans, M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, work, strideWork, offsetWork ) {
	var scllen;
	var bignum;
	var smlnum;
	var iascl;
	var ibscl;
	var brow;
	var anrm;
	var bnrm;
	var tpsd;
	var info;
	var WORK;
	var MN;
	var bi;
	var i;
	var j;

	MN = Math.min( M, N );

	tpsd = ( trans === 'transpose' );

	// Quick return if dimensions are zero
	if ( MN === 0 || nrhs === 0 ) {
		dlaset( 'full', Math.max( M, N ), nrhs, 0.0, 0.0, B, strideB1, strideB2, offsetB );
		return 0;
	}

	// Use caller-provided workspace, offset to the start of the usable region.
	// Mirror Fortran layout: WORK(0:MN-1) holds TAU, WORK(MN:) is factorization scratch.
	WORK = ( offsetWork === 0 ) ? work : work.subarray( offsetWork );

	// Get machine parameters
	smlnum = dlamch( 'safe-minimum' ) / dlamch( 'precision' );
	bignum = 1.0 / smlnum;

	// Scale A if max element is outside [smlnum, bignum]
	anrm = dlange( 'max', M, N, A, strideA1, strideA2, offsetA, WORK, 1, MN );
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
		dlaset( 'full', Math.max( M, N ), nrhs, 0.0, 0.0, B, strideB1, strideB2, offsetB );
		return 0;
	}

	// Scale B
	brow = ( tpsd ) ? N : M;
	bnrm = dlange( 'max', brow, nrhs, B, strideB1, strideB2, offsetB, WORK, 1, MN );
	ibscl = 0;
	if ( bnrm > 0.0 && bnrm < smlnum ) {
		// Scale matrix norm up to smlnum
		dlascl( 'general', 0, 0, bnrm, smlnum, brow, nrhs, B, strideB1, strideB2, offsetB );
		ibscl = 1;
	} else if ( bnrm > bignum ) {
		// Scale matrix norm down to bignum
		dlascl( 'general', 0, 0, bnrm, bignum, brow, nrhs, B, strideB1, strideB2, offsetB );
		ibscl = 2;
	}

	if ( M >= N ) {
		// M >= N: QR factorization of A
		// A = Q * R
		dgeqrf( M, N, A, strideA1, strideA2, offsetA, WORK, 1, 0, WORK, 1, MN );

		if ( tpsd ) {
			// Minimum norm problem: min || X || s.t. A^T * X = B

			// Solve R^T * Y = B(1:N,1:NRHS)
			info = dtrtrs( 'upper', 'transpose', 'non-unit', N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );
			if ( info > 0 ) {
				return info;
			}

			// Zero out B(N+1:M,1:NRHS)
			for ( j = 0; j < nrhs; j++ ) {
				bi = offsetB + (j * strideB2) + (N * strideB1);
				for ( i = N; i < M; i++ ) {
					B[ bi ] = 0.0;
					bi += strideB1;
				}
			}

			// B(1:M,1:NRHS) := Q * B(1:M,1:NRHS)
			dormqr('left', 'no-transpose', M, nrhs, N, A, strideA1, strideA2, offsetA, WORK, 1, 0, B, strideB1, strideB2, offsetB, WORK, 1, MN );

			scllen = M;
		} else {
			// Least squares problem: minimize || b - A*x ||

			// B(1:M,1:NRHS) := Q^T * B(1:M,1:NRHS)
			dormqr('left', 'transpose', M, nrhs, N, A, strideA1, strideA2, offsetA, WORK, 1, 0, B, strideB1, strideB2, offsetB, WORK, 1, MN );

			// Solve R*X = B(1:N,1:NRHS)
			info = dtrtrs( 'upper', 'no-transpose', 'non-unit', N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );
			if ( info > 0 ) {
				return info;
			}

			scllen = N;
		}
	} else {
		// M < N: LQ factorization of A
		// A = L * Q
		dgelqf( M, N, A, strideA1, strideA2, offsetA, WORK, 1, 0, WORK, 1, MN );

		if ( tpsd ) {
			// Least squares problem: minimize || b - A^T*x ||

			// B(1:N,1:NRHS) := Q * B(1:N,1:NRHS)
			dormlq('left', 'no-transpose', N, nrhs, M, A, strideA1, strideA2, offsetA, WORK, 1, 0, B, strideB1, strideB2, offsetB, WORK, 1, MN );

			// Solve L^T * X = B(1:M,1:NRHS)
			info = dtrtrs( 'lower', 'transpose', 'non-unit', M, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );
			if ( info > 0 ) {
				return info;
			}

			scllen = M;
		} else {
			// Minimum norm problem: min || X || s.t. A * X = B

			// Solve L * Y = B(1:M,1:NRHS)
			info = dtrtrs( 'lower', 'no-transpose', 'non-unit', M, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );
			if ( info > 0 ) {
				return info;
			}

			// Zero out B(M+1:N,1:NRHS)
			for ( j = 0; j < nrhs; j++ ) {
				bi = offsetB + (j * strideB2) + (M * strideB1);
				for ( i = M; i < N; i++ ) {
					B[ bi ] = 0.0;
					bi += strideB1;
				}
			}

			// B(1:N,1:NRHS) := Q^T * B(1:N,1:NRHS)
			dormlq('left', 'transpose', N, nrhs, M, A, strideA1, strideA2, offsetA, WORK, 1, 0, B, strideB1, strideB2, offsetB, WORK, 1, MN );

			scllen = N;
		}
	}

	// Undo scaling
	if ( iascl === 1 ) {
		dlascl( 'general', 0, 0, anrm, smlnum, scllen, nrhs, B, strideB1, strideB2, offsetB );
	} else if ( iascl === 2 ) {
		dlascl( 'general', 0, 0, anrm, bignum, scllen, nrhs, B, strideB1, strideB2, offsetB );
	}
	if ( ibscl === 1 ) {
		dlascl( 'general', 0, 0, smlnum, bnrm, scllen, nrhs, B, strideB1, strideB2, offsetB );
	} else if ( ibscl === 2 ) {
		dlascl( 'general', 0, 0, bignum, bnrm, scllen, nrhs, B, strideB1, strideB2, offsetB );
	}

	return 0;
}


// EXPORTS //

export default dgels;
