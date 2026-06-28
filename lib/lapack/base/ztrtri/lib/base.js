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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrti2 from '../../ztrti2/lib/base.js';
import ztrmm from '../../../../blas/base/ztrmm/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';


// VARIABLES //

var NB = 2; // Block size for blocked algorithm (matches dtrtri)
var CONE = new Complex128( 1.0, 0.0 );
var CNEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes the inverse of a complex upper or lower triangular matrix.
*
* Uses a blocked algorithm (Level 3 BLAS) for large matrices and
* falls back to the unblocked algorithm (ztrti2) for small matrices.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - input/output triangular matrix (overwritten with inverse)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @returns {integer} info - 0 if successful, k>0 if A(k,k) is zero
*/
function ztrtri( uplo, diag, N, A, strideA1, strideA2, offsetA ) {
	var nounit;
	var upper;
	var sa1;
	var sa2;
	var Av;
	var nn;
	var jb;
	var ia;
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
		Av = reinterpret( A, 0 );
		for ( j = 0; j < N; j++ ) {
			ia = ( offsetA + (j * sa1) + (j * sa2) ) * 2;
			if ( Av[ ia ] === 0.0 && Av[ ia + 1 ] === 0.0 ) {
				return j + 1;
			}
		}
	}

	// Use unblocked code for small matrices or when NB >= N
	if ( NB <= 1 || NB >= N ) {
		return ztrti2( uplo, diag, N, A, sa1, sa2, offsetA );
	}

	// Blocked algorithm
	if ( upper ) {
		// Compute inverse of upper triangular matrix
		for ( j = 0; j < N; j += NB ) {
			jb = Math.min( NB, N - j );

			// Compute rows 0:j-1 of current block column
			ztrmm( 'left', 'upper', 'no-transpose', diag, j, jb, CONE,
				A, sa1, sa2, offsetA,
				A, sa1, sa2, offsetA + (j * sa2) );
			ztrsm( 'right', 'upper', 'no-transpose', diag, j, jb, CNEGONE,
				A, sa1, sa2, offsetA + (j * sa1) + (j * sa2),
				A, sa1, sa2, offsetA + (j * sa2) );

			// Compute inverse of current diagonal block
			ztrti2( 'upper', diag, jb,
				A, sa1, sa2, offsetA + (j * sa1) + (j * sa2) );
		}
	} else {
		// Compute inverse of lower triangular matrix
		nn = Math.floor( ( N - 1 ) / NB ) * NB;
		for ( j = nn; j >= 0; j -= NB ) {
			jb = Math.min( NB, N - j );
			if ( j + jb < N ) {
				// Compute rows j+jb:N-1 of current block column
				ztrmm( 'left', 'lower', 'no-transpose', diag, N - j - jb, jb, CONE,
					A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (( j + jb ) * sa2),
					A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (j * sa2) );
				ztrsm( 'right', 'lower', 'no-transpose', diag, N - j - jb, jb, CNEGONE,
					A, sa1, sa2, offsetA + (j * sa1) + (j * sa2),
					A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (j * sa2) );
			}

			// Compute inverse of current diagonal block
			ztrti2( 'lower', diag, jb,
				A, sa1, sa2, offsetA + (j * sa1) + (j * sa2) );
		}
	}
	return 0;
}


// EXPORTS //

export default ztrtri;
