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

import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Solves a tridiagonal system of the form A _ X = B using the L_D*L^T.
* factorization of A computed by dpttrf.
*
* D is a diagonal matrix specified in the vector D, L is a unit bidiagonal
* matrix whose subdiagonal is specified in the vector E, and X and B are
* N by NRHS matrices.
*
* @private
* @param {NonNegativeInteger} N - order of the tridiagonal matrix A (N >= 0)
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} d - diagonal elements of D, length N
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements of L, length N-1
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} B - right hand side matrix (N x NRHS), overwritten with solution X
* @param {integer} strideB1 - stride of the first dimension of `B` (row stride)
* @param {integer} strideB2 - stride of the second dimension of `B` (column stride)
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @returns {Float64Array} B - the solution matrix X
*/
function dptts2( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB ) {
	var ib;
	var id;
	var ie;
	var j;
	var i;

	// Quick return if possible
	if ( N <= 1 ) {
		if ( N === 1 ) {
			// Scale row 0 of B by 1/D[0]: B[0,j] /= D[0] for all j
			dscal( nrhs, 1.0 / d[ offsetD ], B, strideB2, offsetB );
		}
		return B;
	}

	// Solve A * X = B using the factorization A = L*D*L^T,
	// Overwriting each right hand side vector with its solution.
	for ( j = 0; j < nrhs; j++ ) {
		ib = offsetB + ( j * strideB2 );

		// Solve L * x = b (forward substitution)

		// B(i,j) = B(i,j) - B(i-1,j) * E(i-1), for i = 1..N-1 (0-based)
		ie = offsetE;
		for ( i = 1; i < N; i++ ) {
			B[ ib + ( i * strideB1 ) ] -= B[ ib + ( ( i - 1 ) * strideB1 ) ] * e[ ie ];
			ie += strideE;
		}

		// Solve D * L^T * x = b (backward substitution)
		// B(N-1,j) = B(N-1,j) / D(N-1)
		id = offsetD + ( ( N - 1 ) * strideD );
		B[ ib + ( ( N - 1 ) * strideB1 ) ] /= d[ id ];

		// B(i,j) = B(i,j) / D(i) - B(i+1,j) * E(i), for i = N-2..0
		ie = offsetE + ( ( N - 2 ) * strideE );
		id -= strideD;
		for ( i = N - 2; i >= 0; i-- ) {
			B[ ib + ( i * strideB1 ) ] = ( B[ ib + ( i * strideB1 ) ] / d[ id ] ) - ( B[ ib + ( ( i + 1 ) * strideB1 ) ] * e[ ie ] );
			ie -= strideE;
			id -= strideD;
		}
	}

	return B;
}


// EXPORTS //

export default dptts2;
