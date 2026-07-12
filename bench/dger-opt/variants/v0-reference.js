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
* Performs the rank 1 operation A := alpha_x_y**T + A.
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {number} alpha - scalar multiplier
* @param {Float64Array} x - first input vector
* @param {integer} strideX - stride for x
* @param {NonNegativeInteger} offsetX - starting index for x
* @param {Float64Array} y - second input vector
* @param {integer} strideY - stride for y
* @param {NonNegativeInteger} offsetY - starting index for y
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of first dimension of A
* @param {integer} strideA2 - stride of second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @returns {Float64Array} A
*/
function dger( M, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA ) {
	var temp;
	var ix;
	var jy;
	var i;
	var j;

	if ( M === 0 || N === 0 || alpha === 0.0 ) {
		return A;
	}

	jy = offsetY;
	for ( j = 0; j < N; j++ ) {
		if ( y[ jy ] !== 0.0 ) {
			temp = alpha * y[ jy ];
			ix = offsetX;
			for ( i = 0; i < M; i++ ) {
				A[ offsetA + (i * strideA1) + (j * strideA2) ] += x[ ix ] * temp;
				ix += strideX;
			}
		}
		jy += strideY;
	}
	return A;
}


// EXPORTS //

export default dger;
