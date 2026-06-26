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
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var THRESH = 0.1;
var SMALL = dlamch( 'safe-minimum' ) / dlamch( 'epsilon' );
var LARGE = 1.0 / SMALL;


// MAIN //

/**
* Equilibrates a Hermitian matrix A using the scaling factors in the vector S.
*
* This sets A(i,j) = S(i) _ A(i,j) _ S(j) for the stored triangle. The
* diagonal is forced real: A(j,j) = S(j)^2 * real(A(j,j)).
*
* Returns the equilibration type:
* - 'none' - no equilibration was needed
* - 'yes' - equilibration was done
*
* @private
* @param {string} uplo - 'upper' if upper triangle stored, 'lower' if lower
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output N-by-N Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Float64Array} s - scaling factors, length N
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - index offset for s
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @returns {string} equed - 'none' or 'yes'
*/
function zlaqhe( uplo, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, scond, amax ) {
	var Av;
	var sa1;
	var sa2;
	var oA;
	var cj;
	var si;
	var da;
	var re;
	var im;
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

	// Get Float64 view
	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	// Equilibrate the matrix
	if ( uplo === 'upper' ) {
		// Upper triangle
		for ( j = 0; j < N; j++ ) {
			cj = s[ offsetS + ( j * strideS ) ];
			da = oA + ( j * sa2 );

			// Off-diagonal: rows 0..j-1
			for ( i = 0; i < j; i++ ) {
				si = s[ offsetS + ( i * strideS ) ];
				re = da + ( i * sa1 );
				im = re + 1;

				// A(i,j) = cj * s(i) * A(i,j)
				Av[ re ] = cj * si * Av[ re ];
				Av[ im ] = cj * si * Av[ im ];
			}
			// Diagonal: A(j,j) = cj^2 * real(A(j,j)), forced real
			re = da + ( j * sa1 );
			Av[ re ] = cj * cj * Av[ re ];
			Av[ re + 1 ] = 0.0;
		}
	} else {
		// Lower triangle
		for ( j = 0; j < N; j++ ) {
			cj = s[ offsetS + ( j * strideS ) ];
			da = oA + ( j * sa2 );

			// Diagonal: A(j,j) = cj^2 * real(A(j,j)), forced real
			re = da + ( j * sa1 );
			Av[ re ] = cj * cj * Av[ re ];
			Av[ re + 1 ] = 0.0;

			// Off-diagonal: rows j+1..N-1
			for ( i = j + 1; i < N; i++ ) {
				si = s[ offsetS + ( i * strideS ) ];
				re = da + ( i * sa1 );
				im = re + 1;

				// A(i,j) = cj * s(i) * A(i,j)
				Av[ re ] = cj * si * Av[ re ];
				Av[ im ] = cj * si * Av[ im ];
			}
		}
	}

	return 'yes';
}


// EXPORTS //

export default zlaqhe;
