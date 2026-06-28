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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacgv from '../../zlacgv/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';


// MAIN //

/**
* Overwrites the M-by-N matrix C with Q_C, Q^H_C, C_Q, or C_Q^H,.
* where Q is a complex unitary matrix defined as the product of K
* elementary reflectors from an RQ factorization:
*
*   Q = H(1)^H _ H(2)^H _ ... * H(k)^H
*
* as returned by ZGERQF. Each H(i) has the form H(i) = I - tau _ v _ v^H.
*
* The reflectors are stored in ROWS of A. For reflector i (0-based),
* the vector v occupies A(i, 0:NQ-K+i) with A(i, NQ-K+i) = 1.
*
* A, TAU, C, WORK are Complex128Arrays. Strides and offsets are in complex elements.
*
* @private
* @param {string} side - 'left' to apply Q from left, 'right' from right
* @param {string} trans - 'no-transpose' for Q, 'conjugate-transpose' for Q^H
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Complex128Array} A - reflector vectors from ZGERQF (K-by-NQ)
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
function zunmr2( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
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
	// Fortran: (LEFT .AND. .NOT.NOTRAN .OR. .NOT.LEFT .AND. NOTRAN) => forward
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
	} else {
		mi = M;
	}

	// Temporary complex scalar for tau
	taui = new Complex128Array( 1 );
	tauiv = reinterpret( taui, 0 );

	for ( i = i1; i !== i2; i += i3 ) {
		if ( left ) {
			// Apply to C(0:NQ-K+i, 0:N-1): mi = NQ-K+i+1 = M-K+i+1
			mi = M - K + i + 1;
		} else {
			// Apply to C(0:M-1, 0:NQ-K+i): ni = NQ-K+i+1 = N-K+i+1
			ni = N - K + i + 1;
		}

		// Conjugate the reflector row A(i, 0:NQ-K+i-1) (length NQ-K+i)
		// In Fortran: ZLACGV( NQ-K+I-1, A(I,1), LDA )
		// NQ-K+I-1 (Fortran 1-based) = NQ-K+i (0-based) elements starting at A(i,0) with stride strideA2
		zlacgv( nq - K + i, A, strideA2, offsetA + ( i * strideA1 ) );

		// Save A(i, NQ-K+i) and set to 1
		// Fortran: A(I, NQ-K+I) => 0-based: A(i, nq-K+i)
		idxA = ( offsetA + ( i * strideA1 ) + ( ( nq - K + i ) * strideA2 ) ) * 2;
		aii0 = Av[ idxA ];
		aii1 = Av[ idxA + 1 ];
		Av[ idxA ] = 1.0;
		Av[ idxA + 1 ] = 0.0;

		// Get tau_i

		// Fortran: if NOTRAN then TAUI = DCONJG(TAU(I)), else TAUI = TAU(I)
		if ( notran ) {
			tauiv[ 0 ] = TAUv[ ( offsetTAU + ( i * strideTAU ) ) * 2 ];
			tauiv[ 1 ] = -TAUv[ ( ( offsetTAU + ( i * strideTAU ) ) * 2 ) + 1 ];
		} else {
			tauiv[ 0 ] = TAUv[ ( offsetTAU + ( i * strideTAU ) ) * 2 ];
			tauiv[ 1 ] = TAUv[ ( ( offsetTAU + ( i * strideTAU ) ) * 2 ) + 1 ];
		}

		// Apply H(i) or H(i)^H to C from side
		// Fortran: CALL ZLARF( SIDE, MI, NI, A(I,1), LDA, TAUI, C, LDC, WORK )
		// A(I,1) with stride LDA means row I starting at column 1, stepping by LDA
		// In JS: reflector at offsetA + i*strideA1, stride = strideA2
		// Zlarf signature: (side, M, N, v, strideV, offsetV, tau, offsetTau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork)
		zlarf(
			side, mi, ni,
			A, strideA2, offsetA + ( i * strideA1 ),
			taui, 0,
			C, strideC1, strideC2, offsetC,
			WORK, strideWork, offsetWork
		);

		// Restore A(i, NQ-K+i)
		Av[ idxA ] = aii0;
		Av[ idxA + 1 ] = aii1;

		// Unconjugate the reflector row
		zlacgv( nq - K + i, A, strideA2, offsetA + ( i * strideA1 ) );
	}

	return 0;
}


// EXPORTS //

export default zunmr2;
