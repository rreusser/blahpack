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

/* eslint-disable max-len, max-lines-per-function, max-statements, no-lonely-if */

// MODULES //

import dpotrf from '../../dpotrf/lib/base.js';
import dsyrk from '../../../../blas/base/dsyrk/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';


// MAIN //

/**
* Computes the Cholesky factorization of a real symmetric positive definite.
* matrix stored in Rectangular Full Packed (RFP) format.
*
* The factorization has the form A = U^T \* U if uplo = 'upper', or
* A = L \* L^T if uplo = 'lower', where U is upper triangular and L is
* lower triangular.
*
* @private
* @param {string} transr - `'no-transpose'` or `'transpose'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - RFP array of length N*(N+1)/2
* @param {integer} strideA - stride for `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @returns {integer} info - 0 if successful, k>0 if the leading minor of order k is not positive definite
*/
function dpftrf( transr, uplo, N, A, strideA, offsetA ) {
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
			// strideA1 = sa (row), strideA2 = sa*N (column)
			if ( lower ) {
				// UPLO = 'L', N odd, TRANSR = 'N'
				// dpotrf( 'L', N1, A(0), N )
				info = dpotrf( 'lower', n1, A, sa, sa * N, offsetA );
				if ( info > 0 ) {
					return info;
				}
				// dtrsm( 'R', 'L', 'T', 'N', N2, N1, 1, A(0), N, A(N1), N )
				dtrsm( 'right', 'lower', 'transpose', 'non-unit', n2, n1, 1.0, A, sa, sa * N, offsetA, A, sa, sa * N, offsetA + (sa * n1) );

				// dsyrk( 'U', 'N', N2, N1, -1, A(N1), N, 1, A(N), N )
				dsyrk( 'upper', 'no-transpose', n2, n1, -1.0, A, sa, sa * N, offsetA + (sa * n1), 1.0, A, sa, sa * N, offsetA + (sa * N) );

				// dpotrf( 'U', N2, A(N), N )
				info = dpotrf( 'upper', n2, A, sa, sa * N, offsetA + (sa * N) );
				if ( info > 0 ) {
					return info + n1;
				}
			} else {
				// UPLO = 'U', N odd, TRANSR = 'N'
				// dpotrf( 'L', N1, A(N2), N )
				info = dpotrf( 'lower', n1, A, sa, sa * N, offsetA + (sa * n2) );
				if ( info > 0 ) {
					return info;
				}
				// dtrsm( 'L', 'L', 'N', 'N', N1, N2, 1, A(N2), N, A(0), N )
				dtrsm( 'left', 'lower', 'no-transpose', 'non-unit', n1, n2, 1.0, A, sa, sa * N, offsetA + (sa * n2), A, sa, sa * N, offsetA );

				// dsyrk( 'U', 'T', N2, N1, -1, A(0), N, 1, A(N1), N )
				dsyrk( 'upper', 'transpose', n2, n1, -1.0, A, sa, sa * N, offsetA, 1.0, A, sa, sa * N, offsetA + (sa * n1) );

				// dpotrf( 'U', N2, A(N1), N )
				info = dpotrf( 'upper', n2, A, sa, sa * N, offsetA + (sa * n1) );
				if ( info > 0 ) {
					return info + n1;
				}
			}
		} else {
			// TRANSR = 'T', transpose RFP, LDA = N1
			// strideA1 = sa (row), strideA2 = sa*N1 (column)
			if ( lower ) {
				// UPLO = 'L', N odd, TRANSR = 'T'
				// dpotrf( 'U', N1, A(0), N1 )
				info = dpotrf( 'upper', n1, A, sa, sa * n1, offsetA );
				if ( info > 0 ) {
					return info;
				}
				// dtrsm( 'L', 'U', 'T', 'N', N1, N2, 1, A(0), N1, A(N1*N1), N1 )
				dtrsm( 'left', 'upper', 'transpose', 'non-unit', n1, n2, 1.0, A, sa, sa * n1, offsetA, A, sa, sa * n1, offsetA + (sa * n1 * n1) );

				// dsyrk( 'L', 'T', N2, N1, -1, A(N1*N1), N1, 1, A(1), N1 )
				dsyrk( 'lower', 'transpose', n2, n1, -1.0, A, sa, sa * n1, offsetA + (sa * n1 * n1), 1.0, A, sa, sa * n1, offsetA + sa );

				// dpotrf( 'L', N2, A(1), N1 )
				info = dpotrf( 'lower', n2, A, sa, sa * n1, offsetA + sa );
				if ( info > 0 ) {
					return info + n1;
				}
			} else {
				// UPLO = 'U', N odd, TRANSR = 'T'
				// dpotrf( 'U', N1, A(N2*N2), N2 )
				info = dpotrf( 'upper', n1, A, sa, sa * n2, offsetA + (sa * n2 * n2) );
				if ( info > 0 ) {
					return info;
				}
				// dtrsm( 'R', 'U', 'N', 'N', N2, N1, 1, A(N2*N2), N2, A(0), N2 )
				dtrsm( 'right', 'upper', 'no-transpose', 'non-unit', n2, n1, 1.0, A, sa, sa * n2, offsetA + (sa * n2 * n2), A, sa, sa * n2, offsetA );

				// dsyrk( 'L', 'N', N2, N1, -1, A(0), N2, 1, A(N1*N2), N2 )
				dsyrk( 'lower', 'no-transpose', n2, n1, -1.0, A, sa, sa * n2, offsetA, 1.0, A, sa, sa * n2, offsetA + (sa * n1 * n2) );

				// dpotrf( 'L', N2, A(N1*N2), N2 )
				info = dpotrf( 'lower', n2, A, sa, sa * n2, offsetA + (sa * n1 * n2) );
				if ( info > 0 ) {
					return info + n1;
				}
			}
		}
	} else {
		// N is even
		if ( normalTransr ) {
			// TRANSR = 'N', column-major RFP, LDA = N+1
			// strideA1 = sa (row), strideA2 = sa*(N+1) (column)
			if ( lower ) {
				// UPLO = 'L', N even, TRANSR = 'N'
				// dpotrf( 'L', K, A(1), N+1 )
				info = dpotrf( 'lower', k, A, sa, sa * (N + 1), offsetA + sa );
				if ( info > 0 ) {
					return info;
				}
				// dtrsm( 'R', 'L', 'T', 'N', K, K, 1, A(1), N+1, A(K+1), N+1 )
				dtrsm( 'right', 'lower', 'transpose', 'non-unit', k, k, 1.0, A, sa, sa * (N + 1), offsetA + sa, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );

				// dsyrk( 'U', 'N', K, K, -1, A(K+1), N+1, 1, A(0), N+1 )
				dsyrk( 'upper', 'no-transpose', k, k, -1.0, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)), 1.0, A, sa, sa * (N + 1), offsetA );

				// dpotrf( 'U', K, A(0), N+1 )
				info = dpotrf( 'upper', k, A, sa, sa * (N + 1), offsetA );
				if ( info > 0 ) {
					return info + k;
				}
			} else {
				// UPLO = 'U', N even, TRANSR = 'N'
				// dpotrf( 'L', K, A(K+1), N+1 )
				info = dpotrf( 'lower', k, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );
				if ( info > 0 ) {
					return info;
				}
				// dtrsm( 'L', 'L', 'N', 'N', K, K, 1, A(K+1), N+1, A(0), N+1 )
				dtrsm( 'left', 'lower', 'no-transpose', 'non-unit', k, k, 1.0, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)), A, sa, sa * (N + 1), offsetA );

				// dsyrk( 'U', 'T', K, K, -1, A(0), N+1, 1, A(K), N+1 )
				dsyrk( 'upper', 'transpose', k, k, -1.0, A, sa, sa * (N + 1), offsetA, 1.0, A, sa, sa * (N + 1), offsetA + (sa * k) );

				// dpotrf( 'U', K, A(K), N+1 )
				info = dpotrf( 'upper', k, A, sa, sa * (N + 1), offsetA + (sa * k) );
				if ( info > 0 ) {
					return info + k;
				}
			}
		} else {
			// TRANSR = 'T', transpose RFP, LDA = K = N/2
			// strideA1 = sa (row), strideA2 = sa*K (column)
			if ( lower ) {
				// UPLO = 'L', N even, TRANSR = 'T'
				// dpotrf( 'U', K, A(0+K), K )
				info = dpotrf( 'upper', k, A, sa, sa * k, offsetA + (sa * k) );
				if ( info > 0 ) {
					return info;
				}
				// dtrsm( 'L', 'U', 'T', 'N', K, K, 1, A(K), N1, A(K*(K+1)), K )
				dtrsm( 'left', 'upper', 'transpose', 'non-unit', k, k, 1.0, A, sa, sa * n1, offsetA + (sa * k), A, sa, sa * k, offsetA + (sa * k * (k + 1)) );

				// dsyrk( 'L', 'T', K, K, -1, A(K*(K+1)), K, 1, A(0), K )
				dsyrk( 'lower', 'transpose', k, k, -1.0, A, sa, sa * k, offsetA + (sa * k * (k + 1)), 1.0, A, sa, sa * k, offsetA );

				// dpotrf( 'L', K, A(0), K )
				info = dpotrf( 'lower', k, A, sa, sa * k, offsetA );
				if ( info > 0 ) {
					return info + k;
				}
			} else {
				// UPLO = 'U', N even, TRANSR = 'T'
				// dpotrf( 'U', K, A(K*(K+1)), K )
				info = dpotrf( 'upper', k, A, sa, sa * k, offsetA + (sa * k * (k + 1)) );
				if ( info > 0 ) {
					return info;
				}
				// dtrsm( 'R', 'U', 'N', 'N', K, K, 1, A(K*(K+1)), K, A(0), K )
				dtrsm( 'right', 'upper', 'no-transpose', 'non-unit', k, k, 1.0, A, sa, sa * k, offsetA + (sa * k * (k + 1)), A, sa, sa * k, offsetA );

				// dsyrk( 'L', 'N', K, K, -1, A(0), K, 1, A(K*K), K )
				dsyrk( 'lower', 'no-transpose', k, k, -1.0, A, sa, sa * k, offsetA, 1.0, A, sa, sa * k, offsetA + (sa * k * k) );

				// dpotrf( 'L', K, A(K*K), K )
				info = dpotrf( 'lower', k, A, sa, sa * k, offsetA + (sa * k * k) );
				if ( info > 0 ) {
					return info + k;
				}
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dpftrf;
