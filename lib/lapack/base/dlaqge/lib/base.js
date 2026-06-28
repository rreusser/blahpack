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

import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var THRESH = 0.1;
var SMALL = dlamch( 'safe-minimum' ) / dlamch( 'epsilon' );
var LARGE = 1.0 / SMALL;


// MAIN //

/**
* Equilibrates a general M-by-N matrix A using the row and column scaling.
* factors in the vectors R and C.
*
* Returns 'N' (no equilibration), 'R' (row only), 'C' (column only),
* or 'B' (both row and column).
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} A - input/output M-by-N matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} r - row scale factors, length M
* @param {integer} strideR - stride for r
* @param {NonNegativeInteger} offsetR - index offset for r
* @param {Float64Array} c - column scale factors, length N
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - index offset for c
* @param {number} rowcnd - ratio of smallest to largest R(i)
* @param {number} colcnd - ratio of smallest to largest C(i)
* @param {number} amax - absolute value of largest matrix entry
* @returns {string} equed - equilibration type: 'N', 'R', 'C', or 'B'
*/
function dlaqge( M, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax ) {
	var cj;
	var da;
	var i;
	var j;

	// Quick return if possible
	if ( M <= 0 || N <= 0 ) {
		return 'none';
	}

	if ( rowcnd >= THRESH && amax >= SMALL && amax <= LARGE ) {
		// No row scaling
		if ( colcnd >= THRESH ) {
			// No column scaling
			return 'none';
		}
		// Column scaling
		for ( j = 0; j < N; j++ ) {
			cj = c[ offsetC + ( j * strideC ) ];
			da = offsetA + ( j * strideA2 );
			for ( i = 0; i < M; i++ ) {
				A[ da + ( i * strideA1 ) ] = cj * A[ da + ( i * strideA1 ) ];
			}
		}
		return 'column';
	} if ( colcnd >= THRESH ) {
		// Row scaling, no column scaling
		for ( j = 0; j < N; j++ ) {
			da = offsetA + ( j * strideA2 );
			for ( i = 0; i < M; i++ ) {
				A[ da + ( i * strideA1 ) ] = r[ offsetR + ( i * strideR ) ] * A[ da + ( i * strideA1 ) ];
			}
		}
		return 'row';
	}
	// Both row and column scaling
	for ( j = 0; j < N; j++ ) {
		cj = c[ offsetC + ( j * strideC ) ];
		da = offsetA + ( j * strideA2 );
		for ( i = 0; i < M; i++ ) {
			A[ da + ( i * strideA1 ) ] = cj * r[ offsetR + ( i * strideR ) ] * A[ da + ( i * strideA1 ) ];
		}
	}
	return 'both';
}


// EXPORTS //

export default dlaqge;
