/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-depth, max-statements, no-mixed-operators, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import ilaenv from '../../ilaenv/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dznrm2 from '../../../../blas/base/dznrm2/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zgebal from '../../zgebal/lib/base.js';
import zgebak from '../../zgebak/lib/base.js';
import zgehrd from '../../zgehrd/lib/base.js';
import zunghr from '../../zunghr/lib/base.js';
import zhseqr, { computeOptimalWorkSize as zhseqrWorkOpt } from '../../zhseqr/lib/base.js';
import ztrevc3, { computeOptimalWorkSize as ztrevc3WorkOpt } from '../../ztrevc3/lib/base.js';
import ztrsna from '../../ztrsna/lib/base.js';


// VARIABLES //

const ZERO = 0.0;
const ONE = 1.0;

// Machine constants (hoisted to module scope)
const EPS = dlamch( 'precision' );
const SMLNUM_BASE = dlamch( 'safe-minimum' );
const SMLNUM = Math.sqrt( SMLNUM_BASE ) / EPS;
const BIGNUM = ONE / SMLNUM;

// Size of zgehrd's T block, `LDT*NBMAX` (65*64): the part of zgehrd's optimum (`N*NB + TSIZE`) beyond its `N*NB` panel, which the reference driver's MAXWRK omits; the `null` allocation includes it so that zgehrd runs blocked at its full block size
const TSIZE = 4160;


// FUNCTIONS //

/**
* Returns the reference's minimum workspace length for ZGEEVX (MINWRK): `2*N`, and `N*N + 2*N` when SENSE is `'right-vectors'` or `'both'`.
*
* @private
* @param {('none'|'eigenvalues'|'right-vectors'|'both')} sense - which condition numbers are computed
* @param {NonNegativeInteger} N - order of the matrix
* @returns {PositiveInteger} minimum workspace length (complex elements)
*/
function computeMinimalWorkSize( sense, N ) {
	if ( N === 0 ) {
		return 1;
	}
	if ( sense === 'right-vectors' || sense === 'both' ) {
		return Math.max( 2 * N, ( N * N ) + ( 2 * N ) );
	}
	return 2 * N;
}

/**
* Returns the reference's optimal workspace length for ZGEEVX (MAXWRK, its workspace query), with the reference's ILAENV block sizes for ZGEHRD and ZUNGHR, zgehrd's `TSIZE` added, ztrevc3's optimum and zhseqr's LWKOPT.
*
* @private
* @param {('no-vectors'|'compute-vectors')} jobvl - whether left eigenvectors are computed
* @param {('no-vectors'|'compute-vectors')} jobvr - whether right eigenvectors are computed
* @param {('none'|'eigenvalues'|'right-vectors'|'both')} sense - which condition numbers are computed
* @param {NonNegativeInteger} N - order of the matrix
* @returns {PositiveInteger} optimal workspace length (complex elements)
*/
function computeOptimalWorkSize( jobvl, jobvr, sense, N ) {
	let maxwrk;
	if ( N === 0 ) {
		return 1;
	}
	maxwrk = N + ( N * ilaenv( 1, 'ZGEHRD', ' ', N, 1, N, 0 ) ) + TSIZE;
	maxwrk = Math.max( maxwrk, zhseqrWorkOpt( N, 1, N ) );
	if ( jobvl === 'compute-vectors' || jobvr === 'compute-vectors' ) {
		maxwrk = Math.max( maxwrk, ztrevc3WorkOpt( ( jobvl === 'compute-vectors' ) ? 'left' : 'right', 'backtransform', N ) );
		maxwrk = Math.max( maxwrk, N + ( ( N - 1 ) * ilaenv( 1, 'ZUNGHR', ' ', N, 1, N, -1 ) ) );
	}
	return Math.max( maxwrk, computeMinimalWorkSize( sense, N ) );
}


// MAIN //

