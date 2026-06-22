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
import zgetrf2 from '../../zgetrf2/lib/base.js';
import zlaswp from '../../zlaswp/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';


// VARIABLES //

var NB = 64; // Block size (hardcoded; Fortran uses ILAENV)
var CONE = new Complex128( 1.0, 0.0 );
var CNEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes an LU factorization of a general complex M-by-N matrix A using.
* partial pivoting with row interchanges (blocked algorithm).
*
* The factorization has the form `A = P*L*U` where P is a permutation
* matrix, L is lower triangular with unit diagonal elements, and U is upper
* triangular.
*
* Uses zgetrf2 for panel factorizations, then zlaswp + ztrsm + zgemm for
* trailing matrix updates.
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
function zgetrf( M, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
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
		// Use unblocked code (zgetrf2) for the entire matrix
		return zgetrf2( M, N, A, sa1, sa2, offsetA, IPIV, strideIPIV, offsetIPIV );
	}

	// Blocked code
	for ( j = 0; j < minMN; j += NB ) {
		jb = Math.min( minMN - j, NB );

		// Factor the panel A(j:M-1, j:j+jb-1) using unblocked code
		iinfo = zgetrf2( M - j, jb, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2), IPIV, strideIPIV, offsetIPIV + (j * strideIPIV));

		if ( info === 0 && iinfo > 0 ) {
			info = iinfo + j;
		}

		// Adjust IPIV: the panel factored rows j..M-1, so pivot indices
		// Are relative to row j. Add j to make them global.
		for ( i = j; i < Math.min( M, j + jb ); i++ ) {
			IPIV[ offsetIPIV + (i * strideIPIV) ] += j;
		}

		// Apply interchanges to columns 0..j-1
		// NOTE: pass offsetIPIV + j * strideIPIV so dlaswp reads the correct
		// Pivot entries for this block (not from the start of IPIV)
		zlaswp( j, A, sa1, sa2, offsetA, j, j + jb - 1, IPIV, strideIPIV, offsetIPIV + (j * strideIPIV), 1 );

		if ( j + jb < N ) {
			// Apply interchanges to columns j+jb..N-1
			zlaswp( N - j - jb, A, sa1, sa2, offsetA + (( j + jb ) * sa2), j, j + jb - 1, IPIV, strideIPIV, offsetIPIV + (j * strideIPIV), 1);

			// Compute block row of U: solve L11 * U12 = A12
			ztrsm( 'left', 'lower', 'no-transpose', 'unit', jb, N - j - jb, CONE, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2), A, sa1, sa2, offsetA + (j * sa1) + (( j + jb ) * sa2));

			if ( j + jb < M ) {
				// Update trailing submatrix: A22 = A22 - A21 * U12
				zgemm( 'no-transpose', 'no-transpose', M - j - jb, N - j - jb, jb, CNEGONE, A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (j * sa2), A, sa1, sa2, offsetA + (j * sa1) + (( j + jb ) * sa2), CONE, A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (( j + jb ) * sa2));
			}
		}
	}

	return info;
}


// EXPORTS //

export default zgetrf;
