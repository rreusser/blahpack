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

import dtrti2 from '../../dtrti2/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';


// VARIABLES //

var NB = 2; // Block size for blocked algorithm


// MAIN //

/**
* Computes the inverse of a real upper or lower triangular matrix.
*
* Uses a blocked algorithm (Level 3 BLAS) for large matrices and
* falls back to the unblocked algorithm (dtrti2) for small matrices.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - input/output triangular matrix (overwritten with inverse)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @returns {integer} info - 0 if successful, k>0 if A(k,k) is zero
*/
function dtrtri( uplo, diag, N, A, strideA1, strideA2, offsetA ) {
	var nounit;
	var upper;
	var sa1;
	var sa2;
	var nn;
	var jb;
	var j;

	if ( N === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );
	nounit = ( diag === 'non-unit' );
	sa1 = strideA1;
	sa2 = strideA2;

	// Check for singularity if non-unit diagonal
	if ( nounit ) {
		for ( j = 0; j < N; j++ ) {
			if ( A[ offsetA + (j * sa1) + (j * sa2) ] === 0.0 ) {
				return j + 1;
			}
		}
	}

	// Use unblocked code for small matrices or when NB >= N
	if ( NB <= 1 || NB >= N ) {
		return dtrti2( uplo, diag, N, A, sa1, sa2, offsetA );
	}

	// Blocked algorithm
	if ( upper ) {
		// Compute inverse of upper triangular matrix
		for ( j = 0; j < N; j += NB ) {
			jb = Math.min( NB, N - j );

			// Compute rows 0:j-1 of current block column
			dtrmm( 'left', 'upper', 'no-transpose', diag, j, jb, 1.0, A, sa1, sa2, offsetA, A, sa1, sa2, offsetA + (j * sa2) );
			dtrsm( 'right', 'upper', 'no-transpose', diag, j, jb, -1.0, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2), A, sa1, sa2, offsetA + (j * sa2) );

			// Compute inverse of current diagonal block
			dtrti2( 'upper', diag, jb, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2) );
		}
	} else {
		// Compute inverse of lower triangular matrix
		nn = Math.floor( ( N - 1 ) / NB ) * NB;
		for ( j = nn; j >= 0; j -= NB ) {
			jb = Math.min( NB, N - j );
			if ( j + jb < N ) {
				// Compute rows j+jb:N-1 of current block column
				dtrmm( 'left', 'lower', 'no-transpose', diag, N - j - jb, jb, 1.0, A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (( j + jb ) * sa2), A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (j * sa2) );
				dtrsm( 'right', 'lower', 'no-transpose', diag, N - j - jb, jb, -1.0, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2), A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (j * sa2) );
			}

			// Compute inverse of current diagonal block
			dtrti2( 'lower', diag, jb, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2) );
		}
	}
	return 0;
}


// EXPORTS //

export default dtrtri;
