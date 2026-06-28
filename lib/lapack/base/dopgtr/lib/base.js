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

import dorg2l from '../../dorg2l/lib/base.js';
import dorg2r from '../../dorg2r/lib/base.js';


// MAIN //

/**
* Generates a real orthogonal matrix Q which is defined as the product of.
* N-1 elementary reflectors H(i) of order N, as returned by DSPTRD using
* packed storage.
*
* ## Notes
*
* -   If UPLO = 'upper', Q = H(n-1) ... H(2) H(1).
* -   If UPLO = 'lower', Q = H(1) H(2) ... H(n-1).
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle was used in DSPTRD (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix Q
* @param {Float64Array} AP - packed reflector vectors from DSPTRD (length N*(N+1)/2)
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} TAU - scalar factors of the reflectors from DSPTRD (length N-1)
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} Q - output orthogonal matrix (N x N)
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} WORK - workspace array (length >= N-1)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (0 = success)
*/
function dopgtr( uplo, N, AP, strideAP, offsetAP, TAU, strideTAU, offsetTAU, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork ) {
	var upper;
	var ij;
	var pq;
	var i;
	var j;

	// Quick return if possible...
	if ( N === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );

	if ( upper ) {
		// Q was determined by a call to DSPTRD with UPLO = 'U'.

		// Unpack the vectors which define the elementary reflectors from
		// Packed storage AP into the Q matrix, and set the last row and
		// Column of Q equal to those of the unit matrix.

		// Fortran packed upper storage (1-based): column j contains
		// Elements 1..j, starting at AP(j*(j-1)/2 + 1).

		// IJ = 2: skip first element (diagonal of col 1), start at AP(2).
		// For j = 1..N-1 (1-based), copy AP(IJ..IJ+j-2) into Q(1..j-1, j),
		// Then skip 2 (diagonal of col j+1 plus start of next col).

		// 0-based: ij starts at index 1 (i.e., AP[offsetAP + 1*strideAP])
		ij = 1;
		for ( j = 0; j < N - 1; j++ ) {
			// Copy j elements: Q(0..j-1, j) = AP(ij..ij+j-1)
			for ( i = 0; i < j; i++ ) {
				Q[ offsetQ + (i * strideQ1) + (j * strideQ2) ] = AP[ offsetAP + (ij * strideAP) ];
				ij += 1;
			}
			// Skip 2: diagonal of current column and first off-diagonal of next
			ij += 2;

			// Set Q(N-1, j) = 0
			Q[ offsetQ + (( N - 1 ) * strideQ1) + (j * strideQ2) ] = 0.0;
		}
		// Set last column: Q(i, N-1) = 0 for i = 0..N-2, Q(N-1, N-1) = 1
		for ( i = 0; i < N - 1; i++ ) {
			Q[ offsetQ + (i * strideQ1) + (( N - 1 ) * strideQ2) ] = 0.0;
		}
		Q[ offsetQ + (( N - 1 ) * strideQ1) + (( N - 1 ) * strideQ2) ] = 1.0;

		// Generate Q(0:N-2, 0:N-2) using dorg2l
		if ( N - 1 > 0 ) {
			dorg2l( N - 1, N - 1, N - 1, Q, strideQ1, strideQ2, offsetQ, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
		}
	} else {
		// Q was determined by a call to DSPTRD with UPLO = 'L'.

		// Unpack the vectors which define the elementary reflectors from
		// Packed storage AP into the Q matrix, and set the first row and
		// Column of Q equal to those of the unit matrix.

		// Set first column: Q(0,0) = 1, Q(i,0) = 0 for i = 1..N-1
		Q[ offsetQ ] = 1.0;
		for ( i = 1; i < N; i++ ) {
			Q[ offsetQ + (i * strideQ1) ] = 0.0;
		}

		// Fortran packed lower storage (1-based): column j contains
		// Elements j..N, starting at AP(j*(2*N-j+1)/2 - N + j).

		// IJ = 3: skip first two elements of column 1 (diagonal + first sub-diagonal),
		// Then the diagonal of column 2 is the third element.
		// Actually: IJ starts at element 3 (1-based), which is 2 (0-based).
		// For j = 2..N (1-based), i.e. j = 1..N-1 (0-based):
		//   Set Q(0, j) = 0
		//   Copy AP(IJ..IJ+(N-j-1)-1) into Q(j+1..N-1, j)
		//   Skip 2 (to get past the diagonal of next column)

		ij = 2;
		for ( j = 1; j < N; j++ ) {
			// Q(0, j) = 0
			Q[ offsetQ + (j * strideQ2) ] = 0.0;

			// Copy elements below the diagonal
			for ( i = j + 1; i < N; i++ ) {
				Q[ offsetQ + (i * strideQ1) + (j * strideQ2) ] = AP[ offsetAP + (ij * strideAP) ];
				ij += 1;
			}
			// Skip 2
			ij += 2;
		}

		// Generate Q(1:N-1, 1:N-1) using dorg2r
		if ( N > 1 ) {
			pq = offsetQ + strideQ1 + strideQ2; // Q(1, 1) in 0-based
			dorg2r( N - 1, N - 1, N - 1, Q, strideQ1, strideQ2, pq, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
		}
	}
	return 0;
}


// EXPORTS //

export default dopgtr;
