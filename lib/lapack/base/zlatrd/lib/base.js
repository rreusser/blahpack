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
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zhemv from '../../../../blas/base/zhemv/lib/base.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );
var CNONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Reduces NB rows and columns of a complex Hermitian matrix A to Hermitian.
* tridiagonal form by a unitary similarity transformation `Q__H*A*Q`,
* and returns the matrices V and W which are needed to apply the
* transformation to the unreduced part of A.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {integer} nb - number of rows/columns to reduce
* @param {Complex128Array} A - complex Hermitian matrix (complex-element strides)
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Float64Array} e - off-diagonal elements
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Complex128Array} TAU - scalar factors of reflectors
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} W - output workspace matrix (N-by-NB) (complex-element strides)
* @param {integer} strideW1 - stride of first dimension of W (complex elements)
* @param {integer} strideW2 - stride of second dimension of W (complex elements)
* @param {NonNegativeInteger} offsetW - starting index for W (complex elements)
*/
function zlatrd( uplo, N, nb, A, strideA1, strideA2, offsetA, e, strideE, offsetE, TAU, strideTAU, offsetTAU, W, strideW1, strideW2, offsetW ) {
	var alphaR;
	var alphaI;
	var tauiR;
	var tauiI;
	var dotR;
	var dotI;
	var sa1;
	var sa2;
	var dot;
	var Av;
	var Tv;
	var oA;
	var oT;
	var ai;
	var iw;
	var i;

	if ( N <= 0 ) {
		return;
	}

	Av = reinterpret( A, 0 );
	Tv = reinterpret( TAU, 0 );
	oA = offsetA * 2;
	oT = offsetTAU * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;

	if ( uplo === 'upper' ) {
		// Reduce last NB columns of upper triangle
		// Fortran: DO I = N, N-NB+1, -1
		// 0-based: i from N-1 down to N-nb
		for ( i = N - 1; i >= N - nb; i-- ) {
			iw = i - N + nb; // 0-based column index in W

			if ( i < N - 1 ) {
				// Update A(0:i, i)
				// First force A(i,i) to be real
				ai = oA + (i * sa1) + (i * sa2);
				Av[ ai + 1 ] = 0.0;

				// Conjugate W(i, iw+1:nb-1) row
				zlacgv( N - 1 - i, W, strideW2, offsetW + (i * strideW1) + (( iw + 1 ) * strideW2) );

				// A(0:i, i) -= A(0:i, i+1:N-1) * W(i, iw+1:nb-1)^T
				zgemv( 'no-transpose', i + 1, N - 1 - i, CNONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2),
					W, strideW2, offsetW + (i * strideW1) + (( iw + 1 ) * strideW2),
					CONE, A, strideA1, offsetA + (i * strideA2)
				);

				// Un-conjugate
				zlacgv( N - 1 - i, W, strideW2, offsetW + (i * strideW1) + (( iw + 1 ) * strideW2) );

				// Conjugate A(i, i+1:N-1) row
				zlacgv( N - 1 - i, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2) );

				// A(0:i, i) -= W(0:i, iw+1:nb-1) * A(i, i+1:N-1)^T
				zgemv( 'no-transpose', i + 1, N - 1 - i, CNONE,
					W, strideW1, strideW2, offsetW + (( iw + 1 ) * strideW2),
					A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2),
					CONE, A, strideA1, offsetA + (i * strideA2)
				);

				// Un-conjugate
				zlacgv( N - 1 - i, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2) );

				// Force diagonal real again
				ai = oA + (i * sa1) + (i * sa2);
				Av[ ai + 1 ] = 0.0;
			}

			if ( i > 0 ) {
				// Generate reflector H(i) to annihilate A(0:i-2, i)
				// Alpha = A(i-1, i)
				// X = A(0:i-2, i) = column i, rows 0..i-2
				zlarfg(
					i,
					A, offsetA + (( i - 1 ) * strideA1) + (i * strideA2),
					A, strideA1, offsetA + (i * strideA2),
					TAU, offsetTAU + (( i - 1 ) * strideTAU)
				);
				ai = oA + (( i - 1 ) * sa1) + (i * sa2);
				e[ offsetE + (( i - 1 ) * strideE) ] = Av[ ai ];

				// Set A(i-1, i) = 1
				Av[ ai ] = 1.0;
				Av[ ai + 1 ] = 0.0;

				// Compute W(0:i-1, iw)

				// W(0:i-1, iw) = A(0:i-1, 0:i-1) * A(0:i-1, i) (Hermitian multiply)
				zhemv( 'upper', i, CONE,
					A, strideA1, strideA2, offsetA,
					A, strideA1, offsetA + (i * strideA2),
					CZERO, W, strideW1, offsetW + (iw * strideW2)
				);

				if ( i < N - 1 ) {
					// W(i+1:N-1, iw) = W(0:i-1, iw+1:nb-1)^H * A(0:i-1, i)
					zgemv( 'conjugate-transpose', i, N - 1 - i, CONE,
						W, strideW1, strideW2, offsetW + (( iw + 1 ) * strideW2),
						A, strideA1, offsetA + (i * strideA2),
						CZERO, W, strideW1, offsetW + (( i + 1 ) * strideW1) + (iw * strideW2)
					);

					// W(0:i-1, iw) -= A(0:i-1, i+1:N-1) * W(i+1:N-1, iw)
					zgemv( 'no-transpose', i, N - 1 - i, CNONE,
						A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2),
						W, strideW1, offsetW + (( i + 1 ) * strideW1) + (iw * strideW2),
						CONE, W, strideW1, offsetW + (iw * strideW2)
					);

					// W(i+1:N-1, iw) = A(0:i-1, i+1:N-1)^H * A(0:i-1, i)
					zgemv( 'conjugate-transpose', i, N - 1 - i, CONE,
						A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2),
						A, strideA1, offsetA + (i * strideA2),
						CZERO, W, strideW1, offsetW + (( i + 1 ) * strideW1) + (iw * strideW2)
					);

					// W(0:i-1, iw) -= W(0:i-1, iw+1:nb-1) * W(i+1:N-1, iw)
					zgemv( 'no-transpose', i, N - 1 - i, CNONE,
						W, strideW1, strideW2, offsetW + (( iw + 1 ) * strideW2),
						W, strideW1, offsetW + (( i + 1 ) * strideW1) + (iw * strideW2),
						CONE, W, strideW1, offsetW + (iw * strideW2)
					);
				}

				// W(0:i-1, iw) = TAU(i-1) * W(0:i-1, iw)
				tauiR = Tv[ oT + (( i - 1 ) * strideTAU * 2) ];
				tauiI = Tv[ oT + (( i - 1 ) * (strideTAU * 2)) + 1 ];
				zscal( i, TAU.get( offsetTAU + (( i - 1 ) * strideTAU) ),
					W, strideW1, offsetW + (iw * strideW2)
				);

				// Alpha = -0.5 * TAU(i-1) * dot(W(0:i-1,iw), A(0:i-1,i))
				dot = zdotc(
					i,
					W, strideW1, offsetW + (iw * strideW2),
					A, strideA1, offsetA + (i * strideA2)
				);
				dotR = real( dot );
				dotI = imag( dot );
				alphaR = -0.5 * ( (tauiR * dotR) - (tauiI * dotI) );
				alphaI = -0.5 * ( (tauiR * dotI) + (tauiI * dotR) );

				// W(0:i-1, iw) += alpha * A(0:i-1, i)
				zaxpy( i, new Complex128( alphaR, alphaI ),
					A, strideA1, offsetA + (i * strideA2),
					W, strideW1, offsetW + (iw * strideW2)
				);
			}
		}
	} else {
		// Reduce first NB columns of lower triangle
		// Fortran: DO I = 1, NB
		// 0-based: i from 0 to nb-1
		for ( i = 0; i < nb; i++ ) {
			// Update A(i:N-1, i)
			// First force A(i,i) to be real
			ai = oA + (i * sa1) + (i * sa2);
			Av[ ai + 1 ] = 0.0;

			// Conjugate W(i, 0:i-1) row
			zlacgv( i, W, strideW2, offsetW + (i * strideW1) );

			// A(i:N-1, i) -= A(i:N-1, 0:i-1) * W(i, 0:i-1)^T
			zgemv( 'no-transpose', N - i, i, CNONE,
				A, strideA1, strideA2, offsetA + (i * strideA1),
				W, strideW2, offsetW + (i * strideW1),
				CONE, A, strideA1, offsetA + (i * strideA1) + (i * strideA2)
			);

			// Un-conjugate
			zlacgv( i, W, strideW2, offsetW + (i * strideW1) );

			// Conjugate A(i, 0:i-1) row
			zlacgv( i, A, strideA2, offsetA + (i * strideA1) );

			// A(i:N-1, i) -= W(i:N-1, 0:i-1) * A(i, 0:i-1)^T
			zgemv( 'no-transpose', N - i, i, CNONE,
				W, strideW1, strideW2, offsetW + (i * strideW1),
				A, strideA2, offsetA + (i * strideA1),
				CONE, A, strideA1, offsetA + (i * strideA1) + (i * strideA2)
			);

			// Un-conjugate
			zlacgv( i, A, strideA2, offsetA + (i * strideA1) );

			// Force diagonal real
			ai = oA + (i * sa1) + (i * sa2);
			Av[ ai + 1 ] = 0.0;

			if ( i < N - 1 ) {
				// Generate reflector H(i+1)
				// Alpha = A(i+1, i), x = A(min(i+2,N-1):N-1, i)
				zlarfg(
					N - i - 1,
					A, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					A, strideA1, offsetA + (Math.min( i + 2, N - 1 ) * strideA1) + (i * strideA2),
					TAU, offsetTAU + (i * strideTAU)
				);
				ai = oA + (( i + 1 ) * sa1) + (i * sa2);
				e[ offsetE + (i * strideE) ] = Av[ ai ];

				// Set A(i+1, i) = 1
				Av[ ai ] = 1.0;
				Av[ ai + 1 ] = 0.0;

				// Compute W(i+1:N-1, i)

				// W(i+1:N-1, i) = A(i+1:N-1, i+1:N-1) * A(i+1:N-1, i) (Hermitian)
				zhemv( 'lower', N - i - 1, CONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2),
					A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					CZERO, W, strideW1, offsetW + (( i + 1 ) * strideW1) + (i * strideW2)
				);

				// W(0:i-1, i) = W(i+1:N-1, 0:i-1)^H * A(i+1:N-1, i)
				zgemv( 'conjugate-transpose', N - i - 1, i, CONE,
					W, strideW1, strideW2, offsetW + (( i + 1 ) * strideW1),
					A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					CZERO, W, strideW1, offsetW + (i * strideW2)
				);

				// W(i+1:N-1, i) -= A(i+1:N-1, 0:i-1) * W(0:i-1, i)
				zgemv( 'no-transpose', N - i - 1, i, CNONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1),
					W, strideW1, offsetW + (i * strideW2),
					CONE, W, strideW1, offsetW + (( i + 1 ) * strideW1) + (i * strideW2)
				);

				// W(0:i-1, i) = A(i+1:N-1, 0:i-1)^H * A(i+1:N-1, i)
				zgemv( 'conjugate-transpose', N - i - 1, i, CONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1),
					A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					CZERO, W, strideW1, offsetW + (i * strideW2)
				);

				// W(i+1:N-1, i) -= W(i+1:N-1, 0:i-1) * W(0:i-1, i)
				zgemv( 'no-transpose', N - i - 1, i, CNONE,
					W, strideW1, strideW2, offsetW + (( i + 1 ) * strideW1),
					W, strideW1, offsetW + (i * strideW2),
					CONE, W, strideW1, offsetW + (( i + 1 ) * strideW1) + (i * strideW2)
				);

				// W(i+1:N-1, i) = TAU(i) * W(i+1:N-1, i)
				tauiR = Tv[ oT + ((i * strideTAU) * 2) ];
				tauiI = Tv[ oT + ((i * strideTAU) * 2) + 1 ];
				zscal( N - i - 1, TAU.get( offsetTAU + (i * strideTAU) ),
					W, strideW1, offsetW + (( i + 1 ) * strideW1) + (i * strideW2)
				);

				// Alpha = -0.5 * TAU(i) * dot(W(i+1:N-1,i), A(i+1:N-1,i))
				dot = zdotc(
					N - i - 1,
					W, strideW1, offsetW + (( i + 1 ) * strideW1) + (i * strideW2),
					A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2)
				);
				dotR = real( dot );
				dotI = imag( dot );
				alphaR = -0.5 * ( (tauiR * dotR) - (tauiI * dotI) );
				alphaI = -0.5 * ( (tauiR * dotI) + (tauiI * dotR) );

				// W(i+1:N-1, i) += alpha * A(i+1:N-1, i)
				zaxpy( N - i - 1, new Complex128( alphaR, alphaI ),
					A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					W, strideW1, offsetW + (( i + 1 ) * strideW1) + (i * strideW2)
				);
			}
		}
	}
}


// EXPORTS //

export default zlatrd;
