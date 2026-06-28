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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zgebal from '../../zgebal/lib/base.js';
import zgebak from '../../zgebak/lib/base.js';
import zgehrd from '../../zgehrd/lib/base.js';
import zunghr from '../../zunghr/lib/base.js';
import zhseqr from '../../zhseqr/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import ztrsen from '../../ztrsen/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

var EPS = dlamch( 'precision' );
var SMLNUM_RAW = dlamch( 'safe-minimum' );
var SMLNUM = Math.sqrt( SMLNUM_RAW ) / EPS;
var BIGNUM = ONE / SMLNUM;


// MAIN //

/**
* Computes for an N-by-N complex nonsymmetric matrix A, the eigenvalues.
* the Schur form T, and, optionally, the matrix of Schur vectors Z.
* This gives the Schur factorization A = Z_T_(Z**H).
*
* Optionally, it also orders the eigenvalues on the diagonal of the Schur
* form so that selected eigenvalues are at the top left. The leading columns
* of Z then form an orthonormal basis for the invariant subspace corresponding
* to the selected eigenvalues.
*
* A complex matrix is in Schur form if it is upper triangular.
*
* @private
* @param {string} jobvs - `'none'` or `'compute-vectors'`
* @param {string} sort - `'none'` or `'sort'`
* @param {Function} select - function(w) returning boolean, where w is Complex128; used when sort=`'sort'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - N-by-N matrix, overwritten with Schur form T on exit
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Float64Array} sdim - output: sdim[0] = number of eigenvalues for which SELECT is true
* @param {Complex128Array} W - output: eigenvalues
* @param {integer} strideW - stride for W (complex elements)
* @param {NonNegativeInteger} offsetW - starting index for W (complex elements)
* @param {Complex128Array} VS - output: N-by-N matrix of Schur vectors (if jobvs=`'compute-vectors'`)
* @param {integer} strideVS1 - stride of first dimension of VS (complex elements)
* @param {integer} strideVS2 - stride of second dimension of VS (complex elements)
* @param {NonNegativeInteger} offsetVS - starting index for VS (complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {integer} lwork - workspace length (complex elements)
* @param {Float64Array} RWORK - real workspace of length N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @param {Uint8Array} BWORK - boolean workspace of length N (used when sort=`'sort'`)
* @param {integer} strideBWORK - stride for BWORK
* @param {NonNegativeInteger} offsetBWORK - starting index for BWORK
* @returns {integer} info (0=success, >0 = failure)
*/
function zgees( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, W, strideW, offsetW, VS, strideVS1, strideVS2, offsetVS, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork, BWORK, strideBWORK, offsetBWORK ) {
	var wantvs;
	var wantst;
	var scalea;
	var cscale;
	var balRes;
	var icond;
	var ieval;
	var anrm;
	var info;
	var ibal;
	var itau;
	var iwrk;
	var ilo;
	var ihi;
	var DUM;
	var SEP;
	var Wv;
	var sw;
	var oW;
	var M;
	var S;
	var i;

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
	anrm = zlange( 'max', N, N, A, strideA1, strideA2, offsetA, DUM, 1, 0 );
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
		zlascl( 'general', 0, 0, anrm, cscale, N, N, A, strideA1, strideA2, offsetA );
	}

	// Balance the matrix
	// RWORK is used for balance SCALE array
	ibal = 0;
	balRes = zgebal( 'permute', N, A, strideA1, strideA2, offsetA, RWORK, strideRWork, offsetRWork + ibal * strideRWork );
	ilo = balRes.ilo; // 1-based
	ihi = balRes.ihi; // 1-based

	// Reduce to upper Hessenberg form

	// WORK layout: [TAU(0..N-1), workspace...]
	itau = 0; // offset in WORK for TAU (in complex elements)
	iwrk = N + itau;
	zgehrd( N, ilo, ihi, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork + itau * strideWork, WORK, strideWork, offsetWork + iwrk * strideWork );

	if ( wantvs ) {
		// Copy Hessenberg form to VS
		zlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VS, strideVS1, strideVS2, offsetVS );

		// Generate unitary matrix in VS
		zunghr( N, ilo, ihi, VS, strideVS1, strideVS2, offsetVS, WORK, strideWork, offsetWork + itau * strideWork, WORK, strideWork, offsetWork + iwrk * strideWork, lwork - iwrk );
	}

	sdim[ 0 ] = 0;

	// Compute Schur form
	iwrk = itau;
	ieval = zhseqr( 'schur', ( wantvs ) ? 'update' : 'none', N, ilo, ihi, A, strideA1, strideA2, offsetA, W, strideW, offsetW, VS, strideVS1, strideVS2, offsetVS, WORK, strideWork, offsetWork + iwrk * strideWork, lwork - iwrk );
	if ( ieval > 0 ) {
		info = ieval;
	}

	// Sort eigenvalues if requested
	if ( wantst && info === 0 ) {
		if ( scalea ) {
			zlascl( 'general', 0, 0, cscale, anrm, N, 1, W, 1, strideW, offsetW );
		}

		Wv = reinterpret( W, 0 );
		sw = strideW * 2;
		oW = offsetW * 2;

		for ( i = 0; i < N; i++ ) {
			BWORK[ offsetBWORK + i * strideBWORK ] = ( select( new Complex128( Wv[ oW + i * sw ], Wv[ oW + i * sw + 1 ] ) ) ) ? 1 : 0;
		}

		// Reorder Schur form
		M = new Float64Array( 1 );
		S = new Float64Array( 1 );
		SEP = new Float64Array( 1 );
		icond = ztrsen( 'none', ( wantvs ) ? 'update' : 'none', BWORK, strideBWORK, offsetBWORK, N, A, strideA1, strideA2, offsetA, VS, strideVS1, strideVS2, offsetVS, W, strideW, offsetW, M, S, SEP, WORK, strideWork, offsetWork + iwrk * strideWork, lwork - iwrk );
		sdim[ 0 ] = M[ 0 ];
		if ( icond > 0 ) {
			info = N + icond;
		}
	}

	if ( wantvs ) {
		// Undo balancing of Schur vectors
		zgebak( 'permute', 'right', N, ilo, ihi, RWORK, strideRWork, offsetRWork + ibal * strideRWork, N, VS, strideVS1, strideVS2, offsetVS );
	}

	if ( scalea ) {
		// Undo scaling for the Schur form of A
		zlascl( 'upper', 0, 0, cscale, anrm, N, N, A, strideA1, strideA2, offsetA );

		// Re-extract diagonal eigenvalues
		zcopy( N, A, strideA1 + strideA2, offsetA, W, strideW, offsetW );
	}

	return info;
}


// EXPORTS //

export default zgees;
