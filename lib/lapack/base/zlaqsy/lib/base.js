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
* Equilibrates a symmetric matrix A using the scaling factors in the vector S.
*
* This sets `A[i,j] = S[i] * A[i,j] * S[j]` when the matrix is poorly scaled.
*
* Returns the equilibration type:
*
* -   'none' - no equilibration was needed
* -   'yes' - equilibration was done
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output N-by-N symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} s - scaling factors, length N
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - index offset for s
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @returns {string} equed - 'none' or 'yes'
*/
function zlaqsy( uplo, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, scond, amax ) {
	var sa1;
	var sa2;
	var Av;
	var cj;
	var da;
	var ia;
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

	// Reinterpret to Float64Array view for element access
	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;

	// Equilibrate the matrix
	if ( uplo === 'upper' ) {
		// Upper triangle
		for ( j = 0; j < N; j += 1 ) {
			cj = s[ offsetS + ( j * strideS ) ];
			da = ( offsetA * 2 ) + ( j * sa2 );
			for ( i = 0; i <= j; i += 1 ) {
				// A[i,j] = S[j] * S[i] * A[i,j] (real-scalar scaling of complex element)
				ia = da + ( i * sa1 );
				Av[ ia ] *= cj * s[ offsetS + ( i * strideS ) ];
				Av[ ia + 1 ] *= cj * s[ offsetS + ( i * strideS ) ];
			}
		}
	} else {
		// Lower triangle
		for ( j = 0; j < N; j += 1 ) {
			cj = s[ offsetS + ( j * strideS ) ];
			da = ( offsetA * 2 ) + ( j * sa2 );
			for ( i = j; i < N; i += 1 ) {
				// A[i,j] = S[j] * S[i] * A[i,j] (real-scalar scaling of complex element)
				ia = da + ( i * sa1 );
				Av[ ia ] *= cj * s[ offsetS + ( i * strideS ) ];
				Av[ ia + 1 ] *= cj * s[ offsetS + ( i * strideS ) ];
			}
		}
	}

	return 'yes';
}


// EXPORTS //

export default zlaqsy;
