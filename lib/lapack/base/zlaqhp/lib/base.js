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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var THRESH = 0.1;
var SMALL = dlamch( 'safe-minimum' ) / dlamch( 'epsilon' );
var LARGE = 1.0 / SMALL;


// MAIN //

/**
* Equilibrates a Hermitian matrix A in packed storage using the scaling factors in the vector S.
*
* This sets `A(i,j) = S(i) * A(i,j) * S(j)` when the matrix is poorly scaled.
* Diagonal elements are forced real: `A(j,j) = S(j)^2 * real(A(j,j))`.
*
* Returns the equilibration type:
*
* -   `'none'` - no equilibration was needed
* -   `'yes'` - equilibration was done
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - input/output packed Hermitian matrix, length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Float64Array} S - scaling factors, length N
* @param {integer} strideS - stride for S
* @param {NonNegativeInteger} offsetS - index offset for S
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @returns {string} equed - 'none' or 'yes'
*/
function zlaqhp( uplo, N, AP, strideAP, offsetAP, S, strideS, offsetS, scond, amax ) {
	var sAP;
	var Av;
	var oA;
	var cj;
	var si;
	var jc;
	var re;
	var im;
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

	// Get Float64 view of the Complex128Array:
	Av = reinterpret( AP, 0 );
	sAP = strideAP * 2;
	oA = offsetAP * 2;

	// Equilibrate the matrix:
	if ( uplo === 'upper' ) {
		// Upper triangle of A is stored in packed format.
		// Column j contains rows 0..j, starting at position jc.
		jc = 0;
		for ( j = 0; j < N; j++ ) {
			cj = S[ offsetS + ( j * strideS ) ];

			// Off-diagonal elements: rows 0..j-1
			for ( i = 0; i < j; i++ ) {
				si = S[ offsetS + ( i * strideS ) ];
				re = oA + ( ( jc + i ) * sAP );
				im = re + 1;
				Av[ re ] *= cj * si;
				Av[ im ] *= cj * si;
			}

			// Diagonal element: A(j,j) = cj^2 * real(A(j,j)), forced real
			re = oA + ( ( jc + j ) * sAP );
			Av[ re ] *= cj * cj;
			Av[ re + 1 ] = 0.0;

			jc += j + 1;
		}
	} else {
		// Lower triangle of A is stored in packed format.
		// Column j contains rows j..N-1, starting at position jc.
		jc = 0;
		for ( j = 0; j < N; j++ ) {
			cj = S[ offsetS + ( j * strideS ) ];

			// Diagonal element: A(j,j) = cj^2 * real(A(j,j)), forced real
			re = oA + ( jc * sAP );
			Av[ re ] *= cj * cj;
			Av[ re + 1 ] = 0.0;

			// Off-diagonal elements: rows j+1..N-1
			for ( i = j + 1; i < N; i++ ) {
				si = S[ offsetS + ( i * strideS ) ];
				re = oA + ( ( jc + i - j ) * sAP );
				im = re + 1;
				Av[ re ] *= cj * si;
				Av[ im ] *= cj * si;
			}

			jc += N - j;
		}
	}

	return 'yes';
}


// EXPORTS //

export default zlaqhp;
