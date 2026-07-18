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


// MAIN //

/**
* Copies all or part of a complex matrix `A` to another complex matrix `B`.
*
* @private
* @param {string} uplo - specifies whether to copy the upper triangle, lower triangle, or all of `A`
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} B - output matrix
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @returns {Complex128Array} `B`
*/
function zlacpy( uplo, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	let ia, ib, i, j;

	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const sb1 = strideB1 * 2;
	const sb2 = strideB2 * 2;
	const oA = offsetA * 2;
	const oB = offsetB * 2;

	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			ia = oA + ( j * sa2 );
			ib = oB + ( j * sb2 );
			for ( i = 0; i <= j && i < M; i++ ) {
				Bv[ ib + ( i * sb1 ) ] = Av[ ia + ( i * sa1 ) ];
				Bv[ ib + ( i * sb1 ) + 1 ] = Av[ ia + ( i * sa1 ) + 1 ];
			}
		}
	} else if ( uplo === 'lower' ) {
		for ( j = 0; j < N; j++ ) {
			ia = oA + ( j * sa2 );
			ib = oB + ( j * sb2 );
			for ( i = j; i < M; i++ ) {
				Bv[ ib + ( i * sb1 ) ] = Av[ ia + ( i * sa1 ) ];
				Bv[ ib + ( i * sb1 ) + 1 ] = Av[ ia + ( i * sa1 ) + 1 ];
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			ia = oA + ( j * sa2 );
			ib = oB + ( j * sb2 );
			for ( i = 0; i < M; i++ ) {
				Bv[ ib + ( i * sb1 ) ] = Av[ ia + ( i * sa1 ) ];
				Bv[ ib + ( i * sb1 ) + 1 ] = Av[ ia + ( i * sa1 ) + 1 ];
			}
		}
	}
	return B;
}


// EXPORTS //

export default zlacpy;
