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

/* eslint-disable max-len, max-params, max-depth, max-statements, no-mixed-operators, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
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
* of a complex N-by-N nonsymmetric matrix A.
*
* The right eigenvector v(j) of A satisfies A _ v(j) = lambda(j) _ v(j).
* The left eigenvector u(j) of A satisfies u(j)**H _ A = lambda(j) _ u(j)**H.
*
* The computed eigenvectors are normalized to have Euclidean norm equal to 1
* and largest component real.
*
* @private
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {Complex128Array} A - input matrix (N x N), overwritten on exit
* @param {integer} strideA1 - first dimension stride of A (complex elements)
* @param {integer} strideA2 - second dimension stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} w - output: eigenvalues (length N)
* @param {integer} strideW - stride for w (complex elements)
* @param {NonNegativeInteger} offsetW - starting index for w (complex elements)
* @param {Complex128Array} VL - output: left eigenvectors (N x N)
* @param {integer} strideVL1 - first dimension stride of VL (complex elements)
* @param {integer} strideVL2 - second dimension stride of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - starting index for VL (complex elements)
* @param {Complex128Array} VR - output: right eigenvectors (N x N)
* @param {integer} strideVR1 - first dimension stride of VR (complex elements)
* @param {integer} strideVR2 - second dimension stride of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - starting index for VR (complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {integer} lwork - workspace length (complex elements)
* @param {Float64Array} RWORK - real workspace (length >= 2*N)
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @returns {integer} info - 0 on success, >0 if QR failed (eigenvalues info+1:N have converged)
*/
function zgeev( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK ) {
	var tmp_mag;
	var wantvl;
	var wantvr;
	var scalea;
	var cscale;
	var balRes;
	var SELECT;
	var irwork;
	var tmp_re;
	var tmp_im;
	var anrm;
	var info;
	var side;
	var nout;
	var itau;
	var iwrk;
	var ibal;
	var ilo;
	var ihi;
	var scl;
	var sv1;
	var sv2;
	var DUM;
	var vv;
	var rv;
	var oV;
	var k;
	var i;

	wantvl = ( jobvl === 'compute-vectors' );
	wantvr = ( jobvr === 'compute-vectors' );

	// Quick return
	if ( N === 0 ) {
		return 0;
	}

	// Handle N=1 case
	if ( N === 1 ) {
		var av = reinterpret( A, 0 ); // eslint-disable-line no-var
		var wv = reinterpret( w, 0 ); // eslint-disable-line no-var
		var oA1 = offsetA * 2; // eslint-disable-line no-var
		wv[ offsetW * 2 ] = av[ oA1 ];
		wv[ offsetW * 2 + 1 ] = av[ oA1 + 1 ];
		if ( wantvl ) {
			var vlv = reinterpret( VL, 0 ); // eslint-disable-line no-var
			vlv[ offsetVL * 2 ] = ONE;
			vlv[ offsetVL * 2 + 1 ] = ZERO;
		}
		if ( wantvr ) {
			var vrv = reinterpret( VR, 0 ); // eslint-disable-line no-var
			vrv[ offsetVR * 2 ] = ONE;
			vrv[ offsetVR * 2 + 1 ] = ZERO;
		}
		return 0;
	}

	// Allocate RWORK layout:
	// RWORK[ibal..ibal+N-1] = SCALE from zgebal
	// RWORK[irwork..irwork+N-1] = scratch for normalization
	ibal = 0;
	irwork = N;

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

	// Balance the matrix (RWORK[ibal..ibal+N-1] stores the scale factors)
	balRes = zgebal( 'both', N, A, strideA1, strideA2, offsetA, RWORK, strideRWORK, offsetRWORK + ibal * strideRWORK );
	ilo = balRes.ilo; // 1-based
	ihi = balRes.ihi; // 1-based

	// Reduce to upper Hessenberg form

	// WORK layout: [TAU(0..N-1), workspace(iwrk...)]
	itau = 0;
	iwrk = itau + N;
	zgehrd( N, ilo, ihi, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK + itau * strideWORK, WORK, strideWORK, offsetWORK + iwrk * strideWORK );

	info = 0;

	if ( wantvl ) {
		// Want left eigenvectors
		side = 'left';

		// Copy Householder vectors to VL
		zlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VL, strideVL1, strideVL2, offsetVL );

		// Generate unitary matrix in VL
		zunghr( N, ilo, ihi, VL, strideVL1, strideVL2, offsetVL, WORK, strideWORK, offsetWORK + itau * strideWORK, WORK, strideWORK, offsetWORK + iwrk * strideWORK, lwork - iwrk );

		// Perform QR iteration, accumulating Schur vectors in VL
		iwrk = itau;
		info = zhseqr( 'schur', 'update', N, ilo, ihi, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, WORK, strideWORK, offsetWORK + iwrk * strideWORK, lwork - iwrk );

		if ( wantvr ) {
			// Want both left and right eigenvectors
			side = 'both';

			// Copy Schur vectors to VR
			zlacpy( 'full', N, N, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
		}
	} else if ( wantvr ) {
		// Want right eigenvectors only
		side = 'right';

		// Copy Householder vectors to VR
		zlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VR, strideVR1, strideVR2, offsetVR );

		// Generate unitary matrix in VR
		zunghr( N, ilo, ihi, VR, strideVR1, strideVR2, offsetVR, WORK, strideWORK, offsetWORK + itau * strideWORK, WORK, strideWORK, offsetWORK + iwrk * strideWORK, lwork - iwrk );

		// Perform QR iteration, accumulating Schur vectors in VR
		iwrk = itau;
		info = zhseqr( 'schur', 'update', N, ilo, ihi, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VR, strideVR1, strideVR2, offsetVR, WORK, strideWORK, offsetWORK + iwrk * strideWORK, lwork - iwrk );
	} else {
		// Compute eigenvalues only
		iwrk = itau;
		info = zhseqr( 'eigenvalues', 'none', N, ilo, ihi, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VR, strideVR1, strideVR2, offsetVR, WORK, strideWORK, offsetWORK + iwrk * strideWORK, lwork - iwrk );
	}

	// If ZHSEQR failed, skip eigenvector computation
	if ( info !== 0 ) {
		// Undo scaling
		if ( scalea ) {
			zlascl( 'general', 0, 0, cscale, anrm, N - info, 1, w, strideW, 1, offsetW + info * strideW );
			if ( info > 0 ) {
				zlascl( 'general', 0, 0, cscale, anrm, ilo - 1, 1, w, strideW, 1, offsetW );
			}
		}
		return info;
	}

	if ( wantvl || wantvr ) {
		// Compute eigenvectors from the Schur form
		SELECT = new Uint8Array( 1 ); // unused but required by ztrevc3
		nout = 0;
		ztrevc3( side, 'backtransform', SELECT, 1, 0, N, A, strideA1, strideA2, offsetA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, N, nout, WORK, strideWORK, offsetWORK + iwrk * strideWORK, lwork - iwrk, RWORK, strideRWORK, offsetRWORK + irwork * strideRWORK, N );
	}

	// Normalize left eigenvectors and make largest component real
	if ( wantvl ) {
		// Undo balancing of left eigenvectors
		zgebak( 'both', 'left', N, ilo, ihi, RWORK, strideRWORK, offsetRWORK + ibal * strideRWORK, N, VL, strideVL1, strideVL2, offsetVL );

		vv = reinterpret( VL, 0 );
		sv1 = strideVL1 * 2;
		sv2 = strideVL2 * 2;
		oV = offsetVL * 2;
		rv = RWORK;

		for ( i = 0; i < N; i++ ) {
			scl = ONE / dznrm2( N, VL, strideVL1, offsetVL + i * strideVL2 );
			zdscal( N, scl, VL, strideVL1, offsetVL + i * strideVL2 );

			// Compute squared magnitudes for each row in column i
			for ( k = 0; k < N; k++ ) {
				rv[ offsetRWORK + irwork * strideRWORK + k ] =
					vv[ oV + k * sv1 + i * sv2 ] * vv[ oV + k * sv1 + i * sv2 ] +
					vv[ oV + k * sv1 + i * sv2 + 1 ] * vv[ oV + k * sv1 + i * sv2 + 1 ];
			}
			k = idamax( N, RWORK, strideRWORK, offsetRWORK + irwork * strideRWORK );

			// Tmp = conj(VL(k,i)) / sqrt(|VL(k,i)|^2)
			tmp_mag = Math.sqrt( rv[ offsetRWORK + irwork * strideRWORK + k ] );
			tmp_re = vv[ oV + k * sv1 + i * sv2 ] / tmp_mag;
			tmp_im = -vv[ oV + k * sv1 + i * sv2 + 1 ] / tmp_mag;

			// Scale the entire column by tmp
			zscal( N, new Complex128( tmp_re, tmp_im ), VL, strideVL1, offsetVL + i * strideVL2 );

			// Make the k-th element purely real
			vv[ oV + k * sv1 + i * sv2 + 1 ] = ZERO;
		}
	}

	// Normalize right eigenvectors and make largest component real
	if ( wantvr ) {
		// Undo balancing of right eigenvectors
		zgebak( 'both', 'right', N, ilo, ihi, RWORK, strideRWORK, offsetRWORK + ibal * strideRWORK, N, VR, strideVR1, strideVR2, offsetVR );

		vv = reinterpret( VR, 0 );
		sv1 = strideVR1 * 2;
		sv2 = strideVR2 * 2;
		oV = offsetVR * 2;
		rv = RWORK;

		for ( i = 0; i < N; i++ ) {
			scl = ONE / dznrm2( N, VR, strideVR1, offsetVR + i * strideVR2 );
			zdscal( N, scl, VR, strideVR1, offsetVR + i * strideVR2 );

			// Compute squared magnitudes for each row in column i
			for ( k = 0; k < N; k++ ) {
				rv[ offsetRWORK + irwork * strideRWORK + k ] =
					vv[ oV + k * sv1 + i * sv2 ] * vv[ oV + k * sv1 + i * sv2 ] +
					vv[ oV + k * sv1 + i * sv2 + 1 ] * vv[ oV + k * sv1 + i * sv2 + 1 ];
			}
			k = idamax( N, RWORK, strideRWORK, offsetRWORK + irwork * strideRWORK );

			// Tmp = conj(VR(k,i)) / sqrt(|VR(k,i)|^2)
			tmp_mag = Math.sqrt( rv[ offsetRWORK + irwork * strideRWORK + k ] );
			tmp_re = vv[ oV + k * sv1 + i * sv2 ] / tmp_mag;
			tmp_im = -vv[ oV + k * sv1 + i * sv2 + 1 ] / tmp_mag;

			// Scale the entire column by tmp
			zscal( N, new Complex128( tmp_re, tmp_im ), VR, strideVR1, offsetVR + i * strideVR2 );

			// Make the k-th element purely real
			vv[ oV + k * sv1 + i * sv2 + 1 ] = ZERO;
		}
	}

	// Undo scaling if necessary
	if ( scalea ) {
		zlascl( 'general', 0, 0, cscale, anrm, N - info, 1, w, strideW, 1, offsetW + info * strideW );
		if ( info > 0 ) {
			zlascl( 'general', 0, 0, cscale, anrm, ilo - 1, 1, w, strideW, 1, offsetW );
		}
	}

	return info;
}


// EXPORTS //

export default zgeev;
