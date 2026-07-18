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

const BLOCK_SIZE = 32;


// MAIN //

/**
* Performs a series of row interchanges on a matrix `A` using pivot indices stored in `IPIV`.
*
* @private
* @param {PositiveInteger} N - number of columns in `A`
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {NonNegativeInteger} k1 - index of first row to interchange
* @param {NonNegativeInteger} k2 - index of last row to interchange
* @param {integer} inck - direction in which to apply pivots (-1 to apply pivots in reverse order; otherwise, apply in provided order)
* @param {Int32Array} IPIV - vector of pivot indices
* @param {integer} strideIPIV - `IPIV` stride length
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @returns {Float64Array} permuted matrix `A`
*/
function dlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, inck, IPIV, strideIPIV, offsetIPIV ) {
	let nrows, tmp, row, ia1, ia2, ip, i, j, k, n, o;

	// Compute the number of rows to be interchanged:
	if ( inck > 0 ) {
		nrows = k2 - k1;
	} else {
		nrows = k1 - k2;
	}
	nrows += 1;

	// Use loop tiling (BLOCK_SIZE-column blocks) for cache-efficient column-major access:
	const n32 = ( ( N / BLOCK_SIZE ) | 0 ) * BLOCK_SIZE;
	if ( n32 !== 0 ) {
		for ( j = 0; j < n32; j += BLOCK_SIZE ) {
			ip = offsetIPIV;
			for ( i = 0, k = k1; i < nrows; i++, k += inck ) {
				row = IPIV[ ip ];
				if ( row !== k ) {
					ia1 = offsetA + ( k * strideA1 );
					ia2 = offsetA + ( row * strideA1 );
					for ( n = j; n < j + BLOCK_SIZE; n++ ) {
						o = n * strideA2;
						tmp = A[ ia1 + o ];
						A[ ia1 + o ] = A[ ia2 + o ];
						A[ ia2 + o ] = tmp;
					}
				}
				ip += strideIPIV;
			}
		}
	}
	if ( n32 !== N ) {
		ip = offsetIPIV;
		for ( i = 0, k = k1; i < nrows; i++, k += inck ) {
			row = IPIV[ ip ];
			if ( row !== k ) {
				ia1 = offsetA + ( k * strideA1 );
				ia2 = offsetA + ( row * strideA1 );
				for ( n = n32; n < N; n++ ) {
					o = n * strideA2;
					tmp = A[ ia1 + o ];
					A[ ia1 + o ] = A[ ia2 + o ];
					A[ ia2 + o ] = tmp;
				}
			}
			ip += strideIPIV;
		}
	}
	return A;
}


// EXPORTS //

export default dlaswp;
