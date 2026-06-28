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
* Equilibrates a complex Hermitian band matrix using the scaling factors in the vector S.
*
* This sets `AB(i,j) = S(i) * AB(i,j) * S(j)` when the matrix is poorly scaled.
* Diagonal elements are made real (imaginary parts zeroed) since a Hermitian matrix has real diagonal.
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
* @param {Complex128Array} AB - input/output band matrix, dimension (LDAB, N)
* @param {integer} strideAB1 - stride of the first dimension of `AB` (complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (complex elements)
* @param {Float64Array} S - scaling factors, length N
* @param {integer} strideS - stride for `S`
* @param {NonNegativeInteger} offsetS - index offset for `S`
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @returns {string} equed - `'none'` or `'yes'`
*/
function zlaqhb( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, S, strideS, offsetS, scond, amax ) {
	var sa1;
	var sa2;
	var oAB;
	var ABv;
	var cj;
	var ia;
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

	// Get Float64 view and compute double-based strides:
	ABv = reinterpret( AB, 0 );
	sa1 = strideAB1 * 2;
	sa2 = strideAB2 * 2;
	oAB = offsetAB * 2;

	// Equilibrate the matrix:
	if ( uplo === 'upper' ) {
		// Upper triangle of A is stored in band format.
		// AB(KD+1+i-j, j) = A(i,j) for max(1, j-KD) <= i <= j (1-based)
		// With 0-based: AB[oAB + (kd+i-j)*sa1 + j*sa2]
		for ( j = 0; j < N; j++ ) {
			cj = S[ offsetS + ( j * strideS ) ];

			// Off-diagonal entries: i from max(0, j-kd) to j-1
			for ( i = max( 0, j - kd ); i < j; i++ ) {
				ia = oAB + ( ( kd + i - j ) * sa1 ) + ( j * sa2 );
				ABv[ ia ] *= cj * S[ offsetS + ( i * strideS ) ];         // real part
				ABv[ ia + 1 ] *= cj * S[ offsetS + ( i * strideS ) ]; // imag part
			}

			// Diagonal entry: take real part only, then scale by cj*cj
			ia = oAB + ( kd * sa1 ) + ( j * sa2 );
			ABv[ ia ] *= cj * cj; // real part: cj^2 * DBLE(AB)
			ABv[ ia + 1 ] = 0.0; // imag part zeroed (Hermitian diagonal is real)
		}
	} else {
		// Lower triangle of A is stored in band format.
		// AB(1+i-j, j) = A(i,j) for j <= i <= min(N, j+KD) (1-based)
		// With 0-based: AB[oAB + (i-j)*sa1 + j*sa2]
		for ( j = 0; j < N; j++ ) {
			cj = S[ offsetS + ( j * strideS ) ];

			// Diagonal entry: take real part only, then scale by cj*cj
			ia = oAB + ( j * sa2 );
			ABv[ ia ] *= cj * cj; // real part: cj^2 * DBLE(AB)
			ABv[ ia + 1 ] = 0.0; // imag part zeroed (Hermitian diagonal is real)

			// Off-diagonal entries: i from j+1 to min(N-1, j+kd)
			for ( i = j + 1; i <= min( N - 1, j + kd ); i++ ) {
				ia = oAB + ( ( i - j ) * sa1 ) + ( j * sa2 );
				ABv[ ia ] *= cj * S[ offsetS + ( i * strideS ) ];         // real part
				ABv[ ia + 1 ] *= cj * S[ offsetS + ( i * strideS ) ]; // imag part
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

export default zlaqhb;
