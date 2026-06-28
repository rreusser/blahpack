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

/* eslint-disable max-len, max-params, no-var, camelcase */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import zlaunhr_col_getrfnp2 from '../../zlaunhr_col_getrfnp2/lib/base.js';


// VARIABLES //

// Hardcoded block size (matches LAPACK ILAENV convention for *LAORHR_COL_GETRFNP-family routines).
var NB = 32;

var CONE = new Complex128( 1.0, 0.0 );
var CNEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes the modified LU factorization without pivoting of a complex general M-by-N matrix `A` (blocked driver).
*
* The factorization has the form `A - S = L*U`, where `S` is a diagonal sign
* matrix with diagonal entries `D(i) = -sign(Re(A(i,i)))` (value after `i-1`
* steps of Gaussian elimination), `L` is lower triangular with unit diagonal
* (lower trapezoidal if `M > N`), and `U` is upper triangular (upper
* trapezoidal if `M < N`). Because `|D(i,i)| = 1`, no pivoting is required
* for stability.
*
* This is the blocked right-looking driver. It calls the recursive kernel
* `zlaunhr_col_getrfnp2` on diagonal blocks and uses Level-3 BLAS (`ztrsm`,
* `zgemm`) to update the trailing submatrix.
*
* @private
* @param {NonNegativeInteger} M - number of rows of matrix `A`
* @param {NonNegativeInteger} N - number of columns of matrix `A`
* @param {Complex128Array} A - input/output complex matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} D - output diagonal sign array (length `min(M,N)`); entries are `(+/-1, 0)`
* @param {integer} strideD - stride length for `D` (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for `D` (complex elements)
* @returns {integer} status code (0 = success)
*/
function zlaunhr_col_getrfnp( M, N, A, strideA1, strideA2, offsetA, D, strideD, offsetD ) {
	var oAjbjb;
	var oAjjb;
	var oAjbj;
	var minMN;
	var oAjj;
	var oDj;
	var jb;
	var j;

	if ( M === 0 || N === 0 ) {
		return 0;
	}

	minMN = ( M < N ) ? M : N;

	// Unblocked path: defer to the recursive kernel directly.
	if ( NB <= 1 || NB >= minMN ) {
		return zlaunhr_col_getrfnp2( M, N, A, strideA1, strideA2, offsetA, D, strideD, offsetD );
	}

	// Blocked right-looking factorization. Loop over diagonal blocks of size up to `NB`.
	for ( j = 0; j < minMN; j += NB ) {
		jb = minMN - j;
		if ( jb > NB ) {
			jb = NB;
		}

		// Offsets (in complex elements) for the current block A(j,j) and related sub-blocks.
		oAjj = offsetA + ( j * strideA1 ) + ( j * strideA2 );             // A(j,j)
		oAjjb = offsetA + ( j * strideA1 ) + ( ( j + jb ) * strideA2 );   // A(j, j+jb)
		oAjbj = offsetA + ( ( j + jb ) * strideA1 ) + ( j * strideA2 );   // A(j+jb, j)
		oAjbjb = offsetA + ( ( j + jb ) * strideA1 ) + ( ( j + jb ) * strideA2 ); // A(j+jb, j+jb)
		oDj = offsetD + ( j * strideD );

		// Factor the diagonal and subdiagonal portion: A(j:M-1, j:j+jb-1).
		zlaunhr_col_getrfnp2( M - j, jb, A, strideA1, strideA2, oAjj, D, strideD, oDj );

		if ( j + jb < N ) {
			// Compute the block row of U:
			//   A(j:j+jb-1, j+jb:N-1) := L11^{-1} * A(j:j+jb-1, j+jb:N-1)
			ztrsm( 'left', 'lower', 'no-transpose', 'unit', jb, N - j - jb, CONE, A, strideA1, strideA2, oAjj, A, strideA1, strideA2, oAjjb );

			if ( j + jb < M ) {
				// Update the trailing submatrix:
				//   A(j+jb:M-1, j+jb:N-1) -= A(j+jb:M-1, j:j+jb-1) * A(j:j+jb-1, j+jb:N-1)
				zgemm( 'no-transpose', 'no-transpose', M - j - jb, N - j - jb, jb, CNEGONE, A, strideA1, strideA2, oAjbj, A, strideA1, strideA2, oAjjb, CONE, A, strideA1, strideA2, oAjbjb );
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zlaunhr_col_getrfnp;
