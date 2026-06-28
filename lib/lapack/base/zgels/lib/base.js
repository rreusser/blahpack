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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqrf from '../../zgeqrf/lib/base.js';
import zgelqf from '../../zgelqf/lib/base.js';
import zunmqr from '../../zunmqr/lib/base.js';
import zunmlq from '../../zunmlq/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import ztrtrs from '../../ztrtrs/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );
var smlnum = dlamch( 'safe-minimum' ) / dlamch( 'precision' );
var bignum = 1.0 / smlnum;


// MAIN //

/**
* Solves overdetermined or underdetermined complex linear systems involving an.
* M-by-N matrix A, or its conjugate transpose, using a QR or LQ factorization
* of A. It is assumed that A has full rank.
*
* The following options are provided:
*
* 1. If TRANS = 'no-transpose' and M >= N: find the least squares solution of
*    an overdetermined system, i.e., solve the least squares problem:
*    minimize || B - A*X ||.
*
* 2. If TRANS = 'no-transpose' and M < N: find the minimum norm solution of
*    an underdetermined system A * X = B.
*
* 3. If TRANS = 'conjugate-transpose' and M >= N: find the minimum norm
*    solution of an underdetermined system A^H * X = B.
*
* 4. If TRANS = 'conjugate-transpose' and M < N: find the least squares
*    solution of an overdetermined system, i.e., solve the least squares
*    problem: minimize || B - A^H * X ||.
*
* @private
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Complex128Array} A - M-by-N matrix, overwritten with factorization on exit
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - on entry, RHS matrix; on exit, solution
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} WORK - workspace (or null for internal allocation)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {integer} lwork - workspace length
* @returns {integer} info - 0 if successful, >0 if the i-th diagonal element of the triangular factor is zero
*/
function zgels( trans, M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line max-len
	var scllen;
	var iascl;
	var ibscl;
	var brow;
	var anrm;
	var bnrm;
	var tpsd;
	var info;
	var TAU;
	var Bv;
	var MN;
	var bi;
	var i;
	var j;

	MN = Math.min( M, N );

	tpsd = ( trans === 'conjugate-transpose' );

	// Quick return if dimensions are zero
	if ( MN === 0 || nrhs === 0 ) {
		zlaset( 'full', Math.max( M, N ), nrhs, CZERO, CZERO, B, strideB1, strideB2, offsetB );
		return 0;
	}

	// Allocate TAU array (length MN, complex)
	TAU = new Complex128Array( MN );

	// Allocate internal WORK if needed
	if ( WORK === null ) {
		WORK = new Complex128Array( MN + ( Math.max( MN, nrhs ) * 32 ) );
	}

	// Scale A if max element is outside [smlnum, bignum]
	anrm = zlange( 'max', M, N, A, strideA1, strideA2, offsetA, null, 1, 0 );
	iascl = 0;
	if ( anrm > 0.0 && anrm < smlnum ) {
		zlascl( 'general', 0, 0, anrm, smlnum, M, N, A, strideA1, strideA2, offsetA );
		iascl = 1;
	} else if ( anrm > bignum ) {
		zlascl( 'general', 0, 0, anrm, bignum, M, N, A, strideA1, strideA2, offsetA );
		iascl = 2;
	} else if ( anrm === 0.0 ) {
		// Matrix all zero. Return zero solution.
		zlaset( 'full', Math.max( M, N ), nrhs, CZERO, CZERO, B, strideB1, strideB2, offsetB );
		return 0;
	}

	// Scale B
	brow = ( tpsd ) ? N : M;
	bnrm = zlange( 'max', brow, nrhs, B, strideB1, strideB2, offsetB, null, 1, 0 );
	ibscl = 0;
	if ( bnrm > 0.0 && bnrm < smlnum ) {
		zlascl( 'general', 0, 0, bnrm, smlnum, brow, nrhs, B, strideB1, strideB2, offsetB );
		ibscl = 1;
	} else if ( bnrm > bignum ) {
		zlascl( 'general', 0, 0, bnrm, bignum, brow, nrhs, B, strideB1, strideB2, offsetB );
		ibscl = 2;
	}

	Bv = reinterpret( B, 0 );

	if ( M >= N ) {
		// M >= N: QR factorization of A
		zgeqrf( M, N, A, strideA1, strideA2, offsetA, TAU, 1, 0, WORK, 1, 0 );

		if ( !tpsd ) {
			// Case 1: Least squares: minimize || B - A*X ||

			// B := Q^H * B
			zunmqr( 'left', 'conjugate-transpose', M, nrhs, N, A, strideA1, strideA2, offsetA, TAU, 1, 0, B, strideB1, strideB2, offsetB, WORK, 1, 0 );

			// Solve R*X = B(1:N,1:NRHS)
			info = ztrtrs( 'upper', 'no-transpose', 'non-unit', N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );
			if ( info > 0 ) {
				return info;
			}

			scllen = N;
		} else {
			// Case 3: Minimum norm: min || X || s.t. A^H * X = B

			// Solve R^H * Y = B(1:N,1:NRHS)
			info = ztrtrs( 'upper', 'conjugate-transpose', 'non-unit', N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );
			if ( info > 0 ) {
				return info;
			}

			// Zero out B(N+1:M,1:NRHS) using Float64 view
			for ( j = 0; j < nrhs; j++ ) {
				bi = ( offsetB + (j * strideB2) + (N * strideB1) ) * 2;
				for ( i = N; i < M; i++ ) {
					Bv[ bi ] = 0.0;
					Bv[ bi + 1 ] = 0.0;
					bi += strideB1 * 2;
				}
			}

			// B := Q * B
			zunmqr( 'left', 'no-transpose', M, nrhs, N, A, strideA1, strideA2, offsetA, TAU, 1, 0, B, strideB1, strideB2, offsetB, WORK, 1, 0 );

			scllen = M;
		}
	} else {
		// M < N: LQ factorization of A
		zgelqf( M, N, A, strideA1, strideA2, offsetA, TAU, 1, 0, WORK, 1, 0 );

		if ( !tpsd ) {
			// Case 2: Minimum norm: min || X || s.t. A * X = B

			// Solve L * Y = B(1:M,1:NRHS)
			info = ztrtrs( 'lower', 'no-transpose', 'non-unit', M, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );
			if ( info > 0 ) {
				return info;
			}

			// Zero out B(M+1:N,1:NRHS) using Float64 view
			for ( j = 0; j < nrhs; j++ ) {
				bi = ( offsetB + (j * strideB2) + (M * strideB1) ) * 2;
				for ( i = M; i < N; i++ ) {
					Bv[ bi ] = 0.0;
					Bv[ bi + 1 ] = 0.0;
					bi += strideB1 * 2;
				}
			}

			// B := Q^H * B
			zunmlq( 'left', 'conjugate-transpose', N, nrhs, M, A, strideA1, strideA2, offsetA, TAU, 1, 0, B, strideB1, strideB2, offsetB, WORK, 1, 0 );

			scllen = N;
		} else {
			// Case 4: Least squares: minimize || B - A^H*X ||

			// B := Q * B
			zunmlq( 'left', 'no-transpose', N, nrhs, M, A, strideA1, strideA2, offsetA, TAU, 1, 0, B, strideB1, strideB2, offsetB, WORK, 1, 0 );

			// Solve L^H * X = B(1:M,1:NRHS)
			info = ztrtrs( 'lower', 'conjugate-transpose', 'non-unit', M, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );
			if ( info > 0 ) {
				return info;
			}

			scllen = M;
		}
	}

	// Undo scaling
	if ( iascl === 1 ) {
		zlascl( 'general', 0, 0, anrm, smlnum, scllen, nrhs, B, strideB1, strideB2, offsetB );
	} else if ( iascl === 2 ) {
		zlascl( 'general', 0, 0, anrm, bignum, scllen, nrhs, B, strideB1, strideB2, offsetB );
	}
	if ( ibscl === 1 ) {
		zlascl( 'general', 0, 0, smlnum, bnrm, scllen, nrhs, B, strideB1, strideB2, offsetB );
	} else if ( ibscl === 2 ) {
		zlascl( 'general', 0, 0, bignum, bnrm, scllen, nrhs, B, strideB1, strideB2, offsetB );
	}

	return 0;
}


// EXPORTS //

export default zgels;
