/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements */

// MAIN //

/**
* Performs the matrix-vector operation `y := alpha*A*x + beta*y`.
*
* Alpha and beta are scalars, x and y are N-element vectors, and A is an
* N-by-N symmetric band matrix with K super-diagonals.
*
* Upper band storage: the diagonal is at row K, and element `A(i,j)` of the
* full matrix is at band position `A_band[K+i-j, j]`.
*
* Lower band storage: the diagonal is at row 0, and element `A(i,j)` of the
* full matrix is at band position `A_band[i-j, j]`.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is stored: `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} K - number of super-diagonals (or sub-diagonals)
* @param {number} alpha - scalar constant
* @param {Float64Array} A - band matrix in band storage
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} beta - scalar constant
* @param {Float64Array} y - input/output vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @returns {Float64Array} `y`
*/
function dsbmv( uplo, N, K, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	let kplus1, temp1, temp2, ix, iy, jx, jy, kx, ky, ia, l, i, j;

	// Quick return if possible:
	if ( N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return y;
	}

	const sa1 = strideA1;
	const sa2 = strideA2;

	kx = offsetX;
	ky = offsetY;

	// First form y := beta * y:
	if ( beta !== 1.0 ) {
		iy = ky;
		if ( beta === 0.0 ) {
			for ( i = 0; i < N; i += 1 ) {
				y[ iy ] = 0.0;
				iy += strideY;
			}
		} else {
			for ( i = 0; i < N; i += 1 ) {
				y[ iy ] *= beta;
				iy += strideY;
			}
		}
	}
	if ( alpha === 0.0 ) {
		return y;
	}

	if ( uplo === 'upper' ) {
		// Form y when upper triangle of A is stored.
		// Band storage: diagonal at row K, element A(i,j) at row K+i-j.
		kplus1 = K;
		jx = kx;
		jy = ky;
		for ( j = 0; j < N; j += 1 ) {
			temp1 = alpha * x[ jx ];
			temp2 = 0.0;
			l = kplus1 - j;
			ix = kx;
			iy = ky;
			for ( i = Math.max( 0, j - K ); i < j; i += 1 ) {
				// Band row = l + i = K + i - j (0-based)
				ia = offsetA + ( ( l + i ) * sa1 ) + ( j * sa2 );
				y[ iy ] += temp1 * A[ ia ];
				temp2 += A[ ia ] * x[ ix ];
				ix += strideX;
				iy += strideY;
			}

			// Diagonal element: band row = K
			y[ jy ] += ( temp1 * A[ offsetA + ( kplus1 * sa1 ) + ( j * sa2 ) ] ) + ( alpha * temp2 );
			jx += strideX;
			jy += strideY;
			if ( j >= K ) {
				kx += strideX;
				ky += strideY;
			}
		}
	} else {
		// Form y when lower triangle of A is stored.
		// Band storage: diagonal at row 0, element A(i,j) at row i-j.
		jx = kx;
		jy = ky;
		for ( j = 0; j < N; j += 1 ) {
			temp1 = alpha * x[ jx ];
			temp2 = 0.0;

			// Diagonal element: band row = 0
			y[ jy ] += temp1 * A[ offsetA + ( j * sa2 ) ];
			l = -j;
			ix = jx;
			iy = jy;
			for ( i = j + 1; i < Math.min( N, j + K + 1 ); i += 1 ) {
				ix += strideX;
				iy += strideY;

				// Band row = l + i = i - j
				ia = offsetA + ( ( l + i ) * sa1 ) + ( j * sa2 );
				y[ iy ] += temp1 * A[ ia ];
				temp2 += A[ ia ] * x[ ix ];
			}
			y[ jy ] += alpha * temp2;
			jx += strideX;
			jy += strideY;
		}
	}
	return y;
}


// EXPORTS //

export default dsbmv;
