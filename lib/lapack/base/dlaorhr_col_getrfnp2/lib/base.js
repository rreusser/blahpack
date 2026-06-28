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

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import dgemm from './../../../../blas/base/dgemm/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dtrsm from './../../../../blas/base/dtrsm/lib/base.js';
import dlamch from './../../dlamch/lib/base.js';


// VARIABLES //

var SFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Computes the modified LU factorization without pivoting of a real general M-by-N matrix `A` (recursive kernel).
*
* The factorization has the form `A - S = L * U` where `S` is an M-by-N
* diagonal sign matrix with diagonal `D`, `L` is M-by-N lower triangular
* with unit diagonal, and `U` is M-by-N upper triangular. The diagonal
* `D(i) = -sign(A(i,i))` is computed at each elimination step so that the
* pivot is at least one in absolute value, guaranteeing stability without
* row interchanges.
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
function dlaorhr_col_getrfnp2( M, N, A, strideA1, strideA2, offsetA, D, strideD, offsetD ) {
	var minMN;
	var a11;
	var n1;
	var n2;
	var i;

	if ( M === 0 || N === 0 ) {
		return 0;
	}

	if ( M === 1 ) {
		// One row case (recursion termination)
		a11 = A[ offsetA ];

		// D(1) = -sign(A(1,1)); Fortran SIGN(1,0) = +1, so handle 0 explicitly
		D[ offsetD ] = ( a11 >= 0.0 ) ? -1.0 : 1.0;

		// Construct row of U: A(1,1) := A(1,1) - D(1)
		A[ offsetA ] = a11 - D[ offsetD ];
		return 0;
	}
	if ( N === 1 ) {
		// One column case (recursion termination)
		a11 = A[ offsetA ];
		D[ offsetD ] = ( a11 >= 0.0 ) ? -1.0 : 1.0;
		A[ offsetA ] = a11 - D[ offsetD ];
		a11 = A[ offsetA ];

		// Construct subdiagonal elements of L
		if ( Math.abs( a11 ) >= SFMIN ) {
			dscal( M - 1, 1.0 / a11, A, strideA1, offsetA + strideA1 );
		} else {
			for ( i = 1; i < M; i++ ) {
				A[ offsetA + ( i * strideA1 ) ] = A[ offsetA + ( i * strideA1 ) ] / a11;
			}
		}
		return 0;
	}

	// Divide the matrix into four submatrices
	minMN = Math.min( M, N );
	n1 = ( minMN / 2 ) | 0;
	n2 = N - n1;

	// Factor B11 (n1 x n1), recursive call
	dlaorhr_col_getrfnp2( n1, n1, A, strideA1, strideA2, offsetA, D, strideD, offsetD );

	// Solve for B21: B21 := B21 * U11^-1 (upper triangular, non-unit)
	dtrsm( 'right', 'upper', 'no-transpose', 'non-unit', M - n1, n1, 1.0, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( n1 * strideA1 ) );

	// Solve for B12: B12 := L11^-1 * B12 (lower triangular, unit)
	dtrsm( 'left', 'lower', 'no-transpose', 'unit', n1, n2, 1.0, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( n1 * strideA2 ) );

	// Update B22 := B22 - B21 * B12 (Schur complement)
	dgemm( 'no-transpose', 'no-transpose', M - n1, n2, n1, -1.0, A, strideA1, strideA2, offsetA + ( n1 * strideA1 ), A, strideA1, strideA2, offsetA + ( n1 * strideA2 ), 1.0, A, strideA1, strideA2, offsetA + ( n1 * strideA1 ) + ( n1 * strideA2 ) );

	// Factor B22 ((M-n1) x n2), recursive call
	dlaorhr_col_getrfnp2( M - n1, n2, A, strideA1, strideA2, offsetA + ( n1 * strideA1 ) + ( n1 * strideA2 ), D, strideD, offsetD + ( n1 * strideD ) );

	return 0;
}


// EXPORTS //

export default dlaorhr_col_getrfnp2;
