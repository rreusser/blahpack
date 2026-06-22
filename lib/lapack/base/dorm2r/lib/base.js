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

import dlarf from '../../dlarf/lib/base.js';


// MAIN //

/**
* Overwrites the M-by-N matrix C with Q_C, Q__T_C, C_Q, or `C_Q*_T`.
* where Q is a real orthogonal matrix defined as the product of K
* elementary reflectors `Q = H(1)*H(2)*...*H(k)` as returned
* by DGEQR2.
*
* @private
* @param {string} side - `'left'` to apply Q from left, `'right'` from right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Float64Array} A - reflector vectors from DGEQR2
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
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dorm2r( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	var notran;
	var left;
	var idxA;
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

	// For left+trans or right+notran: iterate forward (i = 0, 1, ..., K-1)

	// For left+notran or right+trans: iterate backward (i = K-1, ..., 1, 0)
	if ( ( left && !notran ) || ( !left && notran ) ) {
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

	for ( i = i1; i !== i2; i += i3 ) {
		if ( left ) {
			// H(i) is applied to C(i:M-1, 0:N-1)
			mi = M - i;
			ic = i;
		} else {
			// H(i) is applied to C(0:M-1, i:N-1)
			ni = N - i;
			jc = i;
		}

		// Save A(i,i) and set it to 1.0
		idxA = offsetA + (i * strideA1) + (i * strideA2);
		aii = A[ idxA ];
		A[ idxA ] = 1.0;

		// Apply H(i) to C(ic:ic+mi-1, jc:jc+ni-1) from the left or right

		// Dlarf expects: side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK
		dlarf(side, mi, ni, A, strideA1, offsetA + (i * strideA1) + (i * strideA2), TAU[ offsetTAU + (i * strideTAU) ], C, strideC1, strideC2, offsetC + (ic * strideC1) + (jc * strideC2), WORK, strideWORK, offsetWORK);

		// Restore A(i,i)
		A[ idxA ] = aii;
	}

	return 0;
}


// EXPORTS //

export default dorm2r;
