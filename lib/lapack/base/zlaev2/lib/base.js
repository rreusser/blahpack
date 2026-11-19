/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
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
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	const cs1 = new Float64Array( 1 );
	const sn1 = new Float64Array( 1 );
	let wr, wi;

	const br = real( b );
	const bi = imag( b );

	// babs = |B| = sqrt(br^2 + bi^2)
	const babs = Math.sqrt( ( br * br ) + ( bi * bi ) );

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
	dlaev2( real( a ), babs, real( c ), rt1, rt2, cs1, sn1 );

	// SN1 = W * T (complex * real multiplication, safe to inline)
	const t = sn1[ 0 ];
	const sn1r = wr * t;
	const sn1i = wi * t;

	return {
		'rt1': rt1[ 0 ],
		'rt2': rt2[ 0 ],
		'cs1': cs1[ 0 ],
		'sn1r': sn1r,
		'sn1i': sn1i
	};
}


// EXPORTS //

export default zlaev2;
