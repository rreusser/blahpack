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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, camelcase */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zgemm from './../../../../blas/base/zgemm/lib/base.js';
import ztrmm from './../../../../blas/base/ztrmm/lib/base.js';


// VARIABLES //

var ONE = new Complex128( 1.0, 0.0 );
var NEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Applies a complex Householder block reflector `H^H` from the left to a complex `(K+M)`-by-`N` triangular-pentagonal matrix composed of an upper-trapezoidal `K`-by-`N` matrix `A` and a rectangular `M`-by-`(N-K)` matrix `B`.
*
* ## Notes
*
* -   If `ident = 'identity'`, the leading `K`-by-`K` block `V1` of the reflector is the identity matrix and is not stored; otherwise `V1` is unit lower-triangular, stored in the lower triangle of `A` (the unit diagonal is implicit).
* -   The reflector `V2` (dimension `M`-by-`K`) is stored in the first `K` columns of `B` on input, which are overwritten by the output `B1`.
*
* @private
* @param {string} ident - `'identity'` or `'not-identity'`
* @param {NonNegativeInteger} M - number of rows of `B`
* @param {NonNegativeInteger} N - number of columns of `A` and `B`
* @param {NonNegativeInteger} K - number of rows of `A` (and order of `T`)
* @param {Complex128Array} T - upper-triangular `K`-by-`K` factor of the block reflector
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Complex128Array} A - input/output `K`-by-`N` matrix, modified in-place
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} B - input/output `M`-by-`N` matrix, modified in-place
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} WORK - workspace matrix of dimension `K`-by-max(`K`, `N-K`)
* @param {integer} strideWork1 - stride of the first dimension of `WORK`
* @param {integer} strideWork2 - stride of the second dimension of `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {Complex128Array} `A`
*/
function zlarfb_gett( ident, M, N, K, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork1, strideWork2, offsetWork ) {
	var lnotident;
	var sa1;
	var sa2;
	var sw1;
	var sw2;
	var Av;
	var Wv;
	var oA;
	var oW;
	var ia;
	var iw;
	var i;
	var j;

	// Quick return.
	if ( M < 0 || N <= 0 || K === 0 || K > N ) {
		return A;
	}

	lnotident = ( ident !== 'identity' );

	// ------------------------------------------------------------------

	// First Step: column block 2 (only if N > K).

	// ------------------------------------------------------------------
	if ( N > K ) {
		// col2_(1) W2 := A2. Copy A(1:K, K+1:N) into WORK(1:K, 1:N-K) column-by-column.
		for ( j = 0; j < N - K; j++ ) {
			zcopy( K, A, strideA1, offsetA + ( ( K + j ) * strideA2 ), WORK, strideWork1, offsetWork + ( j * strideWork2 ) );
		}

		if ( lnotident ) {
			// col2_(2) W2 := (V1^H) * W2, where V1 is the unit lower-triangular K-by-K block of A.
			ztrmm( 'left', 'lower', 'conjugate-transpose', 'unit', K, N - K, ONE, A, strideA1, strideA2, offsetA, WORK, strideWork1, strideWork2, offsetWork );
		}

		// col2_(3) W2 := W2 + (V2^H) * B2 = W2 + (B1^H) * B2.
		if ( M > 0 ) {
			zgemm( 'conjugate-transpose', 'no-transpose', K, N - K, M, ONE, B, strideB1, strideB2, offsetB, B, strideB1, strideB2, offsetB + ( K * strideB2 ), ONE, WORK, strideWork1, strideWork2, offsetWork );
		}

		// col2_(4) W2 := T * W2 (T is upper-triangular).
		ztrmm( 'left', 'upper', 'no-transpose', 'non-unit', K, N - K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

		// col2_(5) B2 := B2 - V2 * W2 = B2 - B1 * W2.
		if ( M > 0 ) {
			zgemm( 'no-transpose', 'no-transpose', M, N - K, K, NEGONE, B, strideB1, strideB2, offsetB, WORK, strideWork1, strideWork2, offsetWork, ONE, B, strideB1, strideB2, offsetB + ( K * strideB2 ) );
		}

		if ( lnotident ) {
			// col2_(6) W2 := V1 * W2 = A1 * W2 (unit lower-triangular).
			ztrmm( 'left', 'lower', 'no-transpose', 'unit', K, N - K, ONE, A, strideA1, strideA2, offsetA, WORK, strideWork1, strideWork2, offsetWork );
		}

		// col2_(7) A2 := A2 - W2, column-by-column.
		Av = reinterpret( A, 0 );
		Wv = reinterpret( WORK, 0 );
		oA = offsetA * 2;
		oW = offsetWork * 2;
		sa1 = strideA1 * 2;
		sa2 = strideA2 * 2;
		sw1 = strideWork1 * 2;
		sw2 = strideWork2 * 2;
		for ( j = 0; j < N - K; j++ ) {
			for ( i = 0; i < K; i++ ) {
				ia = oA + ( i * sa1 ) + ( ( K + j ) * sa2 );
				iw = oW + ( i * sw1 ) + ( j * sw2 );
				Av[ ia ] -= Wv[ iw ];
				Av[ ia + 1 ] -= Wv[ iw + 1 ];
			}
		}
	}

	// ------------------------------------------------------------------
	// Second Step: column block 1.
	// ------------------------------------------------------------------

	// col1_(1) W1 := A1 (upper-triangular part of A(1:K, 1:K)).
	for ( j = 0; j < K; j++ ) {
		zcopy( j + 1, A, strideA1, offsetA + ( j * strideA2 ), WORK, strideWork1, offsetWork + ( j * strideWork2 ) );
	}

	// Zero the subdiagonal elements of W1, column-by-column.
	Wv = reinterpret( WORK, 0 );
	oW = offsetWork * 2;
	sw1 = strideWork1 * 2;
	sw2 = strideWork2 * 2;
	for ( j = 0; j < K - 1; j++ ) {
		for ( i = j + 1; i < K; i++ ) {
			iw = oW + ( i * sw1 ) + ( j * sw2 );
			Wv[ iw ] = 0.0;
			Wv[ iw + 1 ] = 0.0;
		}
	}

	if ( lnotident ) {
		// col1_(2) W1 := (V1^H) * W1.
		ztrmm( 'left', 'lower', 'conjugate-transpose', 'unit', K, K, ONE, A, strideA1, strideA2, offsetA, WORK, strideWork1, strideWork2, offsetWork );
	}

	// col1_(3) W1 := T * W1.
	ztrmm( 'left', 'upper', 'no-transpose', 'non-unit', K, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

	// col1_(4) B1 := -V2 * W1 = -B1 * W1.
	if ( M > 0 ) {
		ztrmm( 'right', 'upper', 'no-transpose', 'non-unit', M, K, NEGONE, WORK, strideWork1, strideWork2, offsetWork, B, strideB1, strideB2, offsetB );
	}

	if ( lnotident ) {
		// col1_(5) W1 := V1 * W1 = A1 * W1.
		ztrmm( 'left', 'lower', 'no-transpose', 'unit', K, K, ONE, A, strideA1, strideA2, offsetA, WORK, strideWork1, strideWork2, offsetWork );

		// col1_(6)_a Compute elements of A1 below the diagonal.
		Av = reinterpret( A, 0 );
		Wv = reinterpret( WORK, 0 );
		oA = offsetA * 2;
		oW = offsetWork * 2;
		sa1 = strideA1 * 2;
		sa2 = strideA2 * 2;
		sw1 = strideWork1 * 2;
		sw2 = strideWork2 * 2;
		for ( j = 0; j < K - 1; j++ ) {
			for ( i = j + 1; i < K; i++ ) {
				ia = oA + ( i * sa1 ) + ( j * sa2 );
				iw = oW + ( i * sw1 ) + ( j * sw2 );
				Av[ ia ] = -Wv[ iw ];
				Av[ ia + 1 ] = -Wv[ iw + 1 ];
			}
		}
	}

	// col1_(6)_b Compute elements of A1 on and above the diagonal: A1 := A1 - W1.
	Av = reinterpret( A, 0 );
	Wv = reinterpret( WORK, 0 );
	oA = offsetA * 2;
	oW = offsetWork * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sw1 = strideWork1 * 2;
	sw2 = strideWork2 * 2;
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			ia = oA + ( i * sa1 ) + ( j * sa2 );
			iw = oW + ( i * sw1 ) + ( j * sw2 );
			Av[ ia ] -= Wv[ iw ];
			Av[ ia + 1 ] -= Wv[ iw + 1 ];
		}
	}

	return A;
}


// EXPORTS //

export default zlarfb_gett;
