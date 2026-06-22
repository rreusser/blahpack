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
* Equilibrates a complex general band matrix using row and column scaling factors.
*
* The band matrix AB has KL subdiagonals and KU superdiagonals. In band
* storage, element A(i,j) is stored at AB(KU+1+i-j, j) (1-based Fortran),
* i.e., at row offset (ku+i-j) and column j (0-based JS).
*
* Returns 'none' (no equilibration), 'row' (row only), 'column' (column only),
* or 'both' (both row and column).
*
* @private
* @param {NonNegativeInteger} M - number of rows of the matrix A
* @param {NonNegativeInteger} N - number of columns of the matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Complex128Array} AB - band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB` (complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (complex elements)
* @param {NonNegativeInteger} offsetAB - index offset for `AB` (complex elements)
* @param {Float64Array} r - row scale factors, length M
* @param {integer} strideR - stride for `r`
* @param {NonNegativeInteger} offsetR - index offset for `r`
* @param {Float64Array} c - column scale factors, length N
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - index offset for `c`
* @param {number} rowcnd - ratio of smallest to largest R(i)
* @param {number} colcnd - ratio of smallest to largest C(i)
* @param {number} amax - absolute value of largest matrix entry
* @returns {string} equed - equilibration type: 'none', 'row', 'column', or 'both'
*/
function zlaqgb( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax ) {
	var imax;
	var imin;
	var sa1;
	var sa2;
	var oAB;
	var ABv;
	var cj;
	var ri;
	var ia;
	var i;
	var j;

	// Quick return if possible
	if ( M <= 0 || N <= 0 ) {
		return 'none';
	}

	// Get Float64 view and compute double-based strides
	ABv = reinterpret( AB, 0 );
	sa1 = strideAB1 * 2;
	sa2 = strideAB2 * 2;
	oAB = offsetAB * 2;

	if ( rowcnd >= THRESH && amax >= SMALL && amax <= LARGE ) {
		// No row scaling
		if ( colcnd >= THRESH ) {
			// No column scaling
			return 'none';
		}
		// Column scaling only: AB(ku+1+i-j, j) *= C(j)
		for ( j = 0; j < N; j++ ) {
			cj = c[ offsetC + ( j * strideC ) ];
			imin = ( j - ku > 0 ) ? j - ku : 0;           // max(1, j+1-ku) in 0-based
			imax = ( M < j + kl + 1 ) ? M : j + kl + 1;   // min(m, j+1+kl) in 0-based
			for ( i = imin; i < imax; i++ ) {
				ia = oAB + ( ( ku + i - j ) * sa1 ) + ( j * sa2 );
				ABv[ ia ] *= cj;         // real part
				ABv[ ia + 1 ] *= cj;     // imag part
			}
		}
		return 'column';
	}
	if ( colcnd >= THRESH ) {
		// Row scaling only: AB(ku+1+i-j, j) *= R(i)
		for ( j = 0; j < N; j++ ) {
			imin = ( j - ku > 0 ) ? j - ku : 0;
			imax = ( M < j + kl + 1 ) ? M : j + kl + 1;
			for ( i = imin; i < imax; i++ ) {
				ri = r[ offsetR + ( i * strideR ) ];
				ia = oAB + ( ( ku + i - j ) * sa1 ) + ( j * sa2 );
				ABv[ ia ] *= ri;         // real part
				ABv[ ia + 1 ] *= ri;     // imag part
			}
		}
		return 'row';
	}
	// Both row and column scaling: AB(ku+1+i-j, j) *= C(j) * R(i)
	for ( j = 0; j < N; j++ ) {
		cj = c[ offsetC + ( j * strideC ) ];
		imin = ( j - ku > 0 ) ? j - ku : 0;
		imax = ( M < j + kl + 1 ) ? M : j + kl + 1;
		for ( i = imin; i < imax; i++ ) {
			ri = r[ offsetR + ( i * strideR ) ];
			ia = oAB + ( ( ku + i - j ) * sa1 ) + ( j * sa2 );
			ABv[ ia ] *= cj * ri;         // real part
			ABv[ ia + 1 ] *= cj * ri;     // imag part
		}
	}
	return 'both';
}


// EXPORTS //

export default zlaqgb;
