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

import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dsyr2 from '../../../../blas/base/dsyr2/lib/base.js';
import dtrmv from '../../../../blas/base/dtrmv/lib/base.js';
import dtrsv from '../../../../blas/base/dtrsv/lib/base.js';


// MAIN //

/**
* Reduces a real symmetric-definite generalized eigenproblem to standard form.
* (unblocked algorithm).
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
function dsygs2( itype, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	var upper;
	var akk;
	var bkk;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var ct;
	var k;

	upper = ( uplo === 'upper' );

	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideA1;
	sa2 = strideA2;
	sb1 = strideB1;
	sb2 = strideB2;

	if ( itype === 1 ) {
		if ( upper ) {
			// Compute inv(U^T)*A*inv(U)
			for ( k = 0; k < N; k++ ) {
				akk = A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ];
				bkk = B[ offsetB + ( k * sb1 ) + ( k * sb2 ) ];
				akk /= ( bkk * bkk );
				A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] = akk;
				if ( k < N - 1 ) {
					// DSCAL: scale A(k, k+1:n-1) by 1/bkk
					// Fortran: DSCAL(N-K, 1/BKK, A(K, K+1), LDA)
					// Row k, columns k+1..n-1 => stride = sa2
					dscal( N - k - 1, 1.0 / bkk, A, sa2, offsetA + ( k * sa1 ) + ( ( k + 1 ) * sa2 ) );

					ct = -0.5 * akk;

					// DAXPY: A(k, k+1:n-1) += ct * B(k, k+1:n-1)
					daxpy( N - k - 1, ct, B, sb2, offsetB + ( k * sb1 ) + ( ( k + 1 ) * sb2 ), A, sa2, offsetA + ( k * sa1 ) + ( ( k + 1 ) * sa2 ) );

					// DSYR2: A(k+1:n-1, k+1:n-1) -= A(k,k+1:n-1)^T * B(k,k+1:n-1) + B(k,k+1:n-1)^T * A(k,k+1:n-1)
					dsyr2( uplo, N - k - 1, -1.0, A, sa2, offsetA + ( k * sa1 ) + ( ( k + 1 ) * sa2 ), B, sb2, offsetB + ( k * sb1 ) + ( ( k + 1 ) * sb2 ), A, sa1, sa2, offsetA + ( ( k + 1 ) * sa1 ) + ( ( k + 1 ) * sa2 ));

					// DAXPY again
					daxpy( N - k - 1, ct, B, sb2, offsetB + ( k * sb1 ) + ( ( k + 1 ) * sb2 ), A, sa2, offsetA + ( k * sa1 ) + ( ( k + 1 ) * sa2 ) );

					// DTRSV: solve B(k+1:n-1, k+1:n-1)^T * x = A(k, k+1:n-1)
					dtrsv( uplo, 'transpose', 'non-unit', N - k - 1, B, sb1, sb2, offsetB + ( ( k + 1 ) * sb1 ) + ( ( k + 1 ) * sb2 ), A, sa2, offsetA + ( k * sa1 ) + ( ( k + 1 ) * sa2 ));
				}
			}
		} else {
			// Compute inv(L)*A*inv(L^T)
			for ( k = 0; k < N; k++ ) {
				akk = A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ];
				bkk = B[ offsetB + ( k * sb1 ) + ( k * sb2 ) ];
				akk /= ( bkk * bkk );
				A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] = akk;
				if ( k < N - 1 ) {
					// DSCAL: scale A(k+1:n-1, k) by 1/bkk
					// Fortran: DSCAL(N-K, 1/BKK, A(K+1, K), 1)
					// Column k, rows k+1..n-1 => stride = sa1
					dscal( N - k - 1, 1.0 / bkk, A, sa1, offsetA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ) );

					ct = -0.5 * akk;

					daxpy( N - k - 1, ct, B, sb1, offsetB + ( ( k + 1 ) * sb1 ) + ( k * sb2 ), A, sa1, offsetA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ) );

					dsyr2( uplo, N - k - 1, -1.0, A, sa1, offsetA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ), B, sb1, offsetB + ( ( k + 1 ) * sb1 ) + ( k * sb2 ), A, sa1, sa2, offsetA + ( ( k + 1 ) * sa1 ) + ( ( k + 1 ) * sa2 ));

					daxpy( N - k - 1, ct, B, sb1, offsetB + ( ( k + 1 ) * sb1 ) + ( k * sb2 ), A, sa1, offsetA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ) );

					// DTRSV: solve L * x = A(k+1:n-1, k)
					dtrsv( uplo, 'no-transpose', 'non-unit', N - k - 1, B, sb1, sb2, offsetB + ( ( k + 1 ) * sb1 ) + ( ( k + 1 ) * sb2 ), A, sa1, offsetA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ));
				}
			}
		}
	} else {
		// itype = 2 or 3
		if ( upper ) {
			// Compute U*A*U^T
			for ( k = 0; k < N; k++ ) {
				akk = A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ];
				bkk = B[ offsetB + ( k * sb1 ) + ( k * sb2 ) ];

				// DTRMV: multiply column k of A (rows 0..k-1) by B

				// Fortran: DTRMV(UPLO, 'No transpose', 'Non-unit', K-1, B, LDB, A(1,K), 1)
				dtrmv( uplo, 'no-transpose', 'non-unit', k, B, sb1, sb2, offsetB, A, sa1, offsetA + ( k * sa2 ));

				ct = 0.5 * akk;

				daxpy( k, ct, B, sb1, offsetB + ( k * sb2 ), A, sa1, offsetA + ( k * sa2 ) );

				dsyr2( uplo, k, 1.0, A, sa1, offsetA + ( k * sa2 ), B, sb1, offsetB + ( k * sb2 ), A, sa1, sa2, offsetA);

				daxpy( k, ct, B, sb1, offsetB + ( k * sb2 ), A, sa1, offsetA + ( k * sa2 ) );

				dscal( k, bkk, A, sa1, offsetA + ( k * sa2 ) );

				A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] = akk * bkk * bkk;
			}
		} else {
			// Compute L^T*A*L
			for ( k = 0; k < N; k++ ) {
				akk = A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ];
				bkk = B[ offsetB + ( k * sb1 ) + ( k * sb2 ) ];

				// DTRMV: multiply row k of A (columns 0..k-1) by B^T

				// Fortran: DTRMV(UPLO, 'Transpose', 'Non-unit', K-1, B, LDB, A(K,1), LDA)
				// Row k of A, columns 0..k-1 => stride = sa2
				dtrmv( uplo, 'transpose', 'non-unit', k, B, sb1, sb2, offsetB, A, sa2, offsetA + ( k * sa1 ));

				ct = 0.5 * akk;

				// Fortran: DAXPY(K-1, CT, B(K,1), LDB, A(K,1), LDA)
				daxpy( k, ct, B, sb2, offsetB + ( k * sb1 ), A, sa2, offsetA + ( k * sa1 ) );

				dsyr2( uplo, k, 1.0, A, sa2, offsetA + ( k * sa1 ), B, sb2, offsetB + ( k * sb1 ), A, sa1, sa2, offsetA);

				daxpy( k, ct, B, sb2, offsetB + ( k * sb1 ), A, sa2, offsetA + ( k * sa1 ) );

				// DSCAL: A(k, 0:k-1) *= bkk
				dscal( k, bkk, A, sa2, offsetA + ( k * sa1 ) );

				A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] = akk * bkk * bkk;
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dsygs2;
