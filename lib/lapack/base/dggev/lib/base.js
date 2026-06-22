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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dggbal from '../../dggbal/lib/base.js';
import dggbak from '../../dggbak/lib/base.js';
import dgeqrf from '../../dgeqrf/lib/base.js';
import dormqr from '../../dormqr/lib/base.js';
import dorgqr from '../../dorgqr/lib/base.js';
import dgghrd from '../../dgghrd/lib/base.js';
import dhgeqz from '../../dhgeqz/lib/base.js';
import dtgevc from '../../dtgevc/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

// Machine constants (hoisted to module scope)
var EPS = dlamch( 'precision' );
var SMLNUM_BASE = dlamch( 'safe-minimum' );
var BIGNUM_BASE = ONE / SMLNUM_BASE; // eslint-disable-line no-unused-vars
var SMLNUM = Math.sqrt( SMLNUM_BASE ) / EPS;
var BIGNUM = ONE / SMLNUM;


// MAIN //

/**
* Computes the generalized eigenvalues and, optionally, the left and/or right.
* generalized eigenvectors for a pair of N-by-N real nonsymmetric matrices (A,B).
*
* A generalized eigenvalue for a pair of matrices (A,B) is a scalar lambda or
* a ratio alpha/beta = lambda, such that A - lambda*B is singular. It is
* usually represented as the pair (alpha,beta), as there is a reasonable
* interpretation for beta=0, and even for both being zero.
*
* @private
* @param {string} jobvl - `'compute-vectors'` to compute left eigenvectors, `'no-vectors'` to not
* @param {string} jobvr - `'compute-vectors'` to compute right eigenvectors, `'no-vectors'` to not
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input matrix A (N x N), overwritten on exit
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - input matrix B (N x N), overwritten on exit
* @param {integer} strideB1 - first dimension stride of B
* @param {integer} strideB2 - second dimension stride of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} ALPHAR - output: real parts of alpha (length N)
* @param {integer} strideALPHAR - stride for ALPHAR
* @param {NonNegativeInteger} offsetALPHAR - offset for ALPHAR
* @param {Float64Array} ALPHAI - output: imaginary parts of alpha (length N)
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {NonNegativeInteger} offsetALPHAI - offset for ALPHAI
* @param {Float64Array} BETA - output: beta values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - offset for BETA
* @param {Float64Array} VL - output: left eigenvectors (N x N)
* @param {integer} strideVL1 - first dimension stride of VL
* @param {integer} strideVL2 - second dimension stride of VL
* @param {NonNegativeInteger} offsetVL - offset for VL
* @param {Float64Array} VR - output: right eigenvectors (N x N)
* @param {integer} strideVR1 - first dimension stride of VR
* @param {integer} strideVR2 - second dimension stride of VR
* @param {NonNegativeInteger} offsetVR - offset for VR
* @returns {integer} info - 0 on success, 1..N if QZ iteration failed, N+1 for other errors
*/
function dggev( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR ) { // eslint-disable-line max-len
	var LSCALE;
	var RSCALE;
	var SELECT;
	var ilascl;
	var ilbscl;
	var anrmto;
	var bnrmto;
	var chtemp;
	var compvl;
	var compvr;
	var oVLdst;
	var irows;
	var icols;
	var oBsrc;
	var anrm;
	var bnrm;
	var ilvl;
	var ilvr;
	var ierr;
	var info;
	var WORK;
	var oVLI;
	var oBI;
	var oAI;
	var TAU;
	var ilo;
	var ihi;
	var ilv;
	var bal;

	ilvl = ( jobvl === 'compute-vectors' );
	ilvr = ( jobvr === 'compute-vectors' );
	ilv = ilvl || ilvr;

	info = 0;

	// Quick return
	if ( N === 0 ) {
		return 0;
	}

	// Allocate workspace
	LSCALE = new Float64Array( N );
	RSCALE = new Float64Array( N );
	TAU = new Float64Array( N );
	WORK = new Float64Array( Math.max( 8 * N, 1 ) );
	SELECT = new Uint8Array( 1 ); // unused but required by dtgevc

	// Scale A if max element outside range [SMLNUM, BIGNUM]
	anrm = dlange( 'max', N, N, A, strideA1, strideA2, offsetA, WORK, 1, 0 );
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
		dlascl( 'general', 0, 0, anrm, anrmto, N, N, A, strideA1, strideA2, offsetA );
	}

	// Scale B if max element outside range [SMLNUM, BIGNUM]
	bnrm = dlange( 'max', N, N, B, strideB1, strideB2, offsetB, WORK, 1, 0 );
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
		dlascl( 'general', 0, 0, bnrm, bnrmto, N, N, B, strideB1, strideB2, offsetB );
	}

	// Permute the matrices A, B to isolate eigenvalues
	bal = dggbal( 'permute', N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, LSCALE, 1, 0, RSCALE, 1, 0, WORK, 1, 0 );
	ilo = bal.ilo; // 1-based
	ihi = bal.ihi; // 1-based

	// Compute number of rows and columns of the submatrices to work on
	irows = ihi + 1 - ilo;
	if ( ilv ) {
		icols = N + 1 - ilo;
	} else {
		icols = irows;
	}

	// Compute offsets for submatrix (ilo-1, ilo-1) in 0-based indexing
	oBI = offsetB + ( ( ilo - 1 ) * strideB1 ) + ( ( ilo - 1 ) * strideB2 );
	oAI = offsetA + ( ( ilo - 1 ) * strideA1 ) + ( ( ilo - 1 ) * strideA2 );

	// QR factorize the submatrix B(ilo:ihi, ilo:N)
	dgeqrf( irows, icols, B, strideB1, strideB2, oBI, TAU, 1, 0, WORK, 1, 0 );

	// Apply the orthogonal transformation to A: A(ilo:ihi, ilo:N) = Q^T * A(ilo:ihi, ilo:N)
	dormqr( 'left', 'transpose', irows, icols, irows, B, strideB1, strideB2, oBI, TAU, 1, 0, A, strideA1, strideA2, oAI, WORK, 1, 0 );

	// Initialize VL and/or VR
	if ( ilvl ) {
		// Set VL to identity
		dlaset( 'full', N, N, ZERO, ONE, VL, strideVL1, strideVL2, offsetVL );

		// Copy lower triangular part of B(ilo+1:ihi, ilo:ihi-1) to VL
		if ( irows > 1 ) {
			// Fortran: B(ILO+1, ILO) -> 0-based: (ilo, ilo-1)
			oBsrc = offsetB + ( ilo * strideB1 ) + ( ( ilo - 1 ) * strideB2 );
			oVLdst = offsetVL + ( ilo * strideVL1 ) + ( ( ilo - 1 ) * strideVL2 );
			dlacpy( 'lower', irows - 1, irows - 1, B, strideB1, strideB2, oBsrc, VL, strideVL1, strideVL2, oVLdst );
		}

		// Generate orthogonal matrix Q from the QR factorization
		oVLI = offsetVL + ( ( ilo - 1 ) * strideVL1 ) + ( ( ilo - 1 ) * strideVL2 );
		dorgqr( irows, irows, irows, VL, strideVL1, strideVL2, oVLI, TAU, 1, 0, WORK, 1, 0 );
	}

	if ( ilvr ) {
		// Set VR to identity
		dlaset( 'full', N, N, ZERO, ONE, VR, strideVR1, strideVR2, offsetVR );
	}

	// Reduce to generalized Hessenberg form
	if ( ilv ) {
		// Map jobvl/jobvr: 'compute-vectors' -> 'update', 'no-vectors' -> 'none'
		compvl = ( ilvl ) ? 'update' : 'none';
		compvr = ( ilvr ) ? 'update' : 'none';
		dgghrd( compvl, compvr, N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
	} else {
		// Not computing eigenvectors: work on the submatrix only
		dgghrd( 'none', 'none', irows, 1, irows, A, strideA1, strideA2, oAI, B, strideB1, strideB2, oBI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
	}

	// Perform QZ iteration, computing Schur form
	// Note: dhgeqz takes 0-based ilo/ihi
	if ( ilv ) {
		chtemp = 'schur';
	} else {
		chtemp = 'eigenvalues';
	}
	compvl = ( ilvl ) ? 'update' : 'none';
	compvr = ( ilvr ) ? 'update' : 'none';
	ierr = dhgeqz( chtemp, compvl, compvr, N, ilo - 1, ihi - 1, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, 1, 0, WORK.length );
	if ( ierr !== 0 ) {
		if ( ierr > 0 && ierr <= N ) {
			info = ierr;
		} else if ( ierr > N && ierr <= 2 * N ) {
			info = ierr - N;
		} else {
			info = N + 1;
		}
		return cleanup( info, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA );
	}

	// Compute eigenvectors
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
		ierr = dtgevc( chtemp, 'backtransform', SELECT, 1, 0, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, N, 0, WORK, 1, 0 );
		if ( ierr !== 0 ) {
			info = N + 2;
			return cleanup( info, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA );
		}

		// Undo balancing on VL and VR, and normalize eigenvectors
		if ( ilvl ) {
			dggbak( 'permute', 'left', N, ilo, ihi, LSCALE, 1, 0, RSCALE, 1, 0, N, VL, strideVL1, strideVL2, offsetVL );
			normalizeEigenvectors( N, ALPHAI, strideALPHAI, offsetALPHAI, VL, strideVL1, strideVL2, offsetVL );
		}
		if ( ilvr ) {
			dggbak( 'permute', 'right', N, ilo, ihi, LSCALE, 1, 0, RSCALE, 1, 0, N, VR, strideVR1, strideVR2, offsetVR );
			normalizeEigenvectors( N, ALPHAI, strideALPHAI, offsetALPHAI, VR, strideVR1, strideVR2, offsetVR );
		}
	}

	return cleanup( info, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA );
}

