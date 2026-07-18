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
* Scans a complex matrix for its last non-zero column.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @returns {integer} 0-based index of last non-zero column, or -1 if none
*/
function ilazlc( M, N, A, strideA1, strideA2, offsetA ) {
	let re, im, i, j;

	if ( N === 0 ) {
		return -1;
	}

	const Av = reinterpret( A, 0 );
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const oA = offsetA * 2;

	// Quick test for the common case where one corner is non-zero.
	re = Av[ oA + (0 * sa1) + (( N - 1 ) * sa2) ];
	im = Av[ oA + (0 * sa1) + (( N - 1 ) * sa2) + 1 ];
	if ( re !== 0.0 || im !== 0.0 ) {
		return N - 1;
	}
	re = Av[ oA + (( M - 1 ) * sa1) + (( N - 1 ) * sa2) ];
	im = Av[ oA + (( M - 1 ) * sa1) + (( N - 1 ) * sa2) + 1 ];
	if ( re !== 0.0 || im !== 0.0 ) {
		return N - 1;
	}

	// Scan each column from the end, returning with the first non-zero.
	for ( j = N - 1; j >= 0; j-- ) {
		for ( i = 0; i < M; i++ ) {
			re = Av[ oA + (i * sa1) + (j * sa2) ];
			im = Av[ oA + (i * sa1) + (j * sa2) + 1 ];
			if ( re !== 0.0 || im !== 0.0 ) {
				return j;
			}
		}
	}
	return -1;
}


// EXPORTS //

export default ilazlc;
