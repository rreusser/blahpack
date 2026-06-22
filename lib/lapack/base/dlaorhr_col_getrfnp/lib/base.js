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

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import dgemm from './../../../../blas/base/dgemm/lib/base.js';
import dtrsm from './../../../../blas/base/dtrsm/lib/base.js';
import dlaorhr_col_getrfnp2 from './../../dlaorhr_col_getrfnp2/lib/base.js';


// VARIABLES //

// ILAENV(1) block size for DLAORHR_COL_GETRFNP — hardcoded to LAPACK default.
var NB = 32;


// MAIN //

/**
* Computes the modified LU factorization without pivoting of a real general M-by-N matrix `A` (blocked driver).
*
* The factorization has the form `A - S = L * U` where `S` is an M-by-N
* diagonal sign matrix with diagonal `D`, `L` is M-by-N lower triangular
* with unit diagonal, and `U` is M-by-N upper triangular. The diagonal
* `D(i) = -sign(A(i,i))` is computed at each elimination step so that the
* pivot is at least one in absolute value, guaranteeing stability without
* row interchanges. This blocked driver delegates panel factorizations to
* the recursive kernel `dlaorhr_col_getrfnp2`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} D - output diagonal sign vector, length min(M,N)
* @param {integer} strideD - stride length for `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @returns {integer} status code (0 = success)
*/
function dlaorhr_col_getrfnp( M, N, A, strideA1, strideA2, offsetA, D, strideD, offsetD ) {
	var minMN;
	var oA;
	var oD;
	var jb;
	var j;

	if ( M === 0 || N === 0 ) {
		return 0;
	}

	minMN = Math.min( M, N );

	if ( NB <= 1 || NB >= minMN ) {
		// Use unblocked code
		return dlaorhr_col_getrfnp2( M, N, A, strideA1, strideA2, offsetA, D, strideD, offsetD );
	}

	// Use blocked code. j is 0-based panel start.
	for ( j = 0; j < minMN; j += NB ) {
		jb = Math.min( minMN - j, NB );

		oA = offsetA + ( j * strideA1 ) + ( j * strideA2 );
		oD = offsetD + ( j * strideD );

		// Factor diagonal and subdiagonal blocks: A(j:M, j:j+jb) panel
		dlaorhr_col_getrfnp2( M - j, jb, A, strideA1, strideA2, oA, D, strideD, oD );

		if ( j + jb < N ) {
			// Compute block row of U: A(j:j+jb, j+jb:N) := L11^-1 * A(j:j+jb, j+jb:N)
			dtrsm( 'left', 'lower', 'no-transpose', 'unit', jb, N - j - jb, 1.0, A, strideA1, strideA2, oA, A, strideA1, strideA2, offsetA + ( j * strideA1 ) + ( ( j + jb ) * strideA2 ) );

			if ( j + jb < M ) {
				// Update trailing submatrix: A22 := A22 - A21 * U12
				dgemm( 'no-transpose', 'no-transpose', M - j - jb, N - j - jb, jb, -1.0, A, strideA1, strideA2, offsetA + ( ( j + jb ) * strideA1 ) + ( j * strideA2 ), A, strideA1, strideA2, offsetA + ( j * strideA1 ) + ( ( j + jb ) * strideA2 ), 1.0, A, strideA1, strideA2, offsetA + ( ( j + jb ) * strideA1 ) + ( ( j + jb ) * strideA2 ) );
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dlaorhr_col_getrfnp;
