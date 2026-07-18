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

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// VARIABLES //

const BLOCK_SIZE = 32;


// MAIN //

/**
* Performs a series of row interchanges on a complex double-precision matrix `A`.
* using pivot indices stored in `IPIV`.
*
* When incx > 0, rows k1 through k2 are interchanged in forward order, reading
* IPIV from offsetIPIV.
*
* When incx < 0, rows k1 down to k2 are interchanged in reverse order (k1 > k2),
* reading IPIV from offsetIPIV + (k1-k2)*strideIPIV backwards.
*
* @private
* @param {PositiveInteger} N - number of columns in `A`
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for `A` (in complex elements)
* @param {NonNegativeInteger} k1 - index of first row to interchange (0-based)
* @param {NonNegativeInteger} k2 - index of last row to interchange (0-based)
* @param {Int32Array} IPIV - vector of pivot indices (0-based)
* @param {integer} strideIPIV - `IPIV` stride length
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {integer} incx - direction in which to apply pivots (-1 to apply in reverse order; otherwise, apply in provided order)
* @returns {Complex128Array} permuted matrix `A`
*/
function zlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, IPIV, strideIPIV, offsetIPIV, incx ) {
	let istart, nrows, ixinc, iinc, tmpR, tmpI, ix0, row, ia1, ia2, ix, kk, i;
	let j, n, o;

	if ( incx > 0 ) {
		// Forward: iterate from k1 to k2
		nrows = k2 - k1 + 1;
		ix0 = offsetIPIV;
		ixinc = strideIPIV;
		istart = k1;
		iinc = 1;
	} else if ( incx < 0 ) {
		// Reverse: k1 > k2, iterate from k1 down to k2
		nrows = k1 - k2 + 1;

		// IPIV is read from the last element backwards
		ix0 = offsetIPIV + ( ( nrows - 1 ) * strideIPIV );
		ixinc = -strideIPIV;
		istart = k1;
		iinc = -1;
	} else {
		return A;
	}

	// Reinterpret Complex128Array as Float64Array for element access
	const Av = reinterpret( A, 0 );
	const oA = offsetA * 2;

	// Convert complex-element strides to Float64 strides
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;

	// Use loop tiling for cache-efficient column-major access.

	// Outer loop: blocks of columns. Inner loop: row swaps.
	const n32 = ( ( N / BLOCK_SIZE ) | 0 ) * BLOCK_SIZE;
	if ( n32 !== 0 ) {
		for ( j = 0; j < n32; j += BLOCK_SIZE ) {
			ix = ix0;
			kk = istart;
			for ( i = 0; i < nrows; i++ ) {
				row = IPIV[ ix ];
				if ( row !== kk ) {
					ia1 = oA + ( kk * sa1 );
					ia2 = oA + ( row * sa1 );
					for ( n = j; n < j + BLOCK_SIZE; n++ ) {
						o = n * sa2;

						// Swap real parts
						tmpR = Av[ ia1 + o ];
						tmpI = Av[ ia1 + o + 1 ];
						Av[ ia1 + o ] = Av[ ia2 + o ];
						Av[ ia1 + o + 1 ] = Av[ ia2 + o + 1 ];
						Av[ ia2 + o ] = tmpR;
						Av[ ia2 + o + 1 ] = tmpI;
					}
				}
				ix += ixinc;
				kk += iinc;
			}
		}
	}
	if ( n32 !== N ) {
		ix = ix0;
		kk = istart;
		for ( i = 0; i < nrows; i++ ) {
			row = IPIV[ ix ];
			if ( row !== kk ) {
				ia1 = oA + ( kk * sa1 );
				ia2 = oA + ( row * sa1 );
				for ( n = n32; n < N; n++ ) {
					o = n * sa2;

					// Swap real and imaginary parts
					tmpR = Av[ ia1 + o ];
					tmpI = Av[ ia1 + o + 1 ];
					Av[ ia1 + o ] = Av[ ia2 + o ];
					Av[ ia1 + o + 1 ] = Av[ ia2 + o + 1 ];
					Av[ ia2 + o ] = tmpR;
					Av[ ia2 + o + 1 ] = tmpI;
				}
			}
			ix += ixinc;
			kk += iinc;
		}
	}
	return A;
}


// EXPORTS //

export default zlaswp;
