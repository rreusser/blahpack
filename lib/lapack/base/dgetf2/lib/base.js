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

/* eslint-disable max-len, max-params */

// MODULES //

import idamax from '../../../../blas/base/idamax/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dger from '../../../../blas/base/dger/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var SFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Computes an LU factorization of a general M-by-N matrix A using partial.
* pivoting with row interchanges (unblocked algorithm).
*
* The factorization has the form `A = P*L*U` where P is a permutation
* matrix, L is lower triangular with unit diagonal elements (lower
* trapezoidal if M > N), and U is upper triangular (upper trapezoidal
* if M < N).
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
* @returns {integer} info - 0 if successful, k if `U[k-1,k-1]` is exactly zero (1-based)
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
*
* var A = new Float64Array( [ 2.0, 4.0, 1.0, 3.0 ] );
* var IPIV = new Int32Array( 2 );
*
* var info = dgetf2( 2, 2, A, 1, 2, 0, IPIV, 1, 0 );
* // returns 0
*/
function dgetf2( M, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var minMN;
	var info;
	var sa1;
	var sa2;
	var jp;
	var j;
	var i;

	sa1 = strideA1;
	sa2 = strideA2;
	info = 0;

	// Quick return if possible...
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	minMN = Math.min( M, N );

	for ( j = 0; j < minMN; j++ ) {
		// Find the pivot — idamax returns 0-based index relative to the subcolumn A(j:M-1, j)
		jp = j + idamax( M - j, A, sa1, offsetA + (j * sa1) + (j * sa2) );

		// Store pivot index (0-based)
		IPIV[ offsetIPIV + (j * strideIPIV) ] = jp;

		if ( A[ offsetA + (jp * sa1) + (j * sa2) ] !== 0.0 ) {
			// Swap rows j and jp across all columns
			if ( jp !== j ) {
				dswap( N, A, sa2, offsetA + (j * sa1), A, sa2, offsetA + (jp * sa1) );
			}

			// Compute elements j+1:M-1 of j-th column (scale below the pivot)
			if ( j < M - 1 ) {
				if ( Math.abs( A[ offsetA + (j * sa1) + (j * sa2) ] ) >= SFMIN ) {
					dscal( M - j - 1, 1.0 / A[ offsetA + (j * sa1) + (j * sa2) ], A, sa1, offsetA + (( j + 1 ) * sa1) + (j * sa2) );
				} else {
					for ( i = 1; i <= M - j - 1; i++ ) {
						A[ offsetA + (( j + i ) * sa1) + (j * sa2) ] /= A[ offsetA + (j * sa1) + (j * sa2) ];
					}
				}
			}
		} else if ( info === 0 ) {
			// First zero pivot found — record 1-based position
			info = j + 1;
		}

		// Update trailing submatrix A(j+1:M-1, j+1:N-1)
		if ( j < minMN - 1 ) {
			dger( M - j - 1, N - j - 1, -1.0, A, sa1, offsetA + (( j + 1 ) * sa1) + (j * sa2), A, sa2, offsetA + (j * sa1) + (( j + 1 ) * sa2), A, sa1, sa2, offsetA + (( j + 1 ) * sa1) + (( j + 1 ) * sa2) );
		}
	}

	return info;
}


// EXPORTS //

export default dgetf2;
