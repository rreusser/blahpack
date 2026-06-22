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
import dger from '../../../../blas/base/dger/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'precision' );
var SMLNUM = dlamch( 'safe-minimum' ) / EPS;


// MAIN //

/**
* Performs LU factorization with complete pivoting of a general N-by-N matrix.
*
* On exit, A contains the LU factors. IPIV(i) and JPIV(i) are the row and
* column pivots applied at step i. INFO > 0 indicates that U(INFO,INFO) is
* likely to produce overflow when used in dgesc2.
*
* IPIV and JPIV are 0-based in this implementation.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - N-by-N matrix (overwritten with L and U)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Int32Array} IPIV - row pivot indices (length N), 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Int32Array} JPIV - column pivot indices (length N), 0-based
* @param {integer} strideJPIV - stride for JPIV
* @param {NonNegativeInteger} offsetJPIV - starting index for JPIV
* @returns {integer} info - 0 if successful, >0 if U(info,info) is small
*/
function dgetc2( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV ) {
	var xmax;
	var smin;
	var info;
	var ipv;
	var jpv;
	var pa;
	var ip;
	var jp;
	var i;
	var j;

	info = 0;

	// Quick return
	if ( N === 0 ) {
		return info;
	}

	// Handle N = 1
	if ( N === 1 ) {
		IPIV[ offsetIPIV ] = 0;
		JPIV[ offsetJPIV ] = 0;
		if ( Math.abs( A[ offsetA ] ) < SMLNUM ) {
			info = 1;
			A[ offsetA ] = SMLNUM;
		}
		return info;
	}

	smin = 0.0;
	for ( i = 0; i < N - 1; i++ ) {
		// Find the element with the largest absolute value (complete pivoting)
		xmax = 0.0;
		ipv = i;
		jpv = i;
		for ( ip = i; ip < N; ip++ ) {
			for ( jp = i; jp < N; jp++ ) {
				pa = Math.abs( A[ offsetA + ( ip * strideA1 ) + ( jp * strideA2 ) ] );
				if ( pa >= xmax ) {
					xmax = pa;
					ipv = ip;
					jpv = jp;
				}
			}
		}

		if ( i === 0 ) {
			smin = Math.max( EPS * xmax, SMLNUM );
		}

		// Row swap
		if ( ipv !== i ) {
			dswap( N, A, strideA2, offsetA + ( ipv * strideA1 ), A, strideA2, offsetA + ( i * strideA1 ) );
		}
		IPIV[ offsetIPIV + ( i * strideIPIV ) ] = ipv;

		// Column swap
		if ( jpv !== i ) {
			dswap( N, A, strideA1, offsetA + ( jpv * strideA2 ), A, strideA1, offsetA + ( i * strideA2 ) );
		}
		JPIV[ offsetJPIV + ( i * strideJPIV ) ] = jpv;

		// Check for near-singularity
		if ( Math.abs( A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] ) < smin ) {
			info = i + 1; // 1-based INFO
			A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] = smin;
		}

		// Compute multipliers
		for ( j = i + 1; j < N; j++ ) {
			A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] /= A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ];
		}

		// Rank-1 update: A(i+1:N-1, i+1:N-1) -= A(i+1:N-1, i) * A(i, i+1:N-1)
		dger(N - i - 1, N - i - 1, -1.0, A, strideA1, offsetA + ( ( i + 1 ) * strideA1 ) + ( i * strideA2 ),        // x = column vector A(i+1:, i)
			A, strideA2, offsetA + ( i * strideA1 ) + ( ( i + 1 ) * strideA2 ),         // y = row vector A(i, i+1:)
			A, strideA1, strideA2, offsetA + ( ( i + 1 ) * strideA1 ) + ( ( i + 1 ) * strideA2 ) // A submatrix
		);
	}

	// Check the last diagonal element
	if ( Math.abs( A[ offsetA + ( ( N - 1 ) * strideA1 ) + ( ( N - 1 ) * strideA2 ) ] ) < smin ) {
		info = N; // 1-based INFO
		A[ offsetA + ( ( N - 1 ) * strideA1 ) + ( ( N - 1 ) * strideA2 ) ] = smin;
	}

	// Set last pivot entries (0-based identity)
	IPIV[ offsetIPIV + ( ( N - 1 ) * strideIPIV ) ] = N - 1;
	JPIV[ offsetJPIV + ( ( N - 1 ) * strideJPIV ) ] = N - 1;

	return info;
}


// EXPORTS //

export default dgetc2;
