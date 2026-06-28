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
* where b and x are N element vectors and A is an N by N unit or non-unit,
* upper or lower triangular band matrix, with (K+1) diagonals.
*
* Band storage: for upper triangular, the j-th column of A is stored in the
* j-th column of the band array, with diagonal at row K (0-based).
* For lower triangular, diagonal at row 0.
*
* Upper band: `A_band[K-s + s_sa1 + j_sa2] = A(j-s, j)` for s = 0..min(K,j)
* Lower band: `A_band[s_sa1 + j_sa2] = A(j+s, j)` for s = 0..min(K, N-1-j)
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} K - number of super/sub-diagonals
* @param {Float64Array} A - band matrix in band storage
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} x - input/output vector (b on entry, x on exit)
* @param {integer} strideX - stride for x
* @param {NonNegativeInteger} offsetX - starting index for x
* @returns {Float64Array} `x`
*/
function dtbsv( uplo, trans, diag, N, K, A, strideA1, strideA2, offsetA, x, strideX, offsetX ) {
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
		// Solve A*x = b
		if ( uplo === 'upper' ) {
			// Upper triangular, no transpose: back-substitution from bottom
			// Band storage: diagonal at row K (0-based), element A(i,j) at row K+i-j
			kplus1 = K;
			jx = kx + (( N - 1 ) * strideX);
			for ( j = N - 1; j >= 0; j-- ) {
				if ( x[ jx ] !== 0.0 ) {
					// L = kplus1 - j (Fortran: KPLUS1 - J, 0-based offset for band row)
					l = kplus1 - j;
					if ( nounit ) {
						x[ jx ] /= A[ offsetA + (kplus1 * sa1) + (j * sa2) ];
					}
					temp = x[ jx ];
					ix = jx - strideX;
					for ( i = j - 1; i >= Math.max( 0, j - K ); i-- ) {
						// A(l+i, j) in Fortran 1-based = A_band[(l+i)*sa1 + j*sa2] 0-based
						// l = kplus1 - j, so (l + i) = kplus1 - j + i = K + i - j
						ia = offsetA + (( l + i ) * sa1) + (j * sa2);
						x[ ix ] -= temp * A[ ia ];
						ix -= strideX;
					}
				}
				jx -= strideX;
			}
		} else {
			// Lower triangular, no transpose: forward-substitution from top
			// Band storage: diagonal at row 0, element A(i,j) at row i-j (0-based)
			jx = kx;
			for ( j = 0; j < N; j++ ) {
				if ( x[ jx ] !== 0.0 ) {
					l = -j; // Fortran: L = 1 - J (1-based), 0-based: L = -j
					if ( nounit ) {
						x[ jx ] /= A[ offsetA + (j * sa2) ];
					}
					temp = x[ jx ];
					ix = jx + strideX;
					for ( i = j + 1; i < Math.min( N, j + K + 1 ); i++ ) {
						// Band row = l + i = i - j
						ia = offsetA + (( l + i ) * sa1) + (j * sa2);
						x[ ix ] -= temp * A[ ia ];
						ix += strideX;
					}
				}
				jx += strideX;
			}
		}
	} else if ( uplo === 'upper' ) {
		// Solve A**T*x = b (trans = 'transpose' or 'C')
		// Upper triangular, transpose: forward-substitution from top
		kplus1 = K;
		jx = kx;
		for ( j = 0; j < N; j++ ) {
			temp = x[ jx ];
			l = kplus1 - j;
			ix = kx;
			for ( i = Math.max( 0, j - K ); i < j; i++ ) {
				ia = offsetA + (( l + i ) * sa1) + (j * sa2);
				temp -= A[ ia ] * x[ ix ];
				ix += strideX;
			}
			if ( nounit ) {
				temp /= A[ offsetA + (kplus1 * sa1) + (j * sa2) ];
			}
			x[ jx ] = temp;
			jx += strideX;
			if ( j >= K ) {
				kx += strideX;
			}
		}
	} else {
		// Lower triangular, transpose: back-substitution from bottom
		jx = kx + (( N - 1 ) * strideX);
		for ( j = N - 1; j >= 0; j-- ) {
			temp = x[ jx ];
			l = -j;
			ix = kx + (( N - 1 ) * strideX);
			for ( i = Math.min( N - 1, j + K ); i > j; i-- ) {
				ia = offsetA + (( l + i ) * sa1) + (j * sa2);
				temp -= A[ ia ] * x[ ix ];
				ix -= strideX;
			}
			if ( nounit ) {
				temp /= A[ offsetA + (j * sa2) ];
			}
			x[ jx ] = temp;
			jx -= strideX;
			if ( N - 1 - j >= K ) {
				kx -= strideX;
			}
		}
	}
	return x;
}


// EXPORTS //

export default dtbsv;
