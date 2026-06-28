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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zggbal from '../../zggbal/lib/base.js';
import zgeqrf from '../../zgeqrf/lib/base.js';
import zgghrd from '../../zgghrd/lib/base.js';
import zhgeqz from '../../zhgeqz/lib/base.js';
import zggbak from '../../zggbak/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zunmqr from '../../zunmqr/lib/base.js';
import ztgevc from '../../ztgevc/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zungqr from '../../zungqr/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );


// FUNCTIONS //

/**
* ABS1: |re| + |im| (cheap complex absolute value).
*
* @private
* @param {Float64Array} arr - Float64 view of complex array
* @param {integer} idx - Float64 index of real part
* @returns {number} |re| + |im|
*/
function abs1( arr, idx ) {
	return Math.abs( arr[ idx ] ) + Math.abs( arr[ idx + 1 ] );
}


// MAIN //

/**
* Compute the generalized eigenvalues and optionally the left and/or.
* right generalized eigenvectors of a complex matrix pair (A, B).
*
* A, B, ALPHA, BETA, VL, VR are Complex128Arrays.
* Strides and offsets are in complex elements.
*
* @private
* @param {string} jobvl - `'no-vectors'` or `'compute-vectors'`
* @param {string} jobvr - `'no-vectors'` or `'compute-vectors'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - first complex matrix (modified in-place)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - second complex matrix (modified in-place)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} ALPHA - output eigenvalue numerators
* @param {integer} strideALPHA - stride for ALPHA (complex elements)
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA (complex elements)
* @param {Complex128Array} BETA - output eigenvalue denominators
* @param {integer} strideBETA - stride for BETA (complex elements)
* @param {NonNegativeInteger} offsetBETA - starting index for BETA (complex elements)
* @param {Complex128Array} VL - left eigenvector matrix
* @param {integer} strideVL1 - stride of the first dimension of VL (complex elements)
* @param {integer} strideVL2 - stride of the second dimension of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - starting index for VL (complex elements)
* @param {Complex128Array} VR - right eigenvector matrix
* @param {integer} strideVR1 - stride of the first dimension of VR (complex elements)
* @param {integer} strideVR2 - stride of the second dimension of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - starting index for VR (complex elements)
* @returns {integer} INFO: 0=success, 1..N=QZ iteration failed to converge, N+1=other QZ failure, N+2=ZTGEVC error
*/
function zggev( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR ) {
	var anrmto;
	var bnrmto;
	var ilascl;
	var ilbscl;
	var smlnum;
	var bignum;
	var chtemp;
	var iright;
	var ileft;
	var irwrk;
	var irows;
	var icols;
	var RWORK;
	var lwork;
	var anrm;
	var bnrm;
	var ilvl;
	var ilvr;
	var info;
	var ierr;
	var temp;
	var WORK;
	var sVL1;
	var sVL2;
	var sVR1;
	var sVR2;
	var ilv;
	var TAU;
	var VLv;
	var VRv;
	var oVL;
	var oVR;
	var bal;
	var ilo;
	var ihi;
	var eps;
	var jc;
	var jr;

	// Decode input
	ilvl = ( jobvl === 'compute' );
	ilvr = ( jobvr === 'compute' );
	ilv = ilvl || ilvr;

	info = 0;

	// Quick return if possible
	if ( N === 0 ) {
		return info;
	}

	// Allocate workspace — sized for the largest consumer:
	// Zunmqr needs nw*nb + ldt*nb where nw=N, nb=32, ldt=33 → N*32+33*32
	// Zgeqrf needs N*nb + nb*nb → N*32+1024
	// Zhgeqz allocates its own internally
	lwork = Math.max( 1, (N * 32) + (33 * 32) );
	WORK = new Complex128Array( lwork );

	// TAU: Householder scalar factors (complex, length N)
	TAU = new Complex128Array( N );

	// RWORK: real workspace
	RWORK = new Float64Array( 8 * N );

	// Get machine constants
	eps = dlamch( 'epsilon' ) * dlamch( 'base' );
	smlnum = dlamch( 'safe-minimum' );
	bignum = ONE / smlnum;
	smlnum = Math.sqrt( smlnum ) / eps;
	bignum = ONE / smlnum;

	// Scale A if max element outside range [SMLNUM, BIGNUM]
	anrm = zlange( 'max', N, N, A, strideA1, strideA2, offsetA, RWORK, 1, 0 );
	ilascl = false;
	anrmto = 0.0;
	if ( anrm > ZERO && anrm < smlnum ) {
		anrmto = smlnum;
		ilascl = true;
	} else if ( anrm > bignum ) {
		anrmto = bignum;
		ilascl = true;
	}
	if ( ilascl ) {
		zlascl( 'general', 0, 0, anrm, anrmto, N, N, A, strideA1, strideA2, offsetA );
	}

	// Scale B if max element outside range [SMLNUM, BIGNUM]
	bnrm = zlange( 'max', N, N, B, strideB1, strideB2, offsetB, RWORK, 1, 0 );
	ilbscl = false;
	bnrmto = 0.0;
	if ( bnrm > ZERO && bnrm < smlnum ) {
		bnrmto = smlnum;
		ilbscl = true;
	} else if ( bnrm > bignum ) {
		bnrmto = bignum;
		ilbscl = true;
	}
	if ( ilbscl ) {
		zlascl( 'general', 0, 0, bnrm, bnrmto, N, N, B, strideB1, strideB2, offsetB );
	}

	// Permute the matrices A, B to isolate eigenvalues
	ileft = 0;
	iright = N;
	irwrk = 2 * N;
	bal = zggbal( 'permute', N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, RWORK, 1, ileft, RWORK, 1, iright, RWORK, 1, irwrk );
	ilo = bal.ilo;
	ihi = bal.ihi;

	// Compute active block dimensions (1-based ilo, ihi)
	irows = ihi - ilo + 1;
	if ( ilv ) {
		icols = N - ilo + 1;
	} else {
		icols = irows;
	}

	// QR factorize B(ilo:ihi, ilo:icols) using ZGEQRF
	zgeqrf(irows, icols, B, strideB1, strideB2, offsetB + (( ilo - 1 ) * strideB1) + (( ilo - 1 ) * strideB2), TAU, 1, 0, WORK, 1, 0);

	// Apply Q^H to A from the left
	zunmqr('left', 'conjugate-transpose', irows, icols, irows, B, strideB1, strideB2, offsetB + (( ilo - 1 ) * strideB1) + (( ilo - 1 ) * strideB2), TAU, 1, 0, A, strideA1, strideA2, offsetA + (( ilo - 1 ) * strideA1) + (( ilo - 1 ) * strideA2), WORK, 1, 0 );

	// Initialize VL and generate Q
	if ( ilvl ) {
		zlaset( 'Full', N, N, CZERO, CONE, VL, strideVL1, strideVL2, offsetVL );

		if ( irows > 1 ) {
			zlacpy( 'lower', irows - 1, irows - 1, B, strideB1, strideB2, offsetB + (ilo * strideB1) + (( ilo - 1 ) * strideB2), VL, strideVL1, strideVL2, offsetVL + (ilo * strideVL1) + (( ilo - 1 ) * strideVL2));
		}

		zungqr(irows, irows, irows, VL, strideVL1, strideVL2, offsetVL + (( ilo - 1 ) * strideVL1) + (( ilo - 1 ) * strideVL2), TAU, 1, 0, WORK, 1, 0 );
	}

	// Initialize VR
	if ( ilvr ) {
		zlaset( 'Full', N, N, CZERO, CONE, VR, strideVR1, strideVR2, offsetVR );
	}

	// Reduce to generalized Hessenberg form
	// Zgghrd expects compq/compz: 'none'/'update'/'initialize'
	if ( ilv ) {
		zgghrd(( ( ilvl ) ? 'update' : 'none' ), ( ( ilvr ) ? 'update' : 'none' ), N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR);
	} else {
		zgghrd('none', 'none', irows, 1, irows, A, strideA1, strideA2, offsetA + (( ilo - 1 ) * strideA1) + (( ilo - 1 ) * strideA2), B, strideB1, strideB2, offsetB + (( ilo - 1 ) * strideB1) + (( ilo - 1 ) * strideB2), VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR);
	}

	// QZ algorithm: compute eigenvalues and optionally Schur form
	if ( ilv ) {
		chtemp = 'schur';
	} else {
		chtemp = 'eigenvalues';
	}
	ierr = zhgeqz(chtemp, ( ( ilvl ) ? 'update' : 'none' ), ( ( ilvr ) ? 'update' : 'none' ), N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, 1, 0, lwork, RWORK, 1, irwrk);
	if ( ierr !== 0 ) {
		if ( ierr > 0 && ierr <= N ) {
			info = ierr;
		} else if ( ierr > N && ierr <= 2 * N ) {
			info = ierr - N;
		} else {
			info = N + 1;
		}
		return finalize();
	}

	// Compute eigenvectors
	// Ztgevc side: 'left'/'right'/'both'
	if ( ilv ) {
		if ( ilvl ) {
			if ( ilvr ) {
				chtemp = 'both';
			} else {
				chtemp = 'left';
			}
		} else {
			chtemp = 'right';
		}

		// Use a separate RWORK for ztgevc so it doesn't clobber
		// The LSCALE/RSCALE at RWORK[0..2N-1] needed by zggbak
		ierr = ztgevc(chtemp, 'backtransform', null, 0, 0, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, N, [ 0 ], WORK, 1, 0, new Float64Array( 2 * N ), 1, 0);
		if ( ierr !== 0 ) {
			info = N + 2;
			return finalize();
		}

		// Undo balancing on VL and VR, and normalize
		// Get Float64Array views for direct element access
		if ( ilvl ) {
			VLv = reinterpret( VL, 0 );
			sVL1 = strideVL1 * 2;
			sVL2 = strideVL2 * 2;
			oVL = offsetVL * 2;

			zggbak( 'permute', 'left', N, ilo, ihi, RWORK, 1, ileft, RWORK, 1, iright, N, VL, strideVL1, strideVL2, offsetVL);

			// Normalize left eigenvectors
			for ( jc = 0; jc < N; jc++ ) {
				temp = ZERO;
				for ( jr = 0; jr < N; jr++ ) {
					temp = Math.max( temp, abs1( VLv, oVL + (jr * sVL1) + (jc * sVL2) ) );
				}
				if ( temp < smlnum ) {
					continue;
				}
				temp = ONE / temp;
				for ( jr = 0; jr < N; jr++ ) {
					VLv[ oVL + (jr * sVL1) + (jc * sVL2) ] *= temp;
					VLv[ oVL + (jr * sVL1) + (jc * sVL2) + 1 ] *= temp;
				}
			}
		}

		if ( ilvr ) {
			VRv = reinterpret( VR, 0 );
			sVR1 = strideVR1 * 2;
			sVR2 = strideVR2 * 2;
			oVR = offsetVR * 2;

			zggbak( 'permute', 'right', N, ilo, ihi, RWORK, 1, ileft, RWORK, 1, iright, N, VR, strideVR1, strideVR2, offsetVR);

			// Normalize right eigenvectors
			for ( jc = 0; jc < N; jc++ ) {
				temp = ZERO;
				for ( jr = 0; jr < N; jr++ ) {
					temp = Math.max( temp, abs1( VRv, oVR + (jr * sVR1) + (jc * sVR2) ) );
				}
				if ( temp < smlnum ) {
					continue;
				}
				temp = ONE / temp;
				for ( jr = 0; jr < N; jr++ ) {
					VRv[ oVR + (jr * sVR1) + (jc * sVR2) ] *= temp;
					VRv[ oVR + (jr * sVR1) + (jc * sVR2) + 1 ] *= temp;
				}
			}
		}
	}

	return finalize();

	/**
	* Undo scaling on ALPHA and BETA if necessary, then return info.
	*
	* @private
	* @returns {integer} info
	*/
	function finalize() {
		if ( ilascl ) {
			zlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHA, strideALPHA, 1, offsetALPHA);
		}
		if ( ilbscl ) {
			zlascl( 'general', 0, 0, bnrmto, bnrm, N, 1, BETA, strideBETA, 1, offsetBETA);
		}
		return info;
	}
}


// EXPORTS //

export default zggev;
