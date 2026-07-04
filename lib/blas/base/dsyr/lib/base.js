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
* Performs the symmetric rank 1 operation:.
* A := alpha_x_x**T + A,
* where alpha is a real scalar, x is an N element vector, and A is an
* N by N symmetric matrix.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is used (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {number} alpha - scalar multiplier
* @param {Float64Array} x - input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting `x` index
* @param {Float64Array} A - input/output symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @returns {Float64Array} `A`
*/
function dsyr( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA ) {
	var temp;
	var sa1;
	var sa2;
	var ix;
	var jx;
	var i;
	var j;

	if ( N === 0 || alpha === 0.0 ) {
		return A;
	}

	sa1 = strideA1;
	sa2 = strideA2;

	if ( uplo === 'upper' ) {
		// Form A when A is stored in the upper triangle
		jx = offsetX;
		for ( j = 0; j < N; j++ ) {
			if ( x[ jx ] !== 0.0 ) {
				temp = alpha * x[ jx ];
				ix = offsetX;
				for ( i = 0; i <= j; i++ ) {
					A[ offsetA + (i * sa1) + (j * sa2) ] += x[ ix ] * temp;
					ix += strideX;
				}
			}
			jx += strideX;
		}
	} else {
		// Form A when A is stored in the lower triangle
		jx = offsetX;
		for ( j = 0; j < N; j++ ) {
			if ( x[ jx ] !== 0.0 ) {
				temp = alpha * x[ jx ];
				ix = jx;
				for ( i = j; i < N; i++ ) {
					A[ offsetA + (i * sa1) + (j * sa2) ] += x[ ix ] * temp;
					ix += strideX;
				}
			}
			jx += strideX;
		}
	}
	return A;
}


// EXPORTS //

export default dsyr;
