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
* Computes an LQ factorization of a complex triangular-pentagonal matrix `C = [A, B]` using the compact WY representation for `Q`.
*
* ## Notes
*
* -   `A` is an `M`-by-`M` lower triangular matrix.
* -   `B` is an `M`-by-`N` pentagonal matrix whose first `N-l` columns are rectangular and whose last `l` columns form a lower trapezoidal block.
* -   On exit, the lower triangular part of `A` is overwritten with the lower triangular factor `L`, `B` is overwritten with the pentagonal matrix `V` of Householder vectors, and `T` is overwritten with the `M`-by-`M` upper triangular factor of the block reflector.
* -   Strides and offsets are in **complex elements** (factor of 2 conversion is done internally).
*
* @private
* @param {NonNegativeInteger} M - number of rows of `B` and the order of `A`
* @param {NonNegativeInteger} N - number of columns of `B`
* @param {NonNegativeInteger} l - number of rows of the lower trapezoidal part of `B` (`0 <= l <= min(M,N)`)
* @param {Complex128Array} A - input/output matrix; on exit contains the lower triangular factor `L`
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
function ztplqt2( M, N, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, T, strideT1, strideT2, offsetT ) {
	var alphaR;
	var alphaI;
	var alpha;
	var tmiR;
	var tmiI;
	var tmpR;
	var tmpI;
	var aOff;
	var bOff;
	var tOff;
	var bIdx;
	var tIdx;
	var aIdx;
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

	for ( i = 0; i < M; i++ ) {
		// P = N - l + min(l, i+1); number of vector elements in B(i, 0:P-1)
		p = ( N - l ) + Math.min( l, i + 1 );

		// Generate elementary reflector H(i) to annihilate B(i, 0:P-1)

		// zlarfg( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau )
		zlarfg(p + 1, A, offsetA + ( i * strideA1 ) + ( i * strideA2 ), B, strideB2, offsetB + ( i * strideB1 ), T, offsetT + ( i * strideT2 ));

		// T(0,i) = conj(T(0,i))  -- conjugate tau in place
		tIdx = tOff + ( i * st2 );
		Tv[ tIdx + 1 ] = -Tv[ tIdx + 1 ];

		if ( i < M - 1 ) {
			// Conjugate B(i, 0:p-1) in place
			bIdx = bOff + ( i * sb1 );
			for ( j = 0; j < p; j++ ) {
				Bv[ bIdx + 1 ] = -Bv[ bIdx + 1 ];
				bIdx += sb2;
			}

			// W(0:M-i-2) := A(i+1:M-1, i), stored in T(M-1, 0:M-i-2)
			for ( j = 0; j < M - i - 1; j++ ) {
				aIdx = aOff + ( ( i + j + 1 ) * sa1 ) + ( i * sa2 );
				tIdx = tOff + ( ( M - 1 ) * st1 ) + ( j * st2 );
				Tv[ tIdx ] = Av[ aIdx ];
				Tv[ tIdx + 1 ] = Av[ aIdx + 1 ];
			}

			// T(M-1, 0:M-i-2) += B(i+1:M-1, 0:p-1) * conj(B(i, 0:p-1))^T
			// (B(i,:) currently holds the conjugate of v, so this computes the desired sum)
			zgemv('no-transpose', M - i - 1, p, CONE, B, strideB1, strideB2, offsetB + ( ( i + 1 ) * strideB1 ), B, strideB2, offsetB + ( i * strideB1 ), CONE, T, strideT2, offsetT + ( ( M - 1 ) * strideT1 ));

			// alpha = -conj(tau) (T(0,i) was already conjugated above, so reading it gives conj(tau))
			tIdx = tOff + ( i * st2 );
			alphaR = -Tv[ tIdx ];
			alphaI = -Tv[ tIdx + 1 ];
			alpha = new Complex128( alphaR, alphaI );

			// A(i+1:M-1, i) += alpha * T(M-1, 0:M-i-2)
			for ( j = 0; j < M - i - 1; j++ ) {
				aIdx = aOff + ( ( i + j + 1 ) * sa1 ) + ( i * sa2 );
				tIdx = tOff + ( ( M - 1 ) * st1 ) + ( j * st2 );
				tmiR = Tv[ tIdx ];
				tmiI = Tv[ tIdx + 1 ];

				// (alphaR + alphaI*i)(tmiR + tmiI*i) = (alphaR*tmiR - alphaI*tmiI) + (alphaR*tmiI + alphaI*tmiR)*i
				Av[ aIdx ] += ( alphaR * tmiR ) - ( alphaI * tmiI );
				Av[ aIdx + 1 ] += ( alphaR * tmiI ) + ( alphaI * tmiR );
			}

			// B(i+1:M-1, 0:p-1) += alpha * T(M-1, 0:M-i-2) * conj(B(i, 0:p-1))^T
			// ZGERC computes A := alpha * x * y^H + A. Since y = B(i,:) holds conj(v), y^H = v^T.
			zgerc(M - i - 1, p, alpha, T, strideT2, offsetT + ( ( M - 1 ) * strideT1 ), B, strideB2, offsetB + ( i * strideB1 ), B, strideB1, strideB2, offsetB + ( ( i + 1 ) * strideB1 ));

			// Unconjugate B(i, 0:p-1) (restore v)
			bIdx = bOff + ( i * sb1 );
			for ( j = 0; j < p; j++ ) {
				Bv[ bIdx + 1 ] = -Bv[ bIdx + 1 ];
				bIdx += sb2;
			}
		}
	}

	// Build T row-by-row.
	for ( i = 1; i < M; i++ ) {
		// alpha = -conj(tau(i)) = -T(0,i) (T(0,i) was conjugated in the first loop)
		tIdx = tOff + ( i * st2 );
		alphaR = -Tv[ tIdx ];
		alphaI = -Tv[ tIdx + 1 ];
		alpha = new Complex128( alphaR, alphaI );

		// Zero T(i, 0:i-1)
		for ( j = 0; j < i; j++ ) {
			tIdx = tOff + ( i * st1 ) + ( j * st2 );
			Tv[ tIdx ] = 0.0;
			Tv[ tIdx + 1 ] = 0.0;
		}

		p = Math.min( i, l );           // 0-based: corresponds to Fortran P = min(I-1, L)
		np = Math.min( N - l, N - 1 );  // 0-based: NP-1 = min(N-L, N-1); start column of B2
		if ( np < 0 ) {
			np = 0;
		}
		mp = Math.min( p, M - 1 );      // 0-based mp: start row for rectangular part

		// Conjugate B(i, 0:N-l+p-1) in place (matches Fortran DO J = 1, N-L+P)
		bIdx = bOff + ( i * sb1 );
		for ( j = 0; j < ( N - l ) + p; j++ ) {
			Bv[ bIdx + 1 ] = -Bv[ bIdx + 1 ];
			bIdx += sb2;
		}

		// Triangular part of B2: T(i, 0:p-1) = alpha * B(i, N-l : N-l+p-1)
		for ( j = 0; j < p; j++ ) {
			bIdx = bOff + ( i * sb1 ) + ( ( N - l + j ) * sb2 );
			tIdx = tOff + ( i * st1 ) + ( j * st2 );
			tmpR = Bv[ bIdx ];
			tmpI = Bv[ bIdx + 1 ];
			Tv[ tIdx ] = ( alphaR * tmpR ) - ( alphaI * tmpI );
			Tv[ tIdx + 1 ] = ( alphaR * tmpI ) + ( alphaI * tmpR );
		}

		// T(i, 0:p-1) := B(0:p-1, np:np+p-1) lower-triangular * T(i, 0:p-1)
		ztrmv('lower', 'no-transpose', 'non-unit', p, B, strideB1, strideB2, offsetB + ( np * strideB2 ), T, strideT2, offsetT + ( i * strideT1 ));

		// Rectangular part of B2: T(i, mp:mp+(i-p)-1) = alpha * B(mp:i-1, np:np+l-1) * B(i, np:np+l-1)
		zgemv('no-transpose', i - p, l, alpha, B, strideB1, strideB2, offsetB + ( mp * strideB1 ) + ( np * strideB2 ), B, strideB2, offsetB + ( i * strideB1 ) + ( np * strideB2 ), CZERO, T, strideT2, offsetT + ( i * strideT1 ) + ( mp * strideT2 ));

		// B1 contribution: T(i, 0:i-1) += alpha * B(0:i-1, 0:N-l-1) * B(i, 0:N-l-1)
		zgemv('no-transpose', i, N - l, alpha, B, strideB1, strideB2, offsetB, B, strideB2, offsetB + ( i * strideB1 ), CONE, T, strideT2, offsetT + ( i * strideT1 ));

		// Compute T(i, 0:i-1) := T_lower(0:i-1, 0:i-1)^T * T(i, 0:i-1)

		// Pattern: conj(input) -> ZTRMV C (T^H * x) -> conj(output) yields T^T * x.

		// Conjugate T(i, 0:i-1)
		for ( j = 0; j < i; j++ ) {
			tIdx = tOff + ( i * st1 ) + ( j * st2 );
			Tv[ tIdx + 1 ] = -Tv[ tIdx + 1 ];
		}
		ztrmv('lower', 'conjugate-transpose', 'non-unit', i, T, strideT1, strideT2, offsetT, T, strideT2, offsetT + ( i * strideT1 ));

		// Unconjugate T(i, 0:i-1)
		for ( j = 0; j < i; j++ ) {
			tIdx = tOff + ( i * st1 ) + ( j * st2 );
			Tv[ tIdx + 1 ] = -Tv[ tIdx + 1 ];
		}

		// Unconjugate B(i, 0:N-l+p-1) (restore)
		bIdx = bOff + ( i * sb1 );
		for ( j = 0; j < ( N - l ) + p; j++ ) {
			Bv[ bIdx + 1 ] = -Bv[ bIdx + 1 ];
			bIdx += sb2;
		}

		// T(i,i) = T(0,i); T(0,i) = 0  (matches Fortran T(I,I) = T(1,I))
		// Note: the diagonal of T stores conj(tau(i)) — this is the LAPACK convention for ztplqt2.
		tIdx = tOff + ( i * st2 );                // T(0,i)
		aIdx = tOff + ( i * st1 ) + ( i * st2 );  // T(i,i)
		Tv[ aIdx ] = Tv[ tIdx ];
		Tv[ aIdx + 1 ] = Tv[ tIdx + 1 ];
		Tv[ tIdx ] = 0.0;
		Tv[ tIdx + 1 ] = 0.0;
	}

	// Special case: i==0 path of the second loop is skipped, but T(0,0) still holds conj(tau(0)).
	// We need T(0,0) = tau(0) (matching Fortran which doesn't touch T(I,I) for I=1).
	// Actually Fortran loop is DO I=2,M, so T(1,1) was left as conj(tau(1)) — wait, T(1,1) is set inside the loop only for I>=2. Hmm, but Fortran T(1,1) is set by ZLARFG (T(1,I=1)), then conjugated to conj(tau(1)).
	// In dtplqt2 (real), tau is real so T(0,0) = tau(0) directly.
	// For ztplqt2: after the first loop, T(0,0) holds conj(tau(0)). The Fortran code leaves T(1,1) as conj(tau) — but the second loop, by setting T(I,I) = T(1,I) for I>=2 and T(1,I) = 0, leaves T(0,0)=conj(tau(0)) unchanged. Hmm.
	// Wait — does the final transpose/copy step then move T(0,0) somewhere? Re-reading: the final loop copies T(I,J) <- T(J,I) for J>I, and zeros T(J,I). So T(0,0) (i=0,j=0 not in inner loop where j>i) stays as conj(tau(0)).
	// But that's wrong for tau(0) being complex! Let me re-check Fortran...
	// Fortran: T(1,1) is set by ZLARFG then T(1,1) = CONJG(T(1,1)). This is conj(tau(1)). The final transpose loop copies T(I,J) = T(J,I) for J=I+1..M (Fortran 1-based). So T(1,1) is never overwritten. So T(1,1) ends up as conj(tau(1)).
	// Hmm... that seems to be an LAPACK design choice. Let me just match the Fortran and not "fix" it.
	// (After verifying: yes, in LAPACK ztplqt2 the diagonal entries of T are stored as conj(tau(i)). This is consistent with how ztplmqrt etc. consume T.)

	// Final step: copy lower triangle to upper, zero lower (excluding diagonal).
	// Fortran: T(I,J) = T(J,I) for J>I; T(J,I) = 0.
	for ( i = 0; i < M; i++ ) {
		for ( j = i + 1; j < M; j++ ) {
			tIdx = tOff + ( i * st1 ) + ( j * st2 );  // T(i,j)
			aIdx = tOff + ( j * st1 ) + ( i * st2 );  // T(j,i)
			Tv[ tIdx ] = Tv[ aIdx ];
			Tv[ tIdx + 1 ] = Tv[ aIdx + 1 ];
			Tv[ aIdx ] = 0.0;
			Tv[ aIdx + 1 ] = 0.0;
		}
	}

	return 0;
}


// EXPORTS //

export default ztplqt2;
