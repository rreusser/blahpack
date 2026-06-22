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
* Equilibrates a symmetric matrix A in packed storage using the scaling factors in the vector S.
*
* This sets `A(i,j) = S(i) * A(i,j) * S(j)` when the matrix is poorly scaled.
*
* Returns the equilibration type:
*
* -   `'none'` - no equilibration was needed
* -   `'yes'` - equilibration was done
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - input/output packed symmetric matrix, length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} S - scaling factors, length N
* @param {integer} strideS - stride for S
* @param {NonNegativeInteger} offsetS - index offset for S
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @returns {string} equed - 'none' or 'yes'
*/
function dlaqsp( uplo, N, AP, strideAP, offsetAP, S, strideS, offsetS, scond, amax ) {
	var cj;
	var jc;
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
		// Upper triangle of A is stored in packed format.
		// Column j contains rows 1..j, starting at position jc.
		jc = 0;
		for ( j = 0; j < N; j++ ) {
			cj = S[ offsetS + ( j * strideS ) ];
			for ( i = 0; i <= j; i++ ) {
				AP[ offsetAP + ( ( jc + i ) * strideAP ) ] = cj * S[ offsetS + ( i * strideS ) ] * AP[ offsetAP + ( ( jc + i ) * strideAP ) ];
			}
			jc += j + 1;
		}
	} else {
		// Lower triangle of A is stored in packed format.
		// Column j contains rows j..N-1, starting at position jc.
		jc = 0;
		for ( j = 0; j < N; j++ ) {
			cj = S[ offsetS + ( j * strideS ) ];
			for ( i = j; i < N; i++ ) {
				AP[ offsetAP + ( ( jc + i - j ) * strideAP ) ] = cj * S[ offsetS + ( i * strideS ) ] * AP[ offsetAP + ( ( jc + i - j ) * strideAP ) ];
			}
			jc += N - j;
		}
	}

	return 'yes';
}


// EXPORTS //

export default dlaqsp;
