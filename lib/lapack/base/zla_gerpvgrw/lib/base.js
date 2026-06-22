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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// FUNCTIONS //

/**
* CABS1: `|re(z)| + |im(z)|`.
*
* @private
* @param {Float64Array} v - Float64 view
* @param {integer} idx - index of real part
* @returns {number} CABS1 value
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a complex general matrix.
*
* The "max absolute element" norm is used. If this is much less than 1, the
* stability of the LU factorization of the (equilibrated) matrix A could be
* poor. This also means that the solution X, estimated condition numbers, and
* error bounds could be unreliable.
*
* ## Notes
*
* -   All complex array parameters use complex-element strides/offsets.
*
* @private
* @param {NonNegativeInteger} N - number of rows of the matrices A and AF
* @param {NonNegativeInteger} ncols - number of columns to process
* @param {Complex128Array} A - input matrix A of dimension (N, ncols)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} AF - factored matrix AF of dimension (N, ncols), containing U from `A = P*L*U`
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @returns {number} reciprocal pivot growth factor
*/
function zla_gerpvgrw( N, ncols, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF ) {
	var rpvgrw;
	var umax;
	var amax;
	var tmp;
	var sa1;
	var sa2;
	var sf1;
	var sf2;
	var oA;
	var oF;
	var Av;
	var Fv;
	var ja;
	var jf;
	var i;
	var j;

	Av = reinterpret( A, 0 );
	Fv = reinterpret( AF, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets...
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	sf1 = strideAF1 * 2;
	sf2 = strideAF2 * 2;
	oF = offsetAF * 2;

	rpvgrw = 1.0;
	for ( j = 0; j < ncols; j += 1 ) {
		amax = 0.0;
		umax = 0.0;

		// Compute max CABS1 of column j of A...
		ja = oA + ( j * sa2 );
		for ( i = 0; i < N; i += 1 ) {
			tmp = cabs1( Av, ja + ( i * sa1 ) );
			if ( tmp > amax ) {
				amax = tmp;
			}
		}

		// Compute max CABS1 of column j of upper triangle of AF (rows 0..j)...
		jf = oF + ( j * sf2 );
		for ( i = 0; i <= j; i += 1 ) {
			tmp = cabs1( Fv, jf + ( i * sf1 ) );
			if ( tmp > umax ) {
				umax = tmp;
			}
		}
		if ( umax !== 0.0 ) {
			rpvgrw = Math.min( amax / umax, rpvgrw );
		}
	}
	return rpvgrw;
}


// EXPORTS //

export default zla_gerpvgrw;
