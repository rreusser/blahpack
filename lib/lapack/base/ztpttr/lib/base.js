/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
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
	var sap;
	var sa1;
	var sa2;
	var APv;
	var oAP;
	var Av;
	var da;
	var oA;
	var ip;
	var ia;
	var i;
	var j;

	if ( N === 0 ) {
		return 0;
	}

	APv = reinterpret( AP, 0 );
	Av = reinterpret( A, 0 );
	sap = strideAP * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oAP = offsetAP * 2;
	oA = offsetA * 2;

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
