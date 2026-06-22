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


// VARIABLES //

var fround = Math.fround;

// Largest finite IEEE 754 single precision value = slamch('O') = (1 - 2^-24) * 2^128.
var RMAX = 3.4028234663852886e38;


// MAIN //

/**
* Converts a complex double precision matrix to a complex single precision matrix.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} SA - output matrix (single precision simulated via Math.fround)
* @param {integer} strideSA1 - stride of the first dimension of `SA` (in complex elements)
* @param {integer} strideSA2 - stride of the second dimension of `SA` (in complex elements)
* @param {NonNegativeInteger} offsetSA - starting index for `SA` (in complex elements)
* @returns {integer} `INFO` (0 = success, 1 = an entry of `A` exceeds single precision overflow)
*/
function zlag2c( M, N, A, strideA1, strideA2, offsetA, SA, strideSA1, strideSA2, offsetSA ) {
	var sa1;
	var sa2;
	var ss1;
	var ss2;
	var Av;
	var Sv;
	var oA;
	var oS;
	var ia;
	var is;
	var re;
	var im;
	var i;
	var j;

	Av = reinterpret( A, 0 );
	Sv = reinterpret( SA, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	ss1 = strideSA1 * 2;
	ss2 = strideSA2 * 2;
	oA = offsetA * 2;
	oS = offsetSA * 2;

	for ( j = 0; j < N; j++ ) {
		ia = oA + ( j * sa2 );
		is = oS + ( j * ss2 );
		for ( i = 0; i < M; i++ ) {
			re = Av[ ia + ( i * sa1 ) ];
			im = Av[ ia + ( i * sa1 ) + 1 ];
			if ( re < -RMAX || re > RMAX || im < -RMAX || im > RMAX ) {
				return 1;
			}
			Sv[ is + ( i * ss1 ) ] = fround( re );
			Sv[ is + ( i * ss1 ) + 1 ] = fround( im );
		}
	}
	return 0;
}


// EXPORTS //

export default zlag2c;
