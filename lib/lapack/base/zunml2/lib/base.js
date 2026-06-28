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
import zlacgv from '../../zlacgv/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';


// MAIN //

/**
* Overwrite the M-by-N matrix C with Q_C, Q^H_C, C_Q, or C_Q^H.
* where Q is a complex unitary matrix defined as the product of K
* elementary reflectors (from an LQ factorization):
*
* Q = H(k)^H ... H(2)^H H(1)^H  (for TRANS='N')
*
* as returned by ZGELQ2. This is the unblocked algorithm.
*
* @private
* @param {string} side - `'left'` to apply Q from left, `'right'` from right
* @param {string} trans - `'no-transpose'` for Q, `'conjugate-transpose'` for Q^H
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Complex128Array} A - reflector vectors from ZGELQ2 (stored rowwise)
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
function zunml2( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var notran;
	var tauIdx;
	var left;
	var aiiR;
	var aiiI;
	var tauR;
	var tauI;
	var TAUv;
	var sTAU;
	var oTAU;
	var sA1;
	var sA2;
	var aii;
	var Av;
	var oA;
	var nq;
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

	if ( left ) {
		nq = M;
	} else {
		nq = N;
	}

	// Determine iteration direction
	// Fortran: (LEFT .AND. NOTRAN) or (.NOT.LEFT .AND. .NOT.NOTRAN) => forward
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

	// Get Float64 views
	Av = reinterpret( A, 0 );
	sA1 = strideA1 * 2;
	sA2 = strideA2 * 2;
	oA = offsetA * 2;
	TAUv = reinterpret( TAU, 0 );
	sTAU = strideTAU * 2;
	oTAU = offsetTAU * 2;

	for ( i = i1; ( i3 > 0 ) ? ( i < i2 ) : ( i > i2 ); i += i3 ) {
		if ( left ) {
			mi = M - i;
			ic = i;
		} else {
			ni = N - i;
			jc = i;
		}

		// Get tau value; if NOTRAN, conjugate it (Fortran: TAUI = DCONJG(TAU(I)))
		tauIdx = oTAU + (i * sTAU);
		if ( notran ) {
			tauR = TAUv[ tauIdx ];
			tauI = -TAUv[ tauIdx + 1 ]; // conjugate
		} else {
			tauR = TAUv[ tauIdx ];
			tauI = TAUv[ tauIdx + 1 ];
		}

		// Conjugate the row of A beyond the diagonal: A(i, i+1:nq-1)
		if ( i < nq - 1 ) {
			zlacgv( nq - i - 1, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2) );
		}

		// Save A(i,i) and set it to ONE
		aii = oA + (i * sA1) + (i * sA2);
		aiiR = Av[ aii ];
		aiiI = Av[ aii + 1 ];
		Av[ aii ] = 1.0;
		Av[ aii + 1 ] = 0.0;

		// Write the conjugated/unconjugated tau into TAU so zlarf picks it up
		TAUv[ tauIdx ] = tauR;
		TAUv[ tauIdx + 1 ] = tauI;

		// Apply H(i) or H(i)^H to C(ic:, jc:)

		// The reflector vector is A(i, i:nq-1) stored rowwise, so strideV = strideA2
		zlarf( side, mi, ni,
			A, strideA2, offsetA + (i * strideA1) + (i * strideA2),
			TAU, offsetTAU + (i * strideTAU),
			C, strideC1, strideC2, offsetC + (ic * strideC1) + (jc * strideC2),
			WORK, strideWork, offsetWork
		);

		// Restore the original tau value
		tauIdx = oTAU + (i * sTAU);
		if ( notran ) {
			// We conjugated earlier, restore the original
			TAUv[ tauIdx + 1 ] = -TAUv[ tauIdx + 1 ];
		}

		// Restore A(i,i)
		Av[ aii ] = aiiR;
		Av[ aii + 1 ] = aiiI;

		// Un-conjugate the row of A
		if ( i < nq - 1 ) {
			zlacgv( nq - i - 1, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2) );
		}
	}

	return 0;
}


// EXPORTS //

export default zunml2;
