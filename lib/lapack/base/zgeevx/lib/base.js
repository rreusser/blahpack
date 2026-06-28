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

/* eslint-disable max-len, max-params, max-depth, max-statements, no-mixed-operators, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
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
import zhseqr from '../../zhseqr/lib/base.js';
import ztrevc3 from '../../ztrevc3/lib/base.js';
import ztrsna from '../../ztrsna/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

// Machine constants (hoisted to module scope)
var EPS = dlamch( 'precision' );
var SMLNUM_BASE = dlamch( 'safe-minimum' );
var SMLNUM = Math.sqrt( SMLNUM_BASE ) / EPS;
var BIGNUM = ONE / SMLNUM;


// MAIN //

/**
* Computes the eigenvalues and, optionally, the left and/or right eigenvectors.
* of a complex N-by-N nonsymmetric matrix A, with optional balancing and
* reciprocal condition numbers.
*
* @private
* @param {string} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {string} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
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
* @param {integer} ilo - ignored on input; returned in result object
* @param {integer} ihi - ignored on input; returned in result object
* @param {Float64Array} SCALE - output scaling factors from balancing
* @param {integer} strideSCALE - stride for SCALE
* @param {NonNegativeInteger} offsetSCALE - starting index for SCALE
* @param {number} abnrm - ignored on input; returned in result object
* @param {Float64Array} RCONDE - output reciprocal condition numbers for eigenvalues
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - starting index for RCONDE
* @param {Float64Array} RCONDV - output reciprocal condition numbers for right eigenvectors
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - starting index for RCONDV
* @param {Complex128Array} WORK - complex workspace
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - workspace length (complex elements)
* @param {Float64Array} RWORK - real workspace (length >= 2*N)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {Object} result object { info, ilo, ihi, abnrm }
*/
function zgeevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, SCALE, strideSCALE, offsetSCALE, abnrm, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork ) {
	var tmpMag;
	var wantvl;
	var wantvr;
	var wntsnn;
	var wntsne;
	var wntsnv;
	var wntsnb;
	var scalea;
	var cscale;
	var balRes;
	var SELECT;
	var irwork;
	var tmpRe;
	var tmpIm;
	var icond;
	var anrm;
	var info;
	var side;
	var nout;
	var itau;
	var iwrk;
	var aDum;
	var mArr;
	var tjob;
	var hjob;
	var sv1;
	var sv2;
	var scl;
	var DUM;
	var vlv;
	var vrv;
	var oA1;
	var vv;
	var rv;
	var oV;
	var av;
	var wv;
	var k;
	var i;

	wantvl = ( jobvl === 'compute-vectors' );
	wantvr = ( jobvr === 'compute-vectors' );
	wntsnn = ( sense === 'none' );
	wntsne = ( sense === 'eigenvalues' );
	wntsnv = ( sense === 'right-vectors' );
	wntsnb = ( sense === 'both' );

	// Quick return
	if ( N === 0 ) {
		return {
			'info': 0,
			'ilo': 1,
			'ihi': 0,
			'abnrm': ZERO
		};
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
		return {
			'info': 0,
			'ilo': 1,
			'ihi': 1,
			'abnrm': Math.hypot( av[ oA1 ], av[ oA1 + 1 ] )
		};
	}

	// Scratch space layout in RWORK: RWORK[0..N-1] used by ztrevc3/normalization
	irwork = 0;

	// Scale A if max element outside range [SMLNUM, BIGNUM]
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
	balRes = zgebal( balanc, N, A, strideA1, strideA2, offsetA, SCALE, strideSCALE, offsetSCALE );
	ilo = balRes.ilo; // 1-based
	ihi = balRes.ihi; // 1-based

	// Compute 1-norm of balanced matrix for abnrm
	abnrm = zlange( 'one-norm', N, N, A, strideA1, strideA2, offsetA, DUM, 1, 0 );
	if ( scalea ) {
		aDum = new Float64Array( 1 );
		aDum[ 0 ] = abnrm;
		dlascl( 'general', 0, 0, cscale, anrm, 1, 1, aDum, 1, 1, 0 );
		abnrm = aDum[ 0 ];
	}

	// Reduce to upper Hessenberg form
	// WORK layout: [TAU(0..N-1), workspace(iwrk...)]
	itau = 0;
	iwrk = itau + N;
	zgehrd( N, ilo, ihi, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork + itau * strideWork, WORK, strideWork, offsetWork + iwrk * strideWork );

	info = 0;

	if ( wantvl ) {
		side = 'left';
		zlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VL, strideVL1, strideVL2, offsetVL );
		zunghr( N, ilo, ihi, VL, strideVL1, strideVL2, offsetVL, WORK, strideWork, offsetWork + itau * strideWork, WORK, strideWork, offsetWork + iwrk * strideWork, lwork - iwrk );
		iwrk = itau;
		info = zhseqr( 'schur', 'update', N, ilo, ihi, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, WORK, strideWork, offsetWork + iwrk * strideWork, lwork - iwrk );
		if ( wantvr ) {
			side = 'both';
			zlacpy( 'full', N, N, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
		}
	} else if ( wantvr ) {
		side = 'right';
		zlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VR, strideVR1, strideVR2, offsetVR );
		zunghr( N, ilo, ihi, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork + itau * strideWork, WORK, strideWork, offsetWork + iwrk * strideWork, lwork - iwrk );
		iwrk = itau;
		info = zhseqr( 'schur', 'update', N, ilo, ihi, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork + iwrk * strideWork, lwork - iwrk );
	} else {
		// Eigenvalues only. With wntsnn, use 'eigenvalues' mode; otherwise
		// Compute Schur form because ZTRSNA needs it.
		iwrk = itau;
		hjob = ( wntsnn ) ? 'eigenvalues' : 'schur';
		info = zhseqr( hjob, 'none', N, ilo, ihi, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork + iwrk * strideWork, lwork - iwrk );
	}

	// If ZHSEQR failed, undo scaling and exit
	if ( info !== 0 ) {
		if ( scalea ) {
			zlascl( 'general', 0, 0, cscale, anrm, N - info, 1, w, strideW, 1, offsetW + info * strideW );
			if ( info > 0 ) {
				zlascl( 'general', 0, 0, cscale, anrm, ilo - 1, 1, w, strideW, 1, offsetW );
			}
		}
		return {
			'info': info,
			'ilo': ilo,
			'ihi': ihi,
			'abnrm': abnrm
		};
	}

	// Compute eigenvectors from the Schur form
	if ( wantvl || wantvr ) {
		SELECT = new Uint8Array( 1 ); // unused, required by ztrevc3
		nout = 0;
		ztrevc3( side, 'backtransform', SELECT, 1, 0, N, A, strideA1, strideA2, offsetA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, N, nout, WORK, strideWork, offsetWork + iwrk * strideWork, lwork - iwrk, RWORK, strideRWork, offsetRWork + irwork * strideRWork, N );
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
		zgebak( balanc, 'left', N, ilo, ihi, SCALE, strideSCALE, offsetSCALE, N, VL, strideVL1, strideVL2, offsetVL );

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
		zgebak( balanc, 'right', N, ilo, ihi, SCALE, strideSCALE, offsetSCALE, N, VR, strideVR1, strideVR2, offsetVR );

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
		zlascl( 'general', 0, 0, cscale, anrm, N - info, 1, w, strideW, 1, offsetW + info * strideW );
		if ( ( wntsnv || wntsnb ) && icond === 0 ) {
			dlascl( 'general', 0, 0, cscale, anrm, N, 1, RCONDV, strideRCONDV, 1, offsetRCONDV );
		}
	}

	return {
		'info': info,
		'ilo': ilo,
		'ihi': ihi,
		'abnrm': abnrm
	};
}


// EXPORTS //

export default zgeevx;
