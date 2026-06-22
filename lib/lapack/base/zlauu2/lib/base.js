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

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';


// MAIN //

/**
* Computes the product of a complex upper or lower triangular matrix with its.
* conjugate transpose (unblocked algorithm).
*
* If UPLO = 'U', computes `U*U^H` (upper triangle of result stored in A).
* If UPLO = 'L', computes L^H*L (lower triangle of result stored in A).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the triangular matrix
* @param {Complex128Array} A - input/output triangular matrix (overwritten with result)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @returns {integer} info - 0 if successful
*/
function zlauu2( uplo, N, A, strideA1, strideA2, offsetA ) {
	var upper;
	var alpha;
	var dotR;
	var dot;
	var aii;
	var sa1;
	var sa2;
	var Av;
	var ia;
	var i;

	if ( N === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );
	sa1 = strideA1;
	sa2 = strideA2;

	// Float64 view for direct element access
	Av = reinterpret( A, 0 );

	if ( upper ) {
		// Compute U * U^H
		for ( i = 0; i < N; i++ ) {
			// aii = real part of A(i,i)
			ia = 2 * ( offsetA + (i * sa1) + (i * sa2) );
			aii = Av[ ia ];

			if ( i < N - 1 ) {
				// A(i,i) = aii*aii + DBLE( ZDOTC( N-i-1, A(i,i+1), LDA, A(i,i+1), LDA ) )
				// Zdotc returns Complex128, we need real part
				dot = zdotc(
					N - i - 1,
					A, sa2, offsetA + (i * sa1) + (( i + 1 ) * sa2),
					A, sa2, offsetA + (i * sa1) + (( i + 1 ) * sa2)
				);
				dotR = real( dot );
				Av[ ia ] = (aii * aii) + dotR;
				Av[ ia + 1 ] = 0.0;

				// Conjugate A(i, i+1:N-1) before ZGEMV
				zlacgv( N - i - 1, A, sa2, offsetA + (i * sa1) + (( i + 1 ) * sa2) );

				// ZGEMV('N', i, N-i-1, ONE, A(0,i+1), LDA, A(i,i+1), LDA, CMPLX(aii), A(0,i), 1)
				alpha = new Complex128( aii, 0.0 );
				zgemv(
					'no-transpose', i, N - i - 1,
					new Complex128( 1.0, 0.0 ),
					A, sa1, sa2, offsetA + (( i + 1 ) * sa2),        // A(:, i+1)
					A, sa2, offsetA + (i * sa1) + (( i + 1 ) * sa2),   // A(i, i+1:) stride=sa2
					alpha,
					A, sa1, offsetA + (i * sa2)                       // A(:, i) stride=sa1
				);

				// Unconjugate A(i, i+1:N-1)
				zlacgv( N - i - 1, A, sa2, offsetA + (i * sa1) + (( i + 1 ) * sa2) );
			} else {
				// Last column: just scale A(:,N-1) by aii
				zdscal( N, aii, A, sa1, offsetA + (i * sa2) );
			}
		}
	} else {
		// Compute L^H * L
		for ( i = 0; i < N; i++ ) {
			// aii = real part of A(i,i)
			ia = 2 * ( offsetA + (i * sa1) + (i * sa2) );
			aii = Av[ ia ];

			if ( i < N - 1 ) {
				// A(i,i) = aii*aii + DBLE( ZDOTC( N-i-1, A(i+1,i), 1, A(i+1,i), 1 ) )
				dot = zdotc(
					N - i - 1,
					A, sa1, offsetA + (( i + 1 ) * sa1) + (i * sa2),
					A, sa1, offsetA + (( i + 1 ) * sa1) + (i * sa2)
				);
				dotR = real( dot );
				Av[ ia ] = (aii * aii) + dotR;
				Av[ ia + 1 ] = 0.0;

				// Conjugate A(i, 0:i-1) before ZGEMV
				zlacgv( i, A, sa2, offsetA + (i * sa1) );

				// ZGEMV('C', N-i-1, i, ONE, A(i+1,0), LDA, A(i+1,i), 1, CMPLX(aii), A(i,0), LDA)
				alpha = new Complex128( aii, 0.0 );
				zgemv(
					'conjugate-transpose', N - i - 1, i,
					new Complex128( 1.0, 0.0 ),
					A, sa1, sa2, offsetA + (( i + 1 ) * sa1),        // A(i+1, :)
					A, sa1, offsetA + (( i + 1 ) * sa1) + (i * sa2),   // A(i+1:, i) stride=sa1
					alpha,
					A, sa2, offsetA + (i * sa1)                       // A(i, :) stride=sa2
				);

				// Unconjugate A(i, 0:i-1)
				zlacgv( i, A, sa2, offsetA + (i * sa1) );
			} else {
				// Last row: just scale A(N-1,:) by aii
				zdscal( N, aii, A, sa2, offsetA + (i * sa1) );
			}
		}
	}
	return 0;
}


// EXPORTS //

export default zlauu2;
