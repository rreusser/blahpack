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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zscal from './../../../../blas/base/zscal/lib/base.js';
import ztrsm from './../../../../blas/base/ztrsm/lib/base.js';
import zlaunhr_col_getrfnp from './../../zlaunhr_col_getrfnp/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CNEG_ONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Reconstructs the Householder vectors and block reflectors of a complex compact-WY TSQR factorization.
*
* Given an M-by-N complex matrix `Q_in` with orthonormal columns (stored in
* `A`), computes the Householder vectors `V` (overwriting `A`), the block
* reflector matrices `T`, and the real diagonal sign vector `D` (entries
* `±1`) such that `Q_in = (I - V * T * V^H) * diag(D)`. The algorithm
* relies on a modified LU factorization without pivoting
* (`zlaunhr_col_getrfnp`) of the top N-by-N block of `A` and then forms
* `T` block by block of width `nb`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {PositiveInteger} nb - block size used to build `T`
* @param {Complex128Array} A - input matrix with orthonormal columns; on exit, contains the Householder vectors `V`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} T - output block reflector matrix, `min(nb,N)`-by-`N`
* @param {integer} strideT1 - stride of the first dimension of `T` (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of `T` (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for `T` (in complex elements)
* @param {Float64Array} d - real output diagonal sign vector, length `N`
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @returns {integer} status code (0 = success)
*/
function zunhr_col( M, N, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, d, strideD, offsetD ) {
	var nplusone;
	var dScratch;
	var jbtemp1;
	var jbtemp2;
	var iBase;
	var jnb;
	var Tv;
	var jb;
	var oA;
	var oT;
	var i;
	var j;

	// Quick return
	if ( Math.min( M, N ) === 0 ) {
		return 0;
	}

	// The underlying `zlaunhr_col_getrfnp` kernel expects a Complex128Array
	// For the sign vector. Allocate a contiguous scratch and copy back the
	// Real parts into the caller's real `d` vector on return.
	dScratch = new Complex128Array( N );

	// Factor the top N-by-N block of `A` via a modified LU factorization

	// Without pivoting. On return, the strict lower triangle holds `L`,

	// The upper triangle (including the diagonal) holds `U`, and the

	// Scratch `dScratch` holds the ±1 diagonal signs (imaginary part zero).
	zlaunhr_col_getrfnp( N, N, A, strideA1, strideA2, offsetA, dScratch, 1, 0 );

	// Copy the real part of the scratch sign vector into the caller's `d`.
	for ( j = 0; j < N; j += 1 ) {
		d[ offsetD + ( j * strideD ) ] = dScratch.get( j ).re;
	}

	if ( M > N ) {
		// A(N+1:M,1:N) := A(N+1:M,1:N) * U^{-1}
		ztrsm( 'right', 'upper', 'no-transpose', 'non-unit', M - N, N, CONE, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( N * strideA1 ) );
	}

	// Float64 view into `T` for efficient element-wise zeroing of the
	// Strict sub-panel triangles (each complex element = two Float64s).
	Tv = reinterpret( T, 0 );

	// Build T block-by-block. Each panel has width `jnb = min(N-jb, nb)`

	// (Fortran 1-based jb stepping by nb).
	nplusone = N + 1;
	for ( jb = 1; jb <= N; jb += nb ) {
		jnb = Math.min( nplusone - jb, nb );
		jbtemp1 = jb - 1;

		// Copy the upper triangle of the diagonal block A(jb:jb+jnb-1, jb:jb+jnb-1)

		// Into T(1:j-jbtemp1, j) for each column j in the panel.
		for ( j = jb; j <= ( jb + jnb ) - 1; j += 1 ) {
			// zcopy( j - jbtemp1, A(jb,j), 1, T(1,j), 1 )
			oA = offsetA + ( ( jb - 1 ) * strideA1 ) + ( ( j - 1 ) * strideA2 );
			oT = offsetT + ( ( j - 1 ) * strideT2 );
			zcopy( j - jbtemp1, A, strideA1, oA, T, strideT1, oT );
		}

		// For columns where D(j) == 1, negate T(1:j-jbtemp1, j) (scaling
		// By the real scalar `-1` via zscal with a real-valued Complex128).
		for ( j = jb; j <= ( jb + jnb ) - 1; j += 1 ) {
			if ( d[ offsetD + ( ( j - 1 ) * strideD ) ] === 1.0 ) {
				oT = offsetT + ( ( j - 1 ) * strideT2 );
				zscal( j - jbtemp1, CNEG_ONE, T, strideT1, oT );
			}
		}

		// Zero out the strict sub-"triangle" of each T panel column
		// (rows i = j - jbtemp2 .. nb). jbtemp2 = jb - 2 so the first
		// Row zeroed in column j is j - jb + 2. Use the reinterpreted
		// Float64 view to clear both real and imaginary parts.
		jbtemp2 = jb - 2;
		for ( j = jb; j <= ( jb + jnb ) - 2; j += 1 ) {
			for ( i = j - jbtemp2; i <= nb; i += 1 ) {
				iBase = 2 * ( offsetT + ( ( i - 1 ) * strideT1 ) + ( ( j - 1 ) * strideT2 ) );
				Tv[ iBase ] = 0.0;
				Tv[ iBase + 1 ] = 0.0;
			}
		}

		// T(1:jnb, jb:jb+jnb-1) := T(1:jnb, jb:jb+jnb-1) * A(jb:jb+jnb-1, jb:jb+jnb-1)^{-H}
		oA = offsetA + ( ( jb - 1 ) * strideA1 ) + ( ( jb - 1 ) * strideA2 );
		oT = offsetT + ( ( jb - 1 ) * strideT2 );
		ztrsm( 'right', 'lower', 'conjugate-transpose', 'unit', jnb, jnb, CONE, A, strideA1, strideA2, oA, T, strideT1, strideT2, oT );
	}

	return 0;
}


// EXPORTS //

export default zunhr_col;
