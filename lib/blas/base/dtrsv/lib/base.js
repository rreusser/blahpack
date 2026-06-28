/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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
* Solves one of the systems of equations:.
* A_x = b,  or  A__T_x = b
* where b is overwritten with the solution x, x is an N element vector,
* and A is an N by N unit or non-unit, upper or lower triangular matrix.
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
* @param {Float64Array} x - input/output vector (b on entry, x on exit)
* @param {integer} strideX - stride for x
* @param {NonNegativeInteger} offsetX - starting index for x
* @returns {Float64Array} `x`
*/
function dtrsv( uplo, trans, diag, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX ) {
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
		// Solve A*x = b
		if ( uplo === 'upper' ) {
			// Upper triangular, no transpose: back-substitution from bottom
			jx = offsetX + (( N - 1 ) * strideX);
			for ( j = N - 1; j >= 0; j-- ) {
				if ( x[ jx ] !== 0.0 ) {
					if ( nounit ) {
						x[ jx ] /= A[ offsetA + (j * sa1) + (j * sa2) ];
					}
					temp = x[ jx ];
					ix = jx - strideX;
					ia = offsetA + (( j - 1 ) * sa1) + (j * sa2);
					for ( i = j - 1; i >= 0; i-- ) {
						x[ ix ] -= temp * A[ ia ];
						ix -= strideX;
						ia -= sa1;
					}
				}
				jx -= strideX;
			}
		} else {
			// Lower triangular, no transpose: forward-substitution from top
			jx = offsetX;
			for ( j = 0; j < N; j++ ) {
				if ( x[ jx ] !== 0.0 ) {
					if ( nounit ) {
						x[ jx ] /= A[ offsetA + (j * sa1) + (j * sa2) ];
					}
					temp = x[ jx ];
					ix = jx + strideX;
					ia = offsetA + (( j + 1 ) * sa1) + (j * sa2);
					for ( i = j + 1; i < N; i++ ) {
						x[ ix ] -= temp * A[ ia ];
						ix += strideX;
						ia += sa1;
					}
				}
				jx += strideX;
			}
		}
	// Solve A**T*x = b (trans = 'transpose' or 'C')
	} else if ( uplo === 'upper' ) {
		// Upper triangular, transpose: forward-substitution from top
		jx = offsetX;
		for ( j = 0; j < N; j++ ) {
			temp = x[ jx ];
			ix = offsetX;
			ia = offsetA + (j * sa2);
			for ( i = 0; i < j; i++ ) {
				temp -= A[ ia ] * x[ ix ];
				ix += strideX;
				ia += sa1;
			}
			if ( nounit ) {
				temp /= A[ offsetA + (j * sa1) + (j * sa2) ];
			}
			x[ jx ] = temp;
			jx += strideX;
		}
	} else {
		// Lower triangular, transpose: back-substitution from bottom
		jx = offsetX + (( N - 1 ) * strideX);
		for ( j = N - 1; j >= 0; j-- ) {
			temp = x[ jx ];
			ix = offsetX + (( N - 1 ) * strideX);
			ia = offsetA + (( N - 1 ) * sa1) + (j * sa2);
			for ( i = N - 1; i > j; i-- ) {
				temp -= A[ ia ] * x[ ix ];
				ix -= strideX;
				ia -= sa1;
			}
			if ( nounit ) {
				temp /= A[ offsetA + (j * sa1) + (j * sa2) ];
			}
			x[ jx ] = temp;
			jx -= strideX;
		}
	}
	return x;
}


// EXPORTS //

export default dtrsv;
