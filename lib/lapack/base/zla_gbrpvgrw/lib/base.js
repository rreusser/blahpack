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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
var abs = Math.abs;
var max = Math.max;
var min = Math.min;


// FUNCTIONS //

/**
* Computes `CABS1(z) = |re(z)| + |im(z)|`.
*
* @private
* @param {Float64Array} v - interleaved real/imaginary array
* @param {integer} idx - index into the Float64 view (points at real part)
* @returns {number} CABS1 value
*/
function cabs1( v, idx ) {
	return abs( v[ idx ] ) + abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a complex general banded matrix.
*
* The "max absolute element" norm is used. If this is much less than 1, the
* stability of the LU factorization of the (equilibrated) matrix A could be
* poor.
*
* @private
* @param {NonNegativeInteger} N - number of linear equations (order of the matrix)
* @param {NonNegativeInteger} kl - number of subdiagonals within the band of A
* @param {NonNegativeInteger} ku - number of superdiagonals within the band of A
* @param {NonNegativeInteger} ncols - number of columns to process
* @param {Complex128Array} AB - original band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Complex128Array} AFB - LU factored band matrix from zgbtrf
* @param {integer} strideAFB1 - stride of the first dimension of `AFB`
* @param {integer} strideAFB2 - stride of the second dimension of `AFB`
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB`
* @returns {number} reciprocal pivot growth factor
*/
function zla_gbrpvgrw( N, kl, ku, ncols, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB ) {
	var rpvgrw;
	var AFBv;
	var amax;
	var umax;
	var ABv;
	var sa1;
	var sa2;
	var sf1;
	var sf2;
	var oAB;
	var oAF;
	var kd;
	var i;
	var j;

	ABv = reinterpret( AB, 0 );
	AFBv = reinterpret( AFB, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets
	sa1 = strideAB1 * 2;
	sa2 = strideAB2 * 2;
	sf1 = strideAFB1 * 2;
	sf2 = strideAFB2 * 2;
	oAB = offsetAB * 2;
	oAF = offsetAFB * 2;

	rpvgrw = 1.0;
	kd = ku;

	for ( j = 0; j < ncols; j += 1 ) {
		amax = 0.0;
		umax = 0.0;

		// Scan original band matrix column j for max CABS1 element
		for ( i = max( j - ku, 0 ); i < min( j + kl + 1, N ); i += 1 ) {
			amax = max( cabs1( ABv, oAB + ( ( kd + i - j ) * sa1 ) + ( j * sa2 ) ), amax );
		}

		// Scan U factor column j for max CABS1 element
		for ( i = max( j - ku, 0 ); i <= j; i += 1 ) {
			umax = max( cabs1( AFBv, oAF + ( ( kd + i - j ) * sf1 ) + ( j * sf2 ) ), umax );
		}
		if ( umax !== 0.0 ) {
			rpvgrw = min( amax / umax, rpvgrw );
		}
	}
	return rpvgrw;
}


// EXPORTS //

export default zla_gbrpvgrw;
