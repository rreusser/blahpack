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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import dgemv from './../../../../blas/base/dgemv/lib/base.js';
import dger from './../../../../blas/base/dger/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dswap from './../../../../blas/base/dswap/lib/base.js';


// MAIN //

/**
* Solves a system of linear equations `A*X = B` with a real symmetric matrix `A` using the factorization `A = U*D*U^T` or `A = L*D*L^T` computed by `dsytrf_rook`.
*
* IPIV uses the same 0-based convention as `dsytf2_rook`/`dsytrf_rook`:
*
* -   `IPIV[k]` >= 0: 1x1 pivot, row k was interchanged with row `IPIV[k]`.
* -   `IPIV[k]` < 0: 2x2 pivot, `IPIV[k]` = `~kp` (bitwise NOT of 0-based index). For rook pivoting, BOTH entries of a 2x2 block are negative, each encoding its own swap target.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand side vectors
* @param {Float64Array} A - factored matrix from `dsytrf_rook` (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {Int32Array} IPIV - pivot indices from `dsytrf_rook`
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {Float64Array} B - input/output right-hand side / solution matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - index offset for `B`
* @returns {integer} info - 0 on success
*/
function dsytrsRook( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var denom;
	var akm1k;
	var akm1;
	var bkm1;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var ak;
	var bk;
	var kp;
	var k;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;
	sb1 = strideB1;
	sb2 = strideB2;

	// Quick return
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Solve A*X = B where A = U*D*U^T

		// First solve U*D*X = B, overwriting B with X. K starts at N-1 (0-based) and decreases.
		k = N - 1;
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				// 1x1 pivot block

				// Interchange rows k and IPIV[k]
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + (k * sb1), B, sb2, offsetB + (kp * sb1) );
				}

				// Apply multiplier: B(0:k-1,:) -= A(0:k-1,k) * B(k,:)
				if ( k > 0 ) {
					dger( k, nrhs, -1.0, A, sa1, offsetA + (k * sa2), B, sb2, offsetB + (k * sb1), B, sb1, sb2, offsetB );
				}

				// Divide row k by pivot D(k,k)
				dscal( nrhs, 1.0 / A[ offsetA + (k * sa1) + (k * sa2) ], B, sb2, offsetB + (k * sb1) );
				k -= 1;
			} else {
				// 2x2 pivot block (rook): TWO swaps

				// Interchange rows k and ~IPIV[k]
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + (k * sb1), B, sb2, offsetB + (kp * sb1) );
				}

				// Interchange rows k-1 and ~IPIV[k-1]
				kp = ~IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ];
				if ( kp !== k - 1 ) {
					dswap( nrhs, B, sb2, offsetB + (( k - 1 ) * sb1), B, sb2, offsetB + (kp * sb1) );
				}

				// Apply multipliers
				if ( k > 1 ) {
					dger( k - 1, nrhs, -1.0, A, sa1, offsetA + (k * sa2), B, sb2, offsetB + (k * sb1), B, sb1, sb2, offsetB );
					dger( k - 1, nrhs, -1.0, A, sa1, offsetA + (( k - 1 ) * sa2), B, sb2, offsetB + (( k - 1 ) * sb1), B, sb1, sb2, offsetB );
				}

				// Solve 2x2 system: D * [x(k-1); x(k)] = [b(k-1); b(k)]
				akm1k = A[ offsetA + (( k - 1 ) * sa1) + (k * sa2) ];
				akm1 = A[ offsetA + (( k - 1 ) * sa1) + (( k - 1 ) * sa2) ] / akm1k;
				ak = A[ offsetA + (k * sa1) + (k * sa2) ] / akm1k;
				denom = (akm1 * ak) - 1.0;
				for ( j = 0; j < nrhs; j++ ) {
					bkm1 = B[ offsetB + (( k - 1 ) * sb1) + (j * sb2) ] / akm1k;
					bk = B[ offsetB + (k * sb1) + (j * sb2) ] / akm1k;
					B[ offsetB + (( k - 1 ) * sb1) + (j * sb2) ] = ( (ak * bkm1) - bk ) / denom;
					B[ offsetB + (k * sb1) + (j * sb2) ] = ( (akm1 * bk) - bkm1 ) / denom;
				}
				k -= 2;
			}
		}

		// Next solve U^T * X = B, overwriting B with X. K starts at 0 and increases.
		k = 0;
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				// 1x1 pivot

				// Apply multiplier: B(k,:) -= A(0:k-1,k)^T * B(0:k-1,:)
				if ( k > 0 ) {
					dgemv( 'transpose', k, nrhs, -1.0, B, sb1, sb2, offsetB, A, sa1, offsetA + (k * sa2), 1.0, B, sb2, offsetB + (k * sb1) );
				}

				// Interchange rows k and IPIV[k]
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + (k * sb1), B, sb2, offsetB + (kp * sb1) );
				}
				k += 1;
			} else {
				// 2x2 pivot (rook)

				if ( k > 0 ) {
					dgemv( 'transpose', k, nrhs, -1.0, B, sb1, sb2, offsetB, A, sa1, offsetA + (k * sa2), 1.0, B, sb2, offsetB + (k * sb1) );
					dgemv( 'transpose', k, nrhs, -1.0, B, sb1, sb2, offsetB, A, sa1, offsetA + (( k + 1 ) * sa2), 1.0, B, sb2, offsetB + (( k + 1 ) * sb1) );
				}

				// Interchange rows k and ~IPIV[k]
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + (k * sb1), B, sb2, offsetB + (kp * sb1) );
				}

				// Interchange rows k+1 and ~IPIV[k+1]
				kp = ~IPIV[ offsetIPIV + (( k + 1 ) * strideIPIV) ];
				if ( kp !== k + 1 ) {
					dswap( nrhs, B, sb2, offsetB + (( k + 1 ) * sb1), B, sb2, offsetB + (kp * sb1) );
				}
				k += 2;
			}
		}
	} else {
		// Solve A*X = B where A = L*D*L^T

		// First solve L*D*X = B, overwriting B with X. K starts at 0 and increases.
		k = 0;
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				// 1x1 pivot

				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + (k * sb1), B, sb2, offsetB + (kp * sb1) );
				}

				// Apply multiplier: B(k+1:N-1,:) -= A(k+1:N-1,k) * B(k,:)
				if ( k < N - 1 ) {
					dger( N - k - 1, nrhs, -1.0, A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2), B, sb2, offsetB + (k * sb1), B, sb1, sb2, offsetB + (( k + 1 ) * sb1) );
				}

				// Divide row k by pivot
				dscal( nrhs, 1.0 / A[ offsetA + (k * sa1) + (k * sa2) ], B, sb2, offsetB + (k * sb1) );
				k += 1;
			} else {
				// 2x2 pivot (rook): TWO swaps

				// Interchange rows k and ~IPIV[k]
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + (k * sb1), B, sb2, offsetB + (kp * sb1) );
				}

				// Interchange rows k+1 and ~IPIV[k+1]
				kp = ~IPIV[ offsetIPIV + (( k + 1 ) * strideIPIV) ];
				if ( kp !== k + 1 ) {
					dswap( nrhs, B, sb2, offsetB + (( k + 1 ) * sb1), B, sb2, offsetB + (kp * sb1) );
				}

				// Apply multipliers
				if ( k < N - 2 ) {
					dger( N - k - 2, nrhs, -1.0, A, sa1, offsetA + (( k + 2 ) * sa1) + (k * sa2), B, sb2, offsetB + (k * sb1), B, sb1, sb2, offsetB + (( k + 2 ) * sb1) );
					dger( N - k - 2, nrhs, -1.0, A, sa1, offsetA + (( k + 2 ) * sa1) + (( k + 1 ) * sa2), B, sb2, offsetB + (( k + 1 ) * sb1), B, sb1, sb2, offsetB + (( k + 2 ) * sb1) );
				}

				// Solve 2x2 system
				akm1k = A[ offsetA + (( k + 1 ) * sa1) + (k * sa2) ];
				akm1 = A[ offsetA + (k * sa1) + (k * sa2) ] / akm1k;
				ak = A[ offsetA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2) ] / akm1k;
				denom = (akm1 * ak) - 1.0;
				for ( j = 0; j < nrhs; j++ ) {
					bkm1 = B[ offsetB + (k * sb1) + (j * sb2) ] / akm1k;
					bk = B[ offsetB + (( k + 1 ) * sb1) + (j * sb2) ] / akm1k;
					B[ offsetB + (k * sb1) + (j * sb2) ] = ( (ak * bkm1) - bk ) / denom;
					B[ offsetB + (( k + 1 ) * sb1) + (j * sb2) ] = ( (akm1 * bk) - bkm1 ) / denom;
				}
				k += 2;
			}
		}

		// Next solve L^T * X = B, overwriting B with X. K starts at N-1 and decreases.
		k = N - 1;
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				// 1x1 pivot

				if ( k < N - 1 ) {
					dgemv( 'transpose', N - k - 1, nrhs, -1.0, B, sb1, sb2, offsetB + (( k + 1 ) * sb1), A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2), 1.0, B, sb2, offsetB + (k * sb1) );
				}

				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + (k * sb1), B, sb2, offsetB + (kp * sb1) );
				}
				k -= 1;
			} else {
				// 2x2 pivot (rook)

				if ( k < N - 1 ) {
					dgemv( 'transpose', N - k - 1, nrhs, -1.0, B, sb1, sb2, offsetB + (( k + 1 ) * sb1), A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2), 1.0, B, sb2, offsetB + (k * sb1) );
					dgemv( 'transpose', N - k - 1, nrhs, -1.0, B, sb1, sb2, offsetB + (( k + 1 ) * sb1), A, sa1, offsetA + (( k + 1 ) * sa1) + (( k - 1 ) * sa2), 1.0, B, sb2, offsetB + (( k - 1 ) * sb1) );
				}

				// Interchange rows k and ~IPIV[k]
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + (k * sb1), B, sb2, offsetB + (kp * sb1) );
				}

				// Interchange rows k-1 and ~IPIV[k-1]
				kp = ~IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ];
				if ( kp !== k - 1 ) {
					dswap( nrhs, B, sb2, offsetB + (( k - 1 ) * sb1), B, sb2, offsetB + (kp * sb1) );
				}
				k -= 2;
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dsytrsRook;
