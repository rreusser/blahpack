/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len */

// VARIABLES //

var M = 5;


// MAIN //

/**
* Computes the dot product of two vectors.
*
* @private
* @param {PositiveInteger} N - number of indexed elements
* @param {Float64Array} x - first input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting `x` index
* @param {Float64Array} y - second input array
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting `y` index
* @returns {number} dot product
*/
function ddot( N, x, strideX, offsetX, y, strideY, offsetY ) {
	var dtemp;
	var ix;
	var iy;
	var m;
	var i;

	dtemp = 0.0;
	if ( N <= 0 ) {
		return dtemp;
	}
	ix = offsetX;
	iy = offsetY;

	// Use unrolled loops if both strides are equal to 1...
	if ( strideX === 1 && strideY === 1 ) {
		m = N % M;
		if ( m > 0 ) {
			for ( i = 0; i < m; i++ ) {
				dtemp += x[ ix ] * y[ iy ];
				ix += 1;
				iy += 1;
			}
		}
		if ( N < M ) {
			return dtemp;
		}
		for ( i = m; i < N; i += M ) {
			dtemp += (x[ix] * y[iy]) + (x[ix+1] * y[iy+1]) + (x[ix+2] * y[iy+2]) + (x[ix+3] * y[iy+3]) + (x[ix+4] * y[iy+4]);
			ix += M;
			iy += M;
		}
		return dtemp;
	}
	for ( i = 0; i < N; i++ ) {
		dtemp += x[ ix ] * y[ iy ];
		ix += strideX;
		iy += strideY;
	}
	return dtemp;
}


// EXPORTS //

export default ddot;
