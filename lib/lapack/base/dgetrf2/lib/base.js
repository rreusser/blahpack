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

import idamax from '../../../../blas/base/idamax/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';
import dlaswp from '../../dlaswp/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// MAIN //

/**
* Computes an LU factorization of a general M-by-N matrix A using partial.
* pivoting with row interchanges (recursive algorithm).
*
* The factorization has the form `A = P*L*U` where P is a permutation
* matrix, L is lower triangular with unit diagonal elements (lower
* trapezoidal if M > N), and U is upper triangular (upper trapezoidal if
* M < N).
*
* IPIV stores 0-based pivot indices: row i was interchanged with row `IPIV[i]`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of matrix A
* @param {NonNegativeInteger} N - number of columns of matrix A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} IPIV - pivot index output array, length min(M,N)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @returns {integer} info - 0 if successful, k if U(k-1,k-1) is exactly zero (1-based singularity index)
*/
function dgetrf2( M, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var sfmin;
	var iinfo;
	var minMN;
	var info;
	var temp;
	var sa1;
	var sa2;
	var n1;
	var n2;
	var ip;
	var i;

	sa1 = strideA1;
	sa2 = strideA2;

	info = 0;

	if ( M === 0 || N === 0 ) {
		return 0;
	}

	minMN = Math.min( M, N );

	if ( M === 1 ) {
		// 1x? row -- pivot index is self (0-based)
		IPIV[ offsetIPIV ] = 0;
		if ( A[ offsetA ] === 0.0 ) {
			info = 1;
		}
	} else if ( N === 1 ) {
		// ?x1 column -- find pivot, swap, scale
		sfmin = dlamch( 'safe-minimum' );

		// Idamax returns 0-based index
		ip = idamax( M, A, sa1, offsetA );
		IPIV[ offsetIPIV ] = ip;

		if ( A[ offsetA + (ip * sa1) ] === 0.0 ) {
			info = 1;
		} else {
			// Swap rows 0 and ip
			if ( ip !== 0 ) {
				temp = A[ offsetA ];
				A[ offsetA ] = A[ offsetA + (ip * sa1) ];
				A[ offsetA + (ip * sa1) ] = temp;
			}

			// Scale below the pivot
			if ( Math.abs( A[ offsetA ] ) >= sfmin ) {
				dscal( M - 1, 1.0 / A[ offsetA ], A, sa1, offsetA + sa1 );
			} else {
				for ( i = 1; i < M; i++ ) {
					A[ offsetA + (i * sa1) ] = A[ offsetA + (i * sa1) ] / A[ offsetA ];
				}
			}
		}
	} else {
		// General case: recursive split
		n1 = Math.floor( minMN / 2 );
		n2 = N - n1;

		//        [  A11 | A12  ]

		//    A = [ -----|----- ]

		//        [  A21 | A22  ]

		// Where A11 is n1 columns, A22 is n2 columns

		// Factor [A11; A21] (M x n1)
		iinfo = dgetrf2( M, n1, A, sa1, sa2, offsetA, IPIV, strideIPIV, offsetIPIV );

		if ( info === 0 && iinfo > 0 ) {
			info = iinfo;
		}

		// Apply row interchanges to [A12; A22]
		// Reads IPIV at positions 0..n1-1 (offsetIPIV)
		dlaswp( n2, A, sa1, sa2, offsetA + (n1 * sa2), 0, n1 - 1, 1, IPIV, strideIPIV, offsetIPIV );

		// Solve A11 * A12_new = A12 (triangular solve)

		// A11 is lower triangular with unit diagonal, n1 x n1
		dtrsm( 'left', 'lower', 'no-transpose', 'unit', n1, n2, 1.0, A, sa1, sa2, offsetA, A, sa1, sa2, offsetA + (n1 * sa2));

		// Update A22 = A22 - A21 * A12_new
		dgemm( 'no-transpose', 'no-transpose', M - n1, n2, n1, -1.0, A, sa1, sa2, offsetA + (n1 * sa1), A, sa1, sa2, offsetA + (n1 * sa2), 1.0, A, sa1, sa2, offsetA + (n1 * sa1) + (n1 * sa2));

		// Factor A22 (M-n1 x n2)
		iinfo = dgetrf2( M - n1, n2, A, sa1, sa2, offsetA + (n1 * sa1) + (n1 * sa2), IPIV, strideIPIV, offsetIPIV + (n1 * strideIPIV));

		if ( info === 0 && iinfo > 0 ) {
			info = iinfo + n1;
		}

		// Adjust IPIV for the second half: add n1 to each pivot index
		for ( i = n1; i < minMN; i++ ) {
			IPIV[ offsetIPIV + (i * strideIPIV) ] += n1;
		}

		// Apply the second set of row interchanges to A11 columns
		// Reads IPIV at positions n1..minMN-1 (offset by n1 from start)
		dlaswp( n1, A, sa1, sa2, offsetA, n1, minMN - 1, 1, IPIV, strideIPIV, offsetIPIV + (n1 * strideIPIV) );
	}

	return info;
}


// EXPORTS //

export default dgetrf2;
