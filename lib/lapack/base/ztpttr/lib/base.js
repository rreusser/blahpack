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
* Copies a complex triangular matrix from standard packed format (TP) to full format (TR).
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - input packed triangular matrix
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Complex128Array} A - output matrix in full format
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @returns {integer} status code
*/
function ztpttr( uplo, N, AP, strideAP, offsetAP, A, strideA1, strideA2, offsetA ) {
	let da, ip, ia, i, j;

	if ( N === 0 ) {
		return 0;
	}

	const APv = reinterpret( AP, 0 );
	const Av = reinterpret( A, 0 );
	const sap = strideAP * 2;
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const oAP = offsetAP * 2;
	const oA = offsetA * 2;

	ip = oAP;
	if ( uplo === 'lower' ) {
		for ( j = 0; j < N; j += 1 ) {
			da = oA + ( j * sa2 );
			for ( i = j; i < N; i += 1 ) {
				ia = da + ( i * sa1 );
				Av[ ia ] = APv[ ip ];
				Av[ ia + 1 ] = APv[ ip + 1 ];
				ip += sap;
			}
		}
	} else {
		for ( j = 0; j < N; j += 1 ) {
			da = oA + ( j * sa2 );
			for ( i = 0; i <= j; i += 1 ) {
				ia = da + ( i * sa1 );
				Av[ ia ] = APv[ ip ];
				Av[ ia + 1 ] = APv[ ip + 1 ];
				ip += sap;
			}
		}
	}
	return 0;
}


// EXPORTS //

export default ztpttr;
