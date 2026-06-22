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

// MAIN //

/**
* Performs one of the matrix-vector operations:.
* x := A_x,  or  x := A__T_x
* where x is an N element vector and A is an N by N unit or non-unit,
* upper or lower triangular matrix.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} x - vector
* @param {integer} strideX - stride for x
* @param {NonNegativeInteger} offsetX - starting index for x
* @returns {Float64Array} `x`
*/
function dtrmv( uplo, trans, diag, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX ) {
	var nounit;
	var temp;
	var sa1;
	var sa2;
	var ix;
	var jx;
	var ia;
	var i;
	var j;

	if ( N <= 0 ) {
		return x;
	}

	nounit = ( diag === 'non-unit' );
	sa1 = strideA1;
	sa2 = strideA2;

	if ( trans === 'no-transpose' ) {
		// Form x := A*x
		if ( uplo === 'upper' ) {
			// Upper triangular
			jx = offsetX;
			for ( j = 0; j < N; j++ ) {
				if ( x[ jx ] !== 0.0 ) {
					temp = x[ jx ];
					ix = offsetX;
					ia = offsetA + (j * sa2);
					for ( i = 0; i < j; i++ ) {
						x[ ix ] += temp * A[ ia ];
						ix += strideX;
						ia += sa1;
					}
					if ( nounit ) {
						x[ jx ] *= A[ offsetA + (j * sa1) + (j * sa2) ];
					}
				}
				jx += strideX;
			}
		} else {
			// Lower triangular
			jx = offsetX + (( N - 1 ) * strideX);
			for ( j = N - 1; j >= 0; j-- ) {
				if ( x[ jx ] !== 0.0 ) {
					temp = x[ jx ];
					ix = offsetX + (( N - 1 ) * strideX);
					ia = offsetA + (( N - 1 ) * sa1) + (j * sa2);
					for ( i = N - 1; i > j; i-- ) {
						x[ ix ] += temp * A[ ia ];
						ix -= strideX;
						ia -= sa1;
					}
					if ( nounit ) {
						x[ jx ] *= A[ offsetA + (j * sa1) + (j * sa2) ];
					}
				}
				jx -= strideX;
			}
		}
	} else if ( uplo === 'upper' ) {
		// Form x := A**T*x, upper triangular, transpose
		jx = offsetX + (( N - 1 ) * strideX);
		for ( j = N - 1; j >= 0; j-- ) {
			temp = x[ jx ];
			if ( nounit ) {
				temp *= A[ offsetA + (j * sa1) + (j * sa2) ];
			}
			ix = offsetX + (( j - 1 ) * strideX);
			ia = offsetA + (( j - 1 ) * sa1) + (j * sa2);
			for ( i = j - 1; i >= 0; i-- ) {
				temp += A[ ia ] * x[ ix ];
				ix -= strideX;
				ia -= sa1;
			}
			x[ jx ] = temp;
			jx -= strideX;
		}
	} else {
		// Form x := A**T*x, lower triangular, transpose
		jx = offsetX;
		for ( j = 0; j < N; j++ ) {
			temp = x[ jx ];
			if ( nounit ) {
				temp *= A[ offsetA + (j * sa1) + (j * sa2) ];
			}
			ix = offsetX + (( j + 1 ) * strideX);
			ia = offsetA + (( j + 1 ) * sa1) + (j * sa2);
			for ( i = j + 1; i < N; i++ ) {
				temp += A[ ia ] * x[ ix ];
				ix += strideX;
				ia += sa1;
			}
			x[ jx ] = temp;
			jx += strideX;
		}
	}
	return x;
}


// EXPORTS //

export default dtrmv;
