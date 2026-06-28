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
import dgemm from './../../../../blas/base/dgemm/lib/base.js';
import dtrmm from './../../../../blas/base/dtrmm/lib/base.js';


// MAIN //

/**
* Recursively computes a QR factorization of a real `M`-by-`N` matrix `A` using the compact WY representation of `Q`.
*
* ## Notes
*
* -   Requires `M >= N`.
* -   On exit, the elements on and above the diagonal of `A` contain the `N`-by-`N` upper triangular matrix `R`; the elements below the diagonal are the columns of `V` defining the elementary reflectors `H(i)`. The implicit `1`s on the diagonal of `V` are not stored.
* -   On exit, the elements on and above the diagonal of `T` contain the `N`-by-`N` upper triangular block reflector factor; the elements below the diagonal are not used (set to zero by the implementation).
* -   Based on the algorithm of Elmroth and Gustavson, IBM J. Res. Develop. Vol 44 No. 4, July 2000.
*
* @private
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {Float64Array} A - input/output matrix; on exit contains `R` and `V`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - output upper triangular factor of the block reflector
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @returns {integer} status code (`0` = success)
*/
function dgeqrt3( M, N, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT ) {
	var j1off;
	var aoff;
	var toff;
	var N1;
	var N2;
	var i1;
	var j1;
	var i;
	var j;

	// Quick return for empty matrices...
	if ( N === 0 ) {
		return 0;
	}

	if ( N === 1 ) {
		// Compute Householder transform when N = 1: dlarfg(M, A(0,0), A(min(1, M-1), 0), 1, T(0,0)).
		dlarfg( M, A, offsetA, A, strideA1, offsetA + ( Math.min( 1, M - 1 ) * strideA1 ), T, offsetT );
		return 0;
	}

	// Otherwise, split A into blocks...
	N1 = ( N / 2 ) | 0;
	N2 = N - N1;
	j1 = N1; // 0-based col index where the right (N2-col) block starts; equivalent to Fortran J1-1.
	i1 = Math.min( N, M - 1 ); // 0-based row index of the (M-N) trailing rows; equivalent to Fortran I1-1.

	// Compute A(0:M-1, 0:N1-1) <- (Y1, R1, T1), where Q1 = I - Y1 * T1 * Y1^T (left-half recursion).

	// The recursive call cannot fail given the recursion always preserves the M >= N invariant on valid input.
	dgeqrt3( M, N1, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT );

	// Compute A(0:M-1, N1:N-1) = Q1^T * A(0:M-1, N1:N-1).

	// Workspace lives in T(0:N1-1, N1:N-1).

	// Step 1: Copy A(0:N1-1, N1:N-1) into T(0:N1-1, N1:N-1).
	for ( j = 0; j < N2; j++ ) {
		for ( i = 0; i < N1; i++ ) {
			T[ offsetT + ( i * strideT1 ) + ( ( j + N1 ) * strideT2 ) ] = A[ offsetA + ( i * strideA1 ) + ( ( j + N1 ) * strideA2 ) ];
		}
	}

	// Index of T(0, N1) for shorthand.
	j1off = offsetT + ( j1 * strideT2 );

	// Step 2: T(0:N1-1, N1:N-1) := V1^T * T(0:N1-1, N1:N-1), where V1 is the unit lower-triangular implicit reflector matrix stored in A(0:N1-1, 0:N1-1).

	// dtrmm( side, uplo, transa, diag, M, N, alpha, A, sA1, sA2, oA, B, sB1, sB2, oB )
	dtrmm( 'left', 'lower', 'transpose', 'unit', N1, N2, 1.0, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, j1off );

	// Step 3: T(0:N1-1, N1:N-1) += A(N1:M-1, 0:N1-1)^T * A(N1:M-1, N1:N-1).
	dgemm( 'transpose', 'no-transpose', N1, N2, M - N1, 1.0, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ), A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), 1.0, T, strideT1, strideT2, j1off );

	// Step 4: T(0:N1-1, N1:N-1) := T1^T * T(0:N1-1, N1:N-1), where T1 is upper triangular and lives in T(0:N1-1, 0:N1-1).
	dtrmm( 'left', 'upper', 'transpose', 'non-unit', N1, N2, 1.0, T, strideT1, strideT2, offsetT, T, strideT1, strideT2, j1off );

	// Step 5: A(N1:M-1, N1:N-1) -= A(N1:M-1, 0:N1-1) * T(0:N1-1, N1:N-1).
	dgemm( 'no-transpose', 'no-transpose', M - N1, N2, N1, -1.0, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ), T, strideT1, strideT2, j1off, 1.0, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ) );

	// Step 6: T(0:N1-1, N1:N-1) := V1 * T(0:N1-1, N1:N-1), where V1 is the unit lower triangular reflector matrix in A(0:N1-1, 0:N1-1).
	dtrmm( 'left', 'lower', 'no-transpose', 'unit', N1, N2, 1.0, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, j1off );

	// Step 7: A(0:N1-1, N1:N-1) -= T(0:N1-1, N1:N-1); zero out the workspace block of T.
	for ( j = 0; j < N2; j++ ) {
		for ( i = 0; i < N1; i++ ) {
			aoff = offsetA + ( i * strideA1 ) + ( ( j + N1 ) * strideA2 );
			toff = offsetT + ( i * strideT1 ) + ( ( j + N1 ) * strideT2 );
			A[ aoff ] -= T[ toff ];
			T[ toff ] = 0.0;
		}
	}

	// Compute A(N1:M-1, N1:N-1) <- (Y2, R2, T2) where Q2 = I - Y2 * T2 * Y2^T (right-half recursion).
	dgeqrt3( M - N1, N2, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), T, strideT1, strideT2, offsetT + ( j1 * strideT1 ) + ( j1 * strideT2 ) );

	// Compute T3 = T(0:N1-1, N1:N-1) = -T1 * Y1^T * Y2 * T2.

	// Step 1: Copy A(N1:N-1, 0:N1-1)^T into T(0:N1-1, N1:N-1) (i.e. T(i, j+N1) = A(j+N1, i)).
	for ( i = 0; i < N1; i++ ) {
		for ( j = 0; j < N2; j++ ) {
			T[ offsetT + ( i * strideT1 ) + ( ( j + N1 ) * strideT2 ) ] = A[ offsetA + ( ( j + N1 ) * strideA1 ) + ( i * strideA2 ) ];
		}
	}

	// Step 2: T(0:N1-1, N1:N-1) := T(0:N1-1, N1:N-1) * V2, where V2 is unit lower triangular implicit reflector matrix in A(N1:N-1, N1:N-1).
	dtrmm( 'right', 'lower', 'no-transpose', 'unit', N1, N2, 1.0, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), T, strideT1, strideT2, j1off );

	// Step 3: T(0:N1-1, N1:N-1) += A(N:M-1, 0:N1-1)^T * A(N:M-1, N1:N-1).

	// Only meaningful when M - N > 0.
	dgemm( 'transpose', 'no-transpose', N1, N2, M - N, 1.0, A, strideA1, strideA2, offsetA + ( i1 * strideA1 ), A, strideA1, strideA2, offsetA + ( i1 * strideA1 ) + ( j1 * strideA2 ), 1.0, T, strideT1, strideT2, j1off );

	// Step 4: T(0:N1-1, N1:N-1) := -T1 * T(0:N1-1, N1:N-1), where T1 is the upper triangular block in T(0:N1-1, 0:N1-1).
	dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', N1, N2, -1.0, T, strideT1, strideT2, offsetT, T, strideT1, strideT2, j1off );

	// Step 5: T(0:N1-1, N1:N-1) := T(0:N1-1, N1:N-1) * T2, where T2 is upper triangular in T(N1:N-1, N1:N-1).
	dtrmm( 'right', 'upper', 'no-transpose', 'non-unit', N1, N2, 1.0, T, strideT1, strideT2, offsetT + ( j1 * strideT1 ) + ( j1 * strideT2 ), T, strideT1, strideT2, j1off );

	// Final layout:

	// Y = (Y1, Y2); R = [ R1   A(0:N1-1, N1:N-1) ];   T = [ T1  T3 ]

	//                   [ 0    R2                ]        [ 0   T2 ]
	return 0;
}


// EXPORTS //

export default dgeqrt3;
