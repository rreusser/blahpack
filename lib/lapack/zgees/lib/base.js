/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import ilaenv from '../../ilaenv/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zgebal from '../../zgebal/lib/base.js';
import zgebak from '../../zgebak/lib/base.js';
import zgehrd from '../../zgehrd/lib/base.js';
import zunghr from '../../zunghr/lib/base.js';
import zhseqr, { computeOptimalWorkSize as zhseqrWorkOpt } from '../../zhseqr/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import ztrsen from '../../ztrsen/lib/base.js';
import zcopy from '../../../blas/zcopy/lib/base.js';


// VARIABLES //

const ZERO = 0.0;
const ONE = 1.0;

const EPS = dlamch( 'precision' );
const SMLNUM_RAW = dlamch( 'safe-minimum' );
const SMLNUM = Math.sqrt( SMLNUM_RAW ) / EPS;
const BIGNUM = ONE / SMLNUM;

// Size of zgehrd's T block, `LDT*NBMAX` (65*64): the part of zgehrd's optimum (`N*NB + TSIZE`) beyond its `N*NB` panel, which the reference driver's MAXWRK omits; the `null` allocation includes it so that zgehrd runs blocked at its full block size
const TSIZE = 4160;


// FUNCTIONS //

/**
* Returns the reference's optimal workspace length for ZGEES (MAXWRK, its workspace query), with the reference's ILAENV block sizes for ZGEHRD and ZUNGHR, zgehrd's `TSIZE` added, and zhseqr's LWKOPT.
*
* @private
* @param {('no-vectors'|'compute-vectors')} jobvs - whether Schur vectors are computed
* @param {NonNegativeInteger} N - order of the matrix
* @returns {PositiveInteger} optimal workspace length (complex elements)
*/
function computeOptimalWorkSize( jobvs, N ) {
	let maxwrk;
	if ( N === 0 ) {
		return 1;
	}
	maxwrk = N + ( N * ilaenv( 1, 'ZGEHRD', ' ', N, 1, N, 0 ) ) + TSIZE;
	if ( jobvs === 'compute-vectors' ) {
		maxwrk = Math.max( maxwrk, N + ( ( N - 1 ) * ilaenv( 1, 'ZUNGHR', ' ', N, 1, N, -1 ) ) );
	}
	return Math.max( maxwrk, zhseqrWorkOpt( N, 1, N ), 2 * N );
}


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
* @param {('no-vectors'|'compute-vectors')} jobvs - `'none'` or `'compute-vectors'`
* @param {('none'|'sort')} sort - `'none'` or `'sort'`
* @param {Function} select - function(w) returning boolean, where w is Complex128; used when sort=`'sort'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - N-by-N matrix, overwritten with Schur form T on exit
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Int32Array} sdim - output: sdim[0] = number of eigenvalues for which SELECT is true
* @param {Complex128Array} W - output: eigenvalues
* @param {integer} strideW - stride for W (complex elements)
* @param {NonNegativeInteger} offsetW - starting index for W (complex elements)
* @param {Complex128Array} VS - output: N-by-N matrix of Schur vectors (if jobvs=`'compute-vectors'`)
* @param {integer} strideVS1 - stride of first dimension of VS (complex elements)
* @param {integer} strideVS2 - stride of second dimension of VS (complex elements)
* @param {NonNegativeInteger} offsetVS - starting index for VS (complex elements)
* @param {Complex128Array} WORK - workspace of at least `max(1,2*N)` complex elements
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of length N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @param {Uint8Array} BWORK - boolean workspace of length N (used when sort=`'sort'`)
* @param {integer} strideBWork - stride for BWORK
* @param {NonNegativeInteger} offsetBWork - starting index for BWORK
* @returns {integer} info (0=success, >0 = failure)
*/
function zgees( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, W, strideW, offsetW, VS, strideVS1, strideVS2, offsetVS, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, BWORK, strideBWork, offsetBWork ) {
	const iloOut = new Int32Array( 1 );
	const ihiOut = new Int32Array( 1 );
	let scalea, cscale, icond, info, iwrk, SEP, Wv, sw, oW, M, S, i;

	info = 0;
	const wantvs = ( jobvs === 'compute-vectors' );
	const wantst = ( sort === 'sort' );


	// Quick return
	if ( N === 0 ) {
		sdim[ 0 ] = 0;
		return info;
	}

	// Scale matrix
	const DUM = new Float64Array( 1 );
	const anrm = zlange( 'max', N, N, A, strideA1, strideA2, offsetA, DUM, 1, 0 );
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
	const ibal = 0;
	zgebal( 'permute', N, A, strideA1, strideA2, offsetA, iloOut, ihiOut, RWORK, strideRWork, offsetRWork + ibal * strideRWork );
	const ilo = iloOut[ 0 ]; // 1-based
	const ihi = ihiOut[ 0 ]; // 1-based

	// Reduce to upper Hessenberg form

	// WORK layout: [TAU(0..N-1), workspace...]
	const itau = 0; // offset in WORK for TAU (in complex elements)
	iwrk = N + itau;
	zgehrd( N, ilo, ihi, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork + itau * strideWork, WORK, strideWork, offsetWork + iwrk * strideWork );

	if ( wantvs ) {
		// Copy Hessenberg form to VS
		zlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VS, strideVS1, strideVS2, offsetVS );

		// Generate unitary matrix in VS
		zunghr( N, ilo, ihi, VS, strideVS1, strideVS2, offsetVS, WORK, strideWork, offsetWork + itau * strideWork, WORK, strideWork, offsetWork + iwrk * strideWork );
	}

	sdim[ 0 ] = 0;

	// Compute Schur form
	iwrk = itau;
	const ieval = zhseqr( 'schur', ( wantvs ) ? 'update' : 'none', N, ilo, ihi, A, strideA1, strideA2, offsetA, W, strideW, offsetW, VS, strideVS1, strideVS2, offsetVS, WORK, strideWork, offsetWork + iwrk * strideWork );
	if ( ieval > 0 ) {
		info = ieval;
	}

	// Sort eigenvalues if requested
	if ( wantst && info === 0 ) {
		if ( scalea ) {
			zlascl( 'general', 0, 0, cscale, anrm, N, 1, W, strideW, strideW, offsetW );
		}

		Wv = reinterpret( W, 0 );
		sw = strideW * 2;
		oW = offsetW * 2;

		for ( i = 0; i < N; i++ ) {
			BWORK[ offsetBWork + i * strideBWork ] = ( select( new Complex128( Wv[ oW + i * sw ], Wv[ oW + i * sw + 1 ] ) ) ) ? 1 : 0;
		}

		// Reorder Schur form
		M = new Int32Array( 1 );
		S = new Float64Array( 1 );
		SEP = new Float64Array( 1 );
		icond = ztrsen( 'none', ( wantvs ) ? 'update' : 'none', BWORK, strideBWork, offsetBWork, N, A, strideA1, strideA2, offsetA, VS, strideVS1, strideVS2, offsetVS, W, strideW, offsetW, M, S, SEP, WORK, strideWork, offsetWork + iwrk * strideWork );
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
export { computeOptimalWorkSize };
