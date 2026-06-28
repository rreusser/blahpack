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

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import zherk from '../../../../blas/base/zherk/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Computes the Cholesky factorization of a complex Hermitian positive definite.
* matrix A using the recursive algorithm.
*
* The factorization has the form:
* `A = U^H*U`,  if uplo = 'upper', or
* A = L*L^H,  if uplo = 'lower',
* where U is upper triangular and L is lower triangular.
*
* This is the recursive version of the algorithm. It divides the matrix
* into four submatrices and recursively factors.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {Complex128Array} A - input/output Hermitian positive definite matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @returns {integer} info - 0 if successful, k>0 if the leading minor of order k is not positive definite
*/
function zpotrf2( uplo, N, A, strideA1, strideA2, offsetA ) {
	var upper;
	var iinfo;
	var sa1;
	var sa2;
	var ajj;
	var Av;
	var oA;
	var n1;
	var n2;

	upper = ( uplo === 'upper' );
	sa1 = strideA1;
	sa2 = strideA2;

	if ( N === 0 ) {
		return 0;
	}

	// Base case: 1x1 matrix
	if ( N === 1 ) {
		// Get Float64Array view to access real/imag parts
		Av = reinterpret( A, 0 );
		oA = offsetA * 2;
		ajj = Av[ oA ]; // real part of A[0,0]

		// Test for non-positive-definiteness or NaN
		if ( ajj <= 0.0 || ajj !== ajj ) {
			return 1;
		}
		// Factor: A[0,0] = sqrt(Re(A[0,0])), with zero imaginary part
		Av[ oA ] = Math.sqrt( ajj );
		Av[ oA + 1 ] = 0.0;
		return 0;
	}

	// Recursive case: split into n1 and n2
	n1 = ( N / 2 ) | 0;
	n2 = N - n1;

	// Factor A11
	iinfo = zpotrf2( uplo, n1, A, sa1, sa2, offsetA );
	if ( iinfo !== 0 ) {
		return iinfo;
	}

	if ( upper ) {
		// Compute A = U^H * U
		// Solve U11^H * A12 = A12 (update off-diagonal block)
		ztrsm( 'left', 'upper', 'conjugate-transpose', 'non-unit', n1, n2, CONE,
			A, sa1, sa2, offsetA,
			A, sa1, sa2, offsetA + (n1 * sa2)
		);

		// Update A22: A22 -= A12^H * A12
		zherk( uplo, 'conjugate-transpose', n2, n1, -1.0,
			A, sa1, sa2, offsetA + (n1 * sa2),
			1.0,
			A, sa1, sa2, offsetA + (n1 * sa1) + (n1 * sa2)
		);

		// Factor A22
		iinfo = zpotrf2( uplo, n2, A, sa1, sa2, offsetA + (n1 * sa1) + (n1 * sa2) );
		if ( iinfo !== 0 ) {
			return iinfo + n1;
		}
	} else {
		// Compute A = L * L^H
		// Solve A21 * L11^H = A21 (update off-diagonal block)
		ztrsm( 'right', 'lower', 'conjugate-transpose', 'non-unit', n2, n1, CONE,
			A, sa1, sa2, offsetA,
			A, sa1, sa2, offsetA + (n1 * sa1)
		);

		// Update A22: A22 -= A21 * A21^H
		zherk( uplo, 'no-transpose', n2, n1, -1.0,
			A, sa1, sa2, offsetA + (n1 * sa1),
			1.0,
			A, sa1, sa2, offsetA + (n1 * sa1) + (n1 * sa2)
		);

		// Factor A22
		iinfo = zpotrf2( uplo, n2, A, sa1, sa2, offsetA + (n1 * sa1) + (n1 * sa2) );
		if ( iinfo !== 0 ) {
			return iinfo + n1;
		}
	}
	return 0;
}


// EXPORTS //

export default zpotrf2;
