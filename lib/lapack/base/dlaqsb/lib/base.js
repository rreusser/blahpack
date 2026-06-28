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
* Equilibrates a symmetric band matrix using the scaling factors in the vector S.
*
* This sets `AB(i,j) = S(i) * AB(i,j) * S(j)` when the matrix is poorly scaled.
*
* Returns the equilibration type:
*
* -   `'none'` - no equilibration was needed
* -   `'yes'` - equilibration was done
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super-diagonals (upper) or sub-diagonals (lower)
* @param {Float64Array} AB - input/output band matrix, dimension (LDAB, N)
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} S - scaling factors, length N
* @param {integer} strideS - stride for `S`
* @param {NonNegativeInteger} offsetS - index offset for `S`
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @returns {string} equed - `'none'` or `'yes'`
*/
function dlaqsb( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, S, strideS, offsetS, scond, amax ) {
	var cj;
	var i;
	var j;

	// Quick return if possible:
	if ( N <= 0 ) {
		return 'none';
	}

	// Check whether equilibration is needed:
	if ( scond >= THRESH && amax >= SMALL && amax <= LARGE ) {
		return 'none';
	}

	// Equilibrate the matrix:
	if ( uplo === 'upper' ) {
		// Upper triangle of A is stored in band format.
		// AB(KD+1+i-j, j) = A(i,j) for max(1, j-KD) <= i <= j (1-based)
		// With 0-based: AB[offsetAB + (kd+i-j)*strideAB1 + j*strideAB2]
		for ( j = 0; j < N; j++ ) {
			cj = S[ offsetS + ( j * strideS ) ];
			for ( i = max( 0, j - kd ); i <= j; i++ ) {
				AB[ offsetAB + ( ( kd + i - j ) * strideAB1 ) + ( j * strideAB2 ) ] = cj * S[ offsetS + ( i * strideS ) ] * AB[ offsetAB + ( ( kd + i - j ) * strideAB1 ) + ( j * strideAB2 ) ];
			}
		}
	} else {
		// Lower triangle of A is stored in band format.
		// AB(1+i-j, j) = A(i,j) for j <= i <= min(N, j+KD) (1-based)
		// With 0-based: AB[offsetAB + (i-j)*strideAB1 + j*strideAB2]
		for ( j = 0; j < N; j++ ) {
			cj = S[ offsetS + ( j * strideS ) ];
			for ( i = j; i <= min( N - 1, j + kd ); i++ ) {
				AB[ offsetAB + ( ( i - j ) * strideAB1 ) + ( j * strideAB2 ) ] = cj * S[ offsetS + ( i * strideS ) ] * AB[ offsetAB + ( ( i - j ) * strideAB1 ) + ( j * strideAB2 ) ];
			}
		}
	}

	return 'yes';
}

/**
* Returns the maximum of two integers.
*
* @private
* @param {integer} a - first value
* @param {integer} b - second value
* @returns {integer} maximum value
*/
function max( a, b ) {
	if ( a > b ) {
		return a;
	}
	return b;
}

/**
* Returns the minimum of two integers.
*
* @private
* @param {integer} a - first value
* @param {integer} b - second value
* @returns {integer} minimum value
*/
function min( a, b ) {
	if ( a < b ) {
		return a;
	}
	return b;
}


// EXPORTS //

export default dlaqsb;
