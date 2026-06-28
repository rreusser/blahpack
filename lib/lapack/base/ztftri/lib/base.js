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
import ztrtri from '../../ztrtri/lib/base.js';
import ztrmm from '../../../../blas/base/ztrmm/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CNEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes the inverse of a complex triangular matrix stored in Rectangular Full Packed (RFP) format.
*
* @private
* @param {string} transr - `'no-transpose'` or `'conjugate-transpose'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - RFP array of length N*(N+1)/2
* @param {integer} strideA - stride for `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @returns {integer} info - 0 if successful, k>0 if A(k,k) is zero (singular)
*/
function ztftri( transr, uplo, diag, N, A, strideA, offsetA ) {
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
				// SRPA for LOWER, NORMAL and N is odd
				// T1 -> a(0), T2 -> a(N), S -> a(N1)
				// ZTRTRI( 'L', DIAG, N1, A(0), N, INFO )
				info = ztrtri( 'lower', diag, n1, A, sa, sa * N, offsetA );
				if ( info > 0 ) {
					return info;
				}
				// ZTRMM( 'R', 'L', 'N', DIAG, N2, N1, -CONE, A(0), N, A(N1), N )
				ztrmm( 'right', 'lower', 'no-transpose', diag, n2, n1, CNEGONE, A, sa, sa * N, offsetA, A, sa, sa * N, offsetA + (sa * n1) );

				// ZTRTRI( 'U', DIAG, N2, A(N), N, INFO )
				info = ztrtri( 'upper', diag, n2, A, sa, sa * N, offsetA + (sa * N) );
				if ( info > 0 ) {
					return info + n1;
				}
				// ZTRMM( 'L', 'U', 'C', DIAG, N2, N1, CONE, A(N), N, A(N1), N )
				ztrmm( 'left', 'upper', 'conjugate-transpose', diag, n2, n1, CONE, A, sa, sa * N, offsetA + (sa * N), A, sa, sa * N, offsetA + (sa * n1) );
			} else {
				// SRPA for UPPER, NORMAL and N is odd
				// T1 -> a(N2), T2 -> a(N1), S -> a(0)
				// ZTRTRI( 'L', DIAG, N1, A(N2), N, INFO )
				info = ztrtri( 'lower', diag, n1, A, sa, sa * N, offsetA + (sa * n2) );
				if ( info > 0 ) {
					return info;
				}
				// ZTRMM( 'L', 'L', 'C', DIAG, N1, N2, -CONE, A(N2), N, A(0), N )
				ztrmm( 'left', 'lower', 'conjugate-transpose', diag, n1, n2, CNEGONE, A, sa, sa * N, offsetA + (sa * n2), A, sa, sa * N, offsetA );

				// ZTRTRI( 'U', DIAG, N2, A(N1), N, INFO )
				info = ztrtri( 'upper', diag, n2, A, sa, sa * N, offsetA + (sa * n1) );
				if ( info > 0 ) {
					return info + n1;
				}
				// ZTRMM( 'R', 'U', 'N', DIAG, N1, N2, CONE, A(N1), N, A(0), N )
				ztrmm( 'right', 'upper', 'no-transpose', diag, n1, n2, CONE, A, sa, sa * N, offsetA + (sa * n1), A, sa, sa * N, offsetA );
			}
		} else {
			// TRANSR = 'C', conjugate-transpose RFP, LDA = N1
			if ( lower ) {
				// SRPA for LOWER, TRANSPOSE and N is odd
				// T1 -> a(0), T2 -> a(1), S -> a(N1*N1)
				// ZTRTRI( 'U', DIAG, N1, A(0), N1, INFO )
				info = ztrtri( 'upper', diag, n1, A, sa, sa * n1, offsetA );
				if ( info > 0 ) {
					return info;
				}
				// ZTRMM( 'L', 'U', 'N', DIAG, N1, N2, -CONE, A(0), N1, A(N1*N1), N1 )
				ztrmm( 'left', 'upper', 'no-transpose', diag, n1, n2, CNEGONE, A, sa, sa * n1, offsetA, A, sa, sa * n1, offsetA + (sa * n1 * n1) );

				// ZTRTRI( 'L', DIAG, N2, A(1), N1, INFO )
				info = ztrtri( 'lower', diag, n2, A, sa, sa * n1, offsetA + sa );
				if ( info > 0 ) {
					return info + n1;
				}
				// ZTRMM( 'R', 'L', 'C', DIAG, N1, N2, CONE, A(1), N1, A(N1*N1), N1 )
				ztrmm( 'right', 'lower', 'conjugate-transpose', diag, n1, n2, CONE, A, sa, sa * n1, offsetA + sa, A, sa, sa * n1, offsetA + (sa * n1 * n1) );
			} else {
				// SRPA for UPPER, TRANSPOSE and N is odd
				// T1 -> a(N2*N2), T2 -> a(N1*N2), S -> a(0)
				// ZTRTRI( 'U', DIAG, N1, A(N2*N2), N2, INFO )
				info = ztrtri( 'upper', diag, n1, A, sa, sa * n2, offsetA + (sa * n2 * n2) );
				if ( info > 0 ) {
					return info;
				}
				// ZTRMM( 'R', 'U', 'C', DIAG, N2, N1, -CONE, A(N2*N2), N2, A(0), N2 )
				ztrmm( 'right', 'upper', 'conjugate-transpose', diag, n2, n1, CNEGONE, A, sa, sa * n2, offsetA + (sa * n2 * n2), A, sa, sa * n2, offsetA );

				// ZTRTRI( 'L', DIAG, N2, A(N1*N2), N2, INFO )
				info = ztrtri( 'lower', diag, n2, A, sa, sa * n2, offsetA + (sa * n1 * n2) );
				if ( info > 0 ) {
					return info + n1;
				}
				// ZTRMM( 'L', 'L', 'N', DIAG, N2, N1, CONE, A(N1*N2), N2, A(0), N2 )
				ztrmm( 'left', 'lower', 'no-transpose', diag, n2, n1, CONE, A, sa, sa * n2, offsetA + (sa * n1 * n2), A, sa, sa * n2, offsetA );
			}
		}
	} else {
		// N is even
		if ( normalTransr ) {
			// TRANSR = 'N', column-major RFP, LDA = N+1
			if ( lower ) {
				// SRPA for LOWER, NORMAL, and N is even
				// T1 -> a(1), T2 -> a(0), S -> a(K+1)
				// ZTRTRI( 'L', DIAG, K, A(1), N+1, INFO )
				info = ztrtri( 'lower', diag, k, A, sa, sa * (N + 1), offsetA + sa );
				if ( info > 0 ) {
					return info;
				}
				// ZTRMM( 'R', 'L', 'N', DIAG, K, K, -CONE, A(1), N+1, A(K+1), N+1 )
				ztrmm( 'right', 'lower', 'no-transpose', diag, k, k, CNEGONE, A, sa, sa * (N + 1), offsetA + sa, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );

				// ZTRTRI( 'U', DIAG, K, A(0), N+1, INFO )
				info = ztrtri( 'upper', diag, k, A, sa, sa * (N + 1), offsetA );
				if ( info > 0 ) {
					return info + k;
				}
				// ZTRMM( 'L', 'U', 'C', DIAG, K, K, CONE, A(0), N+1, A(K+1), N+1 )
				ztrmm( 'left', 'upper', 'conjugate-transpose', diag, k, k, CONE, A, sa, sa * (N + 1), offsetA, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );
			} else {
				// SRPA for UPPER, NORMAL, and N is even
				// T1 -> a(K+1), T2 -> a(K), S -> a(0)
				// ZTRTRI( 'L', DIAG, K, A(K+1), N+1, INFO )
				info = ztrtri( 'lower', diag, k, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );
				if ( info > 0 ) {
					return info;
				}
				// ZTRMM( 'L', 'L', 'C', DIAG, K, K, -CONE, A(K+1), N+1, A(0), N+1 )
				ztrmm( 'left', 'lower', 'conjugate-transpose', diag, k, k, CNEGONE, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)), A, sa, sa * (N + 1), offsetA );

				// ZTRTRI( 'U', DIAG, K, A(K), N+1, INFO )
				info = ztrtri( 'upper', diag, k, A, sa, sa * (N + 1), offsetA + (sa * k) );
				if ( info > 0 ) {
					return info + k;
				}
				// ZTRMM( 'R', 'U', 'N', DIAG, K, K, CONE, A(K), N+1, A(0), N+1 )
				ztrmm( 'right', 'upper', 'no-transpose', diag, k, k, CONE, A, sa, sa * (N + 1), offsetA + (sa * k), A, sa, sa * (N + 1), offsetA );
			}
		} else {
			// TRANSR = 'C', conjugate-transpose RFP, LDA = K = N/2
			if ( lower ) {
				// SRPA for LOWER, TRANSPOSE and N is even
				// T1 -> a(K), T2 -> a(0), S -> a(K*(K+1))
				// ZTRTRI( 'U', DIAG, K, A(K), K, INFO )
				info = ztrtri( 'upper', diag, k, A, sa, sa * k, offsetA + (sa * k) );
				if ( info > 0 ) {
					return info;
				}
				// ZTRMM( 'L', 'U', 'N', DIAG, K, K, -CONE, A(K), K, A(K*(K+1)), K )
				ztrmm( 'left', 'upper', 'no-transpose', diag, k, k, CNEGONE, A, sa, sa * k, offsetA + (sa * k), A, sa, sa * k, offsetA + (sa * k * (k + 1)) );

				// ZTRTRI( 'L', DIAG, K, A(0), K, INFO )
				info = ztrtri( 'lower', diag, k, A, sa, sa * k, offsetA );
				if ( info > 0 ) {
					return info + k;
				}
				// ZTRMM( 'R', 'L', 'C', DIAG, K, K, CONE, A(0), K, A(K*(K+1)), K )
				ztrmm( 'right', 'lower', 'conjugate-transpose', diag, k, k, CONE, A, sa, sa * k, offsetA, A, sa, sa * k, offsetA + (sa * k * (k + 1)) );
			} else {
				// SRPA for UPPER, TRANSPOSE and N is even
				// T1 -> a(K*(K+1)), T2 -> a(K*K), S -> a(0)
				// ZTRTRI( 'U', DIAG, K, A(K*(K+1)), K, INFO )
				info = ztrtri( 'upper', diag, k, A, sa, sa * k, offsetA + (sa * k * (k + 1)) );
				if ( info > 0 ) {
					return info;
				}
				// ZTRMM( 'R', 'U', 'C', DIAG, K, K, -CONE, A(K*(K+1)), K, A(0), K )
				ztrmm( 'right', 'upper', 'conjugate-transpose', diag, k, k, CNEGONE, A, sa, sa * k, offsetA + (sa * k * (k + 1)), A, sa, sa * k, offsetA );

				// ZTRTRI( 'L', DIAG, K, A(K*K), K, INFO )
				info = ztrtri( 'lower', diag, k, A, sa, sa * k, offsetA + (sa * k * k) );
				if ( info > 0 ) {
					return info + k;
				}
				// ZTRMM( 'L', 'L', 'N', DIAG, K, K, CONE, A(K*K), K, A(0), K )
				ztrmm( 'left', 'lower', 'no-transpose', diag, k, k, CONE, A, sa, sa * k, offsetA + (sa * k * k), A, sa, sa * k, offsetA );
			}
		}
	}

	return 0;
}


// EXPORTS //

export default ztftri;
