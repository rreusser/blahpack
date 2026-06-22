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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import dlarfg from './../../dlarfg/lib/base.js';
import dgemv from './../../../../blas/base/dgemv/lib/base.js';
import dger from './../../../../blas/base/dger/lib/base.js';
import dtrmv from './../../../../blas/base/dtrmv/lib/base.js';


// MAIN //

/**
* Computes an LQ factorization of a real triangular-pentagonal matrix `C = [A, B]` using the compact WY representation for `Q`.
*
* ## Notes
*
* -   `A` is an `M`-by-`M` lower triangular matrix.
* -   `B` is an `M`-by-`N` pentagonal matrix whose first `N-l` columns are rectangular and whose last `l` columns form a lower trapezoidal block.
* -   On exit, the lower triangular part of `A` is overwritten with the lower triangular factor `L`, `B` is overwritten with the pentagonal matrix `V` of Householder vectors, and `T` is overwritten with the `M`-by-`M` upper triangular factor of the block reflector.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `B` and the order of `A`
* @param {NonNegativeInteger} N - number of columns of `B`
* @param {NonNegativeInteger} l - number of rows of the lower trapezoidal part of `B` (`0 <= l <= min(M,N)`)
* @param {Float64Array} A - input/output matrix (column-major); on exit contains the lower triangular factor `L`
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
function dtplqt2( M, N, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, T, strideT1, strideT2, offsetT ) {
	var alpha;
	var aii;
	var bi1;
	var t1i;
	var mp;
	var np;
	var p;
	var i;
	var j;

	// Quick return...
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	for ( i = 0; i < M; i++ ) {
		// P = N - l + min(l, i+1); number of vector elements in B(i, 0:P-1)
		p = N - l + Math.min( l, i + 1 );

		// Indices...
		aii = offsetA + ( i * strideA1 ) + ( i * strideA2 );       // A(i,i)
		bi1 = offsetB + ( i * strideB1 );                           // B(i,0)
		t1i = offsetT + ( i * strideT2 );                           // T(0,i)

		// Generate elementary reflector H(i) applied to [A(i,i); B(i,0:P-1)] to annihilate B(i, 0:P-1).

		// dlarfg( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau )
		dlarfg( p + 1, A, aii, B, strideB2, bi1, T, t1i );

		if ( i < M - 1 ) {
			// W(0:M-i-2) := C(i+1:M-1, i:N-1) * C(i, i:N-1), stored in T(M-1, 0:M-i-2).
			// Initial load: T(M-1, j) = A(i+j+1, i) for j in 0..M-i-2
			for ( j = 0; j < M - i - 1; j++ ) {
				T[ offsetT + ( ( M - 1 ) * strideT1 ) + ( j * strideT2 ) ] = A[ offsetA + ( ( i + j + 1 ) * strideA1 ) + ( i * strideA2 ) ];
			}

			// T(M-1, 0:M-i-2) += B(i+1:M-1, 0:P-1) * B(i, 0:P-1)
			// dgemv( 'no-transpose', M-i-1, P, 1, B(i+1,0), strideB1, strideB2, offB, B(i,0), strideB2, offB, 1, T(M-1,0), strideT2, offT )
			dgemv('no-transpose', M - i - 1, p, 1.0, B, strideB1, strideB2, offsetB + ( ( i + 1 ) * strideB1 ), B, strideB2, bi1, 1.0, T, strideT2, offsetT + ( ( M - 1 ) * strideT1 ));

			// alpha = -tau(i)
			alpha = -T[ t1i ];

			// A(i+1:M-1, i) += alpha * T(M-1, 0:M-i-2)
			for ( j = 0; j < M - i - 1; j++ ) {
				A[ offsetA + ( ( i + j + 1 ) * strideA1 ) + ( i * strideA2 ) ] += alpha * T[ offsetT + ( ( M - 1 ) * strideT1 ) + ( j * strideT2 ) ];
			}

			// B(i+1:M-1, 0:P-1) += alpha * T(M-1, 0:M-i-2) * B(i, 0:P-1)^T
			// dger( M, N, alpha, x, strideX, offX, y, strideY, offY, A, strideA1, strideA2, offA )
			dger(M - i - 1, p, alpha, T, strideT2, offsetT + ( ( M - 1 ) * strideT1 ), B, strideB2, bi1, B, strideB1, strideB2, offsetB + ( ( i + 1 ) * strideB1 ));
		}
	}

	// Build T column-by-column: compute row i of T from row i's reflector data.
	for ( i = 1; i < M; i++ ) {
		alpha = -T[ offsetT + ( i * strideT2 ) ]; // -tau(i) stored in T(0, i)

		// Zero T(i, 0:i-1)
		for ( j = 0; j < i; j++ ) {
			T[ offsetT + ( i * strideT1 ) + ( j * strideT2 ) ] = 0.0;
		}

		p = Math.min( i, l );           // corresponds to Fortran P = min(I-1, L) with I 1-based
		np = Math.min( N - l, N - 1 );  // 0-based: NP-1 = min(N-L, N-1); start column of B2
		if ( np < 0 ) {
			np = 0;
		}
		mp = Math.min( p, M - 1 );      // 0-based mp: start row for rectangular part (Fortran MP-1 = min(P, M-1))

		// Triangular part of B2: T(i, 0:p-1) = alpha * B(i, N-l+0 .. N-l+p-1)
		for ( j = 0; j < p; j++ ) {
			T[ offsetT + ( i * strideT1 ) + ( j * strideT2 ) ] = alpha * B[ offsetB + ( i * strideB1 ) + ( ( N - l + j ) * strideB2 ) ];
		}

		// T(i, 0:p-1) := B(0:p-1, NP:NP+p-1) lower-triangular * T(i, 0:p-1)
		// dtrmv( uplo, trans, diag, N, A, strideA1, strideA2, offA, x, strideX, offX )
		dtrmv('lower', 'no-transpose', 'non-unit', p, B, strideB1, strideB2, offsetB + ( np * strideB2 ), T, strideT2, offsetT + ( i * strideT1 ));

		// Rectangular part of B2: T(i, mp:mp+(i-1-p)-1) = alpha * B(mp:i-1, np:np+l-1) * B(i, np:np+l-1)

		// dgemv( 'no-transpose', i-1-p, l, alpha, B(mp,np), sB1, sB2, offB, B(i,np), sB2, offB, 0, T(i,mp), sT2, offT )
		dgemv('no-transpose', i - p, l, alpha, B, strideB1, strideB2, offsetB + ( mp * strideB1 ) + ( np * strideB2 ), B, strideB2, offsetB + ( i * strideB1 ) + ( np * strideB2 ), 0.0, T, strideT2, offsetT + ( i * strideT1 ) + ( mp * strideT2 ));

		// B1 contribution: T(i, 0:i-1) += alpha * B(0:i-1, 0:N-l-1) * B(i, 0:N-l-1)
		dgemv('no-transpose', i, N - l, alpha, B, strideB1, strideB2, offsetB, B, strideB2, offsetB + ( i * strideB1 ), 1.0, T, strideT2, offsetT + ( i * strideT1 ));

		// T(i, 0:i-1) := T(0:i-1, 0:i-1)^T * T(i, 0:i-1), lower-triangular, non-unit
		dtrmv('lower', 'transpose', 'non-unit', i, T, strideT1, strideT2, offsetT, T, strideT2, offsetT + ( i * strideT1 ));

		// T(i,i) = tau(i) = T(0,i); T(0,i) = 0
		T[ offsetT + ( i * strideT1 ) + ( i * strideT2 ) ] = T[ offsetT + ( i * strideT2 ) ];
		T[ offsetT + ( i * strideT2 ) ] = 0.0;
	}

	// Transpose T: copy lower to upper and zero lower (excluding diagonal).
	for ( i = 0; i < M; i++ ) {
		for ( j = i + 1; j < M; j++ ) {
			T[ offsetT + ( i * strideT1 ) + ( j * strideT2 ) ] = T[ offsetT + ( j * strideT1 ) + ( i * strideT2 ) ];
			T[ offsetT + ( j * strideT1 ) + ( i * strideT2 ) ] = 0.0;
		}
	}

	return 0;
}


// EXPORTS //

export default dtplqt2;
