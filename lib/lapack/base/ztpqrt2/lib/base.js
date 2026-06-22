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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfg from './../../zlarfg/lib/base.js';
import zgemv from './../../../../blas/base/zgemv/lib/base.js';
import zgerc from './../../../../blas/base/zgerc/lib/base.js';
import ztrmv from './../../../../blas/base/ztrmv/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CZERO = new Complex128( 0.0, 0.0 );


// MAIN //

/**
* Computes a QR factorization of a complex triangular-pentagonal matrix `C = [A; B]` using the compact WY representation for `Q`.
*
* ## Notes
*
* -   `A` is an `N`-by-`N` upper triangular matrix.
* -   `B` is an `M`-by-`N` pentagonal matrix whose first `M-l` rows are rectangular and whose last `l` rows form an upper trapezoidal block.
* -   On exit, the upper triangular part of `A` is overwritten with the upper triangular factor `R`, `B` is overwritten with the pentagonal matrix `V` of Householder vectors, and `T` is overwritten with the `N`-by-`N` upper triangular factor of the block reflector.
* -   Strides and offsets are in **complex elements** (factor of 2 conversion is done internally for direct Float64 access).
* -   Column `N-1` of `T` is used as workspace during the first phase. The guard `i < N-1` ensures the workspace column is not written during the final iteration where the workspace and output column would overlap.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `B`
* @param {NonNegativeInteger} N - number of columns of `B` and the order of `A`
* @param {NonNegativeInteger} l - number of rows of the upper trapezoidal part of `B` (`0 <= l <= min(M,N)`)
* @param {Complex128Array} A - input/output matrix; on exit contains the upper triangular factor `R`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} B - input/output matrix; on entry the pentagonal `B`, on exit the reflector storage `V`
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @param {Complex128Array} T - output matrix; on exit contains the upper triangular factor `T` of the block reflector
* @param {integer} strideT1 - stride of the first dimension of `T` (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of `T` (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for `T` (in complex elements)
* @returns {integer} status code (`0` = success)
*/
function ztpqrt2( M, N, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, T, strideT1, strideT2, offsetT ) {
	var alphaR;
	var alphaI;
	var alpha;
	var aijR;
	var aijI;
	var twjR;
	var twjI;
	var bmjR;
	var bmjI;
	var aOff;
	var bOff;
	var tOff;
	var aIdx;
	var tIdx;
	var bIdx;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var st1;
	var st2;
	var Av;
	var Bv;
	var Tv;
	var mp;
	var np;
	var p;
	var i;
	var j;

	// Quick return...
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// Float64 views and stride/offset conversions (complex-elements -> Float64 indices)
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Tv = reinterpret( T, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	st1 = strideT1 * 2;
	st2 = strideT2 * 2;
	aOff = offsetA * 2;
	bOff = offsetB * 2;
	tOff = offsetT * 2;

	for ( i = 0; i < N; i++ ) {
		// p = M - l + min(l, i+1); number of B-row vector elements participating in the reflector for column i
		p = ( M - l ) + Math.min( l, i + 1 );

		// Generate elementary reflector H(i) applied to [A(i,i); B(0:p-1, i)] to annihilate B(0:p-1, i). Tau is stored in T(i, 0).
		zlarfg( p + 1, A, offsetA + ( i * strideA1 ) + ( i * strideA2 ), B, strideB1, offsetB + ( i * strideB2 ), T, offsetT + ( i * strideT1 ) );

		if ( i < N - 1 ) {
			// Use column N-1 of T as workspace W: W(0:N-i-2) := conj(A(i, i+1:N-1))
			for ( j = 0; j < N - i - 1; j++ ) {
				aIdx = aOff + ( i * sa1 ) + ( ( i + j + 1 ) * sa2 );
				tIdx = tOff + ( j * st1 ) + ( ( N - 1 ) * st2 );
				Tv[ tIdx ] = Av[ aIdx ];
				Tv[ tIdx + 1 ] = -Av[ aIdx + 1 ];
			}

			// W(0:N-i-2) += B(0:p-1, i+1:N-1)^H * B(0:p-1, i)
			zgemv( 'conjugate-transpose', p, N - i - 1, CONE, B, strideB1, strideB2, offsetB + ( ( i + 1 ) * strideB2 ), B, strideB1, offsetB + ( i * strideB2 ), CONE, T, strideT1, offsetT + ( ( N - 1 ) * strideT2 ) );

			// alpha = -conj(tau(i)); tau is stored at T(i, 0). conj negates imag (-im); unary minus negates re => -tauR + i*tauI
			tIdx = tOff + ( i * st1 );
			alphaR = -Tv[ tIdx ];
			alphaI = Tv[ tIdx + 1 ];
			alpha = new Complex128( alphaR, alphaI );

			// A(i, i+1:N-1) += alpha * conj(W(0:N-i-2))
			for ( j = 0; j < N - i - 1; j++ ) {
				tIdx = tOff + ( j * st1 ) + ( ( N - 1 ) * st2 );
				aIdx = aOff + ( i * sa1 ) + ( ( i + j + 1 ) * sa2 );
				twjR = Tv[ tIdx ];
				twjI = -Tv[ tIdx + 1 ]; // conj(W(j))

				// (alphaR + i*alphaI) * (twjR + i*twjI) = (alphaR*twjR - alphaI*twjI) + i*(alphaR*twjI + alphaI*twjR)
				Av[ aIdx ] += ( alphaR * twjR ) - ( alphaI * twjI );
				Av[ aIdx + 1 ] += ( alphaR * twjI ) + ( alphaI * twjR );
			}

			// B(0:p-1, i+1:N-1) += alpha * B(0:p-1, i) * W(0:N-i-2)^H  (zgerc: A := alpha*x*y^H + A)
			zgerc( p, N - i - 1, alpha, B, strideB1, offsetB + ( i * strideB2 ), T, strideT1, offsetT + ( ( N - 1 ) * strideT2 ), B, strideB1, strideB2, offsetB + ( ( i + 1 ) * strideB2 ) );
		}
	}

	// Build T column-by-column: compute column i of T from the previously stored reflectors.
	for ( i = 1; i < N; i++ ) {
		// alpha = -tau(i) = -T(i, 0); NOTE: no conjugate here (matches Fortran second loop)
		tIdx = tOff + ( i * st1 );
		alphaR = -Tv[ tIdx ];
		alphaI = -Tv[ tIdx + 1 ];
		alpha = new Complex128( alphaR, alphaI );

		// Zero T(0:i-1, i)
		for ( j = 0; j < i; j++ ) {
			tIdx = tOff + ( j * st1 ) + ( i * st2 );
			Tv[ tIdx ] = 0.0;
			Tv[ tIdx + 1 ] = 0.0;
		}

		p = Math.min( i, l );           // Fortran P = min(I-1, L) with I 1-based -> JS p = min(i, l)
		mp = Math.min( M - l, M - 1 );  // Fortran MP = min(M-L+1, M) 1-based -> JS mp = min(M-l, M-1); start row of B2
		np = Math.min( p, N - 1 );      // Fortran NP = min(P+1, N) 1-based -> JS np = min(p, N-1); start column for the rectangular B2 segment

		// Triangular part of B2: T(0:p-1, i) = alpha * B(M-l:M-l+p-1, i)
		for ( j = 0; j < p; j++ ) {
			bIdx = bOff + ( ( M - l + j ) * sb1 ) + ( i * sb2 );
			tIdx = tOff + ( j * st1 ) + ( i * st2 );
			bmjR = Bv[ bIdx ];
			bmjI = Bv[ bIdx + 1 ];

			// (alphaR + i*alphaI)(bmjR + i*bmjI) = (alphaR*bmjR - alphaI*bmjI) + i*(alphaR*bmjI + alphaI*bmjR)
			Tv[ tIdx ] = ( alphaR * bmjR ) - ( alphaI * bmjI );
			Tv[ tIdx + 1 ] = ( alphaR * bmjI ) + ( alphaI * bmjR );
		}

		// T(0:p-1, i) := B(mp:mp+p-1, 0:p-1)^H * T(0:p-1, i), upper-triangular, conjugate-transpose, non-unit
		ztrmv( 'upper', 'conjugate-transpose', 'non-unit', p, B, strideB1, strideB2, offsetB + ( mp * strideB1 ), T, strideT1, offsetT + ( i * strideT2 ) );

		// Rectangular part of B2: T(np:np+(i-p)-1, i) = alpha * B(mp:mp+l-1, np:np+(i-p)-1)^H * B(mp:mp+l-1, i)
		zgemv( 'conjugate-transpose', l, i - p, alpha, B, strideB1, strideB2, offsetB + ( mp * strideB1 ) + ( np * strideB2 ), B, strideB1, offsetB + ( mp * strideB1 ) + ( i * strideB2 ), CZERO, T, strideT1, offsetT + ( np * strideT1 ) + ( i * strideT2 ) );

		// B1 contribution: T(0:i-1, i) += alpha * B(0:M-l-1, 0:i-1)^H * B(0:M-l-1, i)
		zgemv( 'conjugate-transpose', M - l, i, alpha, B, strideB1, strideB2, offsetB, B, strideB1, offsetB + ( i * strideB2 ), CONE, T, strideT1, offsetT + ( i * strideT2 ) );

		// T(0:i-1, i) := T(0:i-1, 0:i-1) * T(0:i-1, i), upper-triangular, no-transpose, non-unit
		ztrmv( 'upper', 'no-transpose', 'non-unit', i, T, strideT1, strideT2, offsetT, T, strideT1, offsetT + ( i * strideT2 ) );

		// T(i, i) = tau(i) = T(i, 0); T(i, 0) = 0
		tIdx = tOff + ( i * st1 );                     // T(i, 0)
		aIdx = tOff + ( i * st1 ) + ( i * st2 );       // T(i, i)
		aijR = Tv[ tIdx ];
		aijI = Tv[ tIdx + 1 ];
		Tv[ aIdx ] = aijR;
		Tv[ aIdx + 1 ] = aijI;
		Tv[ tIdx ] = 0.0;
		Tv[ tIdx + 1 ] = 0.0;
	}

	return 0;
}


// EXPORTS //

export default ztpqrt2;
