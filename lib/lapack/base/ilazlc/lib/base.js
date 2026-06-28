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

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Scans a complex matrix for its last non-zero column.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @returns {integer} 0-based index of last non-zero column, or -1 if none
*/
function ilazlc( M, N, A, strideA1, strideA2, offsetA ) {
	var sa1;
	var sa2;
	var Av;
	var oA;
	var re;
	var im;
	var i;
	var j;

	if ( N === 0 ) {
		return -1;
	}

	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	// Quick test for the common case where one corner is non-zero.
	re = Av[ oA + (0 * sa1) + (( N - 1 ) * sa2) ];
	im = Av[ oA + (0 * sa1) + (( N - 1 ) * sa2) + 1 ];
	if ( re !== 0.0 || im !== 0.0 ) {
		return N - 1;
	}
	re = Av[ oA + (( M - 1 ) * sa1) + (( N - 1 ) * sa2) ];
	im = Av[ oA + (( M - 1 ) * sa1) + (( N - 1 ) * sa2) + 1 ];
	if ( re !== 0.0 || im !== 0.0 ) {
		return N - 1;
	}

	// Scan each column from the end, returning with the first non-zero.
	for ( j = N - 1; j >= 0; j-- ) {
		for ( i = 0; i < M; i++ ) {
			re = Av[ oA + (i * sa1) + (j * sa2) ];
			im = Av[ oA + (i * sa1) + (j * sa2) + 1 ];
			if ( re !== 0.0 || im !== 0.0 ) {
				return j;
			}
		}
	}
	return -1;
}


// EXPORTS //

export default ilazlc;
