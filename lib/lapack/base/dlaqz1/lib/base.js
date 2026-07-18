/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// VARIABLES //

// Safe minimum (DLAMCH('S')) and its reciprocal:
const SAFMIN = 2.2250738585072014e-308;
const SAFMAX = 1.0 / SAFMIN;


// MAIN //

/**
* Given a 3-by-3 matrix pencil `(A,B)`, sets `v` to a scalar multiple of the first.
* column of the product:
*
* ```text
* K = (A - (beta2*sr2 - i*si)*B) * B^(-1) * (beta1*A - (sr2 + i*si)*B) * B^(-1)
* ```
*
* It is assumed that either `sr1 = sr2`, or `si = 0`.
*
* This is useful for starting double implicit shift bulges in the QZ algorithm.
*
* @private
* @param {Float64Array} A - the 3-by-3 matrix `A`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - the 3-by-3 matrix `B`
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {number} sr1 - real part of the first shift
* @param {number} sr2 - real part of the second shift
* @param {number} si - imaginary part of the shift
* @param {number} beta1 - first beta scalar
* @param {number} beta2 - second beta scalar
* @param {Float64Array} v - output array of length 3 (a scalar multiple of the first column of `K`)
* @param {integer} strideV - stride length for `v`
* @param {NonNegativeInteger} offsetV - starting index for `v`
*/
function dlaqz1( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, sr1, sr2, si, beta1, beta2, v, strideV, offsetV ) {
	let w0, w1, v0;

	// Cache A entries used:
	const a11 = A[ offsetA ];
	const a12 = A[ offsetA + strideA2 ];
	const a21 = A[ offsetA + strideA1 ];
	const a22 = A[ offsetA + strideA1 + strideA2 ];
	const a31 = A[ offsetA + ( 2 * strideA1 ) ];
	const a32 = A[ offsetA + ( 2 * strideA1 ) + strideA2 ];

	// Cache B entries used:
	const b11 = B[ offsetB ];
	const b12 = B[ offsetB + strideB2 ];
	const b21 = B[ offsetB + strideB1 ];
	const b22 = B[ offsetB + strideB1 + strideB2 ];
	const b31 = B[ offsetB + ( 2 * strideB1 ) ];
	const b32 = B[ offsetB + ( 2 * strideB1 ) + strideB2 ];

	// Calculate first shifted vector
	w0 = ( beta1 * a11 ) - ( sr1 * b11 );
	w1 = ( beta1 * a21 ) - ( sr1 * b21 );
	const scale1 = Math.sqrt( Math.abs( w0 ) ) * Math.sqrt( Math.abs( w1 ) );
	if ( scale1 >= SAFMIN && scale1 <= SAFMAX ) {
		w0 /= scale1;
		w1 /= scale1;
	}

	// Solve linear system
	w1 /= b22;
	w0 = ( w0 - ( b12 * w1 ) ) / b11;
	const scale2 = Math.sqrt( Math.abs( w0 ) ) * Math.sqrt( Math.abs( w1 ) );
	if ( scale2 >= SAFMIN && scale2 <= SAFMAX ) {
		w0 /= scale2;
		w1 /= scale2;
	}

	// Apply second shift
	v0 = ( beta2 * ( ( a11 * w0 ) + ( a12 * w1 ) ) ) - ( sr2 * ( ( b11 * w0 ) + ( b12 * w1 ) ) );
	const v1 = ( beta2 * ( ( a21 * w0 ) + ( a22 * w1 ) ) ) - ( sr2 * ( ( b21 * w0 ) + ( b22 * w1 ) ) );
	const v2 = ( beta2 * ( ( a31 * w0 ) + ( a32 * w1 ) ) ) - ( sr2 * ( ( b31 * w0 ) + ( b32 * w1 ) ) );

	// Account for imaginary part
	v0 += ( ( si * si * b11 ) / scale1 ) / scale2;

	// Check for overflow
	const ov0 = offsetV;
	const ov1 = offsetV + strideV;
	const ov2 = offsetV + ( 2 * strideV );
	if (
		Math.abs( v0 ) > SAFMAX ||
		Math.abs( v1 ) > SAFMAX ||
		Math.abs( v2 ) > SAFMAX ||
		v0 !== v0 || v1 !== v1 || v2 !== v2
	) {
		v[ ov0 ] = 0.0;
		v[ ov1 ] = 0.0;
		v[ ov2 ] = 0.0;
		return;
	}
	v[ ov0 ] = v0;
	v[ ov1 ] = v1;
	v[ ov2 ] = v2;
}


// EXPORTS //

export default dlaqz1;
