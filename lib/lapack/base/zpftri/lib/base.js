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

/* eslint-disable max-len, max-lines-per-function, max-statements, no-lonely-if */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import ztftri from '../../ztftri/lib/base.js';
import zlauum from '../../zlauum/lib/base.js';
import zherk from '../../../../blas/base/zherk/lib/base.js';
import ztrmm from '../../../../blas/base/ztrmm/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Computes the inverse of a complex Hermitian positive definite matrix.
* stored in Rectangular Full Packed (RFP) format, using the Cholesky
* factorization computed by ZPFTRF.
*
* @private
* @param {string} transr - `'no-transpose'` or `'conjugate-transpose'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - RFP array of length N*(N+1)/2
* @param {integer} strideA - stride for `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @returns {integer} info - 0 if successful, k>0 if the (k,k) element of the factor is zero
*/
function zpftri( transr, uplo, N, A, strideA, offsetA ) {
	var normalTransr;
	var nisodd;
	var lower;
	var info;
	var sa;
	var n1;
	var n2;
	var k;

	normalTransr = ( transr === 'no-transpose' );
	lower = ( uplo === 'lower' );

	if ( N === 0 ) {
		return 0;
	}

	sa = strideA;

	// Invert the triangular Cholesky factor U or L
	info = ztftri( transr, uplo, 'non-unit', N, A, sa, offsetA );
	if ( info > 0 ) {
		return info;
	}

	// If N is odd, set NISODD = true; if N is even, set K = N/2
	if ( N % 2 === 0 ) {
		k = N / 2;
		nisodd = false;
	} else {
		nisodd = true;
	}

	// Set N1 and N2 depending on LOWER
	if ( lower ) {
		n2 = Math.floor( N / 2 );
		n1 = N - n2;
	} else {
		n1 = Math.floor( N / 2 );
		n2 = N - n1;
	}

	// Start execution: inv(U)*inv(U)^H or inv(L)^H*inv(L)
	if ( nisodd ) {
		// N is odd
		if ( normalTransr ) {
			// TRANSR = 'N', column-major RFP, LDA = N
			if ( lower ) {
				// SRPA for LOWER, NORMAL and N is odd
				// T1 -> a(0), T2 -> a(N), S -> a(N1)
				// ZLAUUM( 'L', N1, A(0), N, INFO )
				zlauum( 'lower', n1, A, sa, sa * N, offsetA );

				// ZHERK( 'L', 'C', N1, N2, ONE, A(N1), N, ONE, A(0), N )
				zherk( 'lower', 'conjugate-transpose', n1, n2, 1.0, A, sa, sa * N, offsetA + (sa * n1), 1.0, A, sa, sa * N, offsetA );

				// ZTRMM( 'L', 'U', 'N', 'N', N2, N1, CONE, A(N), N, A(N1), N )
				ztrmm( 'left', 'upper', 'no-transpose', 'non-unit', n2, n1, CONE, A, sa, sa * N, offsetA + (sa * N), A, sa, sa * N, offsetA + (sa * n1) );

				// ZLAUUM( 'U', N2, A(N), N, INFO )
				zlauum( 'upper', n2, A, sa, sa * N, offsetA + (sa * N) );
			} else {
				// SRPA for UPPER, NORMAL and N is odd
				// T1 -> a(N2), T2 -> a(N1), S -> a(0)
				// ZLAUUM( 'L', N1, A(N2), N, INFO )
				zlauum( 'lower', n1, A, sa, sa * N, offsetA + (sa * n2) );

				// ZHERK( 'L', 'N', N1, N2, ONE, A(0), N, ONE, A(N2), N )
				zherk( 'lower', 'no-transpose', n1, n2, 1.0, A, sa, sa * N, offsetA, 1.0, A, sa, sa * N, offsetA + (sa * n2) );

				// ZTRMM( 'R', 'U', 'C', 'N', N1, N2, CONE, A(N1), N, A(0), N )
				ztrmm( 'right', 'upper', 'conjugate-transpose', 'non-unit', n1, n2, CONE, A, sa, sa * N, offsetA + (sa * n1), A, sa, sa * N, offsetA );

				// ZLAUUM( 'U', N2, A(N1), N, INFO )
				zlauum( 'upper', n2, A, sa, sa * N, offsetA + (sa * n1) );
			}
		} else {
			// TRANSR = 'C', conjugate-transpose RFP, LDA = N1
			if ( lower ) {
				// SRPA for LOWER, TRANSPOSE and N is odd
				// T1 -> a(0), T2 -> a(1), S -> a(N1*N1)
				// ZLAUUM( 'U', N1, A(0), N1, INFO )
				zlauum( 'upper', n1, A, sa, sa * n1, offsetA );

				// ZHERK( 'U', 'N', N1, N2, ONE, A(N1*N1), N1, ONE, A(0), N1 )
				zherk( 'upper', 'no-transpose', n1, n2, 1.0, A, sa, sa * n1, offsetA + (sa * n1 * n1), 1.0, A, sa, sa * n1, offsetA );

				// ZTRMM( 'R', 'L', 'N', 'N', N1, N2, CONE, A(1), N1, A(N1*N1), N1 )
				ztrmm( 'right', 'lower', 'no-transpose', 'non-unit', n1, n2, CONE, A, sa, sa * n1, offsetA + sa, A, sa, sa * n1, offsetA + (sa * n1 * n1) );

				// ZLAUUM( 'L', N2, A(1), N1, INFO )
				zlauum( 'lower', n2, A, sa, sa * n1, offsetA + sa );
			} else {
				// SRPA for UPPER, TRANSPOSE and N is odd
				// T1 -> a(N2*N2), T2 -> a(N1*N2), S -> a(0)
				// ZLAUUM( 'U', N1, A(N2*N2), N2, INFO )
				zlauum( 'upper', n1, A, sa, sa * n2, offsetA + (sa * n2 * n2) );

				// ZHERK( 'U', 'C', N1, N2, ONE, A(0), N2, ONE, A(N2*N2), N2 )
				zherk( 'upper', 'conjugate-transpose', n1, n2, 1.0, A, sa, sa * n2, offsetA, 1.0, A, sa, sa * n2, offsetA + (sa * n2 * n2) );

				// ZTRMM( 'L', 'L', 'C', 'N', N2, N1, CONE, A(N1*N2), N2, A(0), N2 )
				ztrmm( 'left', 'lower', 'conjugate-transpose', 'non-unit', n2, n1, CONE, A, sa, sa * n2, offsetA + (sa * n1 * n2), A, sa, sa * n2, offsetA );

				// ZLAUUM( 'L', N2, A(N1*N2), N2, INFO )
				zlauum( 'lower', n2, A, sa, sa * n2, offsetA + (sa * n1 * n2) );
			}
		}
	} else {
		// N is even
		if ( normalTransr ) {
			// TRANSR = 'N', column-major RFP, LDA = N+1
			if ( lower ) {
				// SRPA for LOWER, NORMAL, and N is even
				// T1 -> a(1), T2 -> a(0), S -> a(K+1)
				// ZLAUUM( 'L', K, A(1), N+1, INFO )
				zlauum( 'lower', k, A, sa, sa * (N + 1), offsetA + sa );

				// ZHERK( 'L', 'C', K, K, ONE, A(K+1), N+1, ONE, A(1), N+1 )
				zherk( 'lower', 'conjugate-transpose', k, k, 1.0, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)), 1.0, A, sa, sa * (N + 1), offsetA + sa );

				// ZTRMM( 'L', 'U', 'N', 'N', K, K, CONE, A(0), N+1, A(K+1), N+1 )
				ztrmm( 'left', 'upper', 'no-transpose', 'non-unit', k, k, CONE, A, sa, sa * (N + 1), offsetA, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );

				// ZLAUUM( 'U', K, A(0), N+1, INFO )
				zlauum( 'upper', k, A, sa, sa * (N + 1), offsetA );
			} else {
				// SRPA for UPPER, NORMAL, and N is even
				// T1 -> a(K+1), T2 -> a(K), S -> a(0)
				// ZLAUUM( 'L', K, A(K+1), N+1, INFO )
				zlauum( 'lower', k, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );

				// ZHERK( 'L', 'N', K, K, ONE, A(0), N+1, ONE, A(K+1), N+1 )
				zherk( 'lower', 'no-transpose', k, k, 1.0, A, sa, sa * (N + 1), offsetA, 1.0, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );

				// ZTRMM( 'R', 'U', 'C', 'N', K, K, CONE, A(K), N+1, A(0), N+1 )
				ztrmm( 'right', 'upper', 'conjugate-transpose', 'non-unit', k, k, CONE, A, sa, sa * (N + 1), offsetA + (sa * k), A, sa, sa * (N + 1), offsetA );

				// ZLAUUM( 'U', K, A(K), N+1, INFO )
				zlauum( 'upper', k, A, sa, sa * (N + 1), offsetA + (sa * k) );
			}
		} else {
			// TRANSR = 'C', conjugate-transpose RFP, LDA = K = N/2
			if ( lower ) {
				// SRPA for LOWER, TRANSPOSE, and N is even
				// T1 -> a(K), T2 -> a(0), S -> a(K*(K+1))
				// ZLAUUM( 'U', K, A(K), K, INFO )
				zlauum( 'upper', k, A, sa, sa * k, offsetA + (sa * k) );

				// ZHERK( 'U', 'N', K, K, ONE, A(K*(K+1)), K, ONE, A(K), K )
				zherk( 'upper', 'no-transpose', k, k, 1.0, A, sa, sa * k, offsetA + (sa * k * (k + 1)), 1.0, A, sa, sa * k, offsetA + (sa * k) );

				// ZTRMM( 'R', 'L', 'N', 'N', K, K, CONE, A(0), K, A(K*(K+1)), K )
				ztrmm( 'right', 'lower', 'no-transpose', 'non-unit', k, k, CONE, A, sa, sa * k, offsetA, A, sa, sa * k, offsetA + (sa * k * (k + 1)) );

				// ZLAUUM( 'L', K, A(0), K, INFO )
				zlauum( 'lower', k, A, sa, sa * k, offsetA );
			} else {
				// SRPA for UPPER, TRANSPOSE, and N is even
				// T1 -> a(K*(K+1)), T2 -> a(K*K), S -> a(0)
				// ZLAUUM( 'U', K, A(K*(K+1)), K, INFO )
				zlauum( 'upper', k, A, sa, sa * k, offsetA + (sa * k * (k + 1)) );

				// ZHERK( 'U', 'C', K, K, ONE, A(0), K, ONE, A(K*(K+1)), K )
				zherk( 'upper', 'conjugate-transpose', k, k, 1.0, A, sa, sa * k, offsetA, 1.0, A, sa, sa * k, offsetA + (sa * k * (k + 1)) );

				// ZTRMM( 'L', 'L', 'C', 'N', K, K, CONE, A(K*K), K, A(0), K )
				ztrmm( 'left', 'lower', 'conjugate-transpose', 'non-unit', k, k, CONE, A, sa, sa * k, offsetA + (sa * k * k), A, sa, sa * k, offsetA );

				// ZLAUUM( 'L', K, A(K*K), K, INFO )
				zlauum( 'lower', k, A, sa, sa * k, offsetA + (sa * k * k) );
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zpftri;
