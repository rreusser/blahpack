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

import dgeql2 from '../../dgeql2/lib/base.js';
import dlarfb from '../../dlarfb/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';


// VARIABLES //

var DEFAULT_NB = 32;


// MAIN //

/**
* Computes a QL factorization of a real M-by-N matrix A = Q * L using blocked Householder reflections.
*
* ## Workspace
*
* WORK is a caller-provided `Float64Array`. The required length is `max( 1, N*NB + NB*NB )` with `NB = 32`, partitioned as `WORK[0:N*NB]` for the `dlarfb` trailing-submatrix update (an `N x NB` matrix with leading dimension `N`) followed by `WORK[N*NB:N*NB+NB*NB]` for the `NB x NB` triangular factor `T` built by `dlarft`.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} WORK - caller-provided workspace (length `>= max(1, N*NB + NB*NB)` with `NB = 32`)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {integer} lwork - unused; retained for ABI compatibility
* @returns {integer} status code (0 = success)
*/
function dgeqlf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line no-unused-vars
	var offsetT;
	var ldwork;
	var nbmin;
	var iws;
	var ib;
	var nb;
	var nx;
	var mu;
	var nu;
	var ki;
	var kk;
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
		// Use blocked code initially (Fortran: KI = ((K-NX-1)/NB)*NB; KK = MIN(K, KI+NB))
		ki = Math.floor( ( K - nx - 1 ) / nb ) * nb;
		kk = Math.min( K, ki + nb );

		// Fortran DO 10 I = K-KK+KI+1, K-KK+1, -NB (1-based); 0-based: i starts at K-kk+ki, ends (inclusive) at K-kk, step -nb
		i = K - kk + ki;
		while ( i >= K - kk ) {
			ib = Math.min( K - i, nb );

			// Compute the QL factorization of the current block A( 0:M-K+i+ib-1, N-K+i:N-K+i+ib-1 ); panel has (M-K+i+ib) rows and ib columns
			dgeql2( M - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ( N - K + i ) * strideA2 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), WORK, strideWORK, offsetWORK );

			if ( N - K + i > 0 ) {
				// Form the triangular factor of the block reflector H = H(i+ib-1) ... H(i+1) H(i) (backward, columnwise)
				dlarft( 'backward', 'columnwise', M - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ( N - K + i ) * strideA2 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), T, 1, nb, offsetT );

				// Apply H^T to A( 0:M-K+i+ib-1, 0:N-K+i-1 ) from the left
				dlarfb( 'left', 'transpose', 'backward', 'columnwise', M - K + i + ib, N - K + i, ib, A, strideA1, strideA2, offsetA + ( ( N - K + i ) * strideA2 ), T, 1, nb, offsetT, A, strideA1, strideA2, offsetA, WORK, 1, ldwork, offsetWORK );
			}
			i -= nb;
		}

		// Fortran post-loop: I = K-KK+1-NB (1-based), so MU = M-K+I+NB-1 = M-KK and NU = N-KK
		mu = M - kk;
		nu = N - kk;
	} else {
		mu = M;
		nu = N;
	}

	// Use unblocked code to factor the last or only block
	if ( mu > 0 && nu > 0 ) {
		dgeql2( mu, nu, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );
	}

	return 0;
}


// EXPORTS //

export default dgeqlf;
