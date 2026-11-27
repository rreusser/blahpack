/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MAIN //

/**
* Applies a plane rotation.
*
* @private
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - first input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} y - second input array
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {number} c - cosine of the angle of rotation
* @param {number} s - sine of the angle of rotation
* @returns {Float64Array} `y`
*/
function drot( N, x, strideX, offsetX, y, strideY, offsetY, c, s ) {
	let temp, ix, iy, i;

	if ( N <= 0 ) {
		return y;
	}
	ix = offsetX;
	iy = offsetY;
	for ( i = 0; i < N; i++ ) {
		temp = ( c * x[ ix ] ) + ( s * y[ iy ] );
		y[ iy ] = ( c * y[ iy ] ) - ( s * x[ ix ] );
		x[ ix ] = temp;
		ix += strideX;
		iy += strideY;
	}
	return y;
}


// EXPORTS //

export default drot;
