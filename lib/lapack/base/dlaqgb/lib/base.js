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


// VARIABLES //

var THRESH = 0.1;
var SMALL = dlamch( 'safe-minimum' ) / dlamch( 'epsilon' );
var LARGE = 1.0 / SMALL;


// FUNCTIONS //

/**
* Returns the maximum of two integers.
*
* @private
* @param {integer} a - first value
* @param {integer} b - second value
* @returns {integer} maximum
*/
function max( a, b ) {
	return ( a > b ) ? a : b;
}

/**
* Returns the minimum of two integers.
*
* @private
* @param {integer} a - first value
* @param {integer} b - second value
* @returns {integer} minimum
*/
function min( a, b ) {
	return ( a < b ) ? a : b;
}


// MAIN //

/**
* Equilibrates a general M-by-N band matrix A with KL sub-diagonals and KU super-diagonals using the row and column scaling factors in the vectors R and C.
*
* Returns 'none' (no equilibration), 'row' (row only), 'column' (column only),
* or 'both' (both row and column).
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} kl - number of sub-diagonals within the band of A
* @param {NonNegativeInteger} ku - number of super-diagonals within the band of A
* @param {Float64Array} AB - input/output band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - index offset for AB
* @param {Float64Array} r - row scale factors, length M
* @param {integer} strideR - stride for r
* @param {NonNegativeInteger} offsetR - index offset for r
* @param {Float64Array} c - column scale factors, length N
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - index offset for c
* @param {number} rowcnd - ratio of smallest to largest R(i)
* @param {number} colcnd - ratio of smallest to largest C(i)
* @param {number} amax - absolute value of largest matrix entry
* @returns {string} equed - equilibration type: 'none', 'row', 'column', or 'both'
*/
function dlaqgb( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax ) {
	var istart;
	var iend;
	var dab;
	var cj;
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
			istart = max( 0, j - ku );
			iend = min( M - 1, j + kl );
			for ( i = istart; i <= iend; i++ ) {
				dab = offsetAB + ( ( ku + i - j ) * strideAB1 ) + ( j * strideAB2 );
				AB[ dab ] *= cj;
			}
		}
		return 'column';
	}
	if ( colcnd >= THRESH ) {
		// Row scaling, no column scaling
		for ( j = 0; j < N; j++ ) {
			istart = max( 0, j - ku );
			iend = min( M - 1, j + kl );
			for ( i = istart; i <= iend; i++ ) {
				dab = offsetAB + ( ( ku + i - j ) * strideAB1 ) + ( j * strideAB2 );
				AB[ dab ] *= r[ offsetR + ( i * strideR ) ];
			}
		}
		return 'row';
	}
	// Both row and column scaling
	for ( j = 0; j < N; j++ ) {
		cj = c[ offsetC + ( j * strideC ) ];
		istart = max( 0, j - ku );
		iend = min( M - 1, j + kl );
		for ( i = istart; i <= iend; i++ ) {
			dab = offsetAB + ( ( ku + i - j ) * strideAB1 ) + ( j * strideAB2 );
			AB[ dab ] *= cj * r[ offsetR + ( i * strideR ) ];
		}
	}
	return 'both';
}


// EXPORTS //

export default dlaqgb;
