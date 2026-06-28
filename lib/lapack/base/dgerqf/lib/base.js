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

import dgerq2 from '../../dgerq2/lib/base.js';
import dlarfb from '../../dlarfb/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';


// VARIABLES //

var DEFAULT_NB = 32;


// MAIN //

/**
* Computes an RQ factorization of a real M-by-N matrix A = R * Q.
* using blocked Householder reflections.
*
* On exit, if M <= N, the upper triangle of the subarray
* A(0:M-1, N-M:N-1) contains the M-by-M upper triangular matrix R;
* if M >= N, the elements on and above the (M-N)-th subdiagonal
* contain the M-by-N upper trapezoidal matrix R; the remaining
* elements, with the array TAU, represent the orthogonal matrix Q.
*
* @private
* @param {NonNegativeInteger} M - number of rows in A
* @param {NonNegativeInteger} N - number of columns in A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - output array of scalar factors (length min(M,N))
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - caller-provided workspace; size must be at least `(ldwork * nb) + (ldt * nb)` elements, where `nb = min(32, min(M, N))`, `ldwork = max(1, M)`, and `ldt = nb`. WORK is partitioned: `WORK[offsetWork .. offsetWork + ldwork*nb)` is the main scratch passed to DLARFB; `WORK[offsetWork + ldwork*nb .. offsetWork + ldwork*nb + ldt*nb)` holds the block-reflector triangular factor T (column-major with leading dimension `ldt`).
* @param {integer} strideWork - stride for WORK (must be 1)
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dgerqf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var offsetT;
	var ldwork;
	var nbmin;
	var ldt;
	var ib;
	var nb;
	var nx;
	var ki;
	var kk;
	var mu;
	var nu;
	var T;
	var K;
	var i;

	K = Math.min( M, N );

	// Quick return if possible
	if ( K === 0 ) {
		return 0;
	}

	nb = DEFAULT_NB;
	nbmin = 2;
	nx = 1;

	if ( nb > 1 && nb < K ) {
		// Determine crossover point NX
		nx = 0;
	}

	ldwork = M;
	ldt = nb;

	// Partition caller-provided WORK: main scratch occupies the first `ldwork*nb` slots; the block-reflector triangular factor T occupies the next `ldt*nb` slots.
	T = WORK;
	offsetT = offsetWork + ( ldwork * nb );

	if ( nb >= nbmin && nb < K && nx < K ) {
		// Use blocked code initially.
		// The last kk rows are handled by the block method.
		ki = Math.floor( (K - nx - 1) / nb ) * nb;
		kk = Math.min( K, ki + nb );

		// Iterate backward over blocks

		// Fortran: DO I = K-KK+KI+1, K-KK+1, -NB (1-based)

		// 0-based: i goes from K-kk+ki down to K-kk, step -nb
		for ( i = K - kk + ki; i >= K - kk; i -= nb ) {
			ib = Math.min( K - i, nb );

			// Compute the RQ factorization of the current block

			// A(m-k+i : m-k+i+ib-1, 0 : n-k+i+ib-1)
			dgerq2(ib, N - K + i + ib, A, strideA1, strideA2, offsetA + ((M - K + i) * strideA1), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, offsetWork);

			if ( M - K + i > 0 ) {
				// Form the triangular factor of the block reflector
				// H = H(i+ib-1) ... H(i+1) H(i)
				dlarft('backward', 'rowwise', N - K + i + ib, ib, A, strideA1, strideA2, offsetA + ((M - K + i) * strideA1), TAU, strideTAU, offsetTAU + (i * strideTAU), T, 1, ldt, offsetT);

				// Apply H to A(0:m-k+i-1, 0:n-k+i+ib-1) from the right
				dlarfb('right', 'no-transpose', 'backward', 'rowwise', M - K + i, N - K + i + ib, ib, A, strideA1, strideA2, offsetA + ((M - K + i) * strideA1), T, 1, ldt, offsetT, A, strideA1, strideA2, offsetA, WORK, 1, ldwork, offsetWork);
			}
		}
		mu = M - K + i + nb;
		nu = N - K + i + nb;
	} else {
		mu = M;
		nu = N;
	}

	// Use unblocked code to factor the last or only block
	if ( mu > 0 && nu > 0 ) {
		dgerq2(mu, nu, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork);
	}

	return 0;
}


// EXPORTS //

export default dgerqf;
