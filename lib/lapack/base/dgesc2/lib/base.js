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

import dlamch from '../../dlamch/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import dlaswp from '../../dlaswp/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'precision' );
var SMLNUM = dlamch( 'safe-minimum' ) / EPS;
var BIGNUM = 1.0 / SMLNUM;


// MAIN //

/**
* Solves a system of linear equations A _ X = scale _ RHS with a general.
* N-by-N matrix A using the LU factorization with complete pivoting computed
* by dgetc2.
*
* IPIV and JPIV are 0-based pivot indices from dgetc2.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - LU-factored N-by-N matrix from dgetc2
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} RHS - right-hand side vector (overwritten with solution)
* @param {integer} strideRHS - stride for RHS
* @param {NonNegativeInteger} offsetRHS - starting index for RHS
* @param {Int32Array} IPIV - row pivot indices from dgetc2, 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Int32Array} JPIV - column pivot indices from dgetc2, 0-based
* @param {integer} strideJPIV - stride for JPIV
* @param {NonNegativeInteger} offsetJPIV - starting index for JPIV
* @param {Float64Array} scale - output: scale[0] receives the scaling factor
*/
function dgesc2( N, A, strideA1, strideA2, offsetA, RHS, strideRHS, offsetRHS, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV, scale ) {
	var temp;
	var idx;
	var tmp;
	var i;
	var j;

	// Apply row permutations (forward): swap RHS(i) and RHS(IPIV(i)) for i = 0..N-2
	for ( i = 0; i < N - 1; i++ ) {
		idx = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
		if ( idx !== i ) {
			tmp = RHS[ offsetRHS + ( i * strideRHS ) ];
			RHS[ offsetRHS + ( i * strideRHS ) ] = RHS[ offsetRHS + ( idx * strideRHS ) ];
			RHS[ offsetRHS + ( idx * strideRHS ) ] = tmp;
		}
	}

	// Solve L * x = RHS (unit lower triangular forward substitution)
	for ( i = 0; i < N - 1; i++ ) {
		for ( j = i + 1; j < N; j++ ) {
			RHS[ offsetRHS + ( j * strideRHS ) ] -= A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] * RHS[ offsetRHS + ( i * strideRHS ) ];
		}
	}

	// Scale if needed to avoid overflow in back substitution
	scale[ 0 ] = 1.0;

	i = idamax( N, RHS, strideRHS, offsetRHS );
	if ( 2.0 * SMLNUM * Math.abs( RHS[ offsetRHS + ( i * strideRHS ) ] ) > Math.abs( A[ offsetA + ( ( N - 1 ) * strideA1 ) + ( ( N - 1 ) * strideA2 ) ] ) ) {
		temp = ( 0.5 ) / Math.abs( RHS[ offsetRHS + ( i * strideRHS ) ] );
		dscal( N, temp, RHS, strideRHS, offsetRHS );
		scale[ 0 ] *= temp;
	}

	// Solve U * x = RHS (upper triangular back substitution)
	for ( i = N - 1; i >= 0; i-- ) {
		temp = 1.0 / A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ];
		RHS[ offsetRHS + ( i * strideRHS ) ] *= temp;
		for ( j = i + 1; j < N; j++ ) {
			RHS[ offsetRHS + ( i * strideRHS ) ] -= RHS[ offsetRHS + ( j * strideRHS ) ] * ( A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] * temp );
		}
	}

	// Apply column permutations (reverse): swap RHS(JPIV(i)) and RHS(i) for i = N-2..0
	for ( i = N - 2; i >= 0; i-- ) {
		idx = JPIV[ offsetJPIV + ( i * strideJPIV ) ];
		if ( idx !== i ) {
			tmp = RHS[ offsetRHS + ( i * strideRHS ) ];
			RHS[ offsetRHS + ( i * strideRHS ) ] = RHS[ offsetRHS + ( idx * strideRHS ) ];
			RHS[ offsetRHS + ( idx * strideRHS ) ] = tmp;
		}
	}
}


// EXPORTS //

export default dgesc2;
