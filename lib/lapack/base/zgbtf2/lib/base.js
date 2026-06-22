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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zgeru from '../../../../blas/base/zgeru/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var TEMP = new Float64Array( 2 );


// MAIN //

/**
* Computes an LU factorization of a complex M-by-N band matrix A using partial.
* pivoting with row interchanges (unblocked algorithm).
*
* The factorization has the form `A = P*L*U` where P is a permutation
* matrix, L is lower triangular with unit diagonal, and U is upper triangular.
*
* The band matrix A is stored in band format:
* AB(kl+ku+1+i-j, j) = A(i,j) (1-based Fortran indexing)
* In JS with complex-element strides, row kv = ku+kl is the diagonal.
*
* IPIV stores 0-based pivot indices: row i was interchanged with row `IPIV[i]`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of matrix A
* @param {NonNegativeInteger} N - number of columns of matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Complex128Array} AB - band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of AB (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for AB (in complex elements)
* @param {Int32Array} IPIV - pivot index output array, length min(M,N)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @returns {integer} info - 0 if successful, k if U(k-1,k-1) is exactly zero (1-based)
*/
function zgbtf2( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV ) {
	var ONE_NEG;
	var info;
	var ABv;
	var sa1;
	var sa2;
	var idx;
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

	ABv = reinterpret( AB, 0 );

	// Zero out the fill-in region: for columns j = ku+1 to min(kv-1, N-1)

	// Zero rows kv-j to kl-1 (0-based) in band storage
	for ( j = ku + 1; j < Math.min( kv, N ); j++ ) {
		for ( i = kv - j; i < kl; i++ ) {
			idx = ( offsetAB + (i * sa1) + (j * sa2) ) * 2;
			ABv[ idx ] = 0.0;
			ABv[ idx + 1 ] = 0.0;
		}
	}

	ju = 0;

	for ( j = 0; j < Math.min( M, N ); j++ ) {
		// Zero out fill-in column: if j + kv < N, zero rows 0..kl-1 of column j+kv
		if ( j + kv < N ) {
			for ( i = 0; i < kl; i++ ) {
				idx = ( offsetAB + (i * sa1) + (( j + kv ) * sa2) ) * 2;
				ABv[ idx ] = 0.0;
				ABv[ idx + 1 ] = 0.0;
			}
		}

		// Find pivot: search km+1 elements starting at AB(kv, j) in band storage
		km = Math.min( kl, M - j - 1 );
		jp = izamax( km + 1, AB, sa1, offsetAB + (kv * sa1) + (j * sa2) );

		// IPIV[j] = jp + j (0-based: the row that was swapped with row j)
		IPIV[ offsetIPIV + (j * strideIPIV) ] = jp + j;

		// Check if pivot element is nonzero
		idx = ( offsetAB + (( kv + jp ) * sa1) + (j * sa2) ) * 2;
		if ( ABv[ idx ] !== 0.0 || ABv[ idx + 1 ] !== 0.0 ) {
			// Update JU: max column reached by pivot search
			ju = Math.max( ju, Math.min( j + ku + jp, N - 1 ) );

			// Swap rows: if jp != 0, swap row kv+jp with row kv for columns j..ju

			// Band stride for moving along a row = sa2 - sa1 (corresponds to LDAB-1)
			if ( jp !== 0 ) {
				zswap( ju - j + 1, AB, sa2 - sa1, offsetAB + (( kv + jp ) * sa1) + (j * sa2), AB, sa2 - sa1, offsetAB + (kv * sa1) + (j * sa2) );
			}

			if ( km > 0 ) {
				// Scale multipliers: L(j+1:j+km, j) = AB(kv+1:kv+km, j) / AB(kv, j)
				// Compute 1/AB(kv, j) as a Complex128 scalar for zscal
				idx = ( offsetAB + (kv * sa1) + (j * sa2) ) * 2;
				TEMP[ 0 ] = 1.0;
				TEMP[ 1 ] = 0.0;
				cmplx.divAt( TEMP, 0, TEMP, 0, ABv, idx );
				ONE_NEG = new Complex128( TEMP[ 0 ], TEMP[ 1 ] );

				zscal( km, ONE_NEG, AB, sa1, offsetAB + (( kv + 1 ) * sa1) + (j * sa2) );

				// Rank-1 update: A(j+1:j+km, j+1:ju) -= L(j+1:j+km, j) * U(j, j+1:ju)
				if ( ju > j ) {
					zgeru( km, ju - j, new Complex128( -1.0, 0.0 ), AB, sa1, offsetAB + (( kv + 1 ) * sa1) + (j * sa2), AB, sa2 - sa1, offsetAB + (( kv - 1 ) * sa1) + (( j + 1 ) * sa2), AB, sa1, sa2 - sa1, offsetAB + (kv * sa1) + (( j + 1 ) * sa2) );
				}
			}
		} else if ( info === 0 ) {
			// Zero pivot found
			info = j + 1; // 1-based info
		}
	}

	return info;
}


// EXPORTS //

export default zgbtf2;