/**
* Undo scaling on eigenvalue output arrays.
*
* @private
* @param {integer} info - info code
* @param {boolean} ilascl - whether A was scaled
* @param {boolean} ilbscl - whether B was scaled
* @param {number} anrmto - scaled norm of A
* @param {number} anrm - original norm of A
* @param {number} bnrmto - scaled norm of B
* @param {number} bnrm - original norm of B
* @param {NonNegativeInteger} N - problem size
* @param {Float64Array} ALPHAR - real parts of alpha
* @param {integer} strideALPHAR - stride for ALPHAR
* @param {NonNegativeInteger} offsetALPHAR - offset for ALPHAR
* @param {Float64Array} ALPHAI - imaginary parts of alpha
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {NonNegativeInteger} offsetALPHAI - offset for ALPHAI
* @param {Float64Array} BETA - beta values
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - offset for BETA
* @returns {integer} info code
*/
function cleanup( info, ilascl, ilbscl, anrmto, anrm, bnrmto, bnrm, N, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA ) {
	if ( ilascl ) {
		dlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHAR, strideALPHAR, 1, offsetALPHAR );
		dlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHAI, strideALPHAI, 1, offsetALPHAI );
	}
	if ( ilbscl ) {
		dlascl( 'general', 0, 0, bnrmto, bnrm, N, 1, BETA, strideBETA, 1, offsetBETA );
	}
	return info;
}

