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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import zgerq2 from '../../zgerq2/lib/base.js';
import zlarfb from '../../zlarfb/lib/base.js';
import zlarft from '../../zlarft/lib/base.js';


// VARIABLES //

var DEFAULT_NB = 32;


// MAIN //

/**
* Computes an RQ factorization of a complex M-by-N matrix A = R * Q using blocked Householder reflections.
*
* On exit, if M <= N, the upper triangle of the subarray A(0:M-1, N-M:N-1) contains the M-by-M upper triangular matrix R; if M >= N, the elements on and above the (M-N)-th subdiagonal contain the M-by-N upper trapezoidal matrix R; the remaining elements, with the array TAU, represent the unitary matrix Q.
*
* ## Workspace
*
* WORK is a caller-provided `Complex128Array`. The required length (in complex elements) is `max( 1, M*NB + NB*NB )` with `NB = 32`, partitioned as `WORK[0:M*NB]` for the `zlarfb` trailing-submatrix update (an `M x NB` matrix with leading dimension `M`) followed by `WORK[M*NB:M*NB+NB*NB]` for the `NB x NB` triangular factor `T` built by `zlarft`.
*
* @private
* @param {NonNegativeInteger} M - number of rows in A
* @param {NonNegativeInteger} N - number of columns in A
* @param {Complex128Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} TAU - output array of scalar factors (length `min(M,N)`)
* @param {integer} strideTAU - stride length for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @param {Complex128Array} WORK - caller-provided workspace (length `>= max(1, M*NB + NB*NB)` with `NB = 32`)
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @param {integer} lwork - unused; retained for ABI compatibility
* @returns {integer} status code (0 = success)
*/
function zgerqf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line no-unused-vars
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
	iws = M;
	ldwork = M;

	T = WORK;

	if ( nb > 1 && nb < K ) {
		iws = ldwork * nb;
	}
	offsetT = offsetWork + iws;

	if ( nb >= nbmin && nb < K && nx < K ) {
		// Use blocked code initially (Fortran: KI = ((K-NX-1)/NB)*NB; KK = MIN(K, KI+NB))
		ki = Math.floor( ( K - nx - 1 ) / nb ) * nb;
		kk = Math.min( K, ki + nb );

		// Fortran DO 10 I = K-KK+KI+1, K-KK+1, -NB (1-based); 0-based: i starts at K-kk+ki, ends (inclusive) at K-kk, step -nb
		i = K - kk + ki;
		while ( i >= K - kk ) {
			ib = Math.min( K - i, nb );

			// Compute the RQ factorization of the current block A( M-K+i:M-K+i+ib-1, 0:N-K+i+ib-1 ); panel has ib rows and (N-K+i+ib) columns
			zgerq2( ib, N - K + i + ib, A, strideA1, strideA2, offsetA + ( ( M - K + i ) * strideA1 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), WORK, strideWork, offsetWork );

			if ( M - K + i > 0 ) {
				// Form the triangular factor of the block reflector H = H(i+ib-1) ... H(i+1) H(i) (backward, rowwise)
				zlarft( 'backward', 'rowwise', N - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ( M - K + i ) * strideA1 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), T, 1, nb, offsetT );

				// Apply H to A( 0:M-K+i-1, 0:N-K+i+ib-1 ) from the right
				zlarfb( 'right', 'no-transpose', 'backward', 'rowwise', M - K + i, N - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ( M - K + i ) * strideA1 ), T, 1, nb, offsetT, A, strideA1, strideA2, offsetA, WORK, 1, ldwork, offsetWork );
			}
			i -= nb;
		}

		// Fortran post-loop: I = K-KK+1-NB (1-based), so MU = M-K+I+NB-1 = M-KK and NU = N-K+I+NB-1 = N-KK
		mu = M - kk;
		nu = N - kk;
	} else {
		mu = M;
		nu = N;
	}

	// Use unblocked code to factor the last or only block
	if ( mu > 0 && nu > 0 ) {
		zgerq2( mu, nu, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
	}

	return 0;
}


// EXPORTS //

export default zgerqf;
