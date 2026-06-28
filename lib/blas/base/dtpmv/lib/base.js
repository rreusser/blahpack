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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MAIN //

/**
* Performs one of the matrix-vector operations `x := A*x` or `x := A^T*x`.
*
* `x` is an N element vector and A is an N by N unit or non-unit, upper or
* lower triangular matrix, supplied in packed form.
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {string} trans - specifies the operation to perform
* @param {string} diag - specifies whether the matrix is unit triangular
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed triangular matrix
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} x - input/output vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @returns {Float64Array} `x`
*/
function dtpmv( uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX ) {
	var nounit;
	var temp;
	var kk;
	var ix;
	var jx;
	var ip;
	var i;
	var j;

	if ( N <= 0 ) {
		return x;
	}

	nounit = ( diag === 'non-unit' );

	if ( trans === 'no-transpose' ) {
		// Form x := A*x
		if ( uplo === 'upper' ) {
			// Upper triangular, no-transpose
			kk = offsetAP;
			jx = offsetX;
			for ( j = 0; j < N; j += 1 ) {
				if ( x[ jx ] !== 0.0 ) {
					temp = x[ jx ];
					ix = offsetX;
					ip = kk;
					for ( i = 0; i < j; i += 1 ) {
						x[ ix ] += temp * AP[ ip ];
						ix += strideX;
						ip += strideAP;
					}
					if ( nounit ) {
						// Diagonal element is at kk + j*strideAP
						x[ jx ] *= AP[ kk + ( j * strideAP ) ];
					}
				}
				jx += strideX;
				kk += ( j + 1 ) * strideAP;
			}
		} else {
			// Lower triangular, no-transpose
			kk = offsetAP + ( ( ( ( N * ( N + 1 ) ) / 2 ) - 1 ) * strideAP );
			jx = offsetX + ( ( N - 1 ) * strideX );
			for ( j = N - 1; j >= 0; j -= 1 ) {
				if ( x[ jx ] !== 0.0 ) {
					temp = x[ jx ];
					ix = offsetX + ( ( N - 1 ) * strideX );
					ip = kk;
					for ( i = N - 1; i > j; i -= 1 ) {
						x[ ix ] += temp * AP[ ip ];
						ix -= strideX;
						ip -= strideAP;
					}
					if ( nounit ) {
						// Diagonal element is at kk - (N-1-j)*strideAP
						x[ jx ] *= AP[ kk - ( ( N - 1 - j ) * strideAP ) ];
					}
				}
				jx -= strideX;
				kk -= ( N - j ) * strideAP;
			}
		}
	} else if ( uplo === 'upper' ) {
		// Form x := A^T*x, upper triangular, transpose
		kk = offsetAP + ( ( ( ( N * ( N + 1 ) ) / 2 ) - 1 ) * strideAP );
		jx = offsetX + ( ( N - 1 ) * strideX );
		for ( j = N - 1; j >= 0; j -= 1 ) {
			temp = x[ jx ];
			if ( nounit ) {
				temp *= AP[ kk ];
			}
			ip = kk - strideAP;
			ix = jx - strideX;
			for ( i = j - 1; i >= 0; i -= 1 ) {
				temp += AP[ ip ] * x[ ix ];
				ip -= strideAP;
				ix -= strideX;
			}
			x[ jx ] = temp;
			jx -= strideX;
			kk -= ( j + 1 ) * strideAP;
		}
	} else {
		// Form x := A^T*x, lower triangular, transpose
		kk = offsetAP;
		jx = offsetX;
		for ( j = 0; j < N; j += 1 ) {
			temp = x[ jx ];
			if ( nounit ) {
				temp *= AP[ kk ];
			}
			ip = kk + strideAP;
			ix = jx + strideX;
			for ( i = j + 1; i < N; i += 1 ) {
				temp += AP[ ip ] * x[ ix ];
				ip += strideAP;
				ix += strideX;
			}
			x[ jx ] = temp;
			jx += strideX;
			kk += ( N - j ) * strideAP;
		}
	}
	return x;
}


// EXPORTS //

export default dtpmv;
