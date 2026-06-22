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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlassq from '../../zlassq/lib/base.js';


// MAIN //

/**
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the
* largest absolute value of any element of a complex symmetric matrix A.
*
* NOTE: This is for SYMMETRIC matrices (not Hermitian).
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - the matrix
* @param {integer} strideA1 - first stride of A (complex elements)
* @param {integer} strideA2 - second stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - offset into A (complex elements)
* @param {Float64Array} WORK - workspace of length N (only for `'one-norm'`/`'inf-norm'` norms)
* @param {integer} strideWORK - stride of WORK
* @param {NonNegativeInteger} offsetWORK - offset into WORK
* @returns {number} the norm value
*/
function zlansy( norm, uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK ) {
	var value;
	var scale;
	var absa;
	var sum;
	var Av;
	var sa1;
	var sa2;
	var oA;
	var pa;
	var re;
	var im;
	var wk;
	var result;
	var i;
	var j;

	if ( N === 0 ) {
		return 0.0;
	}

	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	if ( norm === 'max' ) {
		value = 0.0;
		if ( uplo === 'upper' ) {
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i <= j; i++ ) {
					pa = oA + (i * sa1) + (j * sa2);
					re = Av[ pa ];
					im = Av[ pa + 1 ];
					sum = Math.sqrt( re * re + im * im );
					if ( value < sum || sum !== sum ) {
						value = sum;
					}
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				for ( i = j; i < N; i++ ) {
					pa = oA + (i * sa1) + (j * sa2);
					re = Av[ pa ];
					im = Av[ pa + 1 ];
					sum = Math.sqrt( re * re + im * im );
					if ( value < sum || sum !== sum ) {
						value = sum;
					}
				}
			}
		}
		return value;
	}

	if ( norm === 'one-norm' || norm === 'inf-norm' ) {
		value = 0.0;
		if ( uplo === 'upper' ) {
			for ( j = 0; j < N; j++ ) {
				sum = 0.0;
				for ( i = 0; i < j; i++ ) {
					pa = oA + (i * sa1) + (j * sa2);
					re = Av[ pa ];
					im = Av[ pa + 1 ];
					absa = Math.sqrt( re * re + im * im );
					sum += absa;
					wk = offsetWORK + (i * strideWORK);
					WORK[ wk ] += absa;
				}
				pa = oA + (j * sa1) + (j * sa2);
				re = Av[ pa ];
				im = Av[ pa + 1 ];
				wk = offsetWORK + (j * strideWORK);
				WORK[ wk ] = sum + Math.sqrt( re * re + im * im );
			}
			for ( i = 0; i < N; i++ ) {
				sum = WORK[ offsetWORK + (i * strideWORK) ];
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		} else {
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWORK + (i * strideWORK) ] = 0.0;
			}
			for ( j = 0; j < N; j++ ) {
				pa = oA + (j * sa1) + (j * sa2);
				re = Av[ pa ];
				im = Av[ pa + 1 ];
				sum = WORK[ offsetWORK + (j * strideWORK) ] + Math.sqrt( re * re + im * im );
				for ( i = j + 1; i < N; i++ ) {
					pa = oA + (i * sa1) + (j * sa2);
					re = Av[ pa ];
					im = Av[ pa + 1 ];
					absa = Math.sqrt( re * re + im * im );
					sum += absa;
					WORK[ offsetWORK + (i * strideWORK) ] += absa;
				}
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		}
		return value;
	}

	if ( norm === 'frobenius' ) {
		scale = 0.0;
		sum = 1.0;
		if ( uplo === 'upper' ) {
			for ( j = 1; j < N; j++ ) {
				result = zlassq( j, A, strideA1, offsetA + (j * strideA2), scale, sum );
				scale = result.scl;
				sum = result.sumsq;
			}
		} else {
			for ( j = 0; j < N - 1; j++ ) {
				result = zlassq( N - j - 1, A, strideA1, offsetA + (( j + 1 ) * strideA1) + (j * strideA2), scale, sum );
				scale = result.scl;
				sum = result.sumsq;
			}
		}
		sum *= 2.0;
		result = zlassq( N, A, strideA1 + strideA2, offsetA, scale, sum );
		scale = result.scl;
		sum = result.sumsq;
		return scale * Math.sqrt( sum );
	}

	return 0.0;
}


// EXPORTS //

export default zlansy;
