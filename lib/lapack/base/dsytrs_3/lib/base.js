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

import dscal from './../../../../blas/base/dscal/lib/base.js';
import dswap from './../../../../blas/base/dswap/lib/base.js';
import dtrsm from './../../../../blas/base/dtrsm/lib/base.js';


// MAIN //

/**
* Solves a system of linear equations `A*X = B` with a real symmetric matrix `A` using the factorization `A = P*U*D*U^T*P^T` or `A = P*L*D*L^T*P^T` computed by `dsytrf_rk` (rook, bounded Bunch-Kaufman).
*
* The diagonal block matrix `D` is stored as: `A[k,k]` holds the diagonal entries while `e` holds the super- (UPLO='upper') or sub- (UPLO='lower') diagonal entries that describe `2x2` pivot blocks.
*
* IPIV uses the Fortran-style convention (matching `dsytrf_rk`):
*
* -   `IPIV[k] >= 0`: `1x1` pivot block; row `k` was interchanged with row `IPIV[k]` (0-based).
* -   `IPIV[k] <  0`: `2x2` pivot block; the swap target row is `~IPIV[k]` (bitwise NOT, equivalently `-IPIV[k]-1`).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand side vectors
* @param {Float64Array} A - factored matrix from `dsytrf_rk` (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} e - super- or sub-diagonal entries of the block diagonal matrix `D`
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Int32Array} IPIV - pivot indices from `dsytrf_rk`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} B - input/output right-hand side / solution matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @returns {integer} status code (0 = success)
*/
function dsytrs3( uplo, N, nrhs, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var akm1k;
	var denom;
	var akm1;
	var bkm1;
	var raw;
	var ak;
	var bk;
	var kp;
	var i;
	var j;

	// Quick return.
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Solve A*X = B, where A = P*U*D*U^T*P^T.

		// Apply P^T to B by interchanging rows in the same order as the formation order of IPIV (k = N-1, ..., 0). The absolute value of IPIV[k] gives the swap target row regardless of pivot block size.
		for ( i = N - 1; i >= 0; i-- ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			kp = ( raw >= 0 ) ? raw : ~raw;
			if ( kp !== i ) {
				dswap( nrhs, B, strideB2, offsetB + ( i * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
			}
		}

		// Compute (U \ P^T * B) -> B.
		dtrsm( 'left', 'upper', 'no-transpose', 'unit', N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Compute D \ B -> B.
		i = N - 1;
		while ( i >= 0 ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( raw >= 0 ) {
				// 1x1 pivot block.
				dscal( nrhs, 1.0 / A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ], B, strideB2, offsetB + ( i * strideB1 ) );
			} else if ( i > 0 ) {
				// 2x2 pivot block; consume rows i-1 and i.
				akm1k = e[ offsetE + ( i * strideE ) ];
				akm1 = A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( ( i - 1 ) * strideA2 ) ] / akm1k;
				ak = A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] / akm1k;
				denom = ( akm1 * ak ) - 1.0;
				for ( j = 0; j < nrhs; j++ ) {
					bkm1 = B[ offsetB + ( ( i - 1 ) * strideB1 ) + ( j * strideB2 ) ] / akm1k;
					bk = B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] / akm1k;
					B[ offsetB + ( ( i - 1 ) * strideB1 ) + ( j * strideB2 ) ] = ( ( ak * bkm1 ) - bk ) / denom;
					B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] = ( ( akm1 * bk ) - bkm1 ) / denom;
				}
				i -= 1;
			}
			i -= 1;
		}

		// Compute (U^T \ B) -> B.
		dtrsm( 'left', 'upper', 'transpose', 'unit', N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Apply P to B by interchanging rows in reverse order (k = 0, ..., N-1).
		for ( i = 0; i < N; i++ ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			kp = ( raw >= 0 ) ? raw : ~raw;
			if ( kp !== i ) {
				dswap( nrhs, B, strideB2, offsetB + ( i * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
			}
		}
	} else {
		// Solve A*X = B, where A = P*L*D*L^T*P^T.

		// Apply P^T to B (k = 0, ..., N-1).
		for ( i = 0; i < N; i++ ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			kp = ( raw >= 0 ) ? raw : ~raw;
			if ( kp !== i ) {
				dswap( nrhs, B, strideB2, offsetB + ( i * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
			}
		}

		// Compute (L \ P^T * B) -> B.
		dtrsm( 'left', 'lower', 'no-transpose', 'unit', N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Compute D \ B -> B.
		i = 0;
		while ( i < N ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( raw >= 0 ) {
				// 1x1 pivot block.
				dscal( nrhs, 1.0 / A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ], B, strideB2, offsetB + ( i * strideB1 ) );
			} else if ( i < N - 1 ) {
				// 2x2 pivot block; consume rows i and i+1.
				akm1k = e[ offsetE + ( i * strideE ) ];
				akm1 = A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] / akm1k;
				ak = A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( ( i + 1 ) * strideA2 ) ] / akm1k;
				denom = ( akm1 * ak ) - 1.0;
				for ( j = 0; j < nrhs; j++ ) {
					bkm1 = B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] / akm1k;
					bk = B[ offsetB + ( ( i + 1 ) * strideB1 ) + ( j * strideB2 ) ] / akm1k;
					B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] = ( ( ak * bkm1 ) - bk ) / denom;
					B[ offsetB + ( ( i + 1 ) * strideB1 ) + ( j * strideB2 ) ] = ( ( akm1 * bk ) - bkm1 ) / denom;
				}
				i += 1;
			}
			i += 1;
		}

		// Compute (L^T \ B) -> B.
		dtrsm( 'left', 'lower', 'transpose', 'unit', N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Apply P to B (k = N-1, ..., 0).
		for ( i = N - 1; i >= 0; i-- ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			kp = ( raw >= 0 ) ? raw : ~raw;
			if ( kp !== i ) {
				dswap( nrhs, B, strideB2, offsetB + ( i * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dsytrs3;
