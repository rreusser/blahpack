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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import dlarfg from './../../dlarfg/lib/base.js';
import dgemv from './../../../../blas/base/dgemv/lib/base.js';
import dger from './../../../../blas/base/dger/lib/base.js';
import dtrmv from './../../../../blas/base/dtrmv/lib/base.js';


// MAIN //

/**
* Computes a QR factorization of a real triangular-pentagonal matrix `C = [A; B]` using the compact WY representation for `Q`.
*
* ## Notes
*
* -   `A` is an `N`-by-`N` upper triangular matrix.
* -   `B` is an `M`-by-`N` pentagonal matrix whose first `M-l` rows are rectangular and whose last `l` rows form an upper trapezoidal block.
* -   On exit, the upper triangular part of `A` is overwritten with the upper triangular factor `R`, `B` is overwritten with the pentagonal matrix `V` of Householder vectors, and `T` is overwritten with the `N`-by-`N` upper triangular factor of the block reflector.
* -   Column `N-1` of `T` is used as workspace during the first phase of the algorithm. The guard `i < N-1` ensures the workspace column is not written during the final iteration where the workspace and output column would overlap.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `B`
* @param {NonNegativeInteger} N - number of columns of `B` and the order of `A`
* @param {NonNegativeInteger} l - number of rows of the upper trapezoidal part of `B` (`0 <= l <= min(M,N)`)
* @param {Float64Array} A - input/output matrix (column-major); on exit contains the upper triangular factor `R`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input/output matrix; on entry the pentagonal `B`, on exit the reflector storage `V`
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} T - output matrix; on exit contains the upper triangular factor `T` of the block reflector
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @returns {integer} status code (`0` = success)
*/
function dtpqrt2( M, N, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, T, strideT1, strideT2, offsetT ) {
	var alpha;
	var aii;
	var b1i;
	var ti0;
	var mp;
	var np;
	var p;
	var i;
	var j;

	// Quick return...
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	for ( i = 0; i < N; i++ ) {
		// p = M - l + min(l, i+1); number of B-row vector elements participating in the reflector for column i
		p = ( M - l ) + Math.min( l, i + 1 );

		// Common indices for column i...
		aii = offsetA + ( i * strideA1 ) + ( i * strideA2 );        // A(i, i)
		b1i = offsetB + ( i * strideB2 );                            // B(0, i)
		ti0 = offsetT + ( i * strideT1 );                            // T(i, 0)

		// Generate elementary reflector H(i) applied to [A(i,i); B(0:p-1, i)] to annihilate B(0:p-1, i). Tau is stored in T(i, 0).
		dlarfg( p + 1, A, aii, B, strideB1, b1i, T, ti0 );

		if ( i < N - 1 ) {
			// Use column N-1 of T as workspace W: W(0:N-i-2) := A(i, i+1:N-1)^T (real, so just copy).
			for ( j = 0; j < N - i - 1; j++ ) {
				T[ offsetT + ( j * strideT1 ) + ( ( N - 1 ) * strideT2 ) ] = A[ offsetA + ( i * strideA1 ) + ( ( i + j + 1 ) * strideA2 ) ];
			}

			// W(0:N-i-2) += B(0:p-1, i+1:N-1)^T * B(0:p-1, i)
			dgemv( 'transpose', p, N - i - 1, 1.0, B, strideB1, strideB2, offsetB + ( ( i + 1 ) * strideB2 ), B, strideB1, b1i, 1.0, T, strideT1, offsetT + ( ( N - 1 ) * strideT2 ) );

			// alpha = -tau(i)
			alpha = -T[ ti0 ];

			// A(i, i+1:N-1) += alpha * W(0:N-i-2)^T (here W is real, stored as a column with stride strideT1)
			for ( j = 0; j < N - i - 1; j++ ) {
				A[ offsetA + ( i * strideA1 ) + ( ( i + j + 1 ) * strideA2 ) ] += alpha * T[ offsetT + ( j * strideT1 ) + ( ( N - 1 ) * strideT2 ) ];
			}

			// B(0:p-1, i+1:N-1) += alpha * B(0:p-1, i) * W(0:N-i-2)^T
			dger( p, N - i - 1, alpha, B, strideB1, b1i, T, strideT1, offsetT + ( ( N - 1 ) * strideT2 ), B, strideB1, strideB2, offsetB + ( ( i + 1 ) * strideB2 ) );
		}
	}

	// Build T column-by-column: compute column i of T from the previously stored reflectors.
	for ( i = 1; i < N; i++ ) {
		alpha = -T[ offsetT + ( i * strideT1 ) ]; // -tau(i) stored in T(i, 0)

		// Zero T(0:i-1, i)
		for ( j = 0; j < i; j++ ) {
			T[ offsetT + ( j * strideT1 ) + ( i * strideT2 ) ] = 0.0;
		}

		p = Math.min( i, l );           // Fortran P = min(I-1, L) with I 1-based → JS p = min(i, l)
		mp = Math.min( M - l, M - 1 );  // Fortran MP = min(M-L+1, M) 1-based → JS mp = min(M-l, M-1); start row of B2 (M >= 1 here since N=0/M=0 quick-returned and l <= M, so M-l >= 0)
		np = Math.min( p, N - 1 );      // Fortran NP = min(P+1, N) 1-based → JS np = min(p, N-1); start column for the rectangular B2 segment

		// Triangular part of B2: T(0:p-1, i) = alpha * B(M-l:M-l+p-1, i)
		for ( j = 0; j < p; j++ ) {
			T[ offsetT + ( j * strideT1 ) + ( i * strideT2 ) ] = alpha * B[ offsetB + ( ( M - l + j ) * strideB1 ) + ( i * strideB2 ) ];
		}

		// T(0:p-1, i) := B(mp:mp+p-1, 0:p-1)^T * T(0:p-1, i), upper-triangular, transposed, non-unit
		dtrmv( 'upper', 'transpose', 'non-unit', p, B, strideB1, strideB2, offsetB + ( mp * strideB1 ), T, strideT1, offsetT + ( i * strideT2 ) );

		// Rectangular part of B2: T(np:np+(i-p)-1, i) = alpha * B(mp:mp+l-1, np:np+(i-p)-1)^T * B(mp:mp+l-1, i)
		dgemv( 'transpose', l, i - p, alpha, B, strideB1, strideB2, offsetB + ( mp * strideB1 ) + ( np * strideB2 ), B, strideB1, offsetB + ( mp * strideB1 ) + ( i * strideB2 ), 0.0, T, strideT1, offsetT + ( np * strideT1 ) + ( i * strideT2 ) );

		// B1 contribution: T(0:i-1, i) += alpha * B(0:M-l-1, 0:i-1)^T * B(0:M-l-1, i)
		dgemv( 'transpose', M - l, i, alpha, B, strideB1, strideB2, offsetB, B, strideB1, offsetB + ( i * strideB2 ), 1.0, T, strideT1, offsetT + ( i * strideT2 ) );

		// T(0:i-1, i) := T(0:i-1, 0:i-1) * T(0:i-1, i), upper-triangular, no-transpose, non-unit
		dtrmv( 'upper', 'no-transpose', 'non-unit', i, T, strideT1, strideT2, offsetT, T, strideT1, offsetT + ( i * strideT2 ) );

		// T(i, i) = tau(i) = T(i, 0); T(i, 0) = 0
		T[ offsetT + ( i * strideT1 ) + ( i * strideT2 ) ] = T[ offsetT + ( i * strideT1 ) ];
		T[ offsetT + ( i * strideT1 ) ] = 0.0;
	}

	return 0;
}


// EXPORTS //

export default dtpqrt2;
