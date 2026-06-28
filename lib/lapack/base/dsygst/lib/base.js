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

import dsygs2 from '../../dsygs2/lib/base.js';
import dsymm from '../../../../blas/base/dsymm/lib/base.js';
import dsyr2k from '../../../../blas/base/dsyr2k/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';


// VARIABLES //

var NB = 64; // Block size (hardcoded, replaces ILAENV query)


// MAIN //

/**
* Reduces a real symmetric-definite generalized eigenproblem to standard form.
* (blocked algorithm).
*
* If itype = 1, the problem is A_x = lambda_B_x,
_ and A is overwritten by inv(U^T)_A_inv(U) or inv(L)_A*inv(L^T).
*
* If itype = 2 or 3, the problem is A_B_x = lambda_x or B_A_x = lambda_x,
* and A is overwritten by U_A_U^T or L^T_A_L.
*
* B must have been previously factorized as U^T_U or L_L^T by dpotrf.
*
* @private
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input/output symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - triangular factor from Cholesky factorization of B
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @returns {integer} info - 0 if successful
*/
function dsygst( itype, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
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
		return dsygs2( itype, uplo, N, A, sa1, sa2, offsetA, B, sb1, sb2, offsetB );
	}

	// Use blocked code
	if ( itype === 1 ) {
		if ( upper ) {
			// Compute inv(U^T)*A*inv(U)
			for ( k = 0; k < N; k += NB ) {
				kb = Math.min( N - k, NB );

				// Update the upper triangle of A(k:k+kb-1, k:k+kb-1)
				dsygs2( itype, uplo, kb, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ) );

				if ( k + kb < N ) {
					// DTRSM('Left', UPLO, 'Transpose', 'Non-unit', KB, N-K-KB, 1, B(K,K), LDB, A(K,K+KB), LDA)
					dtrsm( 'left', uplo, 'transpose', 'non-unit', kb, N - k - kb, 1.0, B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ), A, sa1, sa2, offsetA + ( k * sa1 ) + ( ( k + kb ) * sa2 ));

					// DSYMM('Left', UPLO, KB, N-K-KB, -HALF, A(K,K), LDA, B(K,K+KB), LDB, 1, A(K,K+KB), LDA)
					dsymm( 'left', uplo, kb, N - k - kb, -0.5, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ) + ( ( k + kb ) * sb2 ), 1.0, A, sa1, sa2, offsetA + ( k * sa1 ) + ( ( k + kb ) * sa2 ));

					// DSYR2K(UPLO, 'Transpose', N-K-KB, KB, -1, A(K,K+KB), LDA, B(K,K+KB), LDB, 1, A(K+KB,K+KB), LDA)
					dsyr2k( uplo, 'transpose', N - k - kb, kb, -1.0, A, sa1, sa2, offsetA + ( k * sa1 ) + ( ( k + kb ) * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ) + ( ( k + kb ) * sb2 ), 1.0, A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( ( k + kb ) * sa2 ));

					// DSYMM again
					dsymm( 'left', uplo, kb, N - k - kb, -0.5, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ) + ( ( k + kb ) * sb2 ), 1.0, A, sa1, sa2, offsetA + ( k * sa1 ) + ( ( k + kb ) * sa2 ));

					// DTRSM('Right', UPLO, 'No transpose', 'Non-unit', KB, N-K-KB, 1, B(K+KB,K+KB), LDB, A(K,K+KB), LDA)
					dtrsm( 'right', uplo, 'no-transpose', 'non-unit', kb, N - k - kb, 1.0, B, sb1, sb2, offsetB + ( ( k + kb ) * sb1 ) + ( ( k + kb ) * sb2 ), A, sa1, sa2, offsetA + ( k * sa1 ) + ( ( k + kb ) * sa2 ));
				}
			}
		} else {
			// Compute inv(L)*A*inv(L^T)
			for ( k = 0; k < N; k += NB ) {
				kb = Math.min( N - k, NB );

				dsygs2( itype, uplo, kb, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ) );

				if ( k + kb < N ) {
					// DTRSM('Right', UPLO, 'Transpose', 'Non-unit', N-K-KB, KB, 1, B(K,K), LDB, A(K+KB,K), LDA)
					dtrsm( 'right', uplo, 'transpose', 'non-unit', N - k - kb, kb, 1.0, B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ), A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( k * sa2 ));

					// DSYMM('Right', UPLO, N-K-KB, KB, -HALF, A(K,K), LDA, B(K+KB,K), LDB, 1, A(K+KB,K), LDA)
					dsymm( 'right', uplo, N - k - kb, kb, -0.5, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( ( k + kb ) * sb1 ) + ( k * sb2 ), 1.0, A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( k * sa2 ));

					// DSYR2K(UPLO, 'No transpose', N-K-KB, KB, -1, A(K+KB,K), LDA, B(K+KB,K), LDB, 1, A(K+KB,K+KB), LDA)
					dsyr2k( uplo, 'no-transpose', N - k - kb, kb, -1.0, A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( ( k + kb ) * sb1 ) + ( k * sb2 ), 1.0, A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( ( k + kb ) * sa2 ));

					dsymm( 'right', uplo, N - k - kb, kb, -0.5, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( ( k + kb ) * sb1 ) + ( k * sb2 ), 1.0, A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( k * sa2 ));

					// DTRSM('Left', UPLO, 'No transpose', 'Non-unit', N-K-KB, KB, 1, B(K+KB,K+KB), LDB, A(K+KB,K), LDA)
					dtrsm( 'left', uplo, 'no-transpose', 'non-unit', N - k - kb, kb, 1.0, B, sb1, sb2, offsetB + ( ( k + kb ) * sb1 ) + ( ( k + kb ) * sb2 ), A, sa1, sa2, offsetA + ( ( k + kb ) * sa1 ) + ( k * sa2 ));
				}
			}
		}
	} else {
		// itype = 2 or 3
		if ( upper ) {
			// Compute U*A*U^T
			for ( k = 0; k < N; k += NB ) {
				kb = Math.min( N - k, NB );

				// DTRMM('Left', UPLO, 'No transpose', 'Non-unit', K, KB, 1, B, LDB, A(1,K+1), LDA)

				// Note: Fortran K is 1-based loop var, our k is 0-based. Fortran K-1 = our k.
				dtrmm( 'left', uplo, 'no-transpose', 'non-unit', k, kb, 1.0, B, sb1, sb2, offsetB, A, sa1, sa2, offsetA + ( k * sa2 ));

				// DSYMM('Right', UPLO, K, KB, HALF, A(K+1,K+1), LDA, B(1,K+1), LDB, 1, A(1,K+1), LDA)
				dsymm( 'right', uplo, k, kb, 0.5, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb2 ), 1.0, A, sa1, sa2, offsetA + ( k * sa2 ));

				// DSYR2K(UPLO, 'No transpose', K, KB, 1, A(1,K+1), LDA, B(1,K+1), LDB, 1, A, LDA)
				dsyr2k( uplo, 'no-transpose', k, kb, 1.0, A, sa1, sa2, offsetA + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb2 ), 1.0, A, sa1, sa2, offsetA);

				dsymm( 'right', uplo, k, kb, 0.5, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb2 ), 1.0, A, sa1, sa2, offsetA + ( k * sa2 ));

				// DTRMM('Right', UPLO, 'Transpose', 'Non-unit', K, KB, 1, B(K+1,K+1), LDB, A(1,K+1), LDA)
				dtrmm( 'right', uplo, 'transpose', 'non-unit', k, kb, 1.0, B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ), A, sa1, sa2, offsetA + ( k * sa2 ));

				dsygs2( itype, uplo, kb, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ) );
			}
		} else {
			// Compute L^T*A*L
			for ( k = 0; k < N; k += NB ) {
				kb = Math.min( N - k, NB );

				// DTRMM('Right', UPLO, 'No transpose', 'Non-unit', KB, K, 1, B, LDB, A(K+1,1), LDA)
				dtrmm( 'right', uplo, 'no-transpose', 'non-unit', kb, k, 1.0, B, sb1, sb2, offsetB, A, sa1, sa2, offsetA + ( k * sa1 ));

				// DSYMM('Left', UPLO, KB, K, HALF, A(K+1,K+1), LDA, B(K+1,1), LDB, 1, A(K+1,1), LDA)
				dsymm( 'left', uplo, kb, k, 0.5, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ), 1.0, A, sa1, sa2, offsetA + ( k * sa1 ));

				// DSYR2K(UPLO, 'Transpose', K, KB, 1, A(K+1,1), LDA, B(K+1,1), LDB, 1, A, LDA)
				dsyr2k( uplo, 'transpose', k, kb, 1.0, A, sa1, sa2, offsetA + ( k * sa1 ), B, sb1, sb2, offsetB + ( k * sb1 ), 1.0, A, sa1, sa2, offsetA);

				dsymm( 'left', uplo, kb, k, 0.5, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ), 1.0, A, sa1, sa2, offsetA + ( k * sa1 ));

				// DTRMM('Left', UPLO, 'Transpose', 'Non-unit', KB, K, 1, B(K+1,K+1), LDB, A(K+1,1), LDA)
				dtrmm( 'left', uplo, 'transpose', 'non-unit', kb, k, 1.0, B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ), A, sa1, sa2, offsetA + ( k * sa1 ));

				dsygs2( itype, uplo, kb, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), B, sb1, sb2, offsetB + ( k * sb1 ) + ( k * sb2 ) );
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dsygst;
