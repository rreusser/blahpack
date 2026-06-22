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

// MAIN //

/**
* Solves one of the systems of equations `A*x = b` or `A^T*x = b`.
*
* `b` and `x` are N element vectors and `A` is an N by N unit or non-unit,
* upper or lower triangular matrix, supplied in packed form.
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {string} trans - specifies the operation to be performed
* @param {string} diag - specifies whether the matrix is unit or non-unit triangular
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} AP - packed triangular matrix
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} x - input/output vector (b on entry, x on exit)
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @returns {Float64Array} `x`
*/
function dtpsv( uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX ) {
	var nounit;
	var temp;
	var kk;
	var jx;
	var ix;
	var ip;
	var j;

	if ( N === 0 ) {
		return x;
	}

	nounit = ( diag === 'non-unit' );

	if ( trans === 'no-transpose' ) {
		// Solve A*x = b
		if ( uplo === 'upper' ) {
			// Upper triangular, no transpose: backward substitution
			kk = offsetAP + ( ( ( ( N * ( N + 1 ) ) / 2 ) - 1 ) * strideAP );
			jx = offsetX + ( ( N - 1 ) * strideX );
			for ( j = N - 1; j >= 0; j -= 1 ) {
				if ( x[ jx ] !== 0.0 ) {
					if ( nounit ) {
						x[ jx ] /= AP[ kk ];
					}
					temp = x[ jx ];
					ip = kk - strideAP;
					ix = jx - strideX;
					for ( ; ip >= kk - ( j * strideAP ); ip -= strideAP ) {
						x[ ix ] -= temp * AP[ ip ];
						ix -= strideX;
					}
				}
				jx -= strideX;
				kk -= ( j + 1 ) * strideAP;
			}
		} else {
			// Lower triangular, no transpose: forward substitution
			kk = offsetAP;
			jx = offsetX;
			for ( j = 0; j < N; j += 1 ) {
				if ( x[ jx ] !== 0.0 ) {
					if ( nounit ) {
						x[ jx ] /= AP[ kk ];
					}
					temp = x[ jx ];
					ip = kk + strideAP;
					ix = jx + strideX;
					for ( ; ip <= kk + ( ( N - j - 1 ) * strideAP ); ip += strideAP ) {
						x[ ix ] -= temp * AP[ ip ];
						ix += strideX;
					}
				}
				jx += strideX;
				kk += ( N - j ) * strideAP;
			}
		}
	} else if ( uplo === 'upper' ) {
		// Solve A^T*x = b, upper triangular, transpose: forward substitution
		kk = offsetAP;
		jx = offsetX;
		for ( j = 0; j < N; j += 1 ) {
			temp = x[ jx ];
			ip = kk;
			ix = offsetX;
			for ( ; ip < kk + ( j * strideAP ); ip += strideAP ) {
				temp -= AP[ ip ] * x[ ix ];
				ix += strideX;
			}
			if ( nounit ) {
				temp /= AP[ kk + ( j * strideAP ) ];
			}
			x[ jx ] = temp;
			jx += strideX;
			kk += ( j + 1 ) * strideAP;
		}
	} else {
		// Solve A^T*x = b, lower triangular, transpose: backward substitution
		kk = offsetAP + ( ( ( ( N * ( N + 1 ) ) / 2 ) - 1 ) * strideAP );
		jx = offsetX + ( ( N - 1 ) * strideX );
		for ( j = N - 1; j >= 0; j -= 1 ) {
			temp = x[ jx ];
			ip = kk;
			ix = offsetX + ( ( N - 1 ) * strideX );
			for ( ; ip > kk - ( ( N - j - 1 ) * strideAP ); ip -= strideAP ) {
				temp -= AP[ ip ] * x[ ix ];
				ix -= strideX;
			}
			if ( nounit ) {
				temp /= AP[ kk - ( ( N - j - 1 ) * strideAP ) ];
			}
			x[ jx ] = temp;
			jx -= strideX;
			kk -= ( N - j ) * strideAP;
		}
	}
	return x;
}


// EXPORTS //

export default dtpsv;
