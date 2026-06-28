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

/* eslint-disable max-len, max-params */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zhemv from '../../../../blas/base/zhemv/lib/base.js';
import zher2 from '../../../../blas/base/zher2/lib/base.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );
var CNONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Reduces a complex Hermitian matrix A to real symmetric tridiagonal form T.
* by a unitary similarity transformation: `Q__H*A*Q = T`.
*
* If UPLO = 'U', the matrix Q is represented as a product of elementary
* reflectors `Q = H(n-1)*...*H(2)*H(1)`, and if UPLO = 'L', the matrix
* Q is represented `as Q = H(1)*H(2)*...*H(n-1)`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Float64Array} d - output diagonal elements of T (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - output off-diagonal elements of T (length N-1)
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Complex128Array} TAU - output scalar factors of reflectors (length N-1)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @returns {integer} info (0 = success)
*/
function zhetd2( uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU ) {
	var alphaR;
	var alphaI;
	var tauiR;
	var tauiI;
	var dotR;
	var dotI;
	var dot;
	var sa1;
	var sa2;
	var Av;
	var Tv;
	var oA;
	var oT;
	var ai;
	var i;

	// Quick return if possible:
	if ( N <= 0 ) {
		return 0;
	}

	Av = reinterpret( A, 0 );
	Tv = reinterpret( TAU, 0 );
	oA = offsetA * 2;
	oT = offsetTAU * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;

	if ( uplo === 'upper' ) {
		// Reduce the upper triangle of A.
		// Fortran: A(N,N) = DBLE(A(N,N))
		ai = oA + (( N - 1 ) * sa1) + (( N - 1 ) * sa2);
		Av[ ai + 1 ] = 0.0;

		// Fortran: DO I = N-1, 1, -1 (1-based)

		// JS: i = N-2 down to 0 (0-based, Fortran I = i+1)
		for ( i = N - 2; i >= 0; i-- ) {
			// Generate elementary reflector H(i+1) to annihilate A(0:i-1, i+1)
			// Fortran: ALPHA = A(I, I+1)
			// Fortran: CALL ZLARFG(I, ALPHA, A(1,I+1), 1, TAUI)
			// JS: zlarfg(i+1, alpha_arr, offsetAlpha, x, strideX, offsetX, tau, offsetTau)
			// Alpha is at A(i, i+1) = oA + i*sa1 + (i+1)*sa2
			// X is A(0, i+1) = oA + (i+1)*sa2, stride = strideA1
			zlarfg(
				i + 1,
				A, offsetA + (i * strideA1) + (( i + 1 ) * strideA2),
				A, strideA1, offsetA + (( i + 1 ) * strideA2),
				TAU, offsetTAU + (i * strideTAU)
			);

			// e[i] = real(alpha) (alpha was overwritten by zlarfg)
			ai = oA + (i * sa1) + (( i + 1 ) * sa2);
			e[ offsetE + (i * strideE) ] = Av[ ai ];

			tauiR = Tv[ oT + ((i * strideTAU) * 2) ];
			tauiI = Tv[ oT + ((i * strideTAU) * 2) + 1 ];

			if ( tauiR !== 0.0 || tauiI !== 0.0 ) {
				// Set A(i, i+1) = 1
				Av[ ai ] = 1.0;
				Av[ ai + 1 ] = 0.0;

				// Compute w := tau * A * v, store in TAU

				// Fortran: ZHEMV(UPLO, I, TAUI, A, LDA, A(1,I+1), 1, ZERO, TAU, 1)

				// JS: zhemv(uplo, i+1, taui, A, ..., A_col_i+1, ..., 0, TAU, ...)
				zhemv(
					uplo, i + 1, new Complex128( tauiR, tauiI ),
					A, strideA1, strideA2, offsetA,
					A, strideA1, offsetA + (( i + 1 ) * strideA2),
					CZERO,
					TAU, strideTAU, offsetTAU
				);

				// Compute alpha := -0.5 * tau * dot(w, v)

				// Fortran: ALPHA = -HALF*TAUI*ZDOTC(I, TAU, 1, A(1,I+1), 1)
				dot = zdotc(
					i + 1,
					TAU, strideTAU, offsetTAU,
					A, strideA1, offsetA + (( i + 1 ) * strideA2)
				);
				dotR = real( dot );
				dotI = imag( dot );

				// -0.5 * taui * dot

				// (tR + tI*i) * (dR + dI*i) = (tR*dR - tI*dI) + (tR*dI + tI*dR)*i
				alphaR = -0.5 * ( (tauiR * dotR) - (tauiI * dotI) );
				alphaI = -0.5 * ( (tauiR * dotI) + (tauiI * dotR) );

				// W := w + alpha * v

				// Fortran: ZAXPY(I, ALPHA, A(1,I+1), 1, TAU, 1)
				zaxpy(
					i + 1, new Complex128( alphaR, alphaI ),
					A, strideA1, offsetA + (( i + 1 ) * strideA2),
					TAU, strideTAU, offsetTAU
				);

				// Apply rank-2 update: A := A - v*w^H - w*v^H

				// Fortran: ZHER2(UPLO, I, -ONE, A(1,I+1), 1, TAU, 1, A, LDA)
				zher2(
					uplo, i + 1, CNONE,
					A, strideA1, offsetA + (( i + 1 ) * strideA2),
					TAU, strideTAU, offsetTAU,
					A, strideA1, strideA2, offsetA
				);
			} else {
				// A(I,I) = DBLE(A(I,I))
				ai = oA + (i * sa1) + (i * sa2);
				Av[ ai + 1 ] = 0.0;
			}
			// A(I, I+1) = E(I) (restore)
			ai = oA + (i * sa1) + (( i + 1 ) * sa2);
			Av[ ai ] = e[ offsetE + (i * strideE) ];
			Av[ ai + 1 ] = 0.0;

			// D(I+1) = DBLE(A(I+1, I+1))
			ai = oA + (( i + 1 ) * sa1) + (( i + 1 ) * sa2);
			d[ offsetD + (( i + 1 ) * strideD) ] = Av[ ai ];

			// TAU(I) = TAUI (restore after workspace use)
			Tv[ oT + ((i * strideTAU) * 2) ] = tauiR;
			Tv[ oT + ((i * strideTAU) * 2) + 1 ] = tauiI;
		}
		// D(1) = DBLE(A(1,1))
		d[ offsetD ] = Av[ oA ];
	} else {
		// Reduce the lower triangle of A.
		// A(1,1) = DBLE(A(1,1))
		Av[ oA + 1 ] = 0.0;

		// Fortran: DO I = 1, N-1 (1-based)

		// JS: i = 0 to N-2 (0-based, Fortran I = i+1)
		for ( i = 0; i < N - 1; i++ ) {
			// Generate elementary reflector H(i+1)
			// Fortran: ALPHA = A(I+1, I)
			// Fortran: ZLARFG(N-I, ALPHA, A(MIN(I+2,N), I), 1, TAUI)
			// JS: zlarfg(N-i-1, alpha at A(i+1,i), x at A(min(i+2,N-1),i), ...)
			zlarfg(
				N - i - 1,
				A, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
				A, strideA1, offsetA + (Math.min( i + 2, N - 1 ) * strideA1) + (i * strideA2),
				TAU, offsetTAU + (i * strideTAU)
			);

			// e[i] = real(alpha)
			ai = oA + (( i + 1 ) * sa1) + (i * sa2);
			e[ offsetE + (i * strideE) ] = Av[ ai ];

			tauiR = Tv[ oT + ((i * strideTAU) * 2) ];
			tauiI = Tv[ oT + ((i * strideTAU) * 2) + 1 ];

			if ( tauiR !== 0.0 || tauiI !== 0.0 ) {
				// Set A(i+1, i) = 1
				Av[ ai ] = 1.0;
				Av[ ai + 1 ] = 0.0;

				// Compute w := tau * A * v

				// Fortran: ZHEMV(UPLO, N-I, TAUI, A(I+1,I+1), LDA, A(I+1,I), 1, ZERO, TAU(I), 1)
				zhemv(
					uplo, N - i - 1, new Complex128( tauiR, tauiI ),
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2),
					A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					CZERO,
					TAU, strideTAU, offsetTAU + (i * strideTAU)
				);

				// Alpha := -0.5 * tau * dot(w, v)
				dot = zdotc(
					N - i - 1,
					TAU, strideTAU, offsetTAU + (i * strideTAU),
					A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2)
				);
				dotR = real( dot );
				dotI = imag( dot );
				alphaR = -0.5 * ( (tauiR * dotR) - (tauiI * dotI) );
				alphaI = -0.5 * ( (tauiR * dotI) + (tauiI * dotR) );

				// W := w + alpha * v
				zaxpy(
					N - i - 1, new Complex128( alphaR, alphaI ),
					A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					TAU, strideTAU, offsetTAU + (i * strideTAU)
				);

				// Apply rank-2 update: A := A - v*w^H - w*v^H
				zher2(
					uplo, N - i - 1, CNONE,
					A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					TAU, strideTAU, offsetTAU + (i * strideTAU),
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2)
				);
			} else {
				// A(I+1, I+1) = DBLE(A(I+1, I+1))
				ai = oA + (( i + 1 ) * sa1) + (( i + 1 ) * sa2);
				Av[ ai + 1 ] = 0.0;
			}
			// A(I+1, I) = E(I) (restore)
			ai = oA + (( i + 1 ) * sa1) + (i * sa2);
			Av[ ai ] = e[ offsetE + (i * strideE) ];
			Av[ ai + 1 ] = 0.0;

			// D(I) = DBLE(A(I,I))
			ai = oA + (i * sa1) + (i * sa2);
			d[ offsetD + (i * strideD) ] = Av[ ai ];

			// TAU(I) = TAUI (restore after workspace use)
			Tv[ oT + ((i * strideTAU) * 2) ] = tauiR;
			Tv[ oT + ((i * strideTAU) * 2) + 1 ] = tauiI;
		}
		// D(N) = DBLE(A(N,N))
		ai = oA + (( N - 1 ) * sa1) + (( N - 1 ) * sa2);
		d[ offsetD + (( N - 1 ) * strideD) ] = Av[ ai ];
	}

	return 0;
}


// EXPORTS //

export default zhetd2;
