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

/* eslint-disable max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zher2 from '../../../../blas/base/zher2/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';
import ztrmv from '../../../../blas/base/ztrmv/lib/base.js';
import ztrsv from '../../../../blas/base/ztrsv/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var NEGCONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Reduces a complex Hermitian-definite generalized eigenproblem to standard form.
* (unblocked algorithm).
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
function zhegs2( itype, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	var upper;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var akk;
	var bkk;
	var ct;
	var Av;
	var Bv;
	var oA;
	var oB;
	var da1;
	var da2;
	var db1;
	var db2;
	var k;

	upper = ( uplo === 'upper' );

	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideA1;
	sa2 = strideA2;
	sb1 = strideB1;
	sb2 = strideB2;

	// Float64 views and double-based strides for direct element access
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	Bv = reinterpret( B, 0 );
	oB = offsetB * 2;
	da1 = sa1 * 2;
	da2 = sa2 * 2;
	db1 = sb1 * 2;
	db2 = sb2 * 2;

	if ( itype === 1 ) {
		if ( upper ) {
			// Compute inv(U^H)*A*inv(U)
			for ( k = 0; k < N; k++ ) {
				// AKK = DBLE(A(K,K)), BKK = DBLE(B(K,K)) -- diagonal is real
				akk = Av[ oA + ( k * da1 ) + ( k * da2 ) ];
				bkk = Bv[ oB + ( k * db1 ) + ( k * db2 ) ];
				akk /= ( bkk * bkk );
				Av[ oA + ( k * da1 ) + ( k * da2 ) ] = akk;
				Av[ oA + ( k * da1 ) + ( k * da2 ) + 1 ] = 0.0; // ensure imag = 0

				if ( k < N - 1 ) {
					// ZDSCAL(N-K, 1/BKK, A(K,K+1), LDA)
					zdscal( N - k - 1, 1.0 / bkk, A, sa2, offsetA + ( k * sa1 ) + ( ( k + 1 ) * sa2 ) );

					ct = new Complex128( -0.5 * akk, 0.0 );

					// ZLACGV(N-K, A(K,K+1), LDA)
					zlacgv( N - k - 1, A, sa2, offsetA + ( k * sa1 ) + ( ( k + 1 ) * sa2 ) );

					// ZLACGV(N-K, B(K,K+1), LDB)
					zlacgv( N - k - 1, B, sb2, offsetB + ( k * sb1 ) + ( ( k + 1 ) * sb2 ) );

					// ZAXPY(N-K, CT, B(K,K+1), LDB, A(K,K+1), LDA)
					zaxpy( N - k - 1, ct,
						B, sb2, offsetB + ( k * sb1 ) + ( ( k + 1 ) * sb2 ),
						A, sa2, offsetA + ( k * sa1 ) + ( ( k + 1 ) * sa2 )
					);

					// ZHER2(UPLO, N-K, -CONE, A(K,K+1), LDA, B(K,K+1), LDB, A(K+1,K+1), LDA)
					zher2( uplo, N - k - 1, NEGCONE,
						A, sa2, offsetA + ( k * sa1 ) + ( ( k + 1 ) * sa2 ),
						B, sb2, offsetB + ( k * sb1 ) + ( ( k + 1 ) * sb2 ),
						A, sa1, sa2, offsetA + ( ( k + 1 ) * sa1 ) + ( ( k + 1 ) * sa2 )
					);

					// ZAXPY again
					zaxpy( N - k - 1, ct,
						B, sb2, offsetB + ( k * sb1 ) + ( ( k + 1 ) * sb2 ),
						A, sa2, offsetA + ( k * sa1 ) + ( ( k + 1 ) * sa2 )
					);

					// ZLACGV(N-K, B(K,K+1), LDB) — unconjugate
					zlacgv( N - k - 1, B, sb2, offsetB + ( k * sb1 ) + ( ( k + 1 ) * sb2 ) );

					// ZTRSV(UPLO, 'Conjugate transpose', 'Non-unit', N-K, B(K+1,K+1), LDB, A(K,K+1), LDA)
					ztrsv( uplo, 'conjugate-transpose', 'non-unit', N - k - 1,
						B, sb1, sb2, offsetB + ( ( k + 1 ) * sb1 ) + ( ( k + 1 ) * sb2 ),
						A, sa2, offsetA + ( k * sa1 ) + ( ( k + 1 ) * sa2 )
					);

					// ZLACGV(N-K, A(K,K+1), LDA) — unconjugate
					zlacgv( N - k - 1, A, sa2, offsetA + ( k * sa1 ) + ( ( k + 1 ) * sa2 ) );
				}
			}
		} else {
			// Compute inv(L)*A*inv(L^H)
			for ( k = 0; k < N; k++ ) {
				akk = Av[ oA + ( k * da1 ) + ( k * da2 ) ];
				bkk = Bv[ oB + ( k * db1 ) + ( k * db2 ) ];
				akk /= ( bkk * bkk );
				Av[ oA + ( k * da1 ) + ( k * da2 ) ] = akk;
				Av[ oA + ( k * da1 ) + ( k * da2 ) + 1 ] = 0.0;

				if ( k < N - 1 ) {
					// ZDSCAL(N-K, 1/BKK, A(K+1,K), 1)
					zdscal( N - k - 1, 1.0 / bkk, A, sa1, offsetA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ) );

					ct = new Complex128( -0.5 * akk, 0.0 );

					// ZAXPY(N-K, CT, B(K+1,K), 1, A(K+1,K), 1)
					zaxpy( N - k - 1, ct,
						B, sb1, offsetB + ( ( k + 1 ) * sb1 ) + ( k * sb2 ),
						A, sa1, offsetA + ( ( k + 1 ) * sa1 ) + ( k * sa2 )
					);

					// ZHER2(UPLO, N-K, -CONE, A(K+1,K), 1, B(K+1,K), 1, A(K+1,K+1), LDA)
					zher2( uplo, N - k - 1, NEGCONE,
						A, sa1, offsetA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ),
						B, sb1, offsetB + ( ( k + 1 ) * sb1 ) + ( k * sb2 ),
						A, sa1, sa2, offsetA + ( ( k + 1 ) * sa1 ) + ( ( k + 1 ) * sa2 )
					);

					// ZAXPY again
					zaxpy( N - k - 1, ct,
						B, sb1, offsetB + ( ( k + 1 ) * sb1 ) + ( k * sb2 ),
						A, sa1, offsetA + ( ( k + 1 ) * sa1 ) + ( k * sa2 )
					);

					// ZTRSV(UPLO, 'No transpose', 'Non-unit', N-K, B(K+1,K+1), LDB, A(K+1,K), 1)
					ztrsv( uplo, 'no-transpose', 'non-unit', N - k - 1,
						B, sb1, sb2, offsetB + ( ( k + 1 ) * sb1 ) + ( ( k + 1 ) * sb2 ),
						A, sa1, offsetA + ( ( k + 1 ) * sa1 ) + ( k * sa2 )
					);
				}
			}
		}
	} else {
		// itype = 2 or 3
		if ( upper ) {
			// Compute U*A*U^H
			for ( k = 0; k < N; k++ ) {
				akk = Av[ oA + ( k * da1 ) + ( k * da2 ) ];
				bkk = Bv[ oB + ( k * db1 ) + ( k * db2 ) ];

				// ZTRMV(UPLO, 'No transpose', 'Non-unit', K, B, LDB, A(1,K), 1)
				ztrmv( uplo, 'no-transpose', 'non-unit', k,
					B, sb1, sb2, offsetB,
					A, sa1, offsetA + ( k * sa2 )
				);

				ct = new Complex128( 0.5 * akk, 0.0 );

				// ZAXPY(K, CT, B(1,K), 1, A(1,K), 1)
				zaxpy( k, ct,
					B, sb1, offsetB + ( k * sb2 ),
					A, sa1, offsetA + ( k * sa2 )
				);

				// ZHER2(UPLO, K, CONE, A(1,K), 1, B(1,K), 1, A, LDA)
				zher2( uplo, k, CONE,
					A, sa1, offsetA + ( k * sa2 ),
					B, sb1, offsetB + ( k * sb2 ),
					A, sa1, sa2, offsetA
				);

				// ZAXPY(K, CT, B(1,K), 1, A(1,K), 1)
				zaxpy( k, ct,
					B, sb1, offsetB + ( k * sb2 ),
					A, sa1, offsetA + ( k * sa2 )
				);

				// ZDSCAL(K, BKK, A(1,K), 1)
				zdscal( k, bkk, A, sa1, offsetA + ( k * sa2 ) );

				// A(K,K) = AKK * BKK^2
				Av[ oA + ( k * da1 ) + ( k * da2 ) ] = akk * bkk * bkk;
				Av[ oA + ( k * da1 ) + ( k * da2 ) + 1 ] = 0.0;
			}
		} else {
			// Compute L^H*A*L
			for ( k = 0; k < N; k++ ) {
				akk = Av[ oA + ( k * da1 ) + ( k * da2 ) ];
				bkk = Bv[ oB + ( k * db1 ) + ( k * db2 ) ];

				// ZLACGV(K-1, A(K,1), LDA)
				zlacgv( k, A, sa2, offsetA + ( k * sa1 ) );

				// ZTRMV(UPLO, 'Conjugate transpose', 'Non-unit', K, B, LDB, A(K,1), LDA)
				ztrmv( uplo, 'conjugate-transpose', 'non-unit', k,
					B, sb1, sb2, offsetB,
					A, sa2, offsetA + ( k * sa1 )
				);

				ct = new Complex128( 0.5 * akk, 0.0 );

				// ZLACGV(K-1, B(K,1), LDB)
				zlacgv( k, B, sb2, offsetB + ( k * sb1 ) );

				// ZAXPY(K, CT, B(K,1), LDB, A(K,1), LDA)
				zaxpy( k, ct,
					B, sb2, offsetB + ( k * sb1 ),
					A, sa2, offsetA + ( k * sa1 )
				);

				// ZHER2(UPLO, K, CONE, A(K,1), LDA, B(K,1), LDB, A, LDA)
				zher2( uplo, k, CONE,
					A, sa2, offsetA + ( k * sa1 ),
					B, sb2, offsetB + ( k * sb1 ),
					A, sa1, sa2, offsetA
				);

				// ZAXPY(K, CT, B(K,1), LDB, A(K,1), LDA)
				zaxpy( k, ct,
					B, sb2, offsetB + ( k * sb1 ),
					A, sa2, offsetA + ( k * sa1 )
				);

				// ZLACGV(K-1, B(K,1), LDB)
				zlacgv( k, B, sb2, offsetB + ( k * sb1 ) );

				// ZDSCAL(K, BKK, A(K,1), LDA)
				zdscal( k, bkk, A, sa2, offsetA + ( k * sa1 ) );

				// ZLACGV(K-1, A(K,1), LDA)
				zlacgv( k, A, sa2, offsetA + ( k * sa1 ) );

				// A(K,K) = AKK * BKK^2
				Av[ oA + ( k * da1 ) + ( k * da2 ) ] = akk * bkk * bkk;
				Av[ oA + ( k * da1 ) + ( k * da2 ) + 1 ] = 0.0;
			}
		}
	}
	return 0;
}


// EXPORTS //

export default zhegs2;
