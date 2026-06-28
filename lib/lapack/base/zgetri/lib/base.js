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
import ztrtri from '../../ztrtri/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var NB = 32; // Block size (hardcoded; Fortran uses ILAENV)
var CONE = new Complex128( 1.0, 0.0 );
var CNEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes the inverse of a matrix using the LU factorization computed by zgetrf.
*
* This method inverts U and then computes inv(A) by solving the system
* inv(A)*L = inv(U) for inv(A).
*
* IPIV stores 0-based pivot indices: row i was interchanged with row `IPIV[i]`.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output matrix; on entry, the L and U factors from zgetrf; on exit, the inverse
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Int32Array} IPIV - pivot indices from zgetrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Complex128Array} WORK - workspace array of length at least max(1, lwork)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {integer} lwork - length of the WORK array (complex elements); should be at least N for unblocked, N*NB for blocked
* @returns {integer} info - 0 if successful, k>0 if U(k,k) is exactly zero (singular)
*/
function zgetri( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork, lwork ) {
	var ldwork;
	var nbmin;
	var info;
	var sa1;
	var sa2;
	var iws;
	var Wv;
	var Av;
	var nb;
	var nn;
	var jb;
	var jp;
	var jj;
	var ia;
	var iw;
	var j;
	var i;

	sa1 = strideA1;
	sa2 = strideA2;
	info = 0;

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	// Step 1: Compute the inverse of the upper triangular factor U
	info = ztrtri( 'upper', 'non-unit', N, A, sa1, sa2, offsetA );
	if ( info > 0 ) {
		return info;
	}

	nb = NB;
	nbmin = 2;
	ldwork = N;

	if ( nb > 1 && nb < N ) {
		iws = Math.max( ldwork * nb, 1 );
		if ( lwork < iws ) {
			nb = Math.floor( lwork / ldwork );
			nbmin = 2; // Fortran uses ILAENV(2,...), we just keep 2
		}
	} else {
		iws = N;
	}

	// Get Float64Array views for direct element access
	Av = reinterpret( A, 0 );
	Wv = reinterpret( WORK, 0 );

	// Step 2: Form the product inv(U) * inv(L), solving inv(A)*L = inv(U)
	if ( nb < nbmin || nb >= N ) {
		// Unblocked code: process column by column from right to left
		for ( j = N - 1; j >= 0; j-- ) {
			// Copy column j of L (below diagonal) into WORK and zero it in A
			for ( i = j + 1; i < N; i++ ) {
				ia = ( offsetA + (i * sa1) + (j * sa2) ) * 2;
				iw = ( offsetWork + (i * strideWork) ) * 2;

				// WORK(i) = A(i, j)
				Wv[ iw ] = Av[ ia ];
				Wv[ iw + 1 ] = Av[ ia + 1 ];

				// A(i, j) = ZERO
				Av[ ia ] = 0.0;
				Av[ ia + 1 ] = 0.0;
			}

			// Compute current column of inv(A):
			// A(:, j) = A(:, j+1:N-1) * (-WORK(j+1:N-1)) + A(:, j)
			if ( j < N - 1 ) {
				zgemv( 'no-transpose', N, N - j - 1, CNEGONE, A, sa1, sa2, offsetA + (( j + 1 ) * sa2), WORK, strideWork, offsetWork + (( j + 1 ) * strideWork), CONE, A, sa1, offsetA + (j * sa2) );
			}
		}
	} else {
		// Blocked code: process blocks of columns from right to left
		nn = Math.floor( ( N - 1 ) / nb ) * nb;
		for ( j = nn; j >= 0; j -= nb ) {
			jb = Math.min( nb, N - j );

			// Copy block of L (below diagonal) into WORK and zero it in A

			// WORK is used as a column-major N-by-jb matrix with strides (1, ldwork)
			for ( jj = j; jj < j + jb; jj++ ) {
				for ( i = jj + 1; i < N; i++ ) {
					ia = ( offsetA + (i * sa1) + (jj * sa2) ) * 2;

					// WORK(i + (jj-j)*ldwork) in complex elements from offsetWork
					iw = ( offsetWork + i + (( jj - j ) * ldwork) ) * 2;
					Wv[ iw ] = Av[ ia ];
					Wv[ iw + 1 ] = Av[ ia + 1 ];
					Av[ ia ] = 0.0;
					Av[ ia + 1 ] = 0.0;
				}
			}

			// Update the current block column with trailing columns
			if ( j + jb < N ) {
				zgemm( 'no-transpose', 'no-transpose', N, jb, N - j - jb, CNEGONE, A, sa1, sa2, offsetA + (( j + jb ) * sa2), WORK, 1, ldwork, offsetWork + ( j + jb ), CONE, A, sa1, sa2, offsetA + (j * sa2) );
			}
			// Solve with the unit lower triangular block from WORK
			ztrsm( 'right', 'lower', 'no-transpose', 'unit', N, jb, CONE, WORK, 1, ldwork, offsetWork + j, A, sa1, sa2, offsetA + (j * sa2) );
		}
	}

	// Step 3: Apply column permutations from IPIV in reverse order
	for ( j = N - 2; j >= 0; j-- ) {
		jp = IPIV[ offsetIPIV + (j * strideIPIV) ];
		if ( jp !== j ) {
			zswap( N, A, sa1, offsetA + (j * sa2), A, sa1, offsetA + (jp * sa2) );
		}
	}

	return 0;
}


// EXPORTS //

export default zgetri;
