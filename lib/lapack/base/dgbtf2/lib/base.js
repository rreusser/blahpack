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
import dger from '../../../../blas/base/dger/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// MAIN //

/**
* Computes an LU factorization of a real M-by-N band matrix A using partial.
* pivoting with row interchanges (unblocked algorithm).
*
* The factorization has the form `A = P*L*U` where P is a permutation
* matrix, L is lower triangular with unit diagonal, and U is upper triangular.
*
* The band matrix A is stored in band format:
* AB(kl+ku+1+i-j, j) = A(i,j) for max(1,j-ku) <= i <= min(m,j+kl)
* (using 1-based Fortran indexing). In the JS stride/offset API,
* rows map to strideAB1, columns to strideAB2.
*
* On entry, the first KL rows of AB need not be set (fill-in space for U).
* On exit, the factored form is stored with:
*
* -   U as an upper triangular band matrix with KL+KU superdiagonals
* -   L multipliers stored below the diagonal
*
* IPIV stores 0-based pivot indices: row i was interchanged with row `IPIV[i]`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of matrix A
* @param {NonNegativeInteger} N - number of columns of matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Float64Array} AB - band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Int32Array} IPIV - pivot index output array, length min(M,N)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @returns {integer} info - 0 if successful, k if U(k-1,k-1) is exactly zero (1-based)
*/
function dgbtf2( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV ) {
	var info;
	var sa1;
	var sa2;
	var kv;
	var km;
	var jp;
	var ju;
	var i;
	var j;

	sa1 = strideAB1;
	sa2 = strideAB2;

	kv = ku + kl;
	info = 0;

	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// Zero out the fill-in region: for columns j = ku+1 to min(kv-1, N-1)
	// Zero rows kv-j to kl-1 (0-based) in band storage
	for ( j = ku + 1; j < Math.min( kv, N ); j++ ) {
		for ( i = kv - j; i < kl; i++ ) {
			AB[ offsetAB + (i * sa1) + (j * sa2) ] = 0.0;
		}
	}

	ju = 0;

	for ( j = 0; j < Math.min( M, N ); j++ ) {
		// Zero out fill-in column: if j + kv < N, zero rows 0..kl-1 of column j+kv
		if ( j + kv < N ) {
			for ( i = 0; i < kl; i++ ) {
				AB[ offsetAB + (i * sa1) + (( j + kv ) * sa2) ] = 0.0;
			}
		}

		// Find pivot: search km+1 elements starting at AB(kv, j) in band storage
		// (row kv = diagonal position for column j)
		km = Math.min( kl, M - j - 1 );
		jp = idamax( km + 1, AB, sa1, offsetAB + (kv * sa1) + (j * sa2) );

		// IPIV[j] = jp + j (0-based: the row that was swapped with row j)
		IPIV[ offsetIPIV + (j * strideIPIV) ] = jp + j;

		if ( AB[ offsetAB + (( kv + jp ) * sa1) + (j * sa2) ] === 0.0 ) {
			// Zero pivot found
			if ( info === 0 ) {
				info = j + 1; // 1-based info
			}
		} else {
			// Update JU: max column reached by pivot search
			ju = Math.max( ju, Math.min( j + ku + jp, N - 1 ) );

			// Swap rows: if jp != 0, swap row kv+jp with row kv for columns j..ju

			// Band rows are accessed with stride sa2 - sa1 (corresponds to LDAB-1)
			if ( jp !== 0 ) {
				dswap( ju - j + 1, AB, sa2 - sa1, offsetAB + (( kv + jp ) * sa1) + (j * sa2), AB, sa2 - sa1, offsetAB + (kv * sa1) + (j * sa2) );
			}

			if ( km > 0 ) {
				// Scale multipliers: L(j+1:j+km, j) = AB(kv+1:kv+km, j) / AB(kv, j)
				dscal( km, 1.0 / AB[ offsetAB + (kv * sa1) + (j * sa2) ], AB, sa1, offsetAB + (( kv + 1 ) * sa1) + (j * sa2) );

				// Rank-1 update: A(j+1:j+km, j+1:ju) -= L(j+1:j+km, j) * U(j, j+1:ju)
				if ( ju > j ) {
					dger( km, ju - j, -1.0, AB, sa1, offsetAB + (( kv + 1 ) * sa1) + (j * sa2), AB, sa2 - sa1, offsetAB + (( kv - 1 ) * sa1) + (( j + 1 ) * sa2), AB, sa1, sa2 - sa1, offsetAB + (kv * sa1) + (( j + 1 ) * sa2) );
				}
			}
		}
	}

	return info;
}


// EXPORTS //

export default dgbtf2;
