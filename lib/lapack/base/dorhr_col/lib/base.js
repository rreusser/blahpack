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

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dtrsm from './../../../../blas/base/dtrsm/lib/base.js';
import dlaorhr_col_getrfnp from './../../dlaorhr_col_getrfnp/lib/base.js';


// MAIN //

/**
* Reconstructs the Householder vectors and block reflectors of a compact-WY TSQR factorization.
*
* Given an M-by-N matrix `Q_in` with orthonormal columns (stored in `A`),
* computes the Householder vectors `V` (overwriting `A`), the block
* reflector matrices `T`, and the diagonal sign vector `D` (of `±1.0`)
* such that `Q_in = (I - V * T * V^T) * diag(D)`. The algorithm relies
* on a modified LU factorization without pivoting (`dlaorhr_col_getrfnp`)
* of the top N-by-N block of `A` and then forms `T` block by block of
* width `nb`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {PositiveInteger} nb - block size used to build `T`
* @param {Float64Array} A - input matrix with orthonormal columns; on exit, contains the Householder vectors `V`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - output block reflector matrix, `min(nb,N)`-by-`N`
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} d - output diagonal sign vector, length `N`
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @returns {integer} status code (0 = success)
*/
function dorhr_col( M, N, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, d, strideD, offsetD ) {
	var nplusone;
	var jbtemp1;
	var jbtemp2;
	var jnb;
	var jb;
	var oA;
	var oT;
	var i;
	var j;

	// Quick return
	if ( Math.min( M, N ) === 0 ) {
		return 0;
	}

	// On input, A(1:N,1:N) stores the orthonormal top block of Q_in.
	// Factor it as (I - Y*Yhat^T) = diag(D) * L * U (modified LU without
	// pivoting), overwriting A(1:N,1:N) with L (strict lower) and U
	// (upper including diagonal); D holds the diagonal signs.
	dlaorhr_col_getrfnp( N, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD );

	if ( M > N ) {
		// A(N+1:M,1:N) := A(N+1:M,1:N) * U^{-1}
		dtrsm( 'right', 'upper', 'no-transpose', 'non-unit', M - N, N, 1.0, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( N * strideA1 ) );
	}

	// Build T block-by-block. Each panel has width `jnb = min(N-jb, nb)`
	// (Fortran 1-based jb stepping by nb).
	nplusone = N + 1;
	for ( jb = 1; jb <= N; jb += nb ) {
		jnb = Math.min( nplusone - jb, nb );
		jbtemp1 = jb - 1;

		// Copy the upper triangle of the diagonal block A(jb:jb+jnb-1, jb:jb+jnb-1)

		// Into T(1:j-jbtemp1, j) for each column j in the panel.
		for ( j = jb; j <= ( jb + jnb ) - 1; j += 1 ) {
			// dcopy( j - jbtemp1, A(jb,j), 1, T(1,j), 1 )
			oA = offsetA + ( ( jb - 1 ) * strideA1 ) + ( ( j - 1 ) * strideA2 );
			oT = offsetT + ( ( j - 1 ) * strideT2 );
			dcopy( j - jbtemp1, A, strideA1, oA, T, strideT1, oT );
		}

		// For columns where D(j) == 1, negate T(1:j-jbtemp1, j).
		for ( j = jb; j <= ( jb + jnb ) - 1; j += 1 ) {
			if ( d[ offsetD + ( ( j - 1 ) * strideD ) ] === 1.0 ) {
				oT = offsetT + ( ( j - 1 ) * strideT2 );
				dscal( j - jbtemp1, -1.0, T, strideT1, oT );
			}
		}

		// Zero out the strict sub-"triangle" of each T panel column
		// (rows i = j - jbtemp2 .. nb). jbtemp2 = jb - 2 so the first
		// Row zeroed in column j is j - jb + 2.
		jbtemp2 = jb - 2;
		for ( j = jb; j <= ( jb + jnb ) - 2; j += 1 ) {
			for ( i = j - jbtemp2; i <= nb; i += 1 ) {
				T[ offsetT + ( ( i - 1 ) * strideT1 ) + ( ( j - 1 ) * strideT2 ) ] = 0.0;
			}
		}

		// T(1:jnb, jb:jb+jnb-1) := T(1:jnb, jb:jb+jnb-1) * A(jb:jb+jnb-1, jb:jb+jnb-1)^{-T}
		oA = offsetA + ( ( jb - 1 ) * strideA1 ) + ( ( jb - 1 ) * strideA2 );
		oT = offsetT + ( ( jb - 1 ) * strideT2 );
		dtrsm( 'right', 'lower', 'transpose', 'unit', jnb, jnb, 1.0, A, strideA1, strideA2, oA, T, strideT1, strideT2, oT );
	}

	return 0;
}


// EXPORTS //

export default dorhr_col;
