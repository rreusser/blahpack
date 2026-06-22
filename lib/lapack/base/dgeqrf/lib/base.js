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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import dgeqr2 from '../../dgeqr2/lib/base.js';
import dlarfb from '../../dlarfb/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';


// VARIABLES //

var DEFAULT_NB = 32;


// MAIN //

/**
* Computes a QR factorization of a real M-by-N matrix A = Q * R.
* using blocked Householder reflections.
*
* The caller must supply WORK as a `Float64Array` of size at least
* `N*NB + NB*NB` elements (with `NB = 32`) when the blocked path is taken
* (i.e., `min(M,N) > NB`). The buffer is partitioned so that
* `WORK[offsetWORK .. offsetWORK + N*NB - 1]` holds the `dlarfb` block
* update workspace (logical leading dimension `N`) and
* `WORK[offsetWORK + N*NB .. offsetWORK + N*NB + NB*NB - 1]` holds the
* `NB`-by-`NB` block-reflector `T` factor. For the unblocked path
* (`min(M,N) <= NB`), only `N` elements are required.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride length for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - caller-provided workspace (see size formula above)
* @param {integer} strideWORK - stride length for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dgeqrf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	var offsetT;
	var ldwork;
	var nbmin;
	var iws;
	var ib;
	var nb;
	var nx;
	var T;
	var K;
	var i;

	K = Math.min( M, N );
	if ( K === 0 ) {
		return 0;
	}
	nb = DEFAULT_NB;
	nbmin = 2;
	nx = 0;
	iws = N;
	ldwork = N;

	if ( nb > 1 && nb < K ) {
		iws = ldwork * nb;
	}

	T = WORK;
	offsetT = offsetWORK + iws;

	if ( nb >= nbmin && nb < K && nx < K ) {
		// Use blocked code
		i = 0;
		while ( i <= K - 1 - nx ) {
			ib = Math.min( K - i, nb );

			// Compute the QR factorization of the current panel A(i:M-1, i:i+ib-1)
			dgeqr2(M - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWORK, offsetWORK);

			if ( i + ib < N ) {
				// Form the triangular factor of the block reflector
				// H = H(i) H(i+1) ... H(i+ib-1)
				dlarft('forward', 'columnwise', M - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), T, 1, nb, offsetT);

				// Apply H**T to A(i:M-1, i+ib:N-1) from the left
				dlarfb('left', 'transpose', 'forward', 'columnwise', M - i, N - i - ib, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), T, 1, nb, offsetT, A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + ib ) * strideA2), WORK, 1, ldwork, offsetWORK);
			}
			i += nb;
		}
	} else {
		i = 0;
	}

	// Use unblocked code to factor the last or only block
	if ( i <= K - 1 ) {
		dgeqr2(M - i, N - i, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWORK, offsetWORK);
	}

	return 0;
}


// EXPORTS //

export default dgeqrf;
