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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


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
* @param {Float64Array} rt1 - output (length-1 array): the eigenvalue of larger absolute value
* @param {Float64Array} rt2 - output (length-1 array): the eigenvalue of smaller absolute value
* @param {Float64Array} cs1 - output (length-1 array): `cs1`
* @param {Complex128Array} sn1 - output (length-1 array): the vector (CS1, SN1) is a unit right eigenvector for RT1
* @param {NonNegativeInteger} offsetSn1 - starting index for `sn1` (in complex elements)
*/
function zlaev2( a, b, c, rt1, rt2, cs1, sn1, offsetSn1 ) {
	const sn1v = reinterpret( sn1, 0 );
	const sn1Out = new Float64Array( 1 );
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
	dlaev2( real( a ), babs, real( c ), rt1, rt2, cs1, sn1Out );

	// SN1 = W * T (complex * real multiplication, safe to inline)
	const t = sn1Out[ 0 ];
	const sn1r = wr * t;
	const sn1i = wi * t;

	sn1v[ offsetSn1 * 2 ] = sn1r;
	sn1v[ ( offsetSn1 * 2 ) + 1 ] = sn1i;
}


// EXPORTS //

export default zlaev2;
