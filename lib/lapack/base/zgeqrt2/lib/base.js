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
* Computes a QR factorization of a complex `M`-by-`N` matrix `A = Q * R` (with `M >= N`) using the compact `WY` representation of `Q`.
*
* ## Notes
*
* -   On exit, the upper triangle of `A` contains the `N`-by-`N` upper triangular factor `R`. The strictly lower triangle stores the `M`-by-`N` matrix `V` of Householder vectors (with implicit unit diagonal).
* -   `T` is overwritten with the `N`-by-`N` upper triangular block reflector factor `T` such that `Q = I - V * T * V^H`. The strictly lower triangle of `T` is left untouched (matches Fortran).
* -   Internally, the last column of `T` (`T(:, N-1)`) is used as workspace during reflector application; it is overwritten before exit.
* -   Strides and offsets are in **complex elements** (factor of 2 conversion is done internally).
*
* @private
* @param {NonNegativeInteger} M - number of rows in `A` (must satisfy `M >= N`)
* @param {NonNegativeInteger} N - number of columns in `A`
* @param {Complex128Array} A - input/output matrix (column-major); on exit, `R` is in the upper triangle and `V` is in the strict lower triangle
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} T - output matrix; on exit contains the upper triangular block reflector factor
* @param {integer} strideT1 - stride of the first dimension of `T` (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of `T` (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for `T` (in complex elements)
* @returns {integer} status code (`0` = success)
*/
function zgeqrt2( M, N, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT ) {
	var alphaR;
	var alphaI;
	var alpha;
	var aiiR;
	var aiiI;
	var aii;
	var tix;
	var twk;
	var nm1;
	var sa1;
	var sa2;
	var st1;
	var st2;
	var oA;
	var oT;
	var Av;
	var Tv;
	var K;
	var i;

	// Quick return...
	if ( N === 0 ) {
		return 0;
	}

	// Float64 views and stride/offset conversions (complex-elements -> Float64 indices).
	Av = reinterpret( A, 0 );
	Tv = reinterpret( T, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	st1 = strideT1 * 2;
	st2 = strideT2 * 2;
	oA = offsetA * 2;
	oT = offsetT * 2;

	K = Math.min( M, N );
	nm1 = N - 1; // last column index of T (used as workspace in loop 1)

	// Loop 1: generate Householder reflectors and apply each to the trailing submatrix.
	for ( i = 0; i < K; i++ ) {
		aii = oA + ( i * sa1 ) + ( i * sa2 );           // Float64 index of A(i,i)
		tix = oT + ( i * st1 );                         // Float64 index of T(i,0) -- where tau(i) is stored

		// Generate elementary reflector H(i) of length M-i to annihilate A(i+1:M-1, i); tau goes to T(i, 0).

		// Zlarfg uses complex-element strides and offsets directly.
		zlarfg( M - i, A, offsetA + ( i * strideA1 ) + ( i * strideA2 ), A, strideA1, offsetA + ( Math.min( i + 1, M - 1 ) * strideA1 ) + ( i * strideA2 ), T, offsetT + ( i * strideT1 ) );

		if ( i < N - 1 ) {
			// Save A(i,i) (complex) and temporarily set to 1+0i so the reflector vector includes the implicit diagonal.
			aiiR = Av[ aii ];
			aiiI = Av[ aii + 1 ];
			Av[ aii ] = 1.0;
			Av[ aii + 1 ] = 0.0;

			// Workspace column: T(:, N-1).
			twk = offsetT + ( nm1 * strideT2 );

			// W(0:N-i-2) := A(i:M-1, i+1:N-1)^H * A(i:M-1, i)   (note: conjugate-transpose)
			zgemv( 'conjugate-transpose', M - i, N - i - 1, CONE, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( ( i + 1 ) * strideA2 ), A, strideA1, offsetA + ( i * strideA1 ) + ( i * strideA2 ), CZERO, T, strideT1, twk );

			// alpha = -conj(tau(i))   (tau(i) is stored at T(i, 0))

			// -conj(tau_R + i*tau_I) = -tau_R + i*tau_I
			alphaR = -Tv[ tix ];
			alphaI = Tv[ tix + 1 ];
			alpha = new Complex128( alphaR, alphaI );

			// A(i:M-1, i+1:N-1) += alpha * A(i:M-1, i) * conj(W)^T   via ZGERC: A := alpha*x*y^H + A
			zgerc( M - i, N - i - 1, alpha, A, strideA1, offsetA + ( i * strideA1 ) + ( i * strideA2 ), T, strideT1, twk, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( ( i + 1 ) * strideA2 ) );

			// Restore A(i,i).
			Av[ aii ] = aiiR;
			Av[ aii + 1 ] = aiiI;
		}
	}

	// Loop 2: build the upper triangular factor T column by column.
	for ( i = 1; i < N; i++ ) {
		aii = oA + ( i * sa1 ) + ( i * sa2 );           // Float64 index of A(i,i)
		twk = oT + ( i * st1 );                         // Float64 index of T(i,0) -- where tau(i) currently lives

		// Save A(i,i) (complex) and treat reflector as having unit diagonal during the matrix-vector products.
		aiiR = Av[ aii ];
		aiiI = Av[ aii + 1 ];
		Av[ aii ] = 1.0;
		Av[ aii + 1 ] = 0.0;

		// alpha = -tau(i)   (tau(i) at T(i,0))
		alphaR = -Tv[ twk ];
		alphaI = -Tv[ twk + 1 ];
		alpha = new Complex128( alphaR, alphaI );

		// T(0:i-1, i) := alpha * A(i:M-1, 0:i-1)^H * A(i:M-1, i)
		zgemv( 'conjugate-transpose', M - i, i, alpha, A, strideA1, strideA2, offsetA + ( i * strideA1 ), A, strideA1, offsetA + ( i * strideA1 ) + ( i * strideA2 ), CZERO, T, strideT1, offsetT + ( i * strideT2 ) );

		// Restore A(i,i).
		Av[ aii ] = aiiR;
		Av[ aii + 1 ] = aiiI;

		// T(0:i-1, i) := T(0:i-1, 0:i-1) * T(0:i-1, i)   (upper triangular, non-transpose, non-unit).
		ztrmv( 'upper', 'no-transpose', 'non-unit', i, T, strideT1, strideT2, offsetT, T, strideT1, offsetT + ( i * strideT2 ) );

		// T(i, i) = tau(i); zero out the storage cell that previously held tau(i) (T(i, 0)).
		tix = oT + ( i * st1 ) + ( i * st2 );           // Float64 index of T(i,i)
		Tv[ tix ] = Tv[ twk ];
		Tv[ tix + 1 ] = Tv[ twk + 1 ];
		Tv[ twk ] = 0.0;
		Tv[ twk + 1 ] = 0.0;
	}

	return 0;
}


// EXPORTS //

export default zgeqrt2;
