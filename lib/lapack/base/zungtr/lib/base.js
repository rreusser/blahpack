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
import zungqr from '../../zungqr/lib/base.js';
import zungql from '../../zungql/lib/base.js';


// MAIN //

/**
* Generates a complex unitary matrix Q which is defined as the product of N-1.
* elementary reflectors of order N, as returned by ZHETRD.
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
* @param {string} uplo - specifies whether the upper or lower triangle was used in ZHETRD (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix Q
* @param {Complex128Array} A - on entry, contains the reflectors from ZHETRD; on exit, the unitary matrix Q
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} TAU - scalar factors of the reflectors from ZHETRD (length N-1)
* @param {integer} strideTAU - stride length for `TAU` (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (complex elements)
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWork - stride length for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @returns {integer} status code (0 = success)
*/
function zungtr( uplo, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var upper;
	var sa1;
	var sa2;
	var oA;
	var Av;
	var pa;
	var ia;
	var i;
	var j;

	/* @complex-arrays A, TAU, WORK */

	upper = ( uplo === 'upper' );

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	if ( upper ) {
		// Q was determined by ZHETRD as a product of N-1 elementary reflectors
		// Stored in the upper triangle of A. Shift them left by one column
		// So they occupy columns 0..N-2, then call zungql on the (N-1)x(N-1)
		// Leading submatrix.

		// Shift reflectors: for j = 0..N-2, copy column j+1 (rows 0..j-1) into column j
		for ( j = 0; j < N - 1; j++ ) {
			for ( i = 0; i < j; i++ ) {
				// A(i, j) = A(i, j+1)
				ia = oA + (i * sa1) + (j * sa2);
				Av[ ia ] = Av[ oA + (i * sa1) + (( j + 1 ) * sa2) ];
				Av[ ia + 1 ] = Av[ oA + (i * sa1) + (( j + 1 ) * sa2) + 1 ];
			}
			// Set A(N-1, j) = 0
			ia = oA + (( N - 1 ) * sa1) + (j * sa2);
			Av[ ia ] = 0.0;
			Av[ ia + 1 ] = 0.0;
		}
		// Set last column: A(i, N-1) = 0 for i = 0..N-2, A(N-1, N-1) = 1
		for ( i = 0; i < N - 1; i++ ) {
			ia = oA + (i * sa1) + (( N - 1 ) * sa2);
			Av[ ia ] = 0.0;
			Av[ ia + 1 ] = 0.0;
		}
		ia = oA + (( N - 1 ) * sa1) + (( N - 1 ) * sa2);
		Av[ ia ] = 1.0;
		Av[ ia + 1 ] = 0.0;

		// Generate Q by calling zungql on the (N-1)x(N-1) leading submatrix
		if ( N - 1 > 0 ) {
			zungql(N - 1, N - 1, N - 1, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
		}
	} else {
		// Q was determined by ZHETRD as a product of N-1 elementary reflectors
		// Stored in the lower triangle of A. Shift them right by one column
		// So they occupy columns 1..N-1, then call zungqr on the (N-1)x(N-1)
		// Trailing submatrix starting at (1,1).

		// Shift reflectors: for j = N-1 downto 1, copy column j-1 (rows j+1..N-1) into column j
		for ( j = N - 1; j >= 1; j-- ) {
			// Set A(0, j) = 0
			ia = oA + (j * sa2);
			Av[ ia ] = 0.0;
			Av[ ia + 1 ] = 0.0;
			for ( i = j + 1; i < N; i++ ) {
				// A(i, j) = A(i, j-1)
				ia = oA + (i * sa1) + (j * sa2);
				Av[ ia ] = Av[ oA + (i * sa1) + (( j - 1 ) * sa2) ];
				Av[ ia + 1 ] = Av[ oA + (i * sa1) + (( j - 1 ) * sa2) + 1 ];
			}
		}
		// Set first column: A(0, 0) = 1, A(i, 0) = 0 for i = 1..N-1
		Av[ oA ] = 1.0;
		Av[ oA + 1 ] = 0.0;
		for ( i = 1; i < N; i++ ) {
			ia = oA + (i * sa1);
			Av[ ia ] = 0.0;
			Av[ ia + 1 ] = 0.0;
		}

		// Generate Q by calling zungqr on the (N-1)x(N-1) trailing submatrix
		// Starting at position (1, 1) (0-based)
		if ( N > 1 ) {
			pa = offsetA + strideA1 + strideA2; // A(1, 1) in complex-element addressing
			zungqr(N - 1, N - 1, N - 1, A, strideA1, strideA2, pa, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
		}
	}
	return 0;
}


// EXPORTS //

export default zungtr;
