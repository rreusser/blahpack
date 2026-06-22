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


// MAIN //

/**
* Equilibrates a symmetric matrix A using the scaling factors in the vector S.
*
* This sets A(i,j) = S(i) _ A(i,j) _ S(j) when the matrix is poorly scaled.
*
* Returns the equilibration type:
* - 'N' - no equilibration was needed
* - 'Y' - equilibration was done
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output N-by-N symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} s - scaling factors, length N
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - index offset for s
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @returns {string} equed - 'N' or 'Y'
*/
function dlaqsy( uplo, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, scond, amax ) {
	var cj;
	var da;
	var i;
	var j;

	// Quick return if possible
	if ( N <= 0 ) {
		return 'none';
	}

	// Check whether equilibration is needed
	if ( scond >= THRESH && amax >= SMALL && amax <= LARGE ) {
		return 'none';
	}

	// Equilibrate the matrix
	if ( uplo === 'upper' ) {
		// Upper triangle
		for ( j = 0; j < N; j++ ) {
			cj = s[ offsetS + ( j * strideS ) ];
			da = offsetA + ( j * strideA2 );
			for ( i = 0; i <= j; i++ ) {
				A[ da + ( i * strideA1 ) ] = cj * s[ offsetS + ( i * strideS ) ] * A[ da + ( i * strideA1 ) ];
			}
		}
	} else {
		// Lower triangle
		for ( j = 0; j < N; j++ ) {
			cj = s[ offsetS + ( j * strideS ) ];
			da = offsetA + ( j * strideA2 );
			for ( i = j; i < N; i++ ) {
				A[ da + ( i * strideA1 ) ] = cj * s[ offsetS + ( i * strideS ) ] * A[ da + ( i * strideA1 ) ];
			}
		}
	}

	return 'yes';
}


// EXPORTS //

export default dlaqsy;
