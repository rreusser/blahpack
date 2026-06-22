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

import dgetrf2 from '../../dgetrf2/lib/base.js';
import dlaswp from '../../dlaswp/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';


// VARIABLES //

var NB = 64; // Block size (hardcoded; Fortran uses ILAENV)


// MAIN //

/**
* Computes an LU factorization of a general M-by-N matrix A using partial.
* pivoting with row interchanges (blocked algorithm).
*
* The factorization has the form `A = P*L*U` where P is a permutation
* matrix, L is lower triangular with unit diagonal elements, and U is upper
* triangular.
*
* Uses dgetrf2 for panel factorizations, then dlaswp + dtrsm + dgemm for
* trailing matrix updates.
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
* @returns {integer} info - 0 if successful, k if U(k-1,k-1) is exactly zero
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
*
* var A = new Float64Array( [ 2.0, 4.0, 1.0, 3.0 ] );
* var IPIV = new Int32Array( 2 );
*
* var info = dgetrf( 2, 2, A, 1, 2, 0, IPIV, 1, 0 );
* // returns 0
*/
function dgetrf( M, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var iinfo;
	var minMN;
	var info;
	var sa1;
	var sa2;
	var jb;
	var j;
	var i;

	sa1 = strideA1;
	sa2 = strideA2;

	info = 0;

	if ( M === 0 || N === 0 ) {
		return 0;
	}

	minMN = Math.min( M, N );

	if ( NB <= 1 || NB >= minMN ) {
		// Use unblocked code (dgetrf2) for the entire matrix
		return dgetrf2( M, N, A, sa1, sa2, offsetA, IPIV, strideIPIV, offsetIPIV );
	}

	// Blocked code
	for ( j = 0; j < minMN; j += NB ) {
		jb = Math.min( minMN - j, NB );

		// Factor the panel A(j:M-1, j:j+jb-1) using unblocked code
		iinfo = dgetrf2( M - j, jb, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2), IPIV, strideIPIV, offsetIPIV + (j * strideIPIV));

		if ( info === 0 && iinfo > 0 ) {
			info = iinfo + j;
		}

		// Adjust IPIV: the panel factored rows j..M-1, so pivot indices
		// Are relative to row j. Add j to make them global.
		for ( i = j; i < Math.min( M, j + jb ); i++ ) {
			IPIV[ offsetIPIV + (i * strideIPIV) ] += j;
		}

		// Apply interchanges to columns 0..j-1
		dlaswp( j, A, sa1, sa2, offsetA, j, j + jb - 1, 1, IPIV, strideIPIV, offsetIPIV + (j * strideIPIV) );

		if ( j + jb < N ) {
			// Apply interchanges to columns j+jb..N-1
			dlaswp( N - j - jb, A, sa1, sa2, offsetA + (( j + jb ) * sa2), j, j + jb - 1, 1, IPIV, strideIPIV, offsetIPIV + (j * strideIPIV) );

			// Compute block row of U: solve L11 * U12 = A12
			dtrsm( 'left', 'lower', 'no-transpose', 'unit', jb, N - j - jb, 1.0, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2), A, sa1, sa2, offsetA + (j * sa1) + (( j + jb ) * sa2));

			if ( j + jb < M ) {
				// Update trailing submatrix: A22 = A22 - A21 * U12
				dgemm( 'no-transpose', 'no-transpose', M - j - jb, N - j - jb, jb, -1.0, A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (j * sa2), A, sa1, sa2, offsetA + (j * sa1) + (( j + jb ) * sa2), 1.0, A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (( j + jb ) * sa2));
			}
		}
	}

	return info;
}


// EXPORTS //

export default dgetrf;
