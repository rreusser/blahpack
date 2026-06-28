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

import dorgqr from '../../dorgqr/lib/base.js';
import dorgql from '../../dorgql/lib/base.js';


// MAIN //

/**
* Generates an orthogonal matrix Q which is defined as the product of N-1.
* elementary reflectors of order N, as returned by DSYTRD.
*
* ## Notes
*
* -   If UPLO = 'U', Q is defined as a product of reflectors:
* `Q = H(n-1)*...*H(2) * H(1)`
*
* -   If UPLO = 'L', Q is defined as a product of reflectors:
* `Q = H(1)*H(2)*... * H(n-1)`
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle was used in DSYTRD (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix Q
* @param {Float64Array} A - on entry, contains the reflectors from DSYTRD; on exit, the orthogonal matrix Q
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} TAU - scalar factors of the reflectors from DSYTRD (length N-1)
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (0 = success)
*/
function dorgtr( uplo, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var upper;
	var pa;
	var i;
	var j;

	upper = ( uplo === 'upper' );

	// Quick return if possible...
	if ( N === 0 ) {
		return 0;
	}

	if ( upper ) {
		// Q was determined by DSYTRD as a product of N-1 elementary reflectors
		// Stored in the upper triangle of A. The reflectors are in columns
		// 2..N of the upper triangle. We need to shift them left by one column
		// So they occupy columns 1..N-1, then call dorgql on the (N-1)x(N-1)
		// Leading submatrix.

		// Shift reflectors: for j = 1..N-1, copy column j+1 (rows 1..j-1) into column j
		for ( j = 0; j < N - 1; j++ ) {
			for ( i = 0; i < j; i++ ) {
				// A(i, j) = A(i, j+1)
				A[ offsetA + (i * strideA1) + (j * strideA2) ] = A[ offsetA + (i * strideA1) + (( j + 1 ) * strideA2) ];
			}
			// Set A(N-1, j) = 0
			A[ offsetA + (( N - 1 ) * strideA1) + (j * strideA2) ] = 0.0;
		}
		// Set last column: A(i, N-1) = 0 for i = 0..N-2, A(N-1, N-1) = 1
		for ( i = 0; i < N - 1; i++ ) {
			A[ offsetA + (i * strideA1) + (( N - 1 ) * strideA2) ] = 0.0;
		}
		A[ offsetA + (( N - 1 ) * strideA1) + (( N - 1 ) * strideA2) ] = 1.0;

		// Generate Q by calling dorgql on the (N-1)x(N-1) leading submatrix
		if ( N - 1 > 0 ) {
			dorgql(N - 1, N - 1, N - 1, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
		}
	} else {
		// Q was determined by DSYTRD as a product of N-1 elementary reflectors
		// Stored in the lower triangle of A. The reflectors are in columns
		// 1..N-1 of the lower triangle. We need to shift them right by one
		// Column so they occupy columns 2..N, then call dorgqr on the
		// (N-1)x(N-1) trailing submatrix starting at (1,1) (0-based).

		// Shift reflectors: for j = N-1 downto 1, copy column j-1 (rows j+1..N-1) into column j
		for ( j = N - 1; j >= 1; j-- ) {
			// Set A(0, j) = 0
			A[ offsetA + (j * strideA2) ] = 0.0;
			for ( i = j + 1; i < N; i++ ) {
				// A(i, j) = A(i, j-1)
				A[ offsetA + (i * strideA1) + (j * strideA2) ] = A[ offsetA + (i * strideA1) + (( j - 1 ) * strideA2) ];
			}
		}
		// Set first column: A(0, 0) = 1, A(i, 0) = 0 for i = 1..N-1
		A[ offsetA ] = 1.0;
		for ( i = 1; i < N; i++ ) {
			A[ offsetA + (i * strideA1) ] = 0.0;
		}

		// Generate Q by calling dorgqr on the (N-1)x(N-1) trailing submatrix
		// Starting at position (1, 1) (0-based)
		if ( N > 1 ) {
			pa = offsetA + strideA1 + strideA2; // A(1, 1) in 0-based
			dorgqr(N - 1, N - 1, N - 1, A, strideA1, strideA2, pa, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
		}
	}
	return 0;
}


// EXPORTS //

export default dorgtr;