/**
* Normalizes eigenvectors by their infinity norm, handling complex conjugate pairs.
*
* @private
* @param {NonNegativeInteger} N - problem size
* @param {Float64Array} ALPHAI - imaginary parts of eigenvalues
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {NonNegativeInteger} offsetALPHAI - offset for ALPHAI
* @param {Float64Array} V - eigenvector matrix
* @param {integer} strideV1 - first dimension stride of V
* @param {integer} strideV2 - second dimension stride of V
* @param {NonNegativeInteger} offsetV - offset for V
*/
function normalizeEigenvectors( N, ALPHAI, strideALPHAI, offsetALPHAI, V, strideV1, strideV2, offsetV ) {
	var temp;
	var jc;
	var jr;

	for ( jc = 0; jc < N; jc++ ) {
		if ( ALPHAI[ offsetALPHAI + ( jc * strideALPHAI ) ] < ZERO ) {
			continue;
		}
		temp = ZERO;
		if ( ALPHAI[ offsetALPHAI + ( jc * strideALPHAI ) ] === ZERO ) {
			// Real eigenvalue: find max |V(jr,jc)|
			for ( jr = 0; jr < N; jr++ ) {
				temp = Math.max( temp, Math.abs( V[ offsetV + ( jr * strideV1 ) + ( jc * strideV2 ) ] ) );
			}
		} else {
			// Complex eigenvalue pair: find max( |V(jr,jc)| + |V(jr,jc+1)| )
			for ( jr = 0; jr < N; jr++ ) {
				temp = Math.max( temp, Math.abs( V[ offsetV + ( jr * strideV1 ) + ( jc * strideV2 ) ] ) + Math.abs( V[ offsetV + ( jr * strideV1 ) + ( ( jc + 1 ) * strideV2 ) ] ) );
			}
		}
		if ( temp < SMLNUM ) {
			continue;
		}
		temp = ONE / temp;
		if ( ALPHAI[ offsetALPHAI + ( jc * strideALPHAI ) ] === ZERO ) {
			// Real eigenvalue: scale column jc
			for ( jr = 0; jr < N; jr++ ) {
				V[ offsetV + ( jr * strideV1 ) + ( jc * strideV2 ) ] *= temp;
			}
		} else {
			// Complex eigenvalue pair: scale columns jc and jc+1
			for ( jr = 0; jr < N; jr++ ) {
				V[ offsetV + ( jr * strideV1 ) + ( jc * strideV2 ) ] *= temp;
				V[ offsetV + ( jr * strideV1 ) + ( ( jc + 1 ) * strideV2 ) ] *= temp;
			}
		}
	}
}


// EXPORTS //

export default dggev;
