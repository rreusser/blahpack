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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';


// VARIABLES //

var ONE = new Complex128( 1.0, 0.0 );
var ZERO = new Complex128( 0.0, 0.0 );
var NEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Reduces the first NB rows and columns of a complex general M-by-N matrix A.
* to upper or lower real bidiagonal form by a unitary transformation
* `Q^H*A*P`, and returns the matrices X and Y which are needed to apply
* the transformation to the unreduced part of A.
*
* If M >= N, A is reduced to upper bidiagonal form; if M < N, to lower
* bidiagonal form.
*
* This is an auxiliary routine called by ZGEBRD.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {integer} nb - number of leading rows and columns to reduce
* @param {Complex128Array} A - input matrix (M-by-N, column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Float64Array} d - real diagonal elements (length nb)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - real off-diagonal elements (length nb)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Complex128Array} TAUQ - complex scalars for Q reflectors (length nb)
* @param {integer} strideTAUQ - stride length for `TAUQ` (in complex elements)
* @param {NonNegativeInteger} offsetTAUQ - starting index for `TAUQ` (in complex elements)
* @param {Complex128Array} TAUP - complex scalars for P reflectors (length nb)
* @param {integer} strideTAUP - stride length for `TAUP` (in complex elements)
* @param {NonNegativeInteger} offsetTAUP - starting index for `TAUP` (in complex elements)
* @param {Complex128Array} X - output matrix (M-by-NB, column-major)
* @param {integer} strideX1 - stride of the first dimension of `X` (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of `X` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
* @param {Complex128Array} Y - output matrix (N-by-NB, column-major)
* @param {integer} strideY1 - stride of the first dimension of `Y` (in complex elements)
* @param {integer} strideY2 - stride of the second dimension of `Y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `Y` (in complex elements)
*/
function zlabrd( M, N, nb, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, X, strideX1, strideX2, offsetX, Y, strideY1, strideY2, offsetY ) {
	/* @complex-arrays A, TAUQ, TAUP, X, Y */
	var alphaRe;
	var alphaIm;
	var alpha;
	var sa1;
	var sa2;
	var Av;
	var ia;
	var i;

	alpha = new Complex128Array( 1 );

	if ( M <= 0 || N <= 0 ) {
		return;
	}

	// Get Float64 view for direct element access
	Av = reinterpret( A, 0 );

	// Float64 strides and offsets
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;

	if ( M >= N ) {
		// Reduce to upper bidiagonal form
		for ( i = 0; i < nb; i++ ) {
			// Update A(i:M-1, i)
			zlacgv( i, Y, strideY2, offsetY + (i * strideY1) );

			zgemv( 'no-transpose', M - i, i, NEGONE,
				A, strideA1, strideA2, offsetA + (i * strideA1),
				Y, strideY2, offsetY + (i * strideY1),
				ONE, A, strideA1, offsetA + (i * strideA1) + (i * strideA2)
			);

			zlacgv( i, Y, strideY2, offsetY + (i * strideY1) );

			zgemv( 'no-transpose', M - i, i, NEGONE,
				X, strideX1, strideX2, offsetX + (i * strideX1),
				A, strideA1, offsetA + (i * strideA2),
				ONE, A, strideA1, offsetA + (i * strideA1) + (i * strideA2)
			);

			// Generate elementary reflector H(i) to annihilate A(i+1:M-1, i)
			ia = (offsetA * 2) + (i * sa1) + (i * sa2);
			alphaRe = Av[ ia ];
			alphaIm = Av[ ia + 1 ];
			reinterpret( alpha, 0 )[ 0 ] = alphaRe;
			reinterpret( alpha, 0 )[ 1 ] = alphaIm;
			zlarfg( M - i, alpha, 0,
				A, strideA1, offsetA + (Math.min( i + 1, M - 1 ) * strideA1) + (i * strideA2),
				TAUQ, offsetTAUQ + (i * strideTAUQ)
			);
			d[ offsetD + (i * strideD) ] = reinterpret( alpha, 0 )[ 0 ];

			if ( i < N - 1 ) {
				// Set A(i,i) = 1 for use as the reflector vector
				Av[ ia ] = 1.0;
				Av[ ia + 1 ] = 0.0;

				// Compute Y(i+1:N-1, i)
				zgemv( 'conjugate-transpose', M - i, N - i - 1, ONE,
					A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2),
					A, strideA1, offsetA + (i * strideA1) + (i * strideA2),
					ZERO, Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2)
				);

				zgemv( 'conjugate-transpose', M - i, i, ONE,
					A, strideA1, strideA2, offsetA + (i * strideA1),
					A, strideA1, offsetA + (i * strideA1) + (i * strideA2),
					ZERO, Y, strideY1, offsetY + (i * strideY2)
				);

				zgemv( 'no-transpose', N - i - 1, i, NEGONE,
					Y, strideY1, strideY2, offsetY + (( i + 1 ) * strideY1),
					Y, strideY1, offsetY + (i * strideY2),
					ONE, Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2)
				);

				zgemv( 'conjugate-transpose', M - i, i, ONE,
					X, strideX1, strideX2, offsetX + (i * strideX1),
					A, strideA1, offsetA + (i * strideA1) + (i * strideA2),
					ZERO, Y, strideY1, offsetY + (i * strideY2)
				);

				zgemv( 'conjugate-transpose', i, N - i - 1, NEGONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2),
					Y, strideY1, offsetY + (i * strideY2),
					ONE, Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2)
				);

				// ZSCAL(N-I, TAUQ(I), Y(I+1,I), 1)
				zscal( N - i - 1, TAUQ.get( offsetTAUQ + (i * strideTAUQ) ),
					Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2)
				);

				// Update A(i, i+1:N-1)
				zlacgv( N - i - 1, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2) );
				zlacgv( i + 1, A, strideA2, offsetA + (i * strideA1) );

				zgemv( 'no-transpose', N - i - 1, i + 1, NEGONE,
					Y, strideY1, strideY2, offsetY + (( i + 1 ) * strideY1),
					A, strideA2, offsetA + (i * strideA1),
					ONE, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2)
				);

				zlacgv( i + 1, A, strideA2, offsetA + (i * strideA1) );
				zlacgv( i, X, strideX2, offsetX + (i * strideX1) );

				zgemv( 'conjugate-transpose', i, N - i - 1, NEGONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2),
					X, strideX2, offsetX + (i * strideX1),
					ONE, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2)
				);

				zlacgv( i, X, strideX2, offsetX + (i * strideX1) );

				// Generate elementary reflector G(i) to annihilate A(i, i+2:N-1)
				zlarfg( N - i - 1, A, offsetA + (i * strideA1) + (( i + 1 ) * strideA2),
					A, strideA2, offsetA + (i * strideA1) + (Math.min( i + 2, N - 1 ) * strideA2),
					TAUP, offsetTAUP + (i * strideTAUP)
				);
				e[ offsetE + (i * strideE) ] = Av[ (offsetA * 2) + (i * sa1) + (( i + 1 ) * sa2) ];
				Av[ (offsetA * 2) + (i * sa1) + (( i + 1 ) * sa2) ] = 1.0;
				Av[ (offsetA * 2) + (i * sa1) + (( i + 1 ) * sa2) + 1 ] = 0.0;

				// Compute X(i+1:M-1, i)
				zgemv( 'no-transpose', M - i - 1, N - i - 1, ONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2),
					A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2),
					ZERO, X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2)
				);

				zgemv( 'conjugate-transpose', N - i - 1, i + 1, ONE,
					Y, strideY1, strideY2, offsetY + (( i + 1 ) * strideY1),
					A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2),
					ZERO, X, strideX1, offsetX + (i * strideX2)
				);

				zgemv( 'no-transpose', M - i - 1, i + 1, NEGONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1),
					X, strideX1, offsetX + (i * strideX2),
					ONE, X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2)
				);

				zgemv( 'no-transpose', i, N - i - 1, ONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2),
					A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2),
					ZERO, X, strideX1, offsetX + (i * strideX2)
				);

				zgemv( 'no-transpose', M - i - 1, i, NEGONE,
					X, strideX1, strideX2, offsetX + (( i + 1 ) * strideX1),
					X, strideX1, offsetX + (i * strideX2),
					ONE, X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2)
				);

				// ZSCAL(M-I, TAUP(I), X(I+1,I), 1)
				zscal( M - i - 1, TAUP.get( offsetTAUP + (i * strideTAUP) ),
					X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2)
				);

				// Unconjugate A(I, I+1:N-1)
				zlacgv( N - i - 1, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2) );
			}
		}
	} else {
		// Reduce to lower bidiagonal form (M < N)
		for ( i = 0; i < nb; i++ ) {
			// Update A(i, i:N-1)
			zlacgv( N - i, A, strideA2, offsetA + (i * strideA1) + (i * strideA2) );
			zlacgv( i, A, strideA2, offsetA + (i * strideA1) );

			zgemv( 'no-transpose', N - i, i, NEGONE,
				Y, strideY1, strideY2, offsetY + (i * strideY1),
				A, strideA2, offsetA + (i * strideA1),
				ONE, A, strideA2, offsetA + (i * strideA1) + (i * strideA2)
			);

			zlacgv( i, A, strideA2, offsetA + (i * strideA1) );
			zlacgv( i, X, strideX2, offsetX + (i * strideX1) );

			zgemv( 'conjugate-transpose', i, N - i, NEGONE,
				A, strideA1, strideA2, offsetA + (i * strideA2),
				X, strideX2, offsetX + (i * strideX1),
				ONE, A, strideA2, offsetA + (i * strideA1) + (i * strideA2)
			);

			zlacgv( i, X, strideX2, offsetX + (i * strideX1) );

			// Generate elementary reflector G(i) to annihilate A(i, i+1:N-1)
			ia = (offsetA * 2) + (i * sa1) + (i * sa2);
			alphaRe = Av[ ia ];
			alphaIm = Av[ ia + 1 ];
			reinterpret( alpha, 0 )[ 0 ] = alphaRe;
			reinterpret( alpha, 0 )[ 1 ] = alphaIm;
			zlarfg( N - i, alpha, 0,
				A, strideA2, offsetA + (i * strideA1) + (Math.min( i + 1, N - 1 ) * strideA2),
				TAUP, offsetTAUP + (i * strideTAUP)
			);
			d[ offsetD + (i * strideD) ] = reinterpret( alpha, 0 )[ 0 ];

			if ( i < M - 1 ) {
				// Set A(i,i) = 1 for use as reflector vector
				Av[ ia ] = 1.0;
				Av[ ia + 1 ] = 0.0;

				// Compute X(i+1:M-1, i)
				zgemv( 'no-transpose', M - i - 1, N - i, ONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					A, strideA2, offsetA + (i * strideA1) + (i * strideA2),
					ZERO, X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2)
				);

				zgemv( 'conjugate-transpose', N - i, i, ONE,
					Y, strideY1, strideY2, offsetY + (i * strideY1),
					A, strideA2, offsetA + (i * strideA1) + (i * strideA2),
					ZERO, X, strideX1, offsetX + (i * strideX2)
				);

				zgemv( 'no-transpose', M - i - 1, i, NEGONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1),
					X, strideX1, offsetX + (i * strideX2),
					ONE, X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2)
				);

				zgemv( 'no-transpose', i, N - i, ONE,
					A, strideA1, strideA2, offsetA + (i * strideA2),
					A, strideA2, offsetA + (i * strideA1) + (i * strideA2),
					ZERO, X, strideX1, offsetX + (i * strideX2)
				);

				zgemv( 'no-transpose', M - i - 1, i, NEGONE,
					X, strideX1, strideX2, offsetX + (( i + 1 ) * strideX1),
					X, strideX1, offsetX + (i * strideX2),
					ONE, X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2)
				);

				// ZSCAL(M-I, TAUP(I), X(I+1,I), 1)
				zscal( M - i - 1, TAUP.get( offsetTAUP + (i * strideTAUP) ),
					X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2)
				);

				// Unconjugate A(I, I:N-1)
				zlacgv( N - i, A, strideA2, offsetA + (i * strideA1) + (i * strideA2) );

				// Update A(i+1:M-1, i)
				zlacgv( i, Y, strideY2, offsetY + (i * strideY1) );

				zgemv( 'no-transpose', M - i - 1, i, NEGONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1),
					Y, strideY2, offsetY + (i * strideY1),
					ONE, A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2)
				);

				zlacgv( i, Y, strideY2, offsetY + (i * strideY1) );

				zgemv( 'no-transpose', M - i - 1, i + 1, NEGONE,
					X, strideX1, strideX2, offsetX + (( i + 1 ) * strideX1),
					A, strideA1, offsetA + (i * strideA2),
					ONE, A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2)
				);

				// Generate elementary reflector H(i) to annihilate A(i+2:M-1, i)
				zlarfg( M - i - 1, A, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					A, strideA1, offsetA + (Math.min( i + 2, M - 1 ) * strideA1) + (i * strideA2),
					TAUQ, offsetTAUQ + (i * strideTAUQ)
				);
				e[ offsetE + (i * strideE) ] = Av[ (offsetA * 2) + (( i + 1 ) * sa1) + (i * sa2) ];
				Av[ (offsetA * 2) + (( i + 1 ) * sa1) + (i * sa2) ] = 1.0;
				Av[ (offsetA * 2) + (( i + 1 ) * sa1) + (i * sa2) + 1 ] = 0.0;

				// Compute Y(i+1:N-1, i)
				zgemv( 'conjugate-transpose', M - i - 1, N - i - 1, ONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2),
					A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					ZERO, Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2)
				);

				zgemv( 'conjugate-transpose', M - i - 1, i, ONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1),
					A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					ZERO, Y, strideY1, offsetY + (i * strideY2)
				);

				zgemv( 'no-transpose', N - i - 1, i, NEGONE,
					Y, strideY1, strideY2, offsetY + (( i + 1 ) * strideY1),
					Y, strideY1, offsetY + (i * strideY2),
					ONE, Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2)
				);

				zgemv( 'conjugate-transpose', M - i - 1, i + 1, ONE,
					X, strideX1, strideX2, offsetX + (( i + 1 ) * strideX1),
					A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					ZERO, Y, strideY1, offsetY + (i * strideY2)
				);

				zgemv( 'conjugate-transpose', i + 1, N - i - 1, NEGONE,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2),
					Y, strideY1, offsetY + (i * strideY2),
					ONE, Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2)
				);

				// ZSCAL(N-I, TAUQ(I), Y(I+1,I), 1)
				zscal( N - i - 1, TAUQ.get( offsetTAUQ + (i * strideTAUQ) ),
					Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2)
				);
			} else {
				// Unconjugate A(I, I:N-1)
				zlacgv( N - i, A, strideA2, offsetA + (i * strideA1) + (i * strideA2) );
			}
		}
	}
}


// EXPORTS //

export default zlabrd;
