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

import dgelqt3 from './../../dgelqt3/lib/base.js';
import dlarfb from './../../dlarfb/lib/base.js';


// MAIN //

/**
* Computes a blocked LQ factorization of a real `M`-by-`N` matrix `A` using the compact WY representation of `Q`.
*
* ## Notes
*
* -   On exit, the elements on and below the diagonal of `A` contain the `M`-by-min(`M`,`N`) lower trapezoidal matrix `L` (`L` is lower triangular if `M <= N`); the elements above the diagonal are the rows of `V`. The implicit `1`s on the diagonal of `V` are not stored.
* -   `T` is `mb`-by-min(`M`,`N`) and stores the upper triangular block reflectors as a sequence of `mb`-by-`mb` (and IB-by-IB for the last block) blocks: `T = (T1 T2 ... TB)`.
* -   `WORK` is treated as a logically 2D scratch buffer for the trailing-matrix update; matching the Fortran reference, the per-panel leading dimension equals the number of rows of the trailing block. Allocate at least `mb*N` entries.
*
* @private
* @param {NonNegativeInteger} M - number of rows of the matrix `A`
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb - block size (`mb >= 1` and `mb <= min(M,N)` when `min(M,N) > 0`)
* @param {Float64Array} A - input/output matrix; on exit contains `L` and `V`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - output `mb`-by-min(`M`,`N`) block triangular factor
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} WORK - workspace array (length `mb*N`)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (`0` = success)
*/
function dgelqt( M, N, mb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, offsetWork ) {
	var ib;
	var K;
	var i;

	K = ( M < N ) ? M : N;

	// Quick return if possible...
	if ( K === 0 ) {
		return 0;
	}

	// Blocked loop of length K...
	i = 0;
	while ( i < K ) {
		ib = K - i;
		if ( mb < ib ) {
			ib = mb;
		}

		// Compute the LQ factorization of the current block A(i:i+ib-1, i:N-1) using the recursive compact-WY kernel; T(0:ib-1, i:i+ib-1) receives the block reflector.
		dgelqt3( ib, N - i, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( i * strideA2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ) );

		if ( i + ib < M ) {
			// Apply H to A(i+ib:M-1, i:N-1) from the right (no-transpose, forward, rowwise storage). WORK is logically (M-i-ib)-by-ib column-major scratch.
			dlarfb( 'right', 'no-transpose', 'forward', 'rowwise', M - i - ib, N - i, ib, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( i * strideA2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( ( i + ib ) * strideA1 ) + ( i * strideA2 ), WORK, 1, M - i - ib, offsetWork );
		}
		i += mb;
	}
	return 0;
}


// EXPORTS //

export default dgelqt;
