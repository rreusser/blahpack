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

// MODULES //

import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import dlaev2 from '../../dlaev2/lib/index.js';


// MAIN //

/**
* Computes the eigendecomposition of a 2-by-2 Hermitian matrix.
*
* The matrix is:
*
* ```text
* [    A     B    ]
* [ conj(B)  C    ]
* ```
*
* where A and C are real (imaginary parts ignored) and B is complex.
*
* On return:
*
* -   `rt1`: eigenvalue of larger absolute value
* -   `rt2`: eigenvalue of smaller absolute value
* -   `cs1`: cosine of the rotation (real)
* -   `sn1r`: real part of the sine of the rotation (complex)
* -   `sn1i`: imaginary part of the sine of the rotation (complex)
*
* @private
* @param {Complex128} a - (1,1) element of the 2-by-2 Hermitian matrix
* @param {Complex128} b - (1,2) element of the 2-by-2 Hermitian matrix
* @param {Complex128} c - (2,2) element of the 2-by-2 Hermitian matrix
* @returns {Object} object with `rt1`, `rt2`, `cs1`, `sn1r`, and `sn1i` properties
*/
function zlaev2( a, b, c ) {
	var babs;
	var sn1i;
	var sn1r;
	var out;
	var br;
	var bi;
	var wr;
	var wi;
	var t;

	br = real( b );
	bi = imag( b );

	// babs = |B| = sqrt(br^2 + bi^2)
	babs = Math.sqrt( ( br * br ) + ( bi * bi ) );

	if ( babs === 0.0 ) {
		// W = 1.0 (real)
		wr = 1.0;
		wi = 0.0;
	} else {
		// W = conj(B) / |B| (division by real scalar, safe to inline)
		wr = br / babs;
		wi = -bi / babs;
	}

	// Call real dlaev2 with (real(A), |B|, real(C))
	out = dlaev2( real( a ), babs, real( c ) );

	// SN1 = W * T (complex * real multiplication, safe to inline)
	t = out.sn1;
	sn1r = wr * t;
	sn1i = wi * t;

	return {
		'rt1': out.rt1,
		'rt2': out.rt2,
		'cs1': out.cs1,
		'sn1r': sn1r,
		'sn1i': sn1i
	};
}


// EXPORTS //

export default zlaev2;
