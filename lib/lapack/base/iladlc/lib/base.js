/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MAIN //

/**
* Scans a real matrix for its last non-zero column.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @returns {integer} 0-based index of last non-zero column, or -1 if none
*/
function iladlc( M, N, A, strideA1, strideA2, offsetA ) {
	var i;
	var j;

	if ( N === 0 ) {
		return -1;
	}

	// Quick test for the common case where one corner is non-zero.
	if ( A[ offsetA + (( N - 1 ) * strideA2) ] !== 0.0 ||
		A[ offsetA + (( M - 1 ) * strideA1) + (( N - 1 ) * strideA2) ] !== 0.0 ) {
		return N - 1;
	}

	// Scan each column from the end, returning with the first non-zero.
	for ( j = N - 1; j >= 0; j-- ) {
		for ( i = 0; i < M; i++ ) {
			if ( A[ offsetA + (i * strideA1) + (j * strideA2) ] !== 0.0 ) {
				return j;
			}
		}
	}
	return -1;
}


// EXPORTS //

export default iladlc;
