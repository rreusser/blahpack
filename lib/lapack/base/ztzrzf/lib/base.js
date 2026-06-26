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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarzb from './../../zlarzb/lib/base.js';
import zlarzt from './../../zlarzt/lib/base.js';
import zlatrz from './../../zlatrz/lib/base.js';


// VARIABLES //

// Block size used for the blocked path. Matches LAPACK's typical ILAENV(1, 'ZGERQF', ...) default.
var DEFAULT_NB = 32;

// Crossover threshold below which the unblocked code is used.
var DEFAULT_NX = 128;


// MAIN //

/**
* Reduces a complex M-by-N (M <= N) upper trapezoidal matrix `A` to upper triangular form by means of unitary transformations (RZ factorization).
*
* ## Notes
*
* -   On exit, the leading M-by-M upper triangular part of `A` contains the upper triangular matrix `R`. The remaining elements of the first M rows of `A`, with the array `TAU`, represent the unitary matrix `Z` as a product of `M` elementary reflectors of the form `H(i) = I - tau * v * v**H`, where `v` is a length-`(N-M+1)` vector with a leading 1 followed by `N-M` non-trivial entries (the "Z-form" reflector).
* -   The unblocked kernel is `zlatrz`; this routine is the blocked driver. Block reflectors are formed via `zlarzt` and applied via `zlarzb`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A` (must satisfy `N >= M`)
* @param {Complex128Array} A - input/output matrix; on exit, the leading M-by-M upper triangular part contains `R` and the first M rows from column `M` to `N-1` (combined with `TAU`) encode the reflectors of `Z`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} TAU - output array of scalar factors of the elementary reflectors (length `M`)
* @param {integer} strideTAU - stride length for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @param {Complex128Array} WORK - workspace array (length `>= max(1, M)`; for the blocked path, `M*NB` is recommended)
* @param {integer} strideWORK - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function ztzrzf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	var tauView;
	var ldwork;
	var nbmin;
	var nb;
	var nx;
	var ki;
	var kk;
	var m1;
	var mu;
	var ib;
	var oT;
	var i;
	var T;

	// Quick return if possible:
	if ( M === 0 ) {
		return 0;
	}
	if ( M === N ) {
		// `A` is already triangular; zero out `TAU` and return.
		tauView = reinterpret( TAU, 0 );
		oT = offsetTAU * 2;
		for ( i = 0; i < N; i++ ) {
			tauView[ oT ] = 0.0;
			tauView[ oT + 1 ] = 0.0;
			oT += ( strideTAU * 2 );
		}
		return 0;
	}

	nb = DEFAULT_NB;
	nbmin = 2;
	nx = 1;
	ldwork = M;
	if ( nb > 1 && nb < M ) {
		nx = DEFAULT_NX;
	}

	// Allocate the T matrix for block reflectors (NB-by-NB).
	T = new Complex128Array( nb * nb );

	if ( nb >= nbmin && nb < M && nx < M ) {
		// Use blocked code initially. The last KK columns are handled by the unblocked code at the end.
		m1 = Math.min( M + 1, N );
		ki = ( ( ( M - nx - 1 ) / nb ) | 0 ) * nb;
		kk = Math.min( M, ki + nb );

		// Iterate from i = M - kk + ki down to M - kk by steps of -NB (Fortran convention).

		// Convert to 0-based offsets: Fortran I (1-based) maps to i (0-based) = I-1.
		for ( i = ( M - kk ) + ki; i >= ( M - kk ); i -= nb ) {
			ib = Math.min( M - i, nb );

			// Compute the RZ factorization of the trailing IB-by-(N-I) block A(i:i+ib-1, i:N-1).

			// Z-form reflector tail length L = N - M (constant across all blocks).
			zlatrz( ib, N - i, N - M, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( i * strideA2 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), WORK, strideWORK, offsetWORK );

			if ( i > 0 ) {
				// Form the triangular factor of the block reflector
				// H = H(I) H(I+1) ... H(I+IB-1).
				// V = A(i:i+ib-1, M:N-1) — the IB-by-(N-M) row-stored reflector tails.
				// T is a standalone NB-by-NB scratch buffer with leading dimension NB.
				zlarzt( 'backward', 'rowwise', N - M, ib, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( ( m1 - 1 ) * strideA2 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), T, 1, nb, 0 );

				// Apply H to A(0:i-1, i:N-1) from the right.

				// The WORK buffer used by zlarzb has leading dimension `ldwork` (= M); each column holds up to M complex elements.
				zlarzb( 'right', 'no-transpose', 'backward', 'rowwise', i, N - i, ib, N - M, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( ( m1 - 1 ) * strideA2 ), T, 1, nb, 0, A, strideA1, strideA2, offsetA + ( i * strideA2 ), WORK, 1, ldwork, 0 );
			}
		}
		// After the loop, `i` has been decremented past the lower bound; following the Fortran
		// Convention (I + NB - 1 in 1-based), the unblocked tail starts at column `i + nb` in
		// 0-based indexing. Equivalently: `mu = i + nb` (= M - kk + nb).
		mu = i + nb;
	} else {
		mu = M;
	}

	// Use unblocked code to factor the last or only block.
	if ( mu > 0 ) {
		zlatrz( mu, N, N - M, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );
	}

	return 0;
}


// EXPORTS //

export default ztzrzf;
