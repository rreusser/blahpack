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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zgeru from '../../../../blas/base/zgeru/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var EPS = dlamch( 'precision' );
var SMLNUM = dlamch( 'safe-minimum' ) / EPS;
var MINUS_ONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes an LU factorization with complete pivoting of a general N-by-N complex matrix.
*
* The factorization has the form `A = P * L * U * Q`, where P and Q are
* permutation matrices, L is lower triangular with unit diagonal elements,
* and U is upper triangular.
*
* On exit, A contains the LU factors. `IPIV[i]` and `JPIV[i]` are the row and
* column pivots applied at step i. INFO > 0 indicates that `U(INFO,INFO)` is
* likely to produce overflow when used in zgesc2.
*
* IPIV and JPIV are 0-based in this implementation.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - N-by-N complex matrix (overwritten with L and U)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Int32Array} IPIV - row pivot indices (length N), 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Int32Array} JPIV - column pivot indices (length N), 0-based
* @param {integer} strideJPIV - stride for JPIV
* @param {NonNegativeInteger} offsetJPIV - starting index for JPIV
* @returns {integer} info - 0 if successful, >0 if U(info,info) is small
*/
function zgetc2( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV ) {
	var xmax;
	var smin;
	var info;
	var ipv;
	var jpv;
	var sa1;
	var sa2;
	var oA;
	var Av;
	var pa;
	var ip;
	var jp;
	var ia;
	var ii;
	var i;
	var j;

	info = 0;

	// Quick return
	if ( N === 0 ) {
		return info;
	}

	// Reinterpret Complex128Array as Float64Array view
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;

	// Handle N = 1
	if ( N === 1 ) {
		IPIV[ offsetIPIV ] = 0;
		JPIV[ offsetJPIV ] = 0;
		if ( cmplx.absAt( Av, oA ) < SMLNUM ) {
			info = 1;
			Av[ oA ] = SMLNUM;
			Av[ oA + 1 ] = 0.0;
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
				ia = oA + ( ip * sa1 ) + ( jp * sa2 );
				pa = cmplx.absAt( Av, ia );
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
			zswap( N, A, strideA2, offsetA + ( ipv * strideA1 ), A, strideA2, offsetA + ( i * strideA1 ) );
		}
		IPIV[ offsetIPIV + ( i * strideIPIV ) ] = ipv;

		// Column swap
		if ( jpv !== i ) {
			zswap( N, A, strideA1, offsetA + ( jpv * strideA2 ), A, strideA1, offsetA + ( i * strideA2 ) );
		}
		JPIV[ offsetJPIV + ( i * strideJPIV ) ] = jpv;

		// Check for near-singularity
		ii = oA + ( i * sa1 ) + ( i * sa2 );
		if ( cmplx.absAt( Av, ii ) < smin ) {
			info = i + 1; // 1-based INFO
			Av[ ii ] = smin;
			Av[ ii + 1 ] = 0.0;
		}

		// Compute multipliers: A(j,i) = A(j,i) / A(i,i)
		for ( j = i + 1; j < N; j++ ) {
			ia = oA + ( j * sa1 ) + ( i * sa2 );
			cmplx.divAt( Av, ia, Av, ia, Av, ii );
		}

		// Rank-1 update: A(i+1:N-1, i+1:N-1) -= A(i+1:N-1, i) * A(i, i+1:N-1)
		zgeru( N - i - 1, N - i - 1, MINUS_ONE, A, strideA1, offsetA + ( ( i + 1 ) * strideA1 ) + ( i * strideA2 ), A, strideA2, offsetA + ( i * strideA1 ) + ( ( i + 1 ) * strideA2 ), A, strideA1, strideA2, offsetA + ( ( i + 1 ) * strideA1 ) + ( ( i + 1 ) * strideA2 ));
	}

	// Check the last diagonal element
	ii = oA + ( ( N - 1 ) * sa1 ) + ( ( N - 1 ) * sa2 );
	if ( cmplx.absAt( Av, ii ) < smin ) {
		info = N; // 1-based INFO
		Av[ ii ] = smin;
		Av[ ii + 1 ] = 0.0;
	}

	// Set last pivot entries (0-based identity)
	IPIV[ offsetIPIV + ( ( N - 1 ) * strideIPIV ) ] = N - 1;
	JPIV[ offsetJPIV + ( ( N - 1 ) * strideJPIV ) ] = N - 1;

	return info;
}


// EXPORTS //

export default zgetc2;
