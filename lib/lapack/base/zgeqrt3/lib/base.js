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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfg from './../../zlarfg/lib/base.js';
import zgemm from './../../../../blas/base/zgemm/lib/base.js';
import ztrmm from './../../../../blas/base/ztrmm/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CNEG_ONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Recursively computes a QR factorization of a complex `M`-by-`N` matrix `A` using the compact WY representation of `Q`.
*
* ## Notes
*
* -   Requires `M >= N`.
* -   On exit, the elements on and above the diagonal of `A` contain the `N`-by-`N` upper triangular matrix `R`; the elements below the diagonal are the columns of `V` defining the elementary reflectors `H(i)`. The implicit `1`s on the diagonal of `V` are not stored.
* -   On exit, the elements on and above the diagonal of `T` contain the `N`-by-`N` upper triangular block reflector factor; the elements below the diagonal are not used (set to zero by the implementation).
* -   Strides and offsets are in **complex elements** (factor of 2 conversion is done internally).
* -   The block reflector is `H = I - V * T * V^H` where `V^H` is the conjugate transpose of `V`.
* -   Based on the algorithm of Elmroth and Gustavson, IBM J. Res. Develop. Vol 44 No. 4, July 2000.
*
* @private
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {Complex128Array} A - input/output matrix; on exit contains `R` and `V`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} T - output upper triangular factor of the block reflector
* @param {integer} strideT1 - stride of the first dimension of `T` (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of `T` (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for `T` (in complex elements)
* @returns {integer} status code (`0` = success)
*/
function zgeqrt3( M, N, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT ) {
	var j1off;
	var aIdx;
	var tIdx;
	var aOff;
	var tOff;
	var sa1;
	var sa2;
	var st1;
	var st2;
	var Av;
	var Tv;
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
		// Compute Householder transform when N = 1: zlarfg(M, A(0,0), A(min(1, M-1), 0), 1, T(0,0)).

		// Note: Unlike ZGELQT3, ZGEQRT3 does NOT conjugate T(0,0) after the zlarfg call — leave T as zlarfg returned it.
		zlarfg( M, A, offsetA, A, strideA1, offsetA + ( Math.min( 1, M - 1 ) * strideA1 ), T, offsetT );
		return 0;
	}

	// Otherwise, split A into blocks...
	N1 = ( N / 2 ) | 0;
	N2 = N - N1;
	j1 = N1; // 0-based col index where the right (N2-col) block starts; equivalent to Fortran J1-1.
	i1 = Math.min( N, M - 1 ); // 0-based row index of the (M-N) trailing rows; equivalent to Fortran I1-1.

	// Compute A(0:M-1, 0:N1-1) <- (Y1, R1, T1), where Q1 = I - Y1 * T1 * Y1^H (left-half recursion).

	// The recursive call cannot fail given the recursion always preserves the M >= N invariant on valid input.
	zgeqrt3( M, N1, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT );

	// Compute A(0:M-1, N1:N-1) = Q1^H * A(0:M-1, N1:N-1).

	// Workspace lives in T(0:N1-1, N1:N-1).

	// Step 1: Copy A(0:N1-1, N1:N-1) into T(0:N1-1, N1:N-1).
	Av = reinterpret( A, 0 );
	Tv = reinterpret( T, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	st1 = strideT1 * 2;
	st2 = strideT2 * 2;
	aOff = offsetA * 2;
	tOff = offsetT * 2;
	for ( j = 0; j < N2; j++ ) {
		for ( i = 0; i < N1; i++ ) {
			tIdx = tOff + ( i * st1 ) + ( ( j + N1 ) * st2 );
			aIdx = aOff + ( i * sa1 ) + ( ( j + N1 ) * sa2 );
			Tv[ tIdx ] = Av[ aIdx ];
			Tv[ tIdx + 1 ] = Av[ aIdx + 1 ];
		}
	}

	// Index of T(0, N1) shorthand (in complex elements).
	j1off = offsetT + ( j1 * strideT2 );

	// Step 2: T(0:N1-1, N1:N-1) := V1^H * T(0:N1-1, N1:N-1), where V1 is the unit lower-triangular implicit reflector matrix stored in A(0:N1-1, 0:N1-1).

	// ztrmm( side, uplo, transa, diag, M, N, alpha, A, sA1, sA2, oA, B, sB1, sB2, oB )
	ztrmm( 'left', 'lower', 'conjugate-transpose', 'unit', N1, N2, CONE, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, j1off );

	// Step 3: T(0:N1-1, N1:N-1) += A(N1:M-1, 0:N1-1)^H * A(N1:M-1, N1:N-1).
	zgemm( 'conjugate-transpose', 'no-transpose', N1, N2, M - N1, CONE, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ), A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), CONE, T, strideT1, strideT2, j1off );

	// Step 4: T(0:N1-1, N1:N-1) := T1^H * T(0:N1-1, N1:N-1), where T1 is upper triangular and lives in T(0:N1-1, 0:N1-1).
	ztrmm( 'left', 'upper', 'conjugate-transpose', 'non-unit', N1, N2, CONE, T, strideT1, strideT2, offsetT, T, strideT1, strideT2, j1off );

	// Step 5: A(N1:M-1, N1:N-1) -= A(N1:M-1, 0:N1-1) * T(0:N1-1, N1:N-1).
	zgemm( 'no-transpose', 'no-transpose', M - N1, N2, N1, CNEG_ONE, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ), T, strideT1, strideT2, j1off, CONE, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ) );

	// Step 6: T(0:N1-1, N1:N-1) := V1 * T(0:N1-1, N1:N-1), where V1 is the unit lower triangular reflector matrix in A(0:N1-1, 0:N1-1).
	ztrmm( 'left', 'lower', 'no-transpose', 'unit', N1, N2, CONE, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, j1off );

	// Step 7: A(0:N1-1, N1:N-1) -= T(0:N1-1, N1:N-1); zero out the workspace block of T.
	for ( j = 0; j < N2; j++ ) {
		for ( i = 0; i < N1; i++ ) {
			aIdx = aOff + ( i * sa1 ) + ( ( j + N1 ) * sa2 );
			tIdx = tOff + ( i * st1 ) + ( ( j + N1 ) * st2 );
			Av[ aIdx ] -= Tv[ tIdx ];
			Av[ aIdx + 1 ] -= Tv[ tIdx + 1 ];
			Tv[ tIdx ] = 0.0;
			Tv[ tIdx + 1 ] = 0.0;
		}
	}

	// Compute A(N1:M-1, N1:N-1) <- (Y2, R2, T2) where Q2 = I - Y2 * T2 * Y2^H (right-half recursion).
	zgeqrt3( M - N1, N2, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), T, strideT1, strideT2, offsetT + ( j1 * strideT1 ) + ( j1 * strideT2 ) );

	// Compute T3 = T(0:N1-1, N1:N-1) = -T1 * Y1^H * Y2 * T2.

	// Step 1: Copy conj(A(N1:N-1, 0:N1-1))^T into T(0:N1-1, N1:N-1) (i.e. T(i, j+N1) = conj(A(j+N1, i))).

	// Note: The Fortran ZGEQRT3 explicitly applies CONJG here (unlike DGEQRT3), because forming Y1^H requires both transpose and conjugation of the V1 block.
	for ( i = 0; i < N1; i++ ) {
		for ( j = 0; j < N2; j++ ) {
			tIdx = tOff + ( i * st1 ) + ( ( j + N1 ) * st2 );
			aIdx = aOff + ( ( j + N1 ) * sa1 ) + ( i * sa2 );
			Tv[ tIdx ] = Av[ aIdx ];
			Tv[ tIdx + 1 ] = -Av[ aIdx + 1 ];
		}
	}

	// Step 2: T(0:N1-1, N1:N-1) := T(0:N1-1, N1:N-1) * V2, where V2 is unit lower triangular implicit reflector matrix in A(N1:N-1, N1:N-1).
	ztrmm( 'right', 'lower', 'no-transpose', 'unit', N1, N2, CONE, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), T, strideT1, strideT2, j1off );

	// Step 3: T(0:N1-1, N1:N-1) += A(N:M-1, 0:N1-1)^H * A(N:M-1, N1:N-1).

	// Only meaningful when M - N > 0.
	zgemm( 'conjugate-transpose', 'no-transpose', N1, N2, M - N, CONE, A, strideA1, strideA2, offsetA + ( i1 * strideA1 ), A, strideA1, strideA2, offsetA + ( i1 * strideA1 ) + ( j1 * strideA2 ), CONE, T, strideT1, strideT2, j1off );

	// Step 4: T(0:N1-1, N1:N-1) := -T1 * T(0:N1-1, N1:N-1), where T1 is the upper triangular block in T(0:N1-1, 0:N1-1).
	ztrmm( 'left', 'upper', 'no-transpose', 'non-unit', N1, N2, CNEG_ONE, T, strideT1, strideT2, offsetT, T, strideT1, strideT2, j1off );

	// Step 5: T(0:N1-1, N1:N-1) := T(0:N1-1, N1:N-1) * T2, where T2 is upper triangular in T(N1:N-1, N1:N-1).
	ztrmm( 'right', 'upper', 'no-transpose', 'non-unit', N1, N2, CONE, T, strideT1, strideT2, offsetT + ( j1 * strideT1 ) + ( j1 * strideT2 ), T, strideT1, strideT2, j1off );

	// Final layout:

	// Y = (Y1, Y2); R = [ R1   A(0:N1-1, N1:N-1) ];   T = [ T1  T3 ]

	//                   [ 0    R2                ]        [ 0   T2 ]
	return 0;
}


// EXPORTS //

export default zgeqrt3;
