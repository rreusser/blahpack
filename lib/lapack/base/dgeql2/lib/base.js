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

import dlarfg from '../../dlarfg/lib/base.js';
import dlarf from '../../dlarf/lib/base.js';


// MAIN //

/**
* Computes a QL factorization of a real M-by-N matrix A = Q * L.
* using Householder reflections (unblocked algorithm).
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} TAU - input array
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} WORK - output array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (0 = success)
*/
function dgeql2( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var alpha;
	var aii;
	var col;
	var row;
	var K;
	var i;

	K = Math.min( M, N );

	for ( i = K - 1; i >= 0; i-- ) {
		// Fortran: column = N-K+I (1-based), row = M-K+I (1-based)
		// 0-based: col = N-K+i, row = M-K+i
		col = N - K + i;
		row = M - K + i;

		// Index of the diagonal element A(row, col):
		aii = offsetA + ( row * strideA1 ) + ( col * strideA2 );

		// Generate elementary reflector H(i) to annihilate A(0:row-1, col)

		// dlarfg( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau )

		// The reflector has order row+1, alpha is at A(row, col),

		// And the vector to annihilate starts at A(0, col) with stride strideA1

		// Going through row elements (indices 0..row-1).

		// In Fortran: DLARFG( M-K+I, A(M-K+I, N-K+I), A(1, N-K+I), 1, TAU(I) )

		// The vector x is A(1:M-K+I-1, N-K+I), i.e. A(0:row-1, col) in 0-based.

		// The "min" clamp ensures we don't go out of bounds when row=0.
		dlarfg(
			row + 1,
			A, aii,
			A, strideA1, offsetA + ( Math.min( row - 1, 0 ) * strideA1 ) + ( col * strideA2 ),
			TAU, offsetTAU + ( i * strideTAU )
		);

		if ( col > 0 ) {
			// Save A(row, col) and set to 1 for reflector application
			alpha = A[ aii ];
			A[ aii ] = 1.0;

			// Apply H(i) to A(0:row, 0:col-1) from the left

			// Fortran: DLARF('Left', M-K+I, N-K+I-1, A(1,N-K+I), 1, TAU(I), A, LDA, WORK)

			// In 0-based: apply to the submatrix A(0:row, 0:col-1)

			// The reflector vector v is A(0:row, col), length row+1
			dlarf(
				'left',
				row + 1, col,
				A, strideA1, offsetA + ( col * strideA2 ),
				TAU[ offsetTAU + ( i * strideTAU ) ],
				A, strideA1, strideA2, offsetA,
				WORK, strideWork, offsetWork
			);

			// Restore A(row, col)
			A[ aii ] = alpha;
		}
	}
	return 0;
}


// EXPORTS //

export default dgeql2;