/**
* Computes the eigenvalues and, optionally, the left and/or right eigenvectors.
* of a complex N-by-N nonsymmetric matrix A, with optional balancing and
* reciprocal condition numbers.
*
* @private
* @param {('none'|'permute'|'scale'|'both')} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {('no-vectors'|'compute-vectors')} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {('no-vectors'|'compute-vectors')} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {('none'|'eigenvalues'|'right-vectors'|'both')} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {Complex128Array} A - input matrix (N x N), overwritten on exit
* @param {integer} strideA1 - first dimension stride of A (complex elements)
* @param {integer} strideA2 - second dimension stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} w - output eigenvalues
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} VL - output left eigenvectors
* @param {integer} strideVL1 - first dim stride of VL
* @param {integer} strideVL2 - second dim stride of VL
* @param {NonNegativeInteger} offsetVL - starting index for VL
* @param {Complex128Array} VR - output right eigenvectors
* @param {integer} strideVR1 - first dim stride of VR
* @param {integer} strideVR2 - second dim stride of VR
* @param {NonNegativeInteger} offsetVR - starting index for VR
* @param {Int32Array} ilo - input/output (length-1 array): ignored on input; returned in result object
* @param {Int32Array} ihi - input/output (length-1 array): ignored on input; returned in result object
* @param {Float64Array} SCALE - output scaling factors from balancing
* @param {integer} strideSCALE - stride for SCALE
* @param {NonNegativeInteger} offsetSCALE - starting index for SCALE
* @param {Float64Array} abnrm - input/output (length-1 array): ignored on input; returned in result object
* @param {Float64Array} RCONDE - output reciprocal condition numbers for eigenvalues
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - starting index for RCONDE
* @param {Float64Array} RCONDV - output reciprocal condition numbers for right eigenvectors
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - starting index for RCONDV
* @param {Complex128Array} WORK - complex workspace of at least `2*N` elements, and `N*N + 2*N` when SENSE is `'right-vectors'` or `'both'`
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Float64Array} RWORK - real workspace (length >= 2*N)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} status code (0 = success)
*/
function zgeevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, SCALE, strideSCALE, offsetSCALE, abnrm, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	const m = new Int32Array( 1 );
	const iloOut = new Int32Array( 1 );
	const ihiOut = new Int32Array( 1 );
	let tmpMag, scalea, cscale, SELECT, tmpRe, tmpIm, icond, info;
	let iwrk = NaN, aDum, mArr, sv1, sv2, scl, vlv, vrv, oA1, vv, rv, oV;
	/** @type {('both'|'eigenvalues'|'eigenvectors')} */
	let tjob;
	/** @type {('eigenvalues'|'schur')} */
	let hjob;
	let av, wv, k, i;

	const wantvl = ( jobvl === 'compute-vectors' );
	const wantvr = ( jobvr === 'compute-vectors' );
	// The eigenvector side, from the two flags (used only when one is set).
	const side = ( wantvl ) ? ( ( wantvr ) ? 'both' : 'left' ) : 'right';
	const wntsnn = ( sense === 'none' );
	const wntsne = ( sense === 'eigenvalues' );
	const wntsnv = ( sense === 'right-vectors' );
	const wntsnb = ( sense === 'both' );


	// Quick return
	if ( N === 0 ) {
		ilo[ 0 ] = 1;
		ihi[ 0 ] = 0;
		abnrm[ 0 ] = ZERO;
		return 0;
	}

	// Handle N=1 case
	if ( N === 1 ) {
		av = reinterpret( A, 0 );
		wv = reinterpret( w, 0 );
		oA1 = offsetA * 2;
		wv[ offsetW * 2 ] = av[ oA1 ];
		wv[ offsetW * 2 + 1 ] = av[ oA1 + 1 ];
		SCALE[ offsetSCALE ] = ONE;
		if ( wantvl ) {
			vlv = reinterpret( VL, 0 );
			vlv[ offsetVL * 2 ] = ONE;
			vlv[ offsetVL * 2 + 1 ] = ZERO;
		}
		if ( wantvr ) {
			vrv = reinterpret( VR, 0 );
			vrv[ offsetVR * 2 ] = ONE;
			vrv[ offsetVR * 2 + 1 ] = ZERO;
		}
		if ( !wntsnn ) {
			RCONDE[ offsetRCONDE ] = ONE;
			RCONDV[ offsetRCONDV ] = ONE;
		}
		ilo[ 0 ] = 1;
		ihi[ 0 ] = 1;
		abnrm[ 0 ] = Math.hypot( av[ oA1 ], av[ oA1 + 1 ] );
		return 0;
	}

	// Scratch space layout in RWORK: RWORK[0..N-1] used by ztrevc3/normalization
	const irwork = 0;

	// Scale A if max element outside range [SMLNUM, BIGNUM]
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
	zgebal( balanc, N, A, strideA1, strideA2, offsetA, iloOut, ihiOut, SCALE, strideSCALE, offsetSCALE );
	ilo[ 0 ] = iloOut[ 0 ]; // 1-based
	ihi[ 0 ] = ihiOut[ 0 ]; // 1-based

	// Compute 1-norm of balanced matrix for abnrm
	abnrm[ 0 ] = zlange( 'one-norm', N, N, A, strideA1, strideA2, offsetA, DUM, 1, 0 );
	if ( scalea ) {
		aDum = new Float64Array( 1 );
		aDum[ 0 ] = abnrm[ 0 ];
		dlascl( 'general', 0, 0, cscale, anrm, 1, 1, aDum, 1, 1, 0 );
		abnrm[ 0 ] = aDum[ 0 ];
	}

	// Reduce to upper Hessenberg form
	// WORK layout: [TAU(0..N-1), workspace(iwrk...)]
	const itau = 0;
	iwrk = itau + N;
	zgehrd( N, ilo[ 0 ], ihi[ 0 ], A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork + itau * strideWork, WORK, strideWork, offsetWork + iwrk * strideWork );

	info = 0;

	if ( wantvl ) {
		zlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VL, strideVL1, strideVL2, offsetVL );
		zunghr( N, ilo[ 0 ], ihi[ 0 ], VL, strideVL1, strideVL2, offsetVL, WORK, strideWork, offsetWork + itau * strideWork, WORK, strideWork, offsetWork + iwrk * strideWork );
		iwrk = itau;
		info = zhseqr( 'schur', 'update', N, ilo[ 0 ], ihi[ 0 ], A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, WORK, strideWork, offsetWork + iwrk * strideWork );
		if ( wantvr ) {
			zlacpy( 'all', N, N, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
		}
	} else if ( wantvr ) {
		zlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VR, strideVR1, strideVR2, offsetVR );
		zunghr( N, ilo[ 0 ], ihi[ 0 ], VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork + itau * strideWork, WORK, strideWork, offsetWork + iwrk * strideWork );
		iwrk = itau;
		info = zhseqr( 'schur', 'update', N, ilo[ 0 ], ihi[ 0 ], A, strideA1, strideA2, offsetA, w, strideW, offsetW, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork + iwrk * strideWork );
	} else {
		// Eigenvalues only. With wntsnn, use 'eigenvalues' mode; otherwise
		// Compute Schur form because ZTRSNA needs it.
		iwrk = itau;
		hjob = ( wntsnn ) ? 'eigenvalues' : 'schur';
		info = zhseqr( hjob, 'none', N, ilo[ 0 ], ihi[ 0 ], A, strideA1, strideA2, offsetA, w, strideW, offsetW, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork + iwrk * strideWork );
	}

	// If ZHSEQR failed, undo scaling and exit
	if ( info !== 0 ) {
		if ( scalea ) {
			zlascl( 'general', 0, 0, cscale, anrm, N - info, 1, w, strideW, strideW, offsetW + info * strideW );
			if ( info > 0 ) {
				zlascl( 'general', 0, 0, cscale, anrm, ilo[ 0 ] - 1, 1, w, strideW, strideW, offsetW );
			}
		}
		return info;
	}

	// Compute eigenvectors from the Schur form
	if ( wantvl || wantvr ) {
		SELECT = new Uint8Array( 1 ); // unused, required by ztrevc3
		ztrevc3( side, 'backtransform', SELECT, 1, 0, N, A, strideA1, strideA2, offsetA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, N, m, WORK, strideWork, offsetWork + iwrk * strideWork, RWORK, strideRWork, offsetRWork + irwork * strideRWork );
	}

	// Compute condition numbers if desired
	icond = 0;
	if ( !wntsnn ) {
		// Map zgeevx SENSE to ztrsna job.
		if ( wntsne ) {
			tjob = 'eigenvalues';
		} else if ( wntsnv ) {
			tjob = 'eigenvectors';
		} else {
			tjob = 'both';
		}
		SELECT = new Uint8Array( 1 ); // unused for howmny='all'
		mArr = new Int32Array( 1 );

		// WORK(iwrk) is an N-by-(N+1) workspace with leading dimension N.
		icond = ztrsna( tjob, 'all', SELECT, 1, 0, N, A, strideA1, strideA2, offsetA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, N, mArr, WORK, strideWork, N * strideWork, offsetWork + iwrk * strideWork, RWORK, strideRWork, offsetRWork );
	}

	// Normalize left eigenvectors
	if ( wantvl ) {
		zgebak( balanc, 'left', N, ilo[ 0 ], ihi[ 0 ], SCALE, strideSCALE, offsetSCALE, N, VL, strideVL1, strideVL2, offsetVL );

		vv = reinterpret( VL, 0 );
		sv1 = strideVL1 * 2;
		sv2 = strideVL2 * 2;
		oV = offsetVL * 2;
		rv = RWORK;

		for ( i = 0; i < N; i++ ) {
			scl = ONE / dznrm2( N, VL, strideVL1, offsetVL + i * strideVL2 );
			zdscal( N, scl, VL, strideVL1, offsetVL + i * strideVL2 );
			for ( k = 0; k < N; k++ ) {
				rv[ offsetRWork + ( irwork + k ) * strideRWork ] =
					vv[ oV + k * sv1 + i * sv2 ] * vv[ oV + k * sv1 + i * sv2 ] +
					vv[ oV + k * sv1 + i * sv2 + 1 ] * vv[ oV + k * sv1 + i * sv2 + 1 ];
			}
			k = idamax( N, RWORK, strideRWork, offsetRWork + irwork * strideRWork );
			tmpMag = Math.sqrt( rv[ offsetRWork + ( irwork + k ) * strideRWork ] );
			tmpRe = vv[ oV + k * sv1 + i * sv2 ] / tmpMag;
			tmpIm = -vv[ oV + k * sv1 + i * sv2 + 1 ] / tmpMag;
			zscal( N, new Complex128( tmpRe, tmpIm ), VL, strideVL1, offsetVL + i * strideVL2 );
			vv[ oV + k * sv1 + i * sv2 + 1 ] = ZERO;
		}
	}

	// Normalize right eigenvectors
	if ( wantvr ) {
		zgebak( balanc, 'right', N, ilo[ 0 ], ihi[ 0 ], SCALE, strideSCALE, offsetSCALE, N, VR, strideVR1, strideVR2, offsetVR );

		vv = reinterpret( VR, 0 );
		sv1 = strideVR1 * 2;
		sv2 = strideVR2 * 2;
		oV = offsetVR * 2;
		rv = RWORK;

		for ( i = 0; i < N; i++ ) {
			scl = ONE / dznrm2( N, VR, strideVR1, offsetVR + i * strideVR2 );
			zdscal( N, scl, VR, strideVR1, offsetVR + i * strideVR2 );
			for ( k = 0; k < N; k++ ) {
				rv[ offsetRWork + ( irwork + k ) * strideRWork ] =
					vv[ oV + k * sv1 + i * sv2 ] * vv[ oV + k * sv1 + i * sv2 ] +
					vv[ oV + k * sv1 + i * sv2 + 1 ] * vv[ oV + k * sv1 + i * sv2 + 1 ];
			}
			k = idamax( N, RWORK, strideRWork, offsetRWork + irwork * strideRWork );
			tmpMag = Math.sqrt( rv[ offsetRWork + ( irwork + k ) * strideRWork ] );
			tmpRe = vv[ oV + k * sv1 + i * sv2 ] / tmpMag;
			tmpIm = -vv[ oV + k * sv1 + i * sv2 + 1 ] / tmpMag;
			zscal( N, new Complex128( tmpRe, tmpIm ), VR, strideVR1, offsetVR + i * strideVR2 );
			vv[ oV + k * sv1 + i * sv2 + 1 ] = ZERO;
		}
	}

	// Undo scaling
	if ( scalea ) {
		zlascl( 'general', 0, 0, cscale, anrm, N - info, 1, w, strideW, strideW, offsetW + info * strideW );
		if ( ( wntsnv || wntsnb ) && icond === 0 ) {
			dlascl( 'general', 0, 0, cscale, anrm, N, 1, RCONDV, strideRCONDV, strideRCONDV, offsetRCONDV );
		}
	}

	return info;
}


// EXPORTS //

export default zgeevx;
export { computeMinimalWorkSize, computeOptimalWorkSize };
