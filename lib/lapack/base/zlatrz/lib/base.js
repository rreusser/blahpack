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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacgv from './../../zlacgv/lib/base.js';
import zlarfg from './../../zlarfg/lib/base.js';
import zlarz from './../../zlarz/lib/base.js';


// MAIN //

/**
* Factors the M-by-(M+L) complex upper trapezoidal matrix `[ A1 A2 ] = [ A(0:M-1,0:M-1) A(0:M-1,N-L:N-1) ]` as `( R  0 ) * Z` by means of unitary transformations.
*
* ## Notes
*
* -   `Z` is an (M+L)-by-(M+L) unitary matrix, and `R` and `A1` are M-by-M upper triangular matrices.
* -   On exit, the leading M-by-M upper triangular part of `A` contains the upper triangular matrix `R`, and elements N-L to N-1 of the first M rows of `A`, with the array `TAU`, represent the unitary matrix `Z` as a product of M elementary reflectors.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {NonNegativeInteger} l - number of columns containing the meaningful part of the Householder vectors (`N - M >= l >= 0`)
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} TAU - output array of scalar factors of the elementary reflectors (length `M`)
* @param {integer} strideTAU - stride length for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @param {Complex128Array} work - workspace array (length `M`)
* @param {integer} strideWork - stride length for `work` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `work` (in complex elements)
* @returns {Complex128Array} `A`
*/
function zlatrz( M, N, l, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, work, strideWork, offsetWork ) {
	var tauScratchView;
	var tauScratch;
	var alphaView;
	var alphaArr;
	var tauView;
	var offsetV;
	var offsetC;
	var beta;
	var aii;
	var oT;
	var oA;
	var av;
	var i;

	// Quick return if possible...
	if ( M === 0 ) {
		return A;
	}
	if ( M === N ) {
		tauView = reinterpret( TAU, 0 );
		oT = offsetTAU * 2;
		for ( i = 0; i < N; i++ ) {
			tauView[ oT ] = 0.0;
			tauView[ oT + 1 ] = 0.0;
			oT += ( strideTAU * 2 );
		}
		return A;
	}

	// Scratch Complex128Array to hold `ALPHA` (Fortran passes a complex scalar by reference into ZLARFG).
	alphaArr = new Complex128Array( 1 );
	alphaView = reinterpret( alphaArr, 0 );

	// Separate scratch to hold the un-conjugated tau passed to ZLARZ (so we don't clobber ALPHA before reading BETA).
	tauScratch = new Complex128Array( 1 );
	tauScratchView = reinterpret( tauScratch, 0 );

	av = reinterpret( A, 0 );
	tauView = reinterpret( TAU, 0 );

	// Iterate from i = M-1 down to 0 (Fortran: I = M, M-1, ..., 1).
	for ( i = M - 1; i >= 0; i-- ) {
		// Index of A(i, i) — the diagonal pivot element (in complex elements):
		aii = offsetA + ( i * strideA1 ) + ( i * strideA2 );

		// Starting index of A(i, N-l) — the trailing reflector tail (in complex elements):
		offsetV = offsetA + ( i * strideA1 ) + ( ( N - l ) * strideA2 );

		// Conjugate the L trailing entries of row i: ZLACGV( L, A(I, N-L+1), LDA ).
		zlacgv( l, A, strideA2, offsetV );

		// ALPHA = conj( A(i,i) ); load via Float64 view (factor of 2 for interleaving).
		oA = aii * 2;
		alphaView[ 0 ] = av[ oA ];
		alphaView[ 1 ] = -av[ oA + 1 ];

		// Generate elementary reflector H(i) to annihilate [ A(i,i), A(i,N-l:N-1) ]. Reflector length is L+1 (one leading alpha plus L trailing tail elements). After return, ALPHA holds BETA (real-valued).
		zlarfg( l + 1, alphaArr, 0, A, strideA2, offsetV, TAU, offsetTAU + ( i * strideTAU ) );

		// Capture BETA before we reuse alphaArr (BETA is purely real).
		beta = alphaView[ 0 ];

		// Conjugate TAU(i) in-place: TAU(I) = conj( TAU(I) ).
		oT = ( offsetTAU + ( i * strideTAU ) ) * 2;
		tauView[ oT + 1 ] = -tauView[ oT + 1 ];

		// Apply H(i) to A(0:i-1, i:N-1) from the right, using conj(TAU(i)) (i.e. the original tau returned by ZLARFG).
		tauScratchView[ 0 ] = tauView[ oT ];
		tauScratchView[ 1 ] = -tauView[ oT + 1 ];

		offsetC = offsetA + ( i * strideA2 );
		zlarz( 'right', i, N - i, l, A, strideA2, offsetV, tauScratch, 0, A, strideA1, strideA2, offsetC, work, strideWork, offsetWork );

		// A(i,i) = conj( ALPHA ) where ALPHA == BETA (real), so imag is 0.
		av[ oA ] = beta;
		av[ oA + 1 ] = 0.0;
	}
	return A;
}


// EXPORTS //

export default zlatrz;
