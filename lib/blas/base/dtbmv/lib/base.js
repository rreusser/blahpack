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
* Performs one of the matrix-vector operations `x := A*x` or `x := A**T*x`.
*
* `x` is an N element vector and A is an N by N unit or non-unit, upper or
* lower triangular band matrix, with (K+1) diagonals.
*
* Band storage: for upper triangular, the j-th column of A is stored in the
* j-th column of the band array, with diagonal at row K (0-based).
* For lower triangular, diagonal at row 0.
*
* Upper band: `A_band[K-s + s*sa1 + j*sa2] = A(j-s, j)` for s = 0..min(K,j)
* Lower band: `A_band[s*sa1 + j*sa2] = A(j+s, j)` for s = 0..min(K, N-1-j)
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {string} trans - specifies the operation to be performed
* @param {string} diag - specifies whether the matrix is unit or non-unit triangular
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} K - number of super/sub-diagonals
* @param {Float64Array} A - band matrix in band storage
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} x - input/output vector
* @param {integer} strideX - stride for x
* @param {NonNegativeInteger} offsetX - starting index for x
* @returns {Float64Array} `x`
*/
function dtbmv( uplo, trans, diag, N, K, A, strideA1, strideA2, offsetA, x, strideX, offsetX ) {
	var nounit;
	var kplus1;
	var temp;
	var sa1;
	var sa2;
	var ix;
	var jx;
	var kx;
	var ia;
	var i;
	var j;
	var l;

	if ( N <= 0 ) {
		return x;
	}

	nounit = ( diag === 'non-unit' );
	sa1 = strideA1;
	sa2 = strideA2;

	kx = offsetX;

	if ( trans === 'no-transpose' ) {
		// Form x := A*x
		if ( uplo === 'upper' ) {
			// Upper triangular, no transpose: forward through columns
			// For each column j, scatter x[j]*A[i,j] into x[i] for i < j
			kplus1 = K;
			jx = kx;
			for ( j = 0; j < N; j += 1 ) {
				if ( x[ jx ] !== 0.0 ) {
					temp = x[ jx ];
					l = kplus1 - j;
					ix = kx;
					for ( i = Math.max( 0, j - K ); i < j; i += 1 ) {
						ia = offsetA + ( ( l + i ) * sa1 ) + ( j * sa2 );
						x[ ix ] += temp * A[ ia ];
						ix += strideX;
					}
					if ( nounit ) {
						x[ jx ] *= A[ offsetA + ( kplus1 * sa1 ) + ( j * sa2 ) ];
					}
				}
				jx += strideX;
				if ( j >= K ) {
					kx += strideX;
				}
			}
		} else {
			// Lower triangular, no transpose: backward through columns
			// For each column j (from N-1 to 0), scatter x[j]*A[i,j] into x[i] for i > j
			jx = kx + ( ( N - 1 ) * strideX );
			kx = jx;
			for ( j = N - 1; j >= 0; j -= 1 ) {
				if ( x[ jx ] !== 0.0 ) {
					temp = x[ jx ];
					l = -j;
					ix = kx;
					for ( i = Math.min( N - 1, j + K ); i > j; i -= 1 ) {
						ia = offsetA + ( ( l + i ) * sa1 ) + ( j * sa2 );
						x[ ix ] += temp * A[ ia ];
						ix -= strideX;
					}
					if ( nounit ) {
						x[ jx ] *= A[ offsetA + ( j * sa2 ) ];
					}
				}
				jx -= strideX;
				if ( N - 1 - j >= K ) {
					kx -= strideX;
				}
			}
		}
	} else if ( uplo === 'upper' ) {
		// Form x := A**T*x (trans = 'transpose')
		// Upper triangular, transpose: backward through columns
		kplus1 = K;
		jx = kx + ( ( N - 1 ) * strideX );
		kx = jx;
		for ( j = N - 1; j >= 0; j -= 1 ) {
			temp = x[ jx ];
			kx -= strideX;
			ix = kx;
			l = kplus1 - j;
			if ( nounit ) {
				temp *= A[ offsetA + ( kplus1 * sa1 ) + ( j * sa2 ) ];
			}
			for ( i = j - 1; i >= Math.max( 0, j - K ); i -= 1 ) {
				ia = offsetA + ( ( l + i ) * sa1 ) + ( j * sa2 );
				temp += A[ ia ] * x[ ix ];
				ix -= strideX;
			}
			x[ jx ] = temp;
			jx -= strideX;
		}
	} else {
		// Lower triangular, transpose: forward through columns
		jx = kx;
		for ( j = 0; j < N; j += 1 ) {
			temp = x[ jx ];
			kx += strideX;
			ix = kx;
			l = -j;
			if ( nounit ) {
				temp *= A[ offsetA + ( j * sa2 ) ];
			}
			for ( i = j + 1; i <= Math.min( N - 1, j + K ); i += 1 ) {
				ia = offsetA + ( ( l + i ) * sa1 ) + ( j * sa2 );
				temp += A[ ia ] * x[ ix ];
				ix += strideX;
			}
			x[ jx ] = temp;
			jx += strideX;
		}
	}
	return x;
}


// EXPORTS //

export default dtbmv;
