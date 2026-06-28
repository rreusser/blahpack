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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarf from '../../zlarf/lib/base.js';


// MAIN //

/**
* Overwrites the M-by-N matrix C with Q_C, Q^H_C, C_Q, or C_Q^H,.
* where Q is a complex unitary matrix defined as the product of K
* elementary reflectors: Q = H(K)_..._H(2)*H(1) as returned by ZGEQLF.
*
* This is the unblocked (level-2) algorithm.
*
* A, TAU, C, WORK are Complex128Arrays. Strides and offsets are in complex elements.
*
* @private
* @param {string} side - 'left' to apply Q from left, 'right' from right
* @param {string} trans - 'no-transpose' for Q, 'conjugate-transpose' for Q^H
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Complex128Array} A - reflector vectors from ZGEQLF
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C (complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @returns {integer} info - 0 if successful
*/
function zunm2l( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var notran;
	var tauiv;
	var left;
	var taui;
	var idxA;
	var aii0;
	var aii1;
	var TAUv;
	var Av;
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

	if ( left ) {
		nq = M;
	} else {
		nq = N;
	}

	// Get Float64Array views for direct element access
	Av = reinterpret( A, 0 );
	TAUv = reinterpret( TAU, 0 );

	// Determine iteration direction

	// QL: reflectors stored bottom-up. Q = H(K)*...*H(1)

	// For (left && no-transpose) || (!left && !no-transpose): forward i=0..K-1

	// Otherwise: backward i=K-1..0
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

	// Temporary complex scalar for tau
	taui = new Complex128Array( 1 );
	tauiv = reinterpret( taui, 0 );

	for ( i = i1; i !== i2; i += i3 ) {
		if ( left ) {
			// Apply to C(0:M-K+i, 0:N)
			mi = M - K + i + 1;
		} else {
			// Apply to C(0:M, 0:N-K+i)
			ni = N - K + i + 1;
		}

		// Get tau_i, conjugating if trans = 'conjugate-transpose'
		if ( notran ) {
			tauiv[ 0 ] = TAUv[ ( offsetTAU + ( i * strideTAU ) ) * 2 ];
			tauiv[ 1 ] = TAUv[ ( ( offsetTAU + ( i * strideTAU ) ) * 2 ) + 1 ];
		} else {
			tauiv[ 0 ] = TAUv[ ( offsetTAU + ( i * strideTAU ) ) * 2 ];
			tauiv[ 1 ] = -TAUv[ ( ( offsetTAU + ( i * strideTAU ) ) * 2 ) + 1 ];
		}

		// Save A(nq-K+i, i) and set it to 1
		// In QL factorization, the reflector pivot is at row nq-K+i of column i
		idxA = ( offsetA + ( nq - K + i ) * strideA1 + ( i * strideA2 ) ) * 2;
		aii0 = Av[ idxA ];
		aii1 = Av[ idxA + 1 ];
		Av[ idxA ] = 1.0;
		Av[ idxA + 1 ] = 0.0;

		// Apply H(i) to C from the left or right

		// Reflector vector is column i of A, starting from row 0
		zlarf(
			side, mi, ni,
			A, strideA1, offsetA + ( i * strideA2 ),
			taui, 0,
			C, strideC1, strideC2, offsetC,
			WORK, strideWork, offsetWork
		);

		// Restore A(nq-K+i, i)
		Av[ idxA ] = aii0;
		Av[ idxA + 1 ] = aii1;
	}

	return 0;
}


// EXPORTS //

export default zunm2l;
