/* eslint-disable max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Copies a complex triangular matrix from full format (TR) to standard packed format (TP).
*
* @private
* @param {string} uplo - specifies whether `A` is upper or lower triangular (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input matrix in full storage
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} AP - output array in packed storage
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function ztrttp( uplo, N, A, strideA1, strideA2, offsetA, AP, strideAP, offsetAP ) {
	var sap;
	var sa1;
	var sa2;
	var APv;
	var ia;
	var Av;
	var oA;
	var ip;
	var i;
	var j;

	Av = reinterpret( A, 0 );
	APv = reinterpret( AP, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sap = strideAP * 2;
	oA = offsetA * 2;
	ip = offsetAP * 2;

	if ( uplo === 'lower' ) {
		for ( j = 0; j < N; j += 1 ) {
			ia = oA + ( j * sa2 ) + ( j * sa1 );
			for ( i = j; i < N; i += 1 ) {
				APv[ ip ] = Av[ ia ];
				APv[ ip + 1 ] = Av[ ia + 1 ];
				ip += sap;
				ia += sa1;
			}
		}
	} else {
		for ( j = 0; j < N; j += 1 ) {
			ia = oA + ( j * sa2 );
			for ( i = 0; i <= j; i += 1 ) {
				APv[ ip ] = Av[ ia ];
				APv[ ip + 1 ] = Av[ ia + 1 ];
				ip += sap;
				ia += sa1;
			}
		}
	}
	return 0;
}


// EXPORTS //

export default ztrttp;
