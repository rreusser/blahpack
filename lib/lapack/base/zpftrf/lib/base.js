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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zpotrf from '../../zpotrf/lib/base.js';
import zherk from '../../../../blas/base/zherk/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Computes the Cholesky factorization of a complex Hermitian positive definite.
* matrix stored in Rectangular Full Packed (RFP) format.
*
* The factorization has the form A = U^H \* U if uplo = 'upper', or
* A = L \* L^H if uplo = 'lower', where U is upper triangular and L is
* lower triangular.
*
* @private
* @param {string} transr - `'no-transpose'` or `'conjugate-transpose'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - RFP array of length N*(N+1)/2
* @param {integer} strideA - stride for `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @returns {integer} info - 0 if successful, k>0 if the leading minor of order k is not positive definite
*/
function zpftrf( transr, uplo, N, A, strideA, offsetA ) {
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
				// zpotrf( 'L', N1, A(0), N, INFO )
				info = zpotrf( 'lower', n1, A, sa, sa * N, offsetA );
				if ( info > 0 ) {
					return info;
				}
				// ztrsm( 'R', 'L', 'C', 'N', N2, N1, CONE, A(0), N, A(N1), N )
				ztrsm( 'right', 'lower', 'conjugate-transpose', 'non-unit', n2, n1, CONE, A, sa, sa * N, offsetA, A, sa, sa * N, offsetA + (sa * n1));

				// zherk( 'U', 'N', N2, N1, -ONE, A(N1), N, ONE, A(N), N )
				zherk( 'upper', 'no-transpose', n2, n1, -1.0, A, sa, sa * N, offsetA + (sa * n1), 1.0, A, sa, sa * N, offsetA + (sa * N));

				// zpotrf( 'U', N2, A(N), N, INFO )
				info = zpotrf( 'upper', n2, A, sa, sa * N, offsetA + (sa * N) );
				if ( info > 0 ) {
					return info + n1;
				}
			} else {
				// UPLO = 'U', N odd, TRANSR = 'N'
				// zpotrf( 'L', N1, A(N2), N, INFO )
				info = zpotrf( 'lower', n1, A, sa, sa * N, offsetA + (sa * n2) );
				if ( info > 0 ) {
					return info;
				}
				// ztrsm( 'L', 'L', 'N', 'N', N1, N2, CONE, A(N2), N, A(0), N )
				ztrsm( 'left', 'lower', 'no-transpose', 'non-unit', n1, n2, CONE, A, sa, sa * N, offsetA + (sa * n2), A, sa, sa * N, offsetA);

				// zherk( 'U', 'C', N2, N1, -ONE, A(0), N, ONE, A(N1), N )
				zherk( 'upper', 'conjugate-transpose', n2, n1, -1.0, A, sa, sa * N, offsetA, 1.0, A, sa, sa * N, offsetA + (sa * n1));

				// zpotrf( 'U', N2, A(N1), N, INFO )
				info = zpotrf( 'upper', n2, A, sa, sa * N, offsetA + (sa * n1) );
				if ( info > 0 ) {
					return info + n1;
				}
			}
		} else {
			// TRANSR = 'C', conjugate-transpose RFP, LDA = N1
			// strideA1 = sa (row), strideA2 = sa*N1 (column)
			if ( lower ) {
				// UPLO = 'L', N odd, TRANSR = 'C'
				// zpotrf( 'U', N1, A(0), N1, INFO )
				info = zpotrf( 'upper', n1, A, sa, sa * n1, offsetA );
				if ( info > 0 ) {
					return info;
				}
				// ztrsm( 'L', 'U', 'C', 'N', N1, N2, CONE, A(0), N1, A(N1*N1), N1 )
				ztrsm( 'left', 'upper', 'conjugate-transpose', 'non-unit', n1, n2, CONE, A, sa, sa * n1, offsetA, A, sa, sa * n1, offsetA + (sa * n1 * n1));

				// zherk( 'L', 'C', N2, N1, -ONE, A(N1*N1), N1, ONE, A(1), N1 )
				zherk( 'lower', 'conjugate-transpose', n2, n1, -1.0, A, sa, sa * n1, offsetA + (sa * n1 * n1), 1.0, A, sa, sa * n1, offsetA + sa);

				// zpotrf( 'L', N2, A(1), N1, INFO )
				info = zpotrf( 'lower', n2, A, sa, sa * n1, offsetA + sa );
				if ( info > 0 ) {
					return info + n1;
				}
			} else {
				// UPLO = 'U', N odd, TRANSR = 'C'
				// zpotrf( 'U', N1, A(N2*N2), N2, INFO )
				info = zpotrf( 'upper', n1, A, sa, sa * n2, offsetA + (sa * n2 * n2) );
				if ( info > 0 ) {
					return info;
				}
				// ztrsm( 'R', 'U', 'N', 'N', N2, N1, CONE, A(N2*N2), N2, A(0), N2 )
				ztrsm( 'right', 'upper', 'no-transpose', 'non-unit', n2, n1, CONE, A, sa, sa * n2, offsetA + (sa * n2 * n2), A, sa, sa * n2, offsetA);

				// zherk( 'L', 'N', N2, N1, -ONE, A(0), N2, ONE, A(N1*N2), N2 )
				zherk( 'lower', 'no-transpose', n2, n1, -1.0, A, sa, sa * n2, offsetA, 1.0, A, sa, sa * n2, offsetA + (sa * n1 * n2));

				// zpotrf( 'L', N2, A(N1*N2), N2, INFO )
				info = zpotrf( 'lower', n2, A, sa, sa * n2, offsetA + (sa * n1 * n2) );
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
				// zpotrf( 'L', K, A(1), N+1, INFO )
				info = zpotrf( 'lower', k, A, sa, sa * (N + 1), offsetA + sa );
				if ( info > 0 ) {
					return info;
				}
				// ztrsm( 'R', 'L', 'C', 'N', K, K, CONE, A(1), N+1, A(K+1), N+1 )
				ztrsm( 'right', 'lower', 'conjugate-transpose', 'non-unit', k, k, CONE, A, sa, sa * (N + 1), offsetA + sa, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)));

				// zherk( 'U', 'N', K, K, -ONE, A(K+1), N+1, ONE, A(0), N+1 )
				zherk( 'upper', 'no-transpose', k, k, -1.0, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)), 1.0, A, sa, sa * (N + 1), offsetA);

				// zpotrf( 'U', K, A(0), N+1, INFO )
				info = zpotrf( 'upper', k, A, sa, sa * (N + 1), offsetA );
				if ( info > 0 ) {
					return info + k;
				}
			} else {
				// UPLO = 'U', N even, TRANSR = 'N'
				// zpotrf( 'L', K, A(K+1), N+1, INFO )
				info = zpotrf( 'lower', k, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );
				if ( info > 0 ) {
					return info;
				}
				// ztrsm( 'L', 'L', 'N', 'N', K, K, CONE, A(K+1), N+1, A(0), N+1 )
				ztrsm( 'left', 'lower', 'no-transpose', 'non-unit', k, k, CONE, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)), A, sa, sa * (N + 1), offsetA);

				// zherk( 'U', 'C', K, K, -ONE, A(0), N+1, ONE, A(K), N+1 )
				zherk( 'upper', 'conjugate-transpose', k, k, -1.0, A, sa, sa * (N + 1), offsetA, 1.0, A, sa, sa * (N + 1), offsetA + (sa * k));

				// zpotrf( 'U', K, A(K), N+1, INFO )
				info = zpotrf( 'upper', k, A, sa, sa * (N + 1), offsetA + (sa * k) );
				if ( info > 0 ) {
					return info + k;
				}
			}
		} else {
			// TRANSR = 'C', conjugate-transpose RFP, LDA = K = N/2
			// strideA1 = sa (row), strideA2 = sa*K (column)
			if ( lower ) {
				// UPLO = 'L', N even, TRANSR = 'C'
				// zpotrf( 'U', K, A(0+K), K, INFO )
				info = zpotrf( 'upper', k, A, sa, sa * k, offsetA + (sa * k) );
				if ( info > 0 ) {
					return info;
				}
				// ztrsm( 'L', 'U', 'C', 'N', K, K, CONE, A(K), N1, A(K*(K+1)), K )
				ztrsm( 'left', 'upper', 'conjugate-transpose', 'non-unit', k, k, CONE, A, sa, sa * n1, offsetA + (sa * k), A, sa, sa * k, offsetA + (sa * k * (k + 1)));

				// zherk( 'L', 'C', K, K, -ONE, A(K*(K+1)), K, ONE, A(0), K )
				zherk( 'lower', 'conjugate-transpose', k, k, -1.0, A, sa, sa * k, offsetA + (sa * k * (k + 1)), 1.0, A, sa, sa * k, offsetA);

				// zpotrf( 'L', K, A(0), K, INFO )
				info = zpotrf( 'lower', k, A, sa, sa * k, offsetA );
				if ( info > 0 ) {
					return info + k;
				}
			} else {
				// UPLO = 'U', N even, TRANSR = 'C'
				// zpotrf( 'U', K, A(K*(K+1)), K, INFO )
				info = zpotrf( 'upper', k, A, sa, sa * k, offsetA + (sa * k * (k + 1)) );
				if ( info > 0 ) {
					return info;
				}
				// ztrsm( 'R', 'U', 'N', 'N', K, K, CONE, A(K*(K+1)), K, A(0), K )
				ztrsm( 'right', 'upper', 'no-transpose', 'non-unit', k, k, CONE, A, sa, sa * k, offsetA + (sa * k * (k + 1)), A, sa, sa * k, offsetA);

				// zherk( 'L', 'N', K, K, -ONE, A(0), K, ONE, A(K*K), K )
				zherk( 'lower', 'no-transpose', k, k, -1.0, A, sa, sa * k, offsetA, 1.0, A, sa, sa * k, offsetA + (sa * k * k));

				// zpotrf( 'L', K, A(K*K), K, INFO )
				info = zpotrf( 'lower', k, A, sa, sa * k, offsetA + (sa * k * k) );
				if ( info > 0 ) {
					return info + k;
				}
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zpftrf;
