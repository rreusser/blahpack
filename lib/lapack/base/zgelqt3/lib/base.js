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
* Recursively computes an LQ factorization of a complex `M`-by-`N` matrix `A` using the compact WY representation of `Q`.
*
* ## Notes
*
* -   Requires `M <= N`.
* -   On exit, the elements on and below the diagonal of `A` contain the `M`-by-`M` lower triangular matrix `L`; the elements above the diagonal are the rows of `V` defining the elementary reflectors `H(i)`. The implicit `1`s on the diagonal of `V` are not stored.
* -   On exit, the elements on and above the diagonal of `T` contain the `M`-by-`M` upper triangular block reflector factor; the elements below the diagonal are not used (set to zero by the implementation).
* -   Strides and offsets are in **complex elements** (factor of 2 conversion is done internally).
* -   The block reflector is `H = I - V * T * V^H` where `V^H` is the conjugate transpose of `V`.
* -   Based on the algorithm of Elmroth and Gustavson, IBM J. Res. Develop. Vol 44 No. 4, July 2000.
*
* @private
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M <= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {Complex128Array} A - input/output matrix; on exit contains `L` and `V`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} T - output upper triangular factor of the block reflector
* @param {integer} strideT1 - stride of the first dimension of `T` (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of `T` (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for `T` (in complex elements)
* @returns {integer} status code (`0` = success)
*/
function zgelqt3( M, N, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT ) {
	var i1off;
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
	var M1;
	var M2;
	var i1;
	var i;
	var j;

	// Quick return for empty matrices...
	if ( M === 0 ) {
		return 0;
	}

	if ( M === 1 ) {
		// Compute Householder transform when M = 1: zlarfg(N, A(0,0), A(0, min(1, N-1)), strideA2, T(0,0)).
		zlarfg( N, A, offsetA, A, strideA2, offsetA + ( Math.min( 1, N - 1 ) * strideA2 ), T, offsetT );

		// T(0,0) = conj(T(0,0)) — Fortran: T(1,1) = CONJG(T(1,1)).
		Tv = reinterpret( T, 0 );
		tIdx = ( offsetT * 2 ) + 1; // imaginary part index
		Tv[ tIdx ] = -Tv[ tIdx ];
		return 0;
	}

	// Otherwise, split A into blocks...
	M1 = ( M / 2 ) | 0;
	M2 = M - M1;
	i1 = M1; // 0-based row index where the bottom (M2-row) block starts; equivalent to Fortran I1-1.

	// Compute A(0:M1-1, 0:N-1) <- (Y1, R1, T1), where Q1 = I - Y1 * T1 * Y1^H (top-half recursion).

	// The recursive call cannot fail given the recursion always preserves the M <= N invariant on valid input.
	zgelqt3( M1, N, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT );

	// Compute A(M1:M-1, 0:N-1) := A(M1:M-1, 0:N-1) * Q1^H.

	// Workspace lives in T(M1:M-1, 0:M1-1).

	// Step 1: Copy A(M1:M-1, 0:M1-1) into T(M1:M-1, 0:M1-1).
	Av = reinterpret( A, 0 );
	Tv = reinterpret( T, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	st1 = strideT1 * 2;
	st2 = strideT2 * 2;
	aOff = offsetA * 2;
	tOff = offsetT * 2;
	for ( i = 0; i < M2; i++ ) {
		for ( j = 0; j < M1; j++ ) {
			tIdx = tOff + ( ( i + M1 ) * st1 ) + ( j * st2 );
			aIdx = aOff + ( ( i + M1 ) * sa1 ) + ( j * sa2 );
			Tv[ tIdx ] = Av[ aIdx ];
			Tv[ tIdx + 1 ] = Av[ aIdx + 1 ];
		}
	}

	// Index of T(M1, 0) shorthand (in complex elements).
	i1off = offsetT + ( i1 * strideT1 );

	// Step 2: T(M1:M-1, 0:M1-1) := T(M1:M-1, 0:M1-1) * V1^H, where V1 is the unit upper-triangular implicit reflector matrix stored in A(0:M1-1, 0:M1-1).

	// ztrmm( side, uplo, transa, diag, M, N, alpha, A, sA1, sA2, oA, B, sB1, sB2, oB )
	ztrmm( 'right', 'upper', 'conjugate-transpose', 'unit', M2, M1, CONE, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, i1off );

	// Step 3: T(M1:M-1, 0:M1-1) += A(M1:M-1, M1:N-1) * A(0:M1-1, M1:N-1)^H.

	// Only meaningful when N - M1 > 0; zgemm handles the zero-K case as a no-op (or beta-only scale, but beta=1).
	zgemm( 'no-transpose', 'conjugate-transpose', M2, M1, N - M1, CONE, A, strideA1, strideA2, offsetA + ( i1 * strideA1 ) + ( i1 * strideA2 ), A, strideA1, strideA2, offsetA + ( i1 * strideA2 ), CONE, T, strideT1, strideT2, i1off );

	// Step 4: T(M1:M-1, 0:M1-1) := T(M1:M-1, 0:M1-1) * T1, where T1 is upper triangular and lives in T(0:M1-1, 0:M1-1).
	ztrmm( 'right', 'upper', 'no-transpose', 'non-unit', M2, M1, CONE, T, strideT1, strideT2, offsetT, T, strideT1, strideT2, i1off );

	// Step 5: A(M1:M-1, M1:N-1) -= T(M1:M-1, 0:M1-1) * A(0:M1-1, M1:N-1).
	zgemm( 'no-transpose', 'no-transpose', M2, N - M1, M1, CNEG_ONE, T, strideT1, strideT2, i1off, A, strideA1, strideA2, offsetA + ( i1 * strideA2 ), CONE, A, strideA1, strideA2, offsetA + ( i1 * strideA1 ) + ( i1 * strideA2 ) );

	// Step 6: T(M1:M-1, 0:M1-1) := T(M1:M-1, 0:M1-1) * V1, where V1 is the unit upper triangular reflector matrix in A(0:M1-1, 0:M1-1).
	ztrmm( 'right', 'upper', 'no-transpose', 'unit', M2, M1, CONE, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, i1off );

	// Step 7: A(M1:M-1, 0:M1-1) -= T(M1:M-1, 0:M1-1); zero out the workspace block of T.
	for ( i = 0; i < M2; i++ ) {
		for ( j = 0; j < M1; j++ ) {
			aIdx = aOff + ( ( i + M1 ) * sa1 ) + ( j * sa2 );
			tIdx = tOff + ( ( i + M1 ) * st1 ) + ( j * st2 );
			Av[ aIdx ] -= Tv[ tIdx ];
			Av[ aIdx + 1 ] -= Tv[ tIdx + 1 ];
			Tv[ tIdx ] = 0.0;
			Tv[ tIdx + 1 ] = 0.0;
		}
	}

	// Compute A(M1:M-1, M1:N-1) <- (Y2, R2, T2) where Q2 = I - Y2 * T2 * Y2^H (bottom-half recursion).
	zgelqt3( M2, N - M1, A, strideA1, strideA2, offsetA + ( i1 * strideA1 ) + ( i1 * strideA2 ), T, strideT1, strideT2, offsetT + ( i1 * strideT1 ) + ( i1 * strideT2 ) );

	// Compute T3 = T(0:M1-1, M1:M-1) = -T1 * Y1^H * Y2 * T2.

	// Step 1: Copy A(0:M1-1, M1:M-1) into T(0:M1-1, M1:M-1).

	// Note: Fortran writes T(J, I+M1) = (A(J, I+M1)) — the extra parens do NOT mean conjugate (CONJG would be explicit), so this is a plain copy matching dgelqt3.
	for ( i = 0; i < M2; i++ ) {
		for ( j = 0; j < M1; j++ ) {
			tIdx = tOff + ( j * st1 ) + ( ( i + M1 ) * st2 );
			aIdx = aOff + ( j * sa1 ) + ( ( i + M1 ) * sa2 );
			Tv[ tIdx ] = Av[ aIdx ];
			Tv[ tIdx + 1 ] = Av[ aIdx + 1 ];
		}
	}

	// Step 2: T(0:M1-1, M1:M-1) := T(0:M1-1, M1:M-1) * V2^H, where V2 is unit upper triangular implicit reflector matrix in A(M1:M-1, M1:M-1).
	ztrmm( 'right', 'upper', 'conjugate-transpose', 'unit', M1, M2, CONE, A, strideA1, strideA2, offsetA + ( i1 * strideA1 ) + ( i1 * strideA2 ), T, strideT1, strideT2, offsetT + ( i1 * strideT2 ) );

	// Step 3: T(0:M1-1, M1:M-1) += A(0:M1-1, M:N-1) * A(M1:M-1, M:N-1)^H.

	// Only meaningful when N - M > 0.
	zgemm( 'no-transpose', 'conjugate-transpose', M1, M2, N - M, CONE, A, strideA1, strideA2, offsetA + ( M * strideA2 ), A, strideA1, strideA2, offsetA + ( i1 * strideA1 ) + ( M * strideA2 ), CONE, T, strideT1, strideT2, offsetT + ( i1 * strideT2 ) );

	// Step 4: T(0:M1-1, M1:M-1) := -T1 * T(0:M1-1, M1:M-1), where T1 is the upper triangular block in T(0:M1-1, 0:M1-1).
	ztrmm( 'left', 'upper', 'no-transpose', 'non-unit', M1, M2, CNEG_ONE, T, strideT1, strideT2, offsetT, T, strideT1, strideT2, offsetT + ( i1 * strideT2 ) );

	// Step 5: T(0:M1-1, M1:M-1) := T(0:M1-1, M1:M-1) * T2, where T2 is upper triangular in T(M1:M-1, M1:M-1).
	ztrmm( 'right', 'upper', 'no-transpose', 'non-unit', M1, M2, CONE, T, strideT1, strideT2, offsetT + ( i1 * strideT1 ) + ( i1 * strideT2 ), T, strideT1, strideT2, offsetT + ( i1 * strideT2 ) );

	// Final layout:

	// Y = (Y1, Y2); L = [ L1                   0  ];   T = [ T1  T3 ]

	//                   [ A(M1:M-1, 0:M1-1)   L2 ]        [ 0   T2 ]
	return 0;
}


// EXPORTS //

export default zgelqt3;
