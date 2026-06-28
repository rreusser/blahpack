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
import zhegs2 from '../../zhegs2/lib/base.js';
import zhemm from '../../../../blas/base/zhemm/lib/base.js';
import zher2k from '../../../../blas/base/zher2k/lib/base.js';
import ztrmm from '../../../../blas/base/ztrmm/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';


// VARIABLES //

var NB = 64; // Block size (hardcoded, replaces ILAENV query)
var CONE = new Complex128( 1.0, 0.0 );
var NEGHALF = new Complex128( -0.5, 0.0 );
var HALF = new Complex128( 0.5, 0.0 );
var NEGCONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Reduces a complex Hermitian-definite generalized eigenproblem to standard form.
* (blocked algorithm).
*
* If itype = 1, the problem is A_x = lambda_B_x,
_ and A is overwritten by inv(U^H)_A_inv(U) or inv(L)_A*inv(L^H).
*
* If itype = 2 or 3, the problem is A_B_x = lambda_x or B_A_x = lambda_x,
* and A is overwritten by U_A_U^H or L^H_A_L.
*
* B must have been previously factorized as U^H_U or L_L^H by zpotrf.
*
* @private
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - input/output Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128Array} B - triangular factor from Cholesky factorization of B
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zhegst( itype, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	var upper;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var kb;
	var k;

	upper = ( uplo === 'upper' );

	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideA1;
	sa2 = strideA2;
	sb1 = strideB1;
	sb2 = strideB2;

	// Use unblocked code for small matrices
	if ( NB <= 1 || NB >= N ) {
		return zhegs2( itype, uplo, N, A, sa1, sa2, offsetA, B, sb1, sb2, offsetB );
	}

	// Use blocked code
	if ( itype === 1 ) {
		if ( upper ) {
			// Compute inv(U^H)*A*inv(U)
			for ( k = 0; k < N; k += NB ) {
				kb = Math.min( N - k, NB );

				// Update the upper triangle of A(k:k+kb-1, k:k+kb-1)
				zhegs2( itype, uplo, kb, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ) );

				if ( k + kb < N ) {
					// ZTRSM('Left', UPLO, 'Conjugate transpose', 'Non-unit', KB, N-K-KB, CONE, B(K,K), LDB, A(K,K+KB), LDA)
					ztrsm( 'left', uplo, 'conjugate-transpose', 'non-unit', kb, N - k - kb, CONE,
						B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ),
						A, sa1, sa2, offsetA + ( k * sa1 ) + ( ( k + kb ) * sa2 )
					);

					// ZHEMM('Left', UPLO, KB, N-K-KB, -HALF, A(K,K), LDA, B(K,K+KB), LDB, CONE, A(K,K+KB), LDA)
					zhemm( 'left', uplo, kb, N - k - kb, NEGHALF,
						A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ),
						B, sb1, sb2, offsetB + ( k * sb1 ) + ( ( k + kb ) * sb2 ),
						CONE,
						A, sa1, sa2, offsetA + ( k * sa1 ) + ( ( k + kb ) * sa2 )
					);

					// ZHER2K(UPLO, 'Conjugate transpose', N-K-KB, KB, -CONE, A(K,K+KB), LDA, B(K,K+KB), LDB, ONE, A(K+KB,K+KB), LDA)
					zher2k( uplo, 'conjugate-transpose', N - k - kb, kb, NEGCONE,
						A, sa1, sa2, offsetA + ( k * sa1 ) + ( ( k + kb ) * sa2 ),
						B, sb1, sb2, offsetB + ( k * sb1 ) + ( ( k + kb ) * sb2 ),
						1.0,
						A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( ( k + kb ) * sa2 )
					);

					// ZHEMM again
					zhemm( 'left', uplo, kb, N - k - kb, NEGHALF,
						A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ),
						B, sb1, sb2, offsetB + ( k * sb1 ) + ( ( k + kb ) * sb2 ),
						CONE,
						A, sa1, sa2, offsetA + ( k * sa1 ) + ( ( k + kb ) * sa2 )
					);

					// ZTRSM('Right', UPLO, 'No transpose', 'Non-unit', KB, N-K-KB, CONE, B(K+KB,K+KB), LDB, A(K,K+KB), LDA)
					ztrsm( 'right', uplo, 'no-transpose', 'non-unit', kb, N - k - kb, CONE,
						B, sb1, sb2, offsetB + ( ( k + kb ) * sb1 ) + ( ( k + kb ) * sb2 ),
						A, sa1, sa2, offsetA + ( k * sa1 ) + ( ( k + kb ) * sa2 )
					);
				}
			}
		} else {
			// Compute inv(L)*A*inv(L^H)
			for ( k = 0; k < N; k += NB ) {
				kb = Math.min( N - k, NB );

				zhegs2( itype, uplo, kb, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ) );

				if ( k + kb < N ) {
					// ZTRSM('Right', UPLO, 'Conjugate transpose', 'Non-unit', N-K-KB, KB, CONE, B(K,K), LDB, A(K+KB,K), LDA)
					ztrsm( 'right', uplo, 'conjugate-transpose', 'non-unit', N - k - kb, kb, CONE,
						B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ),
						A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( k * sa2 )
					);

					// ZHEMM('Right', UPLO, N-K-KB, KB, -HALF, A(K,K), LDA, B(K+KB,K), LDB, CONE, A(K+KB,K), LDA)
					zhemm( 'right', uplo, N - k - kb, kb, NEGHALF,
						A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ),
						B, sb1, sb2, offsetB + ( ( k + kb ) * sb1 ) + ( k * sb2 ),
						CONE,
						A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( k * sa2 )
					);

					// ZHER2K(UPLO, 'No transpose', N-K-KB, KB, -CONE, A(K+KB,K), LDA, B(K+KB,K), LDB, ONE, A(K+KB,K+KB), LDA)
					zher2k( uplo, 'no-transpose', N - k - kb, kb, NEGCONE,
						A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( k * sa2 ),
						B, sb1, sb2, offsetB + ( ( k + kb ) * sb1 ) + ( k * sb2 ),
						1.0,
						A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( ( k + kb ) * sa2 )
					);

					zhemm( 'right', uplo, N - k - kb, kb, NEGHALF,
						A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ),
						B, sb1, sb2, offsetB + ( ( k + kb ) * sb1 ) + ( k * sb2 ),
						CONE,
						A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( k * sa2 )
					);

					// ZTRSM('Left', UPLO, 'No transpose', 'Non-unit', N-K-KB, KB, CONE, B(K+KB,K+KB), LDB, A(K+KB,K), LDA)
					ztrsm( 'left', uplo, 'no-transpose', 'non-unit', N - k - kb, kb, CONE,
						B, sb1, sb2, offsetB + ( ( k + kb ) * sb1 ) + ( ( k + kb ) * sb2 ),
						A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( k * sa2 )
					);
				}
			}
		}
	} else {
		// itype = 2 or 3
		if ( upper ) {
			// Compute U*A*U^H
			for ( k = 0; k < N; k += NB ) {
				kb = Math.min( N - k, NB );

				// ZTRMM('Left', UPLO, 'No transpose', 'Non-unit', K, KB, CONE, B, LDB, A(1,K+1), LDA)
				ztrmm( 'left', uplo, 'no-transpose', 'non-unit', k, kb, CONE,
					B, sb1, sb2, offsetB,
					A, sa1, sa2, offsetA + ( k * sa2 )
				);

				// ZHEMM('Right', UPLO, K, KB, HALF, A(K+1,K+1), LDA, B(1,K+1), LDB, CONE, A(1,K+1), LDA)
				zhemm( 'right', uplo, k, kb, HALF,
					A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ),
					B, sb1, sb2, offsetB + ( k * sb2 ),
					CONE,
					A, sa1, sa2, offsetA + ( k * sa2 )
				);

				// ZHER2K(UPLO, 'No transpose', K, KB, CONE, A(1,K+1), LDA, B(1,K+1), LDB, ONE, A, LDA)
				zher2k( uplo, 'no-transpose', k, kb, CONE,
					A, sa1, sa2, offsetA + ( k * sa2 ),
					B, sb1, sb2, offsetB + ( k * sb2 ),
					1.0,
					A, sa1, sa2, offsetA
				);

				zhemm( 'right', uplo, k, kb, HALF,
					A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ),
					B, sb1, sb2, offsetB + ( k * sb2 ),
					CONE,
					A, sa1, sa2, offsetA + ( k * sa2 )
				);

				// ZTRMM('Right', UPLO, 'Conjugate transpose', 'Non-unit', K, KB, CONE, B(K+1,K+1), LDB, A(1,K+1), LDA)
				ztrmm( 'right', uplo, 'conjugate-transpose', 'non-unit', k, kb, CONE,
					B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ),
					A, sa1, sa2, offsetA + ( k * sa2 )
				);

				zhegs2( itype, uplo, kb, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ) );
			}
		} else {
			// Compute L^H*A*L
			for ( k = 0; k < N; k += NB ) {
				kb = Math.min( N - k, NB );

				// ZTRMM('Right', UPLO, 'No transpose', 'Non-unit', KB, K, CONE, B, LDB, A(K+1,1), LDA)
				ztrmm( 'right', uplo, 'no-transpose', 'non-unit', kb, k, CONE,
					B, sb1, sb2, offsetB,
					A, sa1, sa2, offsetA + ( k * sa1 )
				);

				// ZHEMM('Left', UPLO, KB, K, HALF, A(K+1,K+1), LDA, B(K+1,1), LDB, CONE, A(K+1,1), LDA)
				zhemm( 'left', uplo, kb, k, HALF,
					A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ),
					B, sb1, sb2, offsetB + ( k * sb1 ),
					CONE,
					A, sa1, sa2, offsetA + ( k * sa1 )
				);

				// ZHER2K(UPLO, 'Conjugate transpose', K, KB, CONE, A(K+1,1), LDA, B(K+1,1), LDB, ONE, A, LDA)
				zher2k( uplo, 'conjugate-transpose', k, kb, CONE,
					A, sa1, sa2, offsetA + ( k * sa1 ),
					B, sb1, sb2, offsetB + ( k * sb1 ),
					1.0,
					A, sa1, sa2, offsetA
				);

				zhemm( 'left', uplo, kb, k, HALF,
					A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ),
					B, sb1, sb2, offsetB + ( k * sb1 ),
					CONE,
					A, sa1, sa2, offsetA + ( k * sa1 )
				);

				// ZTRMM('Left', UPLO, 'Conjugate transpose', 'Non-unit', KB, K, CONE, B(K+1,K+1), LDB, A(K+1,1), LDA)
				ztrmm( 'left', uplo, 'conjugate-transpose', 'non-unit', kb, k, CONE,
					B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ),
					A, sa1, sa2, offsetA + ( k * sa1 )
				);

				zhegs2( itype, uplo, kb, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ) );
			}
		}
	}
	return 0;
}


// EXPORTS //

export default zhegst;
