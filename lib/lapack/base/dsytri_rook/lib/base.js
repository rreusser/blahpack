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

import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import dsymv from '../../../../blas/base/dsymv/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// MAIN //

/**
* Computes the inverse of a real symmetric matrix using the factorization `A = U * D * U^T` or `A = L * D * L^T` computed by `dsytrf_rook` (rook pivoting).
*
* On entry, `A` contains the block diagonal matrix D and the multipliers
* used to obtain the factor U (or L) as computed by `dsytrf_rook`, stored in
* full format. On exit, if `info === 0`, `A` contains the upper (or lower)
* triangle of the inverse of A.
*
* `IPIV` stores 0-based pivot indices from `dsytrf_rook`/`dsytf2_rook`. If
* `IPIV[k] >= 0`, a 1x1 pivot was used. For a 2x2 pivot, both `IPIV[k]` and
* `IPIV[k+/-1]` are stored as `~p` (bitwise NOT of the 0-based row/column
* that was interchanged), one per pivot step.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - symmetric matrix in full storage, length at least N*N
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Int32Array} IPIV - pivot index array from dsytrf_rook/dsytf2_rook, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Float64Array} WORK - workspace array, length N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - index offset for WORK
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is zero (1-based)
*/
function dsytriRook( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
	var kstep;
	var akkp1;
	var temp;
	var info;
	var akp1;
	var sa1;
	var sa2;
	var ak;
	var kp;
	var d;
	var t;
	var k;

	sa1 = strideA1;
	sa2 = strideA2;
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	// Check that the diagonal of D is non-zero (singularity check)...
	if ( uplo === 'upper' ) {
		for ( info = N; info >= 1; info-- ) {
			if ( IPIV[ offsetIPIV + ( ( info - 1 ) * strideIPIV ) ] >= 0 && A[ offsetA + ( ( info - 1 ) * sa1 ) + ( ( info - 1 ) * sa2 ) ] === 0.0 ) {
				return info;
			}
		}
	} else {
		for ( info = 1; info <= N; info++ ) {
			if ( IPIV[ offsetIPIV + ( ( info - 1 ) * strideIPIV ) ] >= 0 && A[ offsetA + ( ( info - 1 ) * sa1 ) + ( ( info - 1 ) * sa2 ) ] === 0.0 ) {
				return info;
			}
		}
	}
	info = 0;

	if ( uplo === 'upper' ) {
		// Compute inv(A) from the factorization A = U*D*U**T.
		// K is the main loop index, increasing from 1 to N in steps of 1 or 2.

		k = 1;

		// eslint-disable-next-line no-constant-condition
		while ( true ) {
			if ( k > N ) {
				break;
			}

			if ( IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] >= 0 ) {
				// 1x1 diagonal block: invert the diagonal block
				A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = 1.0 / A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ];

				// Form column k of the inverse
				if ( k > 1 ) {
					dcopy( k - 1, A, sa1, offsetA + ( ( k - 1 ) * sa2 ), WORK, strideWork, offsetWork );
					dsymv( uplo, k - 1, -1.0, A, sa1, sa2, offsetA, WORK, strideWork, offsetWork, 0.0, A, sa1, offsetA + ( ( k - 1 ) * sa2 ) );
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] -= ddot( k - 1, WORK, strideWork, offsetWork, A, sa1, offsetA + ( ( k - 1 ) * sa2 ) );
				}
				kstep = 1;
			} else {
				// 2x2 diagonal block: invert the diagonal block
				t = Math.abs( A[ offsetA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) ] );
				ak = A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] / t;
				akp1 = A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] / t;
				akkp1 = A[ offsetA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) ] / t;
				d = t * ( ( ak * akp1 ) - 1.0 );
				A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = akp1 / d;
				A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] = ak / d;
				A[ offsetA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) ] = -akkp1 / d;

				// Form columns k and k+1 of the inverse
				if ( k > 1 ) {
					dcopy( k - 1, A, sa1, offsetA + ( ( k - 1 ) * sa2 ), WORK, strideWork, offsetWork );
					dsymv( uplo, k - 1, -1.0, A, sa1, sa2, offsetA, WORK, strideWork, offsetWork, 0.0, A, sa1, offsetA + ( ( k - 1 ) * sa2 ) );
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] -= ddot( k - 1, WORK, strideWork, offsetWork, A, sa1, offsetA + ( ( k - 1 ) * sa2 ) );
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) ] -= ddot( k - 1, A, sa1, offsetA + ( ( k - 1 ) * sa2 ), A, sa1, offsetA + ( k * sa2 ) );

					dcopy( k - 1, A, sa1, offsetA + ( k * sa2 ), WORK, strideWork, offsetWork );
					dsymv( uplo, k - 1, -1.0, A, sa1, sa2, offsetA, WORK, strideWork, offsetWork, 0.0, A, sa1, offsetA + ( k * sa2 ) );
					A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] -= ddot( k - 1, WORK, strideWork, offsetWork, A, sa1, offsetA + ( k * sa2 ) );
				}
				kstep = 2;
			}

			if ( kstep === 1 ) {
				// Interchange rows and columns K and IPIV(K) in the leading
				// Submatrix A(1:k+1,1:k+1).
				kp = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] + 1;
				if ( kp !== k ) {
					if ( kp > 1 ) {
						dswap( kp - 1, A, sa1, offsetA + ( ( k - 1 ) * sa2 ), A, sa1, offsetA + ( ( kp - 1 ) * sa2 ) );
					}
					dswap( k - kp - 1, A, sa1, offsetA + ( kp * sa1 ) + ( ( k - 1 ) * sa2 ), A, sa2, offsetA + ( ( kp - 1 ) * sa1 ) + ( kp * sa2 ) );
					temp = A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ];
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 ) ];
					A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 ) ] = temp;
				}
			} else {
				// Interchange rows and columns K and K+1 with -IPIV(K) and
				// -IPIV(K+1) in the leading submatrix A(1:k+1,1:k+1).
				kp = ( ~IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] ) + 1;
				if ( kp !== k ) {
					if ( kp > 1 ) {
						dswap( kp - 1, A, sa1, offsetA + ( ( k - 1 ) * sa2 ), A, sa1, offsetA + ( ( kp - 1 ) * sa2 ) );
					}
					dswap( k - kp - 1, A, sa1, offsetA + ( kp * sa1 ) + ( ( k - 1 ) * sa2 ), A, sa2, offsetA + ( ( kp - 1 ) * sa1 ) + ( kp * sa2 ) );

					temp = A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ];
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 ) ];
					A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 ) ] = temp;
					temp = A[ offsetA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) ];
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) ] = A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( k * sa2 ) ];
					A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( k * sa2 ) ] = temp;
				}

				k += 1;
				kp = ( ~IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] ) + 1;
				if ( kp !== k ) {
					if ( kp > 1 ) {
						dswap( kp - 1, A, sa1, offsetA + ( ( k - 1 ) * sa2 ), A, sa1, offsetA + ( ( kp - 1 ) * sa2 ) );
					}
					dswap( k - kp - 1, A, sa1, offsetA + ( kp * sa1 ) + ( ( k - 1 ) * sa2 ), A, sa2, offsetA + ( ( kp - 1 ) * sa1 ) + ( kp * sa2 ) );
					temp = A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ];
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 ) ];
					A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 ) ] = temp;
				}
			}

			k += 1;
		}
	} else {
		// Compute inv(A) from the factorization A = L*D*L**T.
		// K is the main loop index, decreasing from N to 1 in steps of 1 or 2.

		k = N;

		// eslint-disable-next-line no-constant-condition
		while ( true ) {
			if ( k < 1 ) {
				break;
			}

			if ( IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] >= 0 ) {
				// 1x1 diagonal block: invert the diagonal block
				A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = 1.0 / A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ];

				// Form column k of the inverse
				if ( k < N ) {
					dcopy( N - k, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 1 ) * sa2 ), WORK, strideWork, offsetWork );
					dsymv( uplo, N - k, -1.0, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), WORK, strideWork, offsetWork, 0.0, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 1 ) * sa2 ) );
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] -= ddot( N - k, WORK, strideWork, offsetWork, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 1 ) * sa2 ) );
				}
				kstep = 1;
			} else {
				// 2x2 diagonal block: invert the diagonal block
				t = Math.abs( A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 ) ] );
				ak = A[ offsetA + ( ( k - 2 ) * sa1 ) + ( ( k - 2 ) * sa2 ) ] / t;
				akp1 = A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] / t;
				akkp1 = A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 ) ] / t;
				d = t * ( ( ak * akp1 ) - 1.0 );
				A[ offsetA + ( ( k - 2 ) * sa1 ) + ( ( k - 2 ) * sa2 ) ] = akp1 / d;
				A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = ak / d;
				A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 ) ] = -akkp1 / d;

				// Form columns k-1 and k of the inverse
				if ( k < N ) {
					dcopy( N - k, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 1 ) * sa2 ), WORK, strideWork, offsetWork );
					dsymv( uplo, N - k, -1.0, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), WORK, strideWork, offsetWork, 0.0, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 1 ) * sa2 ) );
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] -= ddot( N - k, WORK, strideWork, offsetWork, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 1 ) * sa2 ) );
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 ) ] -= ddot( N - k, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 1 ) * sa2 ), A, sa1, offsetA + ( k * sa1 ) + ( ( k - 2 ) * sa2 ) );

					dcopy( N - k, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 2 ) * sa2 ), WORK, strideWork, offsetWork );
					dsymv( uplo, N - k, -1.0, A, sa1, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), WORK, strideWork, offsetWork, 0.0, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 2 ) * sa2 ) );
					A[ offsetA + ( ( k - 2 ) * sa1 ) + ( ( k - 2 ) * sa2 ) ] -= ddot( N - k, WORK, strideWork, offsetWork, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 2 ) * sa2 ) );
				}
				kstep = 2;
			}

			if ( kstep === 1 ) {
				// Interchange rows and columns K and IPIV(K) in the trailing
				// Submatrix A(k-1:n,k-1:n).
				kp = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] + 1;
				if ( kp !== k ) {
					if ( kp < N ) {
						dswap( N - kp, A, sa1, offsetA + ( kp * sa1 ) + ( ( k - 1 ) * sa2 ), A, sa1, offsetA + ( kp * sa1 ) + ( ( kp - 1 ) * sa2 ) );
					}
					dswap( kp - k - 1, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 1 ) * sa2 ), A, sa2, offsetA + ( ( kp - 1 ) * sa1 ) + ( k * sa2 ) );
					temp = A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ];
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 ) ];
					A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 ) ] = temp;
				}
			} else {
				// Interchange rows and columns K and K-1 with -IPIV(K) and
				// -IPIV(K-1) in the trailing submatrix A(k-1:n,k-1:n).
				kp = ( ~IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] ) + 1;
				if ( kp !== k ) {
					if ( kp < N ) {
						dswap( N - kp, A, sa1, offsetA + ( kp * sa1 ) + ( ( k - 1 ) * sa2 ), A, sa1, offsetA + ( kp * sa1 ) + ( ( kp - 1 ) * sa2 ) );
					}
					dswap( kp - k - 1, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 1 ) * sa2 ), A, sa2, offsetA + ( ( kp - 1 ) * sa1 ) + ( k * sa2 ) );

					temp = A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ];
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 ) ];
					A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 ) ] = temp;
					temp = A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 ) ];
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 ) ] = A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 ) ];
					A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 ) ] = temp;
				}

				k -= 1;
				kp = ( ~IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] ) + 1;
				if ( kp !== k ) {
					if ( kp < N ) {
						dswap( N - kp, A, sa1, offsetA + ( kp * sa1 ) + ( ( k - 1 ) * sa2 ), A, sa1, offsetA + ( kp * sa1 ) + ( ( kp - 1 ) * sa2 ) );
					}
					dswap( kp - k - 1, A, sa1, offsetA + ( k * sa1 ) + ( ( k - 1 ) * sa2 ), A, sa2, offsetA + ( ( kp - 1 ) * sa1 ) + ( k * sa2 ) );
					temp = A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ];
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 ) ];
					A[ offsetA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 ) ] = temp;
				}
			}

			k -= 1;
		}
	}

	return info;
}


// EXPORTS //

export default dsytriRook;
