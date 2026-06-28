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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zung2l from '../../zung2l/lib/base.js';
import zung2r from '../../zung2r/lib/base.js';


// MAIN //

/**
* Generates a complex unitary matrix Q which is defined as the product of n-1 elementary reflectors of order n, as returned by ZHPTRD using packed storage.
*
* If UPLO = 'upper', Q = H(n-1) ... H(2) H(1).
* If UPLO = 'lower', Q = H(1) H(2) ... H(n-1).
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle was used in ZHPTRD ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of the matrix Q
* @param {Complex128Array} AP - packed reflector vectors from ZHPTRD (length N*(N+1)/2, complex elements)
* @param {integer} strideAP - stride length for `AP` (complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (complex elements)
* @param {Complex128Array} TAU - scalar factors of the reflectors from ZHPTRD (length N-1, complex elements)
* @param {integer} strideTAU - stride length for `TAU` (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (complex elements)
* @param {Complex128Array} Q - output unitary matrix (N x N, complex elements)
* @param {integer} strideQ1 - stride of the first dimension of `Q` (complex elements)
* @param {integer} strideQ2 - stride of the second dimension of `Q` (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for `Q` (complex elements)
* @param {Complex128Array} WORK - workspace array (length >= N-1, complex elements)
* @param {integer} strideWork - stride length for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @returns {integer} status code (0 = success)
*/
function zupgtr( uplo, N, AP, strideAP, offsetAP, TAU, strideTAU, offsetTAU, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork ) {
	var upper;
	var apv;
	var qv;
	var oA;
	var oQ;
	var ij;
	var pq;
	var i;
	var j;

	// Quick return if possible...
	if ( N === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );

	apv = reinterpret( AP, 0 );
	qv = reinterpret( Q, 0 );

	if ( upper ) {
		// Q was determined by a call to ZHPTRD with UPLO = 'U'.
		// Unpack the vectors which define the elementary reflectors from
		// Packed storage AP into the Q matrix, and set the last row and
		// Column of Q equal to those of the unit matrix.

		// Fortran IJ = 2 => 0-based complex index 1
		ij = 1;
		for ( j = 0; j < N - 1; j++ ) {
			// Copy j elements: Q(0..j-1, j) = AP(ij..ij+j-1)
			for ( i = 0; i < j; i++ ) {
				oQ = ( offsetQ + ( i * strideQ1 ) + ( j * strideQ2 ) ) * 2;
				oA = ( offsetAP + ( ij * strideAP ) ) * 2;
				qv[ oQ ] = apv[ oA ];
				qv[ oQ + 1 ] = apv[ oA + 1 ];
				ij += 1;
			}
			// Skip 2: diagonal of current column and first off-diagonal of next
			ij += 2;

			// Set Q(N-1, j) = (0, 0)
			oQ = ( offsetQ + ( ( N - 1 ) * strideQ1 ) + ( j * strideQ2 ) ) * 2;
			qv[ oQ ] = 0.0;
			qv[ oQ + 1 ] = 0.0;
		}
		// Set last column: Q(i, N-1) = 0 for i = 0..N-2, Q(N-1, N-1) = 1
		for ( i = 0; i < N - 1; i++ ) {
			oQ = ( offsetQ + ( i * strideQ1 ) + ( ( N - 1 ) * strideQ2 ) ) * 2;
			qv[ oQ ] = 0.0;
			qv[ oQ + 1 ] = 0.0;
		}
		oQ = ( offsetQ + ( ( N - 1 ) * strideQ1 ) + ( ( N - 1 ) * strideQ2 ) ) * 2;
		qv[ oQ ] = 1.0;
		qv[ oQ + 1 ] = 0.0;

		// Generate Q(0:N-2, 0:N-2) using zung2l
		if ( N - 1 > 0 ) {
			zung2l( N - 1, N - 1, N - 1, Q, strideQ1, strideQ2, offsetQ, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
		}
	} else {
		// Q was determined by a call to ZHPTRD with UPLO = 'L'.
		// Set first column: Q(0,0) = 1, Q(i,0) = 0 for i = 1..N-1
		oQ = offsetQ * 2;
		qv[ oQ ] = 1.0;
		qv[ oQ + 1 ] = 0.0;
		for ( i = 1; i < N; i++ ) {
			oQ = ( offsetQ + ( i * strideQ1 ) ) * 2;
			qv[ oQ ] = 0.0;
			qv[ oQ + 1 ] = 0.0;
		}

		// Fortran IJ = 3 => 0-based complex index 2
		ij = 2;
		for ( j = 1; j < N; j++ ) {
			// Q(0, j) = (0, 0)
			oQ = ( offsetQ + ( j * strideQ2 ) ) * 2;
			qv[ oQ ] = 0.0;
			qv[ oQ + 1 ] = 0.0;

			// Copy elements below the diagonal
			for ( i = j + 1; i < N; i++ ) {
				oQ = ( offsetQ + ( i * strideQ1 ) + ( j * strideQ2 ) ) * 2;
				oA = ( offsetAP + ( ij * strideAP ) ) * 2;
				qv[ oQ ] = apv[ oA ];
				qv[ oQ + 1 ] = apv[ oA + 1 ];
				ij += 1;
			}
			// Skip 2
			ij += 2;
		}

		// Generate Q(1:N-1, 1:N-1) using zung2r
		if ( N > 1 ) {
			pq = offsetQ + strideQ1 + strideQ2; // Q(1, 1) in complex elements
			zung2r( N - 1, N - 1, N - 1, Q, strideQ1, strideQ2, pq, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
		}
	}
	return 0;
}


// EXPORTS //

export default zupgtr;
