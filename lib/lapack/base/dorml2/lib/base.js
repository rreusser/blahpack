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

import dlarf from '../../dlarf/lib/base.js';


// MAIN //

/**
* Overwrites the M-by-N matrix C with Q_C, Q^T_C, C_Q, or C_Q^T.
* where Q is a real orthogonal matrix defined as the product of K
* elementary reflectors (from an LQ factorization):
*
* Q = H(k) ... H(2) H(1)
*
* as returned by DGELQ2. This is the unblocked algorithm.
*
* @private
* @param {string} side - `'left'` to apply Q from left, `'right'` from right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Float64Array} A - reflector vectors from DGELQ2 (stored rowwise)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors of reflectors
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dorml2( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var notran;
	var left;
	var aii;
	var mi;
	var ni;
	var ic;
	var jc;
	var i1;
	var i2;
	var i3;
	var i;

	if ( M === 0 || N === 0 || K === 0 ) {
		return 0;
	}

	left = ( side === 'left' );
	notran = ( trans === 'no-transpose' );

	// Determine iteration direction:

	// Forward (i=0..K-1) when (LEFT && NOTRAN) or (!LEFT && !NOTRAN)

	// Backward (i=K-1..0) otherwise
	if ( ( left && notran ) || ( !left && !notran ) ) {
		i1 = 0;
		i2 = K;
		i3 = 1;
	} else {
		i1 = K - 1;
		i2 = -1;
		i3 = -1;
	}

	if ( left ) {
		ni = N;
		jc = 0;
	} else {
		mi = M;
		ic = 0;
	}

	for ( i = i1; ( i3 > 0 ) ? ( i < i2 ) : ( i > i2 ); i += i3 ) {
		if ( left ) {
			// Apply H(i) to C(i:M-1, 0:N-1)
			mi = M - i;
			ic = i;
		} else {
			// Apply H(i) to C(0:M-1, i:N-1)
			ni = N - i;
			jc = i;
		}

		// Save A(i,i) and set it to ONE
		aii = A[ offsetA + (i * strideA1) + (i * strideA2) ];
		A[ offsetA + (i * strideA1) + (i * strideA2) ] = 1.0;

		// Apply H(i): the reflector vector is row i of A starting at column i,

		// So v = A(i, i:nq-1), stored with stride strideA2
		dlarf( side, mi, ni, A, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU[ offsetTAU + (i * strideTAU) ], C, strideC1, strideC2, offsetC + (ic * strideC1) + (jc * strideC2), WORK, strideWork, offsetWork);

		// Restore A(i,i)
		A[ offsetA + (i * strideA1) + (i * strideA2) ] = aii;
	}

	return 0;
}


// EXPORTS //

export default dorml2;
