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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import dlarfg from './../../dlarfg/lib/base.js';
import dgemv from './../../../../blas/base/dgemv/lib/base.js';
import dger from './../../../../blas/base/dger/lib/base.js';
import dtrmv from './../../../../blas/base/dtrmv/lib/base.js';


// MAIN //

/**
* Computes a QR factorization of a real `M`-by-`N` matrix `A = Q * R` (with `M >= N`) using the compact `WY` representation of `Q`.
*
* ## Notes
*
* -   On exit, the upper triangle of `A` contains the `N`-by-`N` upper triangular factor `R`. The strictly lower triangle stores the `M`-by-`N` matrix `V` of Householder vectors (with implicit unit diagonal).
* -   `T` is overwritten with the `N`-by-`N` upper triangular block reflector factor `T` such that `Q = I - V * T * V^T`. The strictly lower triangle of `T` is set to zero.
* -   Internally, the last column of `T` (`T(:,N-1)`) is used as workspace during reflector application; it is overwritten before exit.
*
* @private
* @param {NonNegativeInteger} M - number of rows in `A` (must satisfy `M >= N`)
* @param {NonNegativeInteger} N - number of columns in `A`
* @param {Float64Array} A - input/output matrix (column-major); on exit, `R` is in the upper triangle and `V` is in the strict lower triangle
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - output matrix; on exit contains the upper triangular block reflector factor
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @returns {integer} status code (`0` = success)
*/
function dgeqrt2( M, N, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT ) {
	var alpha;
	var aii;
	var aix;
	var tix;
	var twk;
	var nm1;
	var K;
	var i;

	// Quick return...
	if ( N === 0 ) {
		return 0;
	}
	K = Math.min( M, N );
	nm1 = N - 1; // last column index of T (used as workspace in loop 1)

	// Loop 1: generate Householder reflectors and apply each to the trailing submatrix.
	for ( i = 0; i < K; i++ ) {
		aii = offsetA + ( i * strideA1 ) + ( i * strideA2 );           // A(i,i)
		tix = offsetT + ( i * strideT1 );                              // T(i,0) -- where tau(i) is stored

		// Generate elementary reflector H(i) of length M-i to annihilate A(i+1:M-1, i); tau goes to T(i, 0).
		dlarfg( M - i, A, aii, A, strideA1, offsetA + ( Math.min( i + 1, M - 1 ) * strideA1 ) + ( i * strideA2 ), T, tix );

		if ( i < N - 1 ) {
			// Save A(i,i) and temporarily set to 1 so the reflector vector includes the implicit diagonal.
			alpha = A[ aii ];
			A[ aii ] = 1.0;

			// Workspace column: T(:, N-1).
			twk = offsetT + ( nm1 * strideT2 );

			// T(:, N-1)[0..N-i-2] := A(i:M-1, i+1:N-1)^T * A(i:M-1, i)
			dgemv( 'transpose', M - i, N - i - 1, 1.0, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( ( i + 1 ) * strideA2 ), A, strideA1, aii, 0.0, T, strideT1, twk );

			// Apply rank-1 update: A(i:M-1, i+1:N-1) += -tau * A(i:M-1, i) * T(:, N-1)^T
			dger( M - i, N - i - 1, -T[ tix ], A, strideA1, aii, T, strideT1, twk, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( ( i + 1 ) * strideA2 ) );

			// Restore A(i,i).
			A[ aii ] = alpha;
		}
	}

	// Loop 2: build the upper triangular factor T column by column.
	for ( i = 1; i < N; i++ ) {
		aii = offsetA + ( i * strideA1 ) + ( i * strideA2 );           // A(i,i)
		tix = offsetT + ( i * strideT2 );                              // T(0,i) -- top of column i
		aix = offsetT + ( i * strideT1 );                              // T(i,0) -- where tau(i) currently lives

		// Save diagonal and treat reflector as having unit diagonal during the matrix-vector products.
		alpha = A[ aii ];
		A[ aii ] = 1.0;

		// T(0:i-1, i) := -tau(i) * A(i:M-1, 0:i-1)^T * A(i:M-1, i)
		dgemv( 'transpose', M - i, i, -T[ aix ], A, strideA1, strideA2, offsetA + ( i * strideA1 ), A, strideA1, aii, 0.0, T, strideT1, tix );

		// Restore A(i,i).
		A[ aii ] = alpha;

		// T(0:i-1, i) := T(0:i-1, 0:i-1) * T(0:i-1, i)  (upper triangular, non-unit, no transpose).
		dtrmv( 'upper', 'no-transpose', 'non-unit', i, T, strideT1, strideT2, offsetT, T, strideT1, tix );

		// T(i, i) = tau(i); zero out the storage cell that previously held tau(i) (T(i, 0)).
		T[ offsetT + ( i * strideT1 ) + ( i * strideT2 ) ] = T[ aix ];
		T[ aix ] = 0.0;
	}

	return 0;
}


// EXPORTS //

export default dgeqrt2;
