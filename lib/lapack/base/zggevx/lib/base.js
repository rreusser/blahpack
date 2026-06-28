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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
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
import ztgsna from '../../ztgsna/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zungqr from '../../zungqr/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );

// Machine constants (hoisted to module scope)
var EPS = dlamch( 'precision' );
var SAFMIN = dlamch( 'safe-minimum' );
var SMLNUM = Math.sqrt( SAFMIN ) / EPS;
var BIGNUM = ONE / SMLNUM;


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
* Computes for a pair of N-by-N complex nonsymmetric matrices (A,B) the.
* generalized eigenvalues, and optionally, the left and/or right generalized
* eigenvectors. Optionally also computes a balancing transformation to
* improve the conditioning of the eigenvalues and eigenvectors (ilo, ihi,
* lscale, rscale, abnrm, bbnrm), reciprocal condition numbers for the
* eigenvalues (rconde), and reciprocal condition numbers for the right
* eigenvectors (rcondv).
*
* ## Notes
*
* -   A, B, ALPHA, BETA, VL, VR are Complex128Arrays. Strides and offsets
*     are in complex elements.
*
* -   When `sense` is `'eigenvalues'`, `'right-vectors'`, or `'both'`,
*     eigenvalue / right-eigenvector reciprocal condition numbers are
*     computed one eigenvalue at a time via `ztgevc('selected')` +
*     `ztgsna`, mirroring the Fortran reference.
*
* @private
* @param {string} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} jobvl - `'no-vectors'` or `'compute-vectors'`
* @param {string} jobvr - `'no-vectors'` or `'compute-vectors'`
* @param {string} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - first complex matrix (modified in-place)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - second complex matrix (modified in-place)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} ALPHA - output eigenvalue numerators (length N)
* @param {integer} strideALPHA - stride for ALPHA (complex elements)
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA (complex elements)
* @param {Complex128Array} BETA - output eigenvalue denominators (length N)
* @param {integer} strideBETA - stride for BETA (complex elements)
* @param {NonNegativeInteger} offsetBETA - starting index for BETA (complex elements)
* @param {Complex128Array} VL - left eigenvector matrix (N x N)
* @param {integer} strideVL1 - stride of the first dimension of VL (complex elements)
* @param {integer} strideVL2 - stride of the second dimension of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - starting index for VL (complex elements)
* @param {Complex128Array} VR - right eigenvector matrix (N x N)
* @param {integer} strideVR1 - stride of the first dimension of VR (complex elements)
* @param {integer} strideVR2 - stride of the second dimension of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - starting index for VR (complex elements)
* @param {Float64Array} LSCALE - output: details of left permutations/scaling (length N)
* @param {integer} strideLSCALE - stride for LSCALE
* @param {NonNegativeInteger} offsetLSCALE - offset for LSCALE
* @param {Float64Array} RSCALE - output: details of right permutations/scaling (length N)
* @param {integer} strideRSCALE - stride for RSCALE
* @param {NonNegativeInteger} offsetRSCALE - offset for RSCALE
* @param {Float64Array} RCONDE - output: reciprocal condition numbers for eigenvalues (length N)
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - offset for RCONDE
* @param {Float64Array} RCONDV - output: reciprocal condition numbers for right eigenvectors (length N)
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - offset for RCONDV
* @returns {Object} result with properties: info (integer), ilo (1-based), ihi (1-based), abnrm (number), bbnrm (number)
*/
function zggevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV ) {
	var RWORKscratch;
	var rcondeS;
	var rcondvS;
	var snaJob;
	var workVL;
	var workVR;
	var snaRes;
	var anrmto;
	var bnrmto;
	var ilascl;
	var ilbscl;
	var chtemp;
	var wantsb;
	var wantse;
	var wantsn;
	var wantsv;
	var BWORK;
	var IWORK;
	var noscl;
	var irows;
	var icols;
	var RWORK;
	var abnrm;
	var bbnrm;
	var iIdx;
	var jVal;
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
	var Mout;
	var ilv;
	var TAU;
	var VLv;
	var VRv;
	var oVL;
	var oVR;
	var bal;
	var ilo;
	var ihi;
	var jc;
	var jr;
	var i;

	// Decode input strings
	ilvl = ( jobvl === 'compute-vectors' );
	ilvr = ( jobvr === 'compute-vectors' );
	ilv = ilvl || ilvr;

	noscl = ( balanc === 'none' ) || ( balanc === 'permute' );
	wantsn = ( sense === 'none' );
	wantse = ( sense === 'eigenvalues' );
	wantsv = ( sense === 'right-vectors' );
	wantsb = ( sense === 'both' );

	info = 0;

	// Validate string inputs.
	if ( !( noscl || balanc === 'scale' || balanc === 'both' ) ) {
		info = -1;
	} else if ( !ilvl && jobvl !== 'no-vectors' ) {
		info = -2;
	} else if ( !ilvr && jobvr !== 'no-vectors' ) {
		info = -3;
	} else if ( !( wantsn || wantse || wantsv || wantsb ) ) {
		info = -4;
	}
	if ( info !== 0 ) {
		return {
			'info': info,
			'ilo': 0,
			'ihi': 0,
			'abnrm': 0.0,
			'bbnrm': 0.0
		};
	}

	// Quick return
	if ( N === 0 ) {
		return {
			'info': 0,
			'ilo': 1,
			'ihi': 0,
			'abnrm': 0.0,
			'bbnrm': 0.0
		};
	}

	// Allocate workspaces
	// WORK sized for the largest consumer; zggev uses N*32 + 33*32
	WORK = new Complex128Array( Math.max( 1, ( N * 32 ) + ( 33 * 32 ) ) );
	TAU = new Complex128Array( N );

	// RWORK needs 6*N for zggbal, 2*N for zhgeqz, 2*N for ztgevc; 8*N is safe.
	RWORK = new Float64Array( Math.max( 1, 8 * N ) );
	RWORKscratch = new Float64Array( 1 );
	Mout = [ 0 ];

	// Scale A if max element outside range [SMLNUM, BIGNUM]
	anrm = zlange( 'max', N, N, A, strideA1, strideA2, offsetA, RWORK, 1, 0 );
	ilascl = false;
	anrmto = 0.0;
	if ( anrm > ZERO && anrm < SMLNUM ) {
		anrmto = SMLNUM;
		ilascl = true;
	} else if ( anrm > BIGNUM ) {
		anrmto = BIGNUM;
		ilascl = true;
	}
	if ( ilascl ) {
		zlascl( 'general', 0, 0, anrm, anrmto, N, N, A, strideA1, strideA2, offsetA );
	}

	// Scale B if max element outside range [SMLNUM, BIGNUM]
	bnrm = zlange( 'max', N, N, B, strideB1, strideB2, offsetB, RWORK, 1, 0 );
	ilbscl = false;
	bnrmto = 0.0;
	if ( bnrm > ZERO && bnrm < SMLNUM ) {
		bnrmto = SMLNUM;
		ilbscl = true;
	} else if ( bnrm > BIGNUM ) {
		bnrmto = BIGNUM;
		ilbscl = true;
	}
	if ( ilbscl ) {
		zlascl( 'general', 0, 0, bnrm, bnrmto, N, N, B, strideB1, strideB2, offsetB );
	}

	// Permute and/or scale balancing. Note: zggbal writes LSCALE/RSCALE.
	bal = zggbal( balanc, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, RWORK, 1, 0 );
	ilo = bal.ilo; // 1-based
	ihi = bal.ihi; // 1-based

	// Compute 1-norms of the balanced A and B
	abnrm = zlange( 'one-norm', N, N, A, strideA1, strideA2, offsetA, RWORK, 1, 0 );
	if ( ilascl ) {
		RWORKscratch[ 0 ] = abnrm;
		dlascl( 'general', 0, 0, anrmto, anrm, 1, 1, RWORKscratch, 1, 1, 0 );
		abnrm = RWORKscratch[ 0 ];
	}

	bbnrm = zlange( 'one-norm', N, N, B, strideB1, strideB2, offsetB, RWORK, 1, 0 );
	if ( ilbscl ) {
		RWORKscratch[ 0 ] = bbnrm;
		dlascl( 'general', 0, 0, bnrmto, bnrm, 1, 1, RWORKscratch, 1, 1, 0 );
		bbnrm = RWORKscratch[ 0 ];
	}

	// Compute active block dimensions
	irows = ihi + 1 - ilo;
	if ( ilv || !wantsn ) {
		icols = N + 1 - ilo;
	} else {
		icols = irows;
	}

	// QR factorize B(ilo:ihi, ilo:icols) using zgeqrf
	zgeqrf( irows, icols, B, strideB1, strideB2, offsetB + ( ( ilo - 1 ) * strideB1 ) + ( ( ilo - 1 ) * strideB2 ), TAU, 1, 0, WORK, 1, 0 );

	// Apply Q^H to A from the left
	zunmqr( 'left', 'conjugate-transpose', irows, icols, irows, B, strideB1, strideB2, offsetB + ( ( ilo - 1 ) * strideB1 ) + ( ( ilo - 1 ) * strideB2 ), TAU, 1, 0, A, strideA1, strideA2, offsetA + ( ( ilo - 1 ) * strideA1 ) + ( ( ilo - 1 ) * strideA2 ), WORK, 1, 0 );

	// Initialize VL and generate Q
	if ( ilvl ) {
		zlaset( 'full', N, N, CZERO, CONE, VL, strideVL1, strideVL2, offsetVL );

		if ( irows > 1 ) {
			zlacpy( 'lower', irows - 1, irows - 1, B, strideB1, strideB2, offsetB + ( ilo * strideB1 ) + ( ( ilo - 1 ) * strideB2 ), VL, strideVL1, strideVL2, offsetVL + ( ilo * strideVL1 ) + ( ( ilo - 1 ) * strideVL2 ) );
		}

		zungqr( irows, irows, irows, VL, strideVL1, strideVL2, offsetVL + ( ( ilo - 1 ) * strideVL1 ) + ( ( ilo - 1 ) * strideVL2 ), TAU, 1, 0, WORK, 1, 0 );
	}

	// Initialize VR
	if ( ilvr ) {
		zlaset( 'full', N, N, CZERO, CONE, VR, strideVR1, strideVR2, offsetVR );
	}

	// Reduce to generalized Hessenberg form
	if ( ilv || !wantsn ) {
		zgghrd( ( ( ilvl ) ? 'update' : 'none' ), ( ( ilvr ) ? 'update' : 'none' ), N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
	} else {
		zgghrd( 'none', 'none', irows, 1, irows, A, strideA1, strideA2, offsetA + ( ( ilo - 1 ) * strideA1 ) + ( ( ilo - 1 ) * strideA2 ), B, strideB1, strideB2, offsetB + ( ( ilo - 1 ) * strideB1 ) + ( ( ilo - 1 ) * strideB2 ), VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
	}

	// QZ iteration, computing Schur form
	if ( ilv || !wantsn ) {
		chtemp = 'schur';
	} else {
		chtemp = 'eigenvalues';
	}

	ierr = zhgeqz( chtemp, ( ( ilvl ) ? 'update' : 'none' ), ( ( ilvr ) ? 'update' : 'none' ), N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, 1, 0, WORK.length, RWORK, 1, 0 );
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

	// Compute eigenvectors via ztgevc when requested
	if ( ilv || !wantsn ) {
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

			ierr = ztgevc( chtemp, 'backtransform', null, 0, 0, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, N, Mout, WORK, 1, 0, RWORK, 1, 0 );
			if ( ierr !== 0 ) {
				info = N + 2;
				return finalize();
			}
		}
		if ( !wantsn ) {
			// Compute reciprocal condition numbers one eigenvalue at a time, using ztgevc (in 'selected' mode) to recompute a pair of eigenvectors of the Schur form (S,T) and ztgsna to estimate their condition numbers. We cannot reuse VL/VR because ztgsna requires eigenvectors of (S,T), not the back-transformed versions.
			// Map zggevx SENSE to ztgsna job: 'right-vectors' → 'eigenvectors'.
			if ( wantse ) {
				snaJob = 'eigenvalues';
			} else if ( wantsv ) {
				snaJob = 'eigenvectors';
			} else {
				snaJob = 'both';
			}
			workVL = new Complex128Array( N );
			workVR = new Complex128Array( N );
			BWORK = new Uint8Array( Math.max( N, 1 ) );
			IWORK = new Int32Array( Math.max( N + 2, 1 ) );
			rcondeS = new Float64Array( 1 );
			rcondvS = new Float64Array( 1 );
			for ( iIdx = 0; iIdx < N; iIdx++ ) {
				for ( jVal = 0; jVal < N; jVal++ ) {
					BWORK[ jVal ] = 0;
				}
				BWORK[ iIdx ] = 1;

				// Compute a single eigenvector pair of (S,T) for ztgsna.
				if ( wantse || wantsb ) {
					Mout[ 0 ] = 0;
					ierr = ztgevc( 'both', 'selected', BWORK, 1, 0, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, workVL, 1, N, 0, workVR, 1, N, 0, 1, Mout, WORK, 1, 0, RWORK, 1, 0 );
					if ( ierr !== 0 ) {
						info = N + 2;
						return finalize();
					}
				}

				rcondeS[ 0 ] = ZERO;
				rcondvS[ 0 ] = ZERO;
				snaRes = ztgsna( snaJob, 'selected', BWORK, 1, 0, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, workVL, 1, N, 0, workVR, 1, N, 0, rcondeS, 1, 0, rcondvS, 1, 0, 1, 0, WORK, 1, 0, WORK.length, IWORK, 1, 0 );
				if ( snaRes.info < 0 ) {
					info = N + 2;
					return finalize();
				}
				if ( wantse || wantsb ) {
					RCONDE[ offsetRCONDE + ( iIdx * strideRCONDE ) ] = rcondeS[ 0 ];
				}
				if ( wantsv || wantsb ) {
					RCONDV[ offsetRCONDV + ( iIdx * strideRCONDV ) ] = rcondvS[ 0 ];
				}
			}
		}
	}

	// Undo balancing on VL and VR, and normalize
	if ( ilvl ) {
		zggbak( balanc, 'left', N, ilo, ihi, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, N, VL, strideVL1, strideVL2, offsetVL );

		VLv = reinterpret( VL, 0 );
		sVL1 = strideVL1 * 2;
		sVL2 = strideVL2 * 2;
		oVL = offsetVL * 2;
		for ( jc = 0; jc < N; jc++ ) {
			temp = ZERO;
			for ( jr = 0; jr < N; jr++ ) {
				temp = Math.max( temp, abs1( VLv, oVL + ( jr * sVL1 ) + ( jc * sVL2 ) ) );
			}
			if ( temp < SMLNUM ) {
				continue;
			}
			temp = ONE / temp;
			for ( jr = 0; jr < N; jr++ ) {
				i = oVL + ( jr * sVL1 ) + ( jc * sVL2 );
				VLv[ i ] *= temp;
				VLv[ i + 1 ] *= temp;
			}
		}
	}

	if ( ilvr ) {
		zggbak( balanc, 'right', N, ilo, ihi, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, N, VR, strideVR1, strideVR2, offsetVR );

		VRv = reinterpret( VR, 0 );
		sVR1 = strideVR1 * 2;
		sVR2 = strideVR2 * 2;
		oVR = offsetVR * 2;
		for ( jc = 0; jc < N; jc++ ) {
			temp = ZERO;
			for ( jr = 0; jr < N; jr++ ) {
				temp = Math.max( temp, abs1( VRv, oVR + ( jr * sVR1 ) + ( jc * sVR2 ) ) );
			}
			if ( temp < SMLNUM ) {
				continue;
			}
			temp = ONE / temp;
			for ( jr = 0; jr < N; jr++ ) {
				i = oVR + ( jr * sVR1 ) + ( jc * sVR2 );
				VRv[ i ] *= temp;
				VRv[ i + 1 ] *= temp;
			}
		}
	}

	return finalize();

	/**
	* Undo scaling on ALPHA/BETA and return the result object.
	*
	* @private
	* @returns {Object} result
	*/
	function finalize() {
		if ( ilascl ) {
			zlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHA, strideALPHA, 1, offsetALPHA );
		}
		if ( ilbscl ) {
			zlascl( 'general', 0, 0, bnrmto, bnrm, N, 1, BETA, strideBETA, 1, offsetBETA );
		}
		return {
			'info': info,
			'ilo': ilo,
			'ihi': ihi,
			'abnrm': abnrm,
			'bbnrm': bbnrm
		};
	}
}


// EXPORTS //

export default zggevx;
