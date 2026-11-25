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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Scans a complex matrix for its last non-zero row.
*
* @private
* @param {integer} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @returns {integer} 0-based index of last non-zero row, or -1 if none
*/
function ilazlr( M, N, A, strideA1, strideA2, offsetA ) {
	let result, re, im, i, j;

	// The reference returns 0 (JS -1) for M = 0, but for N = 0 it reads A(M,1) of a matrix with no columns, out of bounds. With no columns there is no non-zero row, so N = 0 returns -1 here too: one quick return for both `ndarray.js` and the layout wrapper (ticket 0074).
	if ( M === 0 || N === 0 ) {
		return -1;
	}

	const Av = reinterpret( A, 0 );
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const oA = offsetA * 2;

	// Quick test for the common case where one corner is non-zero.
	re = Av[ oA + (( M - 1 ) * sa1) + (0 * sa2) ];
	im = Av[ oA + (( M - 1 ) * sa1) + (0 * sa2) + 1 ];
	if ( re !== 0.0 || im !== 0.0 ) {
		return M - 1;
	}
	re = Av[ oA + (( M - 1 ) * sa1) + (( N - 1 ) * sa2) ];
	im = Av[ oA + (( M - 1 ) * sa1) + (( N - 1 ) * sa2) + 1 ];
	if ( re !== 0.0 || im !== 0.0 ) {
		return M - 1;
	}

	// Scan up each column tracking the last zero row seen.
	result = -1;
	for ( j = 0; j < N; j++ ) {
		i = M - 1;
		while ( i >= 0 ) {
			re = Av[ oA + (i * sa1) + (j * sa2) ];
			im = Av[ oA + (i * sa1) + (j * sa2) + 1 ];
			if ( re !== 0.0 || im !== 0.0 ) {
				break;
			}
			i -= 1;
		}
		if ( i > result ) {
			result = i;
		}
	}
	return result;
}


// EXPORTS //

export default ilazlr;
