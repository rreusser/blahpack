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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zgeru from '../../../../blas/base/zgeru/lib/base.js';
import zrscl from '../../zrscl/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var CNEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes an LU factorization of a general M-by-N complex matrix using.
* partial pivoting with row interchanges (unblocked algorithm).
*
* The factorization has the form `A = P*L*U` where P is a permutation
* matrix, L is lower triangular with unit diagonal elements (lower
* trapezoidal if m > n), and U is upper triangular (upper trapezoidal
* if m < n).
*
* IPIV stores 0-based pivot indices: row i was interchanged with row `IPIV[i]`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of matrix A
* @param {NonNegativeInteger} N - number of columns of matrix A
* @param {Complex128Array} A - input/output complex matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Int32Array} IPIV - pivot index output array, length min(M,N) (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @returns {integer} info - 0 if successful, k if U(k-1,k-1) is exactly zero (1-based singularity index)
*/
function zgetf2( M, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var minMN;
	var info;
	var sa1;
	var sa2;
	var idx;
	var Av;
	var jp;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;
	info = 0;

	if ( M === 0 || N === 0 ) {
		return 0;
	}

	Av = reinterpret( A, 0 );
	minMN = Math.min( M, N );

	for ( j = 0; j < minMN; j++ ) {
		// Find pivot: index of element with maximum absolute value in A(j:M-1, j)
		jp = j + izamax( M - j, A, sa1, offsetA + ( j * sa1 ) + ( j * sa2 ) );

		// Store 0-based pivot index
		IPIV[ offsetIPIV + ( j * strideIPIV ) ] = jp;

		// Check if pivot element is nonzero
		idx = ( offsetA + ( jp * sa1 ) + ( j * sa2 ) ) * 2;
		if ( Av[ idx ] !== 0.0 || Av[ idx + 1 ] !== 0.0 ) {
			// Apply the interchange to columns 0:N-1
			if ( jp !== j ) {
				zswap( N, A, sa2, offsetA + ( j * sa1 ), A, sa2, offsetA + ( jp * sa1 ) );
			}

			// Compute elements j+1:M-1 of j-th column (scale by reciprocal of pivot)
			if ( j < M - 1 ) {
				idx = ( offsetA + ( j * sa1 ) + ( j * sa2 ) ) * 2;
				zrscl( M - j - 1, new Complex128( Av[ idx ], Av[ idx + 1 ] ), A, sa1, offsetA + ( ( j + 1 ) * sa1 ) + ( j * sa2 ) ); // eslint-disable-line max-len
			}
		} else if ( info === 0 ) {
			// First zero pivot found
			info = j + 1; // 1-based
		}

		// Update trailing submatrix: A(j+1:M-1, j+1:N-1) -= A(j+1:M-1, j) * A(j, j+1:N-1)
		if ( j < minMN - 1 ) {
			zgeru( M - j - 1, N - j - 1, CNEGONE, A, sa1, offsetA + ( ( j + 1 ) * sa1 ) + ( j * sa2 ), A, sa2, offsetA + ( j * sa1 ) + ( ( j + 1 ) * sa2 ), A, sa1, sa2, offsetA + ( ( j + 1 ) * sa1 ) + ( ( j + 1 ) * sa2 ) );
		}
	}

	return info;
}


// EXPORTS //

export default zgetf2;
