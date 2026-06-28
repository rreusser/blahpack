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

/* eslint-disable max-len, max-params, max-statements, camelcase, no-mixed-operators */

// MODULES //

import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';


// MAIN //

/**
* Applies a real Householder block reflector `H` from the left to a real `(K+M)`-by-`N` "triangular-pentagonal" matrix composed of two blocks: an upper trapezoidal `K`-by-`N` matrix `A` and a rectangular `M`-by-`(N-K)` matrix `B`.
*
* ## Notes
*
* -   The block reflector is stored in compact WY-representation. The elementary reflectors are held in the strictly lower triangle of the leading `K`-by-`K` block of `A` (`V1`) and in the `M`-by-`K` leading block of `B` (`V2`), with the upper triangular `K`-by-`K` matrix `T` defining the block reflector.
* -   If `ident` is `'identity'`, the `V1` block is the identity matrix and is not read from `A`.
* -   If `ident` is `'not-identity'`, the strictly lower triangle of the leading `K`-by-`K` block of `A` contains `V1` (with implicit unit diagonal).
* -   On exit, `A` is overwritten by the leading `K`-by-`N` block of `H*[A;B]` and `B` is overwritten by the trailing `M`-by-`N` block.
* -   `WORK` is a workspace matrix of size at least `K`-by-`N`.
*
* @private
* @param {string} ident - specifies whether `V1` is the identity (`'identity'`) or a unit lower-triangular matrix stored in `A` (`'not-identity'`)
* @param {NonNegativeInteger} M - number of rows of `B`
* @param {NonNegativeInteger} N - number of columns of `A` and `B`
* @param {NonNegativeInteger} K - number of rows of `A` and order of `T`
* @param {Float64Array} T - upper triangular `K`-by-`K` matrix defining the block reflector
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} A - `K`-by-`N` upper trapezoidal matrix (modified in place)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - `M`-by-`N` matrix (modified in place)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} WORK - workspace matrix of size at least `K`-by-`N`
* @param {integer} strideWork1 - stride of the first dimension of `WORK`
* @param {integer} strideWork2 - stride of the second dimension of `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
*/
function dlarfb_gett( ident, M, N, K, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork1, strideWork2, offsetWork ) {
	var lnotident;
	var oAkj;
	var nmk;
	var oWj;
	var i;
	var j;

	// Quick return if possible...
	if ( M < 0 || N <= 0 || K === 0 || K > N ) {
		return;
	}
	lnotident = ( ident !== 'identity' );

	nmk = N - K;

	if ( nmk > 0 ) {
		// Col 1: Copy the `K`-by-`(N-K)` rectangular block of A(1:K, K+1:N) into WORK(1:K, 1:N-K)...
		for ( j = 0; j < nmk; j++ ) {
			dcopy( K, A, strideA1, offsetA + ( K + j ) * strideA2, WORK, strideWork1, offsetWork + j * strideWork2 );
		}

		// Col 1: W := V1**T * W, where V1 is unit lower triangular stored in A(1:K,1:K)...
		if ( lnotident ) {
			dtrmm( 'left', 'lower', 'transpose', 'unit', K, nmk, 1.0, A, strideA1, strideA2, offsetA, WORK, strideWork1, strideWork2, offsetWork );
		}

		// Col 1: W := W + V2**T * B2, where V2 occupies B(1:M,1:K) and B2 occupies B(1:M,K+1:N)...
		if ( M > 0 ) {
			dgemm( 'transpose', 'no-transpose', K, nmk, M, 1.0, B, strideB1, strideB2, offsetB, B, strideB1, strideB2, offsetB + K * strideB2, 1.0, WORK, strideWork1, strideWork2, offsetWork );
		}

		// Col 1: W := T * W, where T is upper triangular K-by-K...
		dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', K, nmk, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

		// Col 1: B2 := B2 - V2 * W...
		if ( M > 0 ) {
			dgemm( 'no-transpose', 'no-transpose', M, nmk, K, -1.0, B, strideB1, strideB2, offsetB, WORK, strideWork1, strideWork2, offsetWork, 1.0, B, strideB1, strideB2, offsetB + K * strideB2 );
		}

		// Col 1: W := V1 * W, where V1 is unit lower triangular stored in A(1:K,1:K)...
		if ( lnotident ) {
			dtrmm( 'left', 'lower', 'no-transpose', 'unit', K, nmk, 1.0, A, strideA1, strideA2, offsetA, WORK, strideWork1, strideWork2, offsetWork );
		}

		// Col 1: A2 := A2 - W, where A2 := A(1:K, K+1:N)...
		for ( j = 0; j < nmk; j++ ) {
			oAkj = offsetA + ( K + j ) * strideA2;
			oWj = offsetWork + j * strideWork2;
			for ( i = 0; i < K; i++ ) {
				A[ oAkj + i * strideA1 ] -= WORK[ oWj + i * strideWork1 ];
			}
		}
	}

	// Col 2: copy upper triangle of A(1:K,1:K) into WORK(1:K,1:K)...
	for ( j = 0; j < K; j++ ) {
		dcopy( j + 1, A, strideA1, offsetA + j * strideA2, WORK, strideWork1, offsetWork + j * strideWork2 );
	}

	// Zero the strictly lower triangle of WORK(1:K,1:K)...
	for ( j = 0; j < K - 1; j++ ) {
		oWj = offsetWork + j * strideWork2;
		for ( i = j + 1; i < K; i++ ) {
			WORK[ oWj + i * strideWork1 ] = 0.0;
		}
	}

	// W := V1**T * W, where V1 is unit lower triangular stored in A(1:K,1:K)...
	if ( lnotident ) {
		dtrmm( 'left', 'lower', 'transpose', 'unit', K, K, 1.0, A, strideA1, strideA2, offsetA, WORK, strideWork1, strideWork2, offsetWork );
	}

	// W := T * W, where T is upper triangular K-by-K...
	dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', K, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

	// B1 := -B1 * W**T? Actually: B1 := B1 + (-V2) * W -> but V2 = B1, so use dtrmm right with -1...

	// Fortran: DTRMM( 'R', 'U', 'N', 'N', M, K, -ONE, WORK, LDWORK, B, LDB )

	// This computes B1 := -B1 * WORK (where WORK is upper triangular K-by-K)...
	if ( M > 0 ) {
		dtrmm( 'right', 'upper', 'no-transpose', 'non-unit', M, K, -1.0, WORK, strideWork1, strideWork2, offsetWork, B, strideB1, strideB2, offsetB );
	}

	if ( lnotident ) {
		// W := V1 * W, where V1 is unit lower triangular stored in A(1:K,1:K)...
		dtrmm( 'left', 'lower', 'no-transpose', 'unit', K, K, 1.0, A, strideA1, strideA2, offsetA, WORK, strideWork1, strideWork2, offsetWork );

		// Update strictly lower triangle of A(1:K,1:K) := -WORK(1:K,1:K) strict lower...
		for ( j = 0; j < K - 1; j++ ) {
			oAkj = offsetA + j * strideA2;
			oWj = offsetWork + j * strideWork2;
			for ( i = j + 1; i < K; i++ ) {
				A[ oAkj + i * strideA1 ] = -WORK[ oWj + i * strideWork1 ];
			}
		}
	}

	// Update upper triangle of A(1:K,1:K): A := A - WORK...
	for ( j = 0; j < K; j++ ) {
		oAkj = offsetA + j * strideA2;
		oWj = offsetWork + j * strideWork2;
		for ( i = 0; i <= j; i++ ) {
			A[ oAkj + i * strideA1 ] -= WORK[ oWj + i * strideWork1 ];
		}
	}
}


// EXPORTS //

export default dlarfb_gett;
