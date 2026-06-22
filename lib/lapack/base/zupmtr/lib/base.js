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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarf from '../../zlarf/lib/base.js';


// VARIABLES //

// Module-level scratch Complex128Array for passing tau to zlarf:
var scratchTau = new Complex128Array( 1 );
var scratchTauView = reinterpret( scratchTau, 0 );


// MAIN //

/**
* Overwrites a general complex M-by-N matrix C with Q_C, C_Q, QH_C, or C_QH, where Q is a complex unitary matrix of order NQ defined as the product of NQ-1 elementary reflectors, as returned by ZHPTRD using packed storage.
*
* If UPLO='upper', Q = H(NQ-1) ... H(2) H(1).
* If UPLO='lower', Q = H(1) H(2) ... H(NQ-1).
*
* NQ = M if SIDE='left', NQ = N if SIDE='right'.
*
* @private
* @param {string} side - 'left' or 'right'
* @param {string} uplo - 'upper' or 'lower'
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Complex128Array} AP - packed reflector storage from zhptrd (modified then restored)
* @param {integer} strideAP - stride for AP (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for AP (in complex elements)
* @param {Complex128Array} TAU - scalar factors from zhptrd
* @param {integer} strideTAU - stride for TAU (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (in complex elements)
* @param {Complex128Array} C - input/output M-by-N matrix
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zupmtr( side, uplo, trans, M, N, AP, strideAP, offsetAP, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	var notran;
	var forwrd;
	var upper;
	var left;
	var aiiR;
	var aiiI;
	var tauv;
	var apv;
	var nq;
	var mi;
	var ni;
	var ic;
	var jc;
	var ii;
	var i1;
	var i2;
	var i3;
	var oA;
	var oT;
	var i;

	left = ( side === 'left' );
	notran = ( trans === 'no-transpose' );
	upper = ( uplo === 'upper' );

	// NQ is the order of Q
	if ( left ) {
		nq = M;
	} else {
		nq = N;
	}

	// Quick return if possible
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	apv = reinterpret( AP, 0 );
	tauv = reinterpret( TAU, 0 );

	if ( upper ) {
		// Q was determined by a call to ZHPTRD with UPLO = 'U'
		forwrd = ( left && notran ) || ( !left && !notran );

		if ( forwrd ) {
			i1 = 0;
			i2 = nq - 2;
			i3 = 1;

			// Fortran II=2 => 0-based index 1
			ii = 1;
		} else {
			i1 = nq - 2;
			i2 = 0;
			i3 = -1;

			// Fortran II = NQ*(NQ+1)/2 - 1 => 0-based: NQ*(NQ+1)/2 - 2
			ii = ( ( nq * ( nq + 1 ) ) / 2 ) - 2;
		}

		if ( left ) {
			ni = N;
		} else {
			mi = M;
		}

		for ( i = i1; ( i3 > 0 ) ? ( i <= i2 ) : ( i >= i2 ); i += i3 ) {
			if ( left ) {
				// H(i+1) is applied to C(0:i, 0:n-1)  [0-based: mi = i+1]
				mi = i + 1;
			} else {
				// H(i+1) is applied to C(0:m-1, 0:i)  [0-based: ni = i+1]
				ni = i + 1;
			}

			// Compute TAUI: conjugate if trans='conjugate-transpose'
			oT = ( offsetTAU + ( i * strideTAU ) ) * 2;
			if ( notran ) {
				scratchTauView[ 0 ] = tauv[ oT ];
				scratchTauView[ 1 ] = tauv[ oT + 1 ];
			} else {
				// conj(TAU(I))
				scratchTauView[ 0 ] = tauv[ oT ];
				scratchTauView[ 1 ] = -tauv[ oT + 1 ];
			}

			// Save AP(ii) and set to (1.0, 0.0)
			oA = ( offsetAP + ( ii * strideAP ) ) * 2;
			aiiR = apv[ oA ];
			aiiI = apv[ oA + 1 ];
			apv[ oA ] = 1.0;
			apv[ oA + 1 ] = 0.0;

			// Apply H(i+1): ZLARF with AP starting at ii-i (Fortran II-I+1 => 0-based II-I)
			zlarf( side, mi, ni, AP, strideAP, offsetAP + ( ( ii - i ) * strideAP ), scratchTau, 0, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK );

			// Restore AP(ii)
			apv[ oA ] = aiiR;
			apv[ oA + 1 ] = aiiI;

			if ( forwrd ) {
				// Fortran: II = II + I + 2  (I is 1-based there)
				// 0-based i maps to Fortran I = i+1, so II += (i+1) + 2 = i + 3
				ii += i + 3;
			} else {
				// Fortran: II = II - I - 1 where I is 1-based loop variable
				// 0-based i => Fortran I = i+1
				// II = II - (i+1) - 1 = II - i - 2
				ii -= i + 2;
			}
		}
	} else {
		// Q was determined by a call to ZHPTRD with UPLO = 'L'
		forwrd = ( left && !notran ) || ( !left && notran );

		if ( forwrd ) {
			i1 = 0;
			i2 = nq - 2;
			i3 = 1;

			// Fortran II=2 => 0-based 1
			ii = 1;
		} else {
			i1 = nq - 2;
			i2 = 0;
			i3 = -1;

			// Fortran II = NQ*(NQ+1)/2 - 1 => 0-based NQ*(NQ+1)/2 - 2
			ii = ( ( nq * ( nq + 1 ) ) / 2 ) - 2;
		}

		if ( left ) {
			ni = N;
			jc = 0;
		} else {
			mi = M;
			ic = 0;
		}

		for ( i = i1; ( i3 > 0 ) ? ( i <= i2 ) : ( i >= i2 ); i += i3 ) {
			// Save AP(ii) and set to (1.0, 0.0)
			oA = ( offsetAP + ( ii * strideAP ) ) * 2;
			aiiR = apv[ oA ];
			aiiI = apv[ oA + 1 ];
			apv[ oA ] = 1.0;
			apv[ oA + 1 ] = 0.0;

			if ( left ) {
				// H(i+1) applied to C(i+1:m-1, 0:n-1)
				// Fortran: MI = M - I, IC = I + 1
				// 0-based: i maps to Fortran I = i+1
				// MI = M - (i+1), IC = (i+1) => 0-based ic = i+1
				mi = M - i - 1;
				ic = i + 1;
			} else {
				// H(i+1) applied to C(0:m-1, i+1:n-1)
				// Fortran: NI = N - I, JC = I + 1
				// 0-based: NI = N - (i+1), JC = i+1 => 0-based jc = i+1
				ni = N - i - 1;
				jc = i + 1;
			}

			// Compute TAUI: conjugate if trans='conjugate-transpose'
			oT = ( offsetTAU + ( i * strideTAU ) ) * 2;
			if ( notran ) {
				scratchTauView[ 0 ] = tauv[ oT ];
				scratchTauView[ 1 ] = tauv[ oT + 1 ];
			} else {
				// conj(TAU(I))
				scratchTauView[ 0 ] = tauv[ oT ];
				scratchTauView[ 1 ] = -tauv[ oT + 1 ];
			}

			// Apply H(i+1)
			// Fortran: CALL ZLARF(SIDE, MI, NI, AP(II), 1, TAU(I), C(IC,JC), LDC, WORK)
			// 0-based: AP at ii, C offset at ic*strideC1 + jc*strideC2
			zlarf( side, mi, ni, AP, strideAP, offsetAP + ( ii * strideAP ), scratchTau, 0, C, strideC1, strideC2, offsetC + ( ic * strideC1 ) + ( jc * strideC2 ), WORK, strideWORK, offsetWORK );

			// Restore AP(ii)
			apv[ oA ] = aiiR;
			apv[ oA + 1 ] = aiiI;

			if ( forwrd ) {
				// Fortran: II = II + NQ - I + 1  (I is 1-based)
				// 0-based i => Fortran I = i+1
				// II += NQ - (i+1) + 1 = NQ - i
				ii += nq - i;
			} else {
				// Fortran: II = II - NQ + I - 2  (I is 1-based)
				// 0-based: II += -(NQ) + (i+1) - 2 = -NQ + i - 1
				ii += -nq + i - 1;
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zupmtr;
