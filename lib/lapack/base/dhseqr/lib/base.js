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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import dlacpy from '../../dlacpy/lib/base.js';
import dlahqr from '../../dlahqr/lib/base.js';
import dlaqr0 from '../../dlaqr0/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var NTINY = 15;
var NL = 49;

// Iparmq ISPEC=12: crossover point for small-to-large strategy
var NMIN = 75;

// Use the aggressive-early-deflation path (dlaqr0 -> dlaqr3/dlaqr4/dlaqr5)

// For N > NMIN. This was disabled while dlaqr23impl's spike-reflection

// Copied the first column of V instead of its first row (DCOPY stride bug,

// Only triggered with deflation + ns>1 + V aliased into H); fixed in

// lib/lapack/base/dlaqr2. Verified vs reference Fortran DLAQR0.
var USE_DLAQR0 = true;


// MAIN //

/**
* Computes the eigenvalues of a real upper Hessenberg matrix H, and.
* optionally the matrices T and Z from the Schur decomposition
* H = Z _ T _ Z**T, where T is an upper quasi-triangular matrix (the
* Schur form) and Z is the orthogonal matrix of Schur vectors.
*
* JOB = 'E': compute eigenvalues only.
* JOB = 'S': compute eigenvalues and the Schur form T.
*
* COMPZ = 'N': no Schur vectors are computed.
* COMPZ = 'I': Z is initialized to the identity matrix and the matrix Z
*              of Schur vectors of H is returned.
* COMPZ = 'V': Z must contain an orthogonal matrix Q on entry, and the
*              product Q*Z is returned.
*
* ILO and IHI are 1-based indices (Fortran convention). The active block
* is H(ILO:IHI, ILO:IHI). Elements outside this block are assumed already
* upper triangular. Normally ILO=1 and IHI=N.
*
* On exit, if INFO = 0, WR and WI contain the real and imaginary parts
* of the computed eigenvalues. Complex eigenvalues occur in conjugate
* pairs in consecutive entries. If JOB = 'S', the eigenvalues are stored
* in the same order as on the diagonal of T.
*
* INFO = 0: success.
* INFO > 0: dhseqr failed to compute all eigenvalues. Elements
*           INFO+1:IHI of WR and WI contain those eigenvalues which
*           have been successfully computed.
*
* @private
* @param {string} job - `'eigenvalues'` or `'schur'`
* @param {string} compz - `'none'`, `'initialize'`, or `'update'`
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ilo - first row/col of the active block (1-based)
* @param {integer} ihi - last row/col of the active block (1-based)
* @param {Float64Array} H - upper Hessenberg matrix (N-by-N)
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Float64Array} WR - output array for real parts of eigenvalues
* @param {integer} strideWR - stride length for `WR`
* @param {NonNegativeInteger} offsetWR - starting index for `WR`
* @param {Float64Array} WI - output array for imaginary parts of eigenvalues
* @param {integer} strideWI - stride length for `WI`
* @param {NonNegativeInteger} offsetWI - starting index for `WI`
* @param {Float64Array} Z - Schur vectors matrix (N-by-N)
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} work - caller-provided workspace array (minimum `max(1,N)` elements; larger improves performance via dlaqr0)
* @param {integer} strideWork - stride length for `work`
* @param {NonNegativeInteger} offsetWork - starting index for `work`
* @returns {integer} info - 0 on success, >0 if failed to converge
*/
function dhseqr( job, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, Z, strideZ1, strideZ2, offsetZ, work, strideWork, offsetWork ) { // eslint-disable-line max-params
	var wantt;
	var initz;
	var wantz;
	var workl;
	var lwork;
	var info;
	var kbot;
	var HL;
	var i;

	// Decode parameters
	wantt = ( job === 'schur' );
	initz = ( compz === 'initialize' );
	wantz = initz || ( compz === 'update' );

	// Quick return if N = 0
	if ( N === 0 ) {
		return 0;
	}

	// Extract eigenvalues of rows/cols outside [ILO, IHI] from the diagonal of H
	for ( i = 0; i < ilo - 1; i++ ) {
		WR[ offsetWR + ( i * strideWR ) ] = H[ offsetH + ( i * strideH1 ) + ( i * strideH2 ) ];
		WI[ offsetWI + ( i * strideWI ) ] = ZERO;
	}
	for ( i = ihi; i < N; i++ ) {
		WR[ offsetWR + ( i * strideWR ) ] = H[ offsetH + ( i * strideH1 ) + ( i * strideH2 ) ];
		WI[ offsetWI + ( i * strideWI ) ] = ZERO;
	}

	// Initialize Z to identity if COMPZ = 'I'
	if ( initz ) {
		dlaset( 'all', N, N, ZERO, ONE, Z, strideZ1, strideZ2, offsetZ );
	}

	// If active block is a single element, just read off the eigenvalue
	if ( ilo === ihi ) {
		WR[ offsetWR + ( ( ilo - 1 ) * strideWR ) ] = H[ offsetH + ( ( ilo - 1 ) * strideH1 ) + ( ( ilo - 1 ) * strideH2 ) ];
		WI[ offsetWI + ( ( ilo - 1 ) * strideWI ) ] = ZERO;
		return 0;
	}

	// Compute the available workspace length from the caller-provided buffer
	lwork = Math.floor( ( work.length - offsetWork ) / Math.abs( strideWork ) );

	// For N > NMIN, use the aggressive early deflation QR algorithm (dlaqr0).

	// For small N (<= NMIN), use dlahqr (double-shift implicit QR).
	if ( USE_DLAQR0 && N > Math.max( NTINY, NMIN ) ) {
		// Large matrix: use dlaqr0 directly with caller-provided workspace.
		info = dlaqr0( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, ilo, ihi, Z, strideZ1, strideZ2, offsetZ, work, strideWork, offsetWork, lwork );
	} else {
		// Small matrix: use dlahqr
		info = dlahqr( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, ilo, ihi, Z, strideZ1, strideZ2, offsetZ );

		if ( info > 0 ) {
			// Dlahqr failed to converge. KBOT = INFO is the last converged index.
			// Try again with dlaqr0 on the unconverged block.
			kbot = info;

			if ( N >= NL ) {
				// Matrix is big enough to use dlaqr0 directly with caller's workspace
				info = dlaqr0( wantt, wantz, N, ilo, kbot, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, ilo, ihi, Z, strideZ1, strideZ2, offsetZ, work, strideWork, offsetWork, lwork );
			} else {
				// Matrix is smaller than NL — embed in an NL-by-NL workspace
				// To give dlaqr0 more room to work.
				HL = new Float64Array( NL * NL );

				// Copy H into HL (column-major, stride = NL)
				dlacpy( 'all', N, N, H, strideH1, strideH2, offsetH, HL, 1, NL, 0 );

				// Zero out HL(N+1, N) — the subdiagonal just below the copied block

				// (Fortran: HL(N+1, N) = 0; 0-based: HL[N + (N-1)*NL] = 0)
				HL[ N + ( ( N - 1 ) * NL ) ] = ZERO;

				// Zero the columns beyond N
				dlaset( 'full', NL, NL - N, ZERO, ZERO, HL, 1, NL, N * NL );

				// Run dlaqr0 on the embedded matrix using a small local buffer.

				// Fortran uses local WORKL(NL) — 49 elements; caller's work may be

				// Smaller than NL when N < NL, so we use an internal NL-element

				// Scratch buffer here as the reference Fortran does.
				workl = new Float64Array( NL );
				info = dlaqr0( wantt, wantz, NL, ilo, kbot, HL, 1, NL, 0, WR, strideWR, offsetWR, WI, strideWI, offsetWI, ilo, ihi, Z, strideZ1, strideZ2, offsetZ, workl, 1, 0, NL );

				// Copy the result back to H if needed
				if ( wantt || info !== 0 ) {
					dlacpy( 'all', N, N, HL, 1, NL, 0, H, strideH1, strideH2, offsetH );
				}
			}
		}
	}

	// Clean up the strictly lower triangular part of H (below subdiagonal)
	// To ensure proper Schur form
	if ( ( wantt || info !== 0 ) && N > 2 ) {
		dlaset( 'lower', N - 2, N - 2, ZERO, ZERO, H, strideH1, strideH2, offsetH + ( 2 * strideH1 ) + ( 0 * strideH2 ) );
	}

	return info;
}


// EXPORTS //

export default dhseqr;
