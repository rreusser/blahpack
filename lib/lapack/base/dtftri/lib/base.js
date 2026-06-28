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

import dtrtri from '../../dtrtri/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';


// MAIN //

/**
* Computes the inverse of a real triangular matrix stored in Rectangular Full Packed (RFP) format.
*
* This is a Level 3 BLAS version of the algorithm.
*
* @private
* @param {string} transr - `'no-transpose'` or `'transpose'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - RFP array of length N*(N+1)/2
* @param {integer} strideA - stride for `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @returns {integer} info - 0 if successful, k>0 if A(k,k) is exactly zero (singular)
*/
function dtftri( transr, uplo, diag, N, A, strideA, offsetA ) {
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

	if ( N % 2 === 0 ) {
		k = N / 2;
		nisodd = false;
	} else {
		nisodd = true;
	}

	if ( lower ) {
		n2 = Math.floor( N / 2 );
		n1 = N - n2;
	} else {
		n1 = Math.floor( N / 2 );
		n2 = N - n1;
	}

	if ( nisodd ) {
		// N is odd
		if ( normalTransr ) {
			// TRANSR = 'N', column-major RFP, LDA = N
			if ( lower ) {
				// UPLO = 'L', N odd, TRANSR = 'N'
				// T1 -> a(0), T2 -> a(N), S -> a(N1)

				// dtrtri( 'L', diag, N1, A(0), N ) => LDA=N => sa1=sa, sa2=sa*N
				info = dtrtri( 'lower', diag, n1, A, sa, sa * N, offsetA );
				if ( info > 0 ) {
					return info;
				}
				// dtrmm( 'R', 'L', 'N', diag, N2, N1, -1, A(0), N, A(N1), N )
				dtrmm( 'right', 'lower', 'no-transpose', diag, n2, n1, -1.0, A, sa, sa * N, offsetA, A, sa, sa * N, offsetA + (sa * n1) );

				// dtrtri( 'U', diag, N2, A(N), N )
				info = dtrtri( 'upper', diag, n2, A, sa, sa * N, offsetA + (sa * N) );
				if ( info > 0 ) {
					return info + n1;
				}
				// dtrmm( 'L', 'U', 'T', diag, N2, N1, 1, A(N), N, A(N1), N )
				dtrmm( 'left', 'upper', 'transpose', diag, n2, n1, 1.0, A, sa, sa * N, offsetA + (sa * N), A, sa, sa * N, offsetA + (sa * n1) );
			} else {
				// UPLO = 'U', N odd, TRANSR = 'N'
				// T1 -> a(N2), T2 -> a(N1), S -> a(0)

				// dtrtri( 'L', diag, N1, A(N2), N )
				info = dtrtri( 'lower', diag, n1, A, sa, sa * N, offsetA + (sa * n2) );
				if ( info > 0 ) {
					return info;
				}
				// dtrmm( 'L', 'L', 'T', diag, N1, N2, -1, A(N2), N, A(0), N )
				dtrmm( 'left', 'lower', 'transpose', diag, n1, n2, -1.0, A, sa, sa * N, offsetA + (sa * n2), A, sa, sa * N, offsetA );

				// dtrtri( 'U', diag, N2, A(N1), N )
				info = dtrtri( 'upper', diag, n2, A, sa, sa * N, offsetA + (sa * n1) );
				if ( info > 0 ) {
					return info + n1;
				}
				// dtrmm( 'R', 'U', 'N', diag, N1, N2, 1, A(N1), N, A(0), N )
				dtrmm( 'right', 'upper', 'no-transpose', diag, n1, n2, 1.0, A, sa, sa * N, offsetA + (sa * n1), A, sa, sa * N, offsetA );
			}
		} else {
			// TRANSR = 'T', transpose RFP, LDA = N1
			if ( lower ) {
				// UPLO = 'L', N odd, TRANSR = 'T'
				// T1 -> a(0), T2 -> a(1), S -> a(N1*N1)

				// dtrtri( 'U', diag, N1, A(0), N1 )
				info = dtrtri( 'upper', diag, n1, A, sa, sa * n1, offsetA );
				if ( info > 0 ) {
					return info;
				}
				// dtrmm( 'L', 'U', 'N', diag, N1, N2, -1, A(0), N1, A(N1*N1), N1 )
				dtrmm( 'left', 'upper', 'no-transpose', diag, n1, n2, -1.0, A, sa, sa * n1, offsetA, A, sa, sa * n1, offsetA + (sa * n1 * n1) );

				// dtrtri( 'L', diag, N2, A(1), N1 )
				info = dtrtri( 'lower', diag, n2, A, sa, sa * n1, offsetA + sa );
				if ( info > 0 ) {
					return info + n1;
				}
				// dtrmm( 'R', 'L', 'T', diag, N1, N2, 1, A(1), N1, A(N1*N1), N1 )
				dtrmm( 'right', 'lower', 'transpose', diag, n1, n2, 1.0, A, sa, sa * n1, offsetA + sa, A, sa, sa * n1, offsetA + (sa * n1 * n1) );
			} else {
				// UPLO = 'U', N odd, TRANSR = 'T'
				// T1 -> a(N2*N2), T2 -> a(N1*N2), S -> a(0)

				// dtrtri( 'U', diag, N1, A(N2*N2), N2 )
				info = dtrtri( 'upper', diag, n1, A, sa, sa * n2, offsetA + (sa * n2 * n2) );
				if ( info > 0 ) {
					return info;
				}
				// dtrmm( 'R', 'U', 'T', diag, N2, N1, -1, A(N2*N2), N2, A(0), N2 )
				dtrmm( 'right', 'upper', 'transpose', diag, n2, n1, -1.0, A, sa, sa * n2, offsetA + (sa * n2 * n2), A, sa, sa * n2, offsetA );

				// dtrtri( 'L', diag, N2, A(N1*N2), N2 )
				info = dtrtri( 'lower', diag, n2, A, sa, sa * n2, offsetA + (sa * n1 * n2) );
				if ( info > 0 ) {
					return info + n1;
				}
				// dtrmm( 'L', 'L', 'N', diag, N2, N1, 1, A(N1*N2), N2, A(0), N2 )
				dtrmm( 'left', 'lower', 'no-transpose', diag, n2, n1, 1.0, A, sa, sa * n2, offsetA + (sa * n1 * n2), A, sa, sa * n2, offsetA );
			}
		}
	} else {
		// N is even
		if ( normalTransr ) {
			// TRANSR = 'N', column-major RFP, LDA = N+1
			if ( lower ) {
				// UPLO = 'L', N even, TRANSR = 'N'
				// T1 -> a(1), T2 -> a(0), S -> a(K+1)

				// dtrtri( 'L', diag, K, A(1), N+1 )
				info = dtrtri( 'lower', diag, k, A, sa, sa * (N + 1), offsetA + sa );
				if ( info > 0 ) {
					return info;
				}
				// dtrmm( 'R', 'L', 'N', diag, K, K, -1, A(1), N+1, A(K+1), N+1 )
				dtrmm( 'right', 'lower', 'no-transpose', diag, k, k, -1.0, A, sa, sa * (N + 1), offsetA + sa, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );

				// dtrtri( 'U', diag, K, A(0), N+1 )
				info = dtrtri( 'upper', diag, k, A, sa, sa * (N + 1), offsetA );
				if ( info > 0 ) {
					return info + k;
				}
				// dtrmm( 'L', 'U', 'T', diag, K, K, 1, A(0), N+1, A(K+1), N+1 )
				dtrmm( 'left', 'upper', 'transpose', diag, k, k, 1.0, A, sa, sa * (N + 1), offsetA, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );
			} else {
				// UPLO = 'U', N even, TRANSR = 'N'
				// T1 -> a(K+1), T2 -> a(K), S -> a(0)

				// dtrtri( 'L', diag, K, A(K+1), N+1 )
				info = dtrtri( 'lower', diag, k, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );
				if ( info > 0 ) {
					return info;
				}
				// dtrmm( 'L', 'L', 'T', diag, K, K, -1, A(K+1), N+1, A(0), N+1 )
				dtrmm( 'left', 'lower', 'transpose', diag, k, k, -1.0, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)), A, sa, sa * (N + 1), offsetA );

				// dtrtri( 'U', diag, K, A(K), N+1 )
				info = dtrtri( 'upper', diag, k, A, sa, sa * (N + 1), offsetA + (sa * k) );
				if ( info > 0 ) {
					return info + k;
				}
				// dtrmm( 'R', 'U', 'N', diag, K, K, 1, A(K), N+1, A(0), N+1 )
				dtrmm( 'right', 'upper', 'no-transpose', diag, k, k, 1.0, A, sa, sa * (N + 1), offsetA + (sa * k), A, sa, sa * (N + 1), offsetA );
			}
		} else {
			// TRANSR = 'T', transpose RFP, LDA = K = N/2
			if ( lower ) {
				// UPLO = 'L', N even, TRANSR = 'T'
				// T1 -> a(K), T2 -> a(0), S -> a(K*(K+1))

				// dtrtri( 'U', diag, K, A(K), K )
				info = dtrtri( 'upper', diag, k, A, sa, sa * k, offsetA + (sa * k) );
				if ( info > 0 ) {
					return info;
				}
				// dtrmm( 'L', 'U', 'N', diag, K, K, -1, A(K), K, A(K*(K+1)), K )
				dtrmm( 'left', 'upper', 'no-transpose', diag, k, k, -1.0, A, sa, sa * k, offsetA + (sa * k), A, sa, sa * k, offsetA + (sa * k * (k + 1)) );

				// dtrtri( 'L', diag, K, A(0), K )
				info = dtrtri( 'lower', diag, k, A, sa, sa * k, offsetA );
				if ( info > 0 ) {
					return info + k;
				}
				// dtrmm( 'R', 'L', 'T', diag, K, K, 1, A(0), K, A(K*(K+1)), K )
				dtrmm( 'right', 'lower', 'transpose', diag, k, k, 1.0, A, sa, sa * k, offsetA, A, sa, sa * k, offsetA + (sa * k * (k + 1)) );
			} else {
				// UPLO = 'U', N even, TRANSR = 'T'
				// T1 -> a(K*(K+1)), T2 -> a(K*K), S -> a(0)

				// dtrtri( 'U', diag, K, A(K*(K+1)), K )
				info = dtrtri( 'upper', diag, k, A, sa, sa * k, offsetA + (sa * k * (k + 1)) );
				if ( info > 0 ) {
					return info;
				}
				// dtrmm( 'R', 'U', 'T', diag, K, K, -1, A(K*(K+1)), K, A(0), K )
				dtrmm( 'right', 'upper', 'transpose', diag, k, k, -1.0, A, sa, sa * k, offsetA + (sa * k * (k + 1)), A, sa, sa * k, offsetA );

				// dtrtri( 'L', diag, K, A(K*K), K )
				info = dtrtri( 'lower', diag, k, A, sa, sa * k, offsetA + (sa * k * k) );
				if ( info > 0 ) {
					return info + k;
				}
				// dtrmm( 'L', 'L', 'N', diag, K, K, 1, A(K*K), K, A(0), K )
				dtrmm( 'left', 'lower', 'no-transpose', diag, k, k, 1.0, A, sa, sa * k, offsetA + (sa * k * k), A, sa, sa * k, offsetA );
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dtftri;
