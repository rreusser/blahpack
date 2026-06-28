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
* Overwrites the M-by-N matrix C with Q_C, Q^T_C, C_Q, or C_Q^T.
* where Q is a real orthogonal matrix defined as the product of K
* elementary reflectors Q = H(k) ... H(2) H(1) as returned by DGEQLF.
*
* @private
* @param {string} side - 'left' to apply Q from left, 'right' from right
* @param {string} trans - 'no-transpose' for Q, 'transpose' for Q^T
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Float64Array} A - reflector vectors from DGEQLF
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
function dorm2l( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var notran;
	var left;
	var idxA;
	var aii;
	var nq;
	var mi;
	var ni;
	var i1;
	var i2;
	var i3;
	var i;

	if ( M === 0 || N === 0 || K === 0 ) {
		return 0;
	}

	left = ( side === 'left' );
	notran = ( trans === 'no-transpose' );

	// NQ is the order of Q
	if ( left ) {
		nq = M;
	} else {
		nq = N;
	}

	// Determine iteration direction:
	// QL: Q = H(k)...H(2)H(1)
	// left+notran or right+trans => forward (i = 0, 1, ..., K-1)
	// left+trans or right+notran => backward (i = K-1, ..., 0)
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
	} else {
		mi = M;
	}

	for ( i = i1; i !== i2; i += i3 ) {
		if ( left ) {
			// H(i) is applied to C(0:m-k+i, 0:n-1)
			mi = M - K + i + 1;
		} else {
			// H(i) is applied to C(0:m-1, 0:n-k+i)
			ni = N - K + i + 1;
		}

		// Save A(nq-k+i, i) and set it to 1.0
		// Fortran: A(NQ-K+I, I) — 1-based col I maps to 0-based col i
		idxA = offsetA + ((nq - K + i) * strideA1) + (i * strideA2);
		aii = A[ idxA ];
		A[ idxA ] = 1.0;

		// Apply H(i) — reflector is in column i of A, from row 0 to nq-k+i

		// dlarf( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork )
		dlarf(side, mi, ni, A, strideA1, offsetA + (i * strideA2), TAU[ offsetTAU + (i * strideTAU) ], C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork);

		// Restore A(nq-k+i, i)
		A[ idxA ] = aii;
	}

	return 0;
}


// EXPORTS //

export default dorm2l;
