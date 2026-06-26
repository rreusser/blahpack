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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// FUNCTIONS //

/**
* CABS1 = |Re(z)| + |Im(z)|.
*
* @private
* @param {Float64Array} v - interleaved view
* @param {integer} idx - Float64 index
* @returns {number} result
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Sets a scalar multiple of the first column of the product of 2-by-2 or.
* 3-by-3 matrix (H - s1_I)_(H - s2*I), scaling to avoid overflows and
* most underflows.
*
* This is used to determine the initial shift vector in the QR algorithm.
* H is an upper Hessenberg matrix, and s1, s2 are complex shifts.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix H (must be 2 or 3)
* @param {Complex128Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H` (complex elements)
* @param {integer} strideH2 - stride of the second dimension of `H` (complex elements)
* @param {NonNegativeInteger} offsetH - starting index for `H` (complex elements)
* @param {Complex128} s1 - first shift
* @param {Complex128} s2 - second shift
* @param {Complex128Array} v - output array of length N
* @param {integer} strideV - stride length for `v` (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for `v` (complex elements)
*/
function zlaqr1( N, H, strideH1, strideH2, offsetH, s1, s2, v, strideV, offsetV ) {
	var h21sR;
	var h21sI;
	var h31sR;
	var h31sI;
	var s1R;
	var s1I;
	var s2R;
	var s2I;
	var sh1;
	var sh2;
	var sv;
	var Hv;
	var tR;
	var tI;
	var uR;
	var uI;
	var aR;
	var aI;
	var bR;
	var bI;
	var s;

	// Quick return if possible:
	if ( N !== 2 && N !== 3 ) {
		return;
	}

	s1R = real( s1 );
	s1I = imag( s1 );
	s2R = real( s2 );
	s2I = imag( s2 );

	Hv = reinterpret( H, 0 );
	sv = reinterpret( v, 0 );
	sh1 = strideH1 * 2;
	sh2 = strideH2 * 2;

	// oH is the Float64 base offset
	var oH = offsetH * 2; // eslint-disable-line no-var
	var ov = offsetV * 2; // eslint-disable-line no-var
	var svv = strideV * 2; // eslint-disable-line no-var

	if ( N === 2 ) {
		// s = CABS1( H(1,1) - S2 ) + CABS1( H(2,1) )
		// H(1,1) - S2:
		tR = Hv[ oH ] - s2R;
		tI = Hv[ oH + 1 ] - s2I;
		s = ( Math.abs( tR ) + Math.abs( tI ) ) + cabs1( Hv, oH + sh1 );

		if ( s === 0.0 ) {
			sv[ ov ] = 0.0;
			sv[ ov + 1 ] = 0.0;
			sv[ ov + svv ] = 0.0;
			sv[ ov + svv + 1 ] = 0.0;
		} else {
			// H21S = H(2,1) / S
			h21sR = Hv[ oH + sh1 ] / s;
			h21sI = Hv[ oH + sh1 + 1 ] / s;

			// V(1) = H21S*H(1,2) + (H(1,1)-S1)*((H(1,1)-S2)/S)

			// First: (H(1,1)-S1)
			aR = Hv[ oH ] - s1R;
			aI = Hv[ oH + 1 ] - s1I;

			// (H(1,1)-S2)/S
			bR = tR / s;
			bI = tI / s;

			// (H(1,1)-S1)*((H(1,1)-S2)/S) = a*b

			// a*b = (aR*bR - aI*bI) + (aR*bI + aI*bR)*i
			uR = aR * bR - aI * bI;
			uI = aR * bI + aI * bR;

			// H21S*H(1,2)

			// H(1,2) is at oH + sh2
			aR = h21sR * Hv[ oH + sh2 ] - h21sI * Hv[ oH + sh2 + 1 ];
			aI = h21sR * Hv[ oH + sh2 + 1 ] + h21sI * Hv[ oH + sh2 ];

			// V(1) = H21S*H(1,2) + (H(1,1)-S1)*((H(1,1)-S2)/S)
			sv[ ov ] = aR + uR;
			sv[ ov + 1 ] = aI + uI;

			// V(2) = H21S*(H(1,1) + H(2,2) - S1 - S2)

			// H(2,2) is at oH + sh1 + sh2
			aR = Hv[ oH ] + Hv[ oH + sh1 + sh2 ] - s1R - s2R;
			aI = Hv[ oH + 1 ] + Hv[ oH + sh1 + sh2 + 1 ] - s1I - s2I;

			// H21S * a
			sv[ ov + svv ] = h21sR * aR - h21sI * aI;
			sv[ ov + svv + 1 ] = h21sR * aI + h21sI * aR;
		}
	} else {
		// N === 3
		// s = CABS1( H(1,1)-S2 ) + CABS1( H(2,1) ) + CABS1( H(3,1) )
		tR = Hv[ oH ] - s2R;
		tI = Hv[ oH + 1 ] - s2I;
		s = ( Math.abs( tR ) + Math.abs( tI ) ) +
			cabs1( Hv, oH + sh1 ) +
			cabs1( Hv, oH + 2 * sh1 );

		if ( s === 0.0 ) {
			sv[ ov ] = 0.0;
			sv[ ov + 1 ] = 0.0;
			sv[ ov + svv ] = 0.0;
			sv[ ov + svv + 1 ] = 0.0;
			sv[ ov + 2 * svv ] = 0.0;
			sv[ ov + 2 * svv + 1 ] = 0.0;
		} else {
			// H21S = H(2,1) / S
			h21sR = Hv[ oH + sh1 ] / s;
			h21sI = Hv[ oH + sh1 + 1 ] / s;

			// H31S = H(3,1) / S
			h31sR = Hv[ oH + 2 * sh1 ] / s;
			h31sI = Hv[ oH + 2 * sh1 + 1 ] / s;

			// V(1) = (H(1,1)-S1)*((H(1,1)-S2)/S) + H(1,2)*H21S + H(1,3)*H31S

			// (H(1,1)-S1):
			aR = Hv[ oH ] - s1R;
			aI = Hv[ oH + 1 ] - s1I;

			// (H(1,1)-S2)/S:
			bR = tR / s;
			bI = tI / s;

			// a*b:
			uR = aR * bR - aI * bI;
			uI = aR * bI + aI * bR;

			// + H(1,2)*H21S:  H(1,2) at oH + sh2
			aR = Hv[ oH + sh2 ] * h21sR - Hv[ oH + sh2 + 1 ] * h21sI;
			aI = Hv[ oH + sh2 ] * h21sI + Hv[ oH + sh2 + 1 ] * h21sR;
			uR += aR;
			uI += aI;

			// + H(1,3)*H31S:  H(1,3) at oH + 2*sh2
			aR = Hv[ oH + 2 * sh2 ] * h31sR - Hv[ oH + 2 * sh2 + 1 ] * h31sI;
			aI = Hv[ oH + 2 * sh2 ] * h31sI + Hv[ oH + 2 * sh2 + 1 ] * h31sR;
			sv[ ov ] = uR + aR;
			sv[ ov + 1 ] = uI + aI;

			// V(2) = H21S*(H(1,1)+H(2,2)-S1-S2) + H(2,3)*H31S

			// H(2,2) at oH + sh1 + sh2
			aR = Hv[ oH ] + Hv[ oH + sh1 + sh2 ] - s1R - s2R;
			aI = Hv[ oH + 1 ] + Hv[ oH + sh1 + sh2 + 1 ] - s1I - s2I;

			// H21S * a:
			uR = h21sR * aR - h21sI * aI;
			uI = h21sR * aI + h21sI * aR;

			// + H(2,3)*H31S:  H(2,3) at oH + sh1 + 2*sh2
			aR = Hv[ oH + sh1 + 2 * sh2 ] * h31sR - Hv[ oH + sh1 + 2 * sh2 + 1 ] * h31sI;
			aI = Hv[ oH + sh1 + 2 * sh2 ] * h31sI + Hv[ oH + sh1 + 2 * sh2 + 1 ] * h31sR;
			sv[ ov + svv ] = uR + aR;
			sv[ ov + svv + 1 ] = uI + aI;

			// V(3) = H31S*(H(1,1)+H(3,3)-S1-S2) + H21S*H(3,2)

			// H(3,3) at oH + 2*sh1 + 2*sh2
			aR = Hv[ oH ] + Hv[ oH + 2 * sh1 + 2 * sh2 ] - s1R - s2R;
			aI = Hv[ oH + 1 ] + Hv[ oH + 2 * sh1 + 2 * sh2 + 1 ] - s1I - s2I;

			// H31S * a:
			uR = h31sR * aR - h31sI * aI;
			uI = h31sR * aI + h31sI * aR;

			// + H21S*H(3,2):  H(3,2) at oH + 2*sh1 + sh2
			aR = h21sR * Hv[ oH + 2 * sh1 + sh2 ] - h21sI * Hv[ oH + 2 * sh1 + sh2 + 1 ];
			aI = h21sR * Hv[ oH + 2 * sh1 + sh2 + 1 ] + h21sI * Hv[ oH + 2 * sh1 + sh2 ];
			sv[ ov + 2 * svv ] = uR + aR;
			sv[ ov + 2 * svv + 1 ] = uI + aI;
		}
	}
}


// EXPORTS //

export default zlaqr1;
