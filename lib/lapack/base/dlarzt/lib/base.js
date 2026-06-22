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

import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dtrmv from '../../../../blas/base/dtrmv/lib/base.js';


// MAIN //

/**
* Forms the triangular factor T of a block reflector `H = I - V*T*V^T`.
*
* The routine only supports `DIRECT = 'backward'` and `STOREV = 'rowwise'`.
* The vectors which define the elementary reflectors are stored row-wise
* in V. T is lower triangular.
*
* @private
* @param {string} direct - direction (`'backward'`)
* @param {string} storev - storage direction (`'rowwise'`)
* @param {NonNegativeInteger} N - order of the block reflector
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Float64Array} V - matrix of reflector vectors (K-by-N, rowwise)
* @param {integer} strideV1 - stride of first dimension of V
* @param {integer} strideV2 - stride of second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} TAU - array of scalar factors of length K
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} T - output lower triangular matrix (K-by-K)
* @param {integer} strideT1 - stride of first dimension of T
* @param {integer} strideT2 - stride of second dimension of T
* @param {NonNegativeInteger} offsetT - starting index for T
*/
function dlarzt( direct, storev, N, K, V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT ) {
	var taui;
	var i;
	var j;

	// Iterate from i = K-1 down to 0 (Fortran: K down to 1)
	for ( i = K - 1; i >= 0; i-- ) {
		taui = TAU[ offsetTAU + ( i * strideTAU ) ];
		if ( taui === 0.0 ) {
			// H(i) = I: zero out column i of T from row i to K-1
			for ( j = i; j < K; j++ ) {
				T[ offsetT + ( j * strideT1 ) + ( i * strideT2 ) ] = 0.0;
			}
		} else {
			// General case
			if ( i < K - 1 ) {
				// T(i+1:K-1, i) = -tau(i) * V(i+1:K-1, :) * V(i, :)^T
				// Fortran: DGEMV('No transpose', K-I, N, -TAU(I), V(I+1,1), LDV, V(I,1), LDV, ZERO, T(I+1,I), 1)
				dgemv( 'no-transpose', K - i - 1, N, -taui, V, strideV1, strideV2, offsetV + ( ( i + 1 ) * strideV1 ), V, strideV2, offsetV + ( i * strideV1 ), 0.0, T, strideT1, offsetT + ( ( i + 1 ) * strideT1 ) + ( i * strideT2 ) );

				// T(i+1:K-1, i) = T(i+1:K-1, i+1:K-1) * T(i+1:K-1, i)

				// Fortran: DTRMV('Lower', 'No transpose', 'Non-unit', K-I, T(I+1,I+1), LDT, T(I+1,I), 1)
				dtrmv( 'lower', 'no-transpose', 'non-unit', K - i - 1, T, strideT1, strideT2, offsetT + ( ( i + 1 ) * strideT1 ) + ( ( i + 1 ) * strideT2 ), T, strideT1, offsetT + ( ( i + 1 ) * strideT1 ) + ( i * strideT2 ) );
			}
			T[ offsetT + ( i * strideT1 ) + ( i * strideT2 ) ] = taui;
		}
	}
}


// EXPORTS //

export default dlarzt;
