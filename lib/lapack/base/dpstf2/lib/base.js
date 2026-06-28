/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Computes the Cholesky factorization with complete pivoting of a real.
* symmetric positive semi-definite matrix (unblocked algorithm).
*
* The factorization has the form
* `P^T * A * P = U^T * U` if uplo = 'upper', or
* `P^T * A * P = L * L^T` if uplo = 'lower',
* where U is upper triangular, L is lower triangular, and P is stored
* as a permutation vector.
*
* ## Notes
*
* -   `PIV` is 0-based (Fortran uses 1-based).
*
* -   `RANK` is written to `rank[0]`.
*
* -   Returns `info`: 0 if the factorization completed (full rank), 1 if
*     the matrix is rank-deficient (the computed rank is in `rank[0]`).
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of matrix A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} PIV - output permutation array of length N (0-based)
* @param {integer} stridePIV - stride for PIV
* @param {NonNegativeInteger} offsetPIV - index offset for PIV
* @param {Int32Array} RANK - 1-element array; on exit, RANK[0] = computed rank
* @param {number} tol - user-defined tolerance; if negative, machine epsilon is used
* @param {Float64Array} WORK - workspace array of length 2*N
* @returns {integer} info - 0 if successful (full rank), 1 if rank-deficient
*/
function dpstf2( uplo, N, A, strideA1, strideA2, offsetA, PIV, stridePIV, offsetPIV, RANK, tol, WORK ) {
	var dstop;
	var dtemp;
	var itemp;
	var pvt;
	var ajj;
	var sa1;
	var sa2;
	var i;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;

	// Quick return if possible...
	if ( N === 0 ) {
		return 0;
	}

	// Initialize PIV to identity (0-based)...
	for ( i = 0; i < N; i++ ) {
		PIV[ offsetPIV + ( i * stridePIV ) ] = i;
	}

	// Find initial pivot: index of maximum diagonal element...
	pvt = 0;
	ajj = A[ offsetA ];
	for ( i = 1; i < N; i++ ) {
		if ( A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ] > ajj ) {
			pvt = i;
			ajj = A[ offsetA + ( pvt * sa1 ) + ( pvt * sa2 ) ];
		}
	}

	// Check for non-positive or NaN...
	if ( ajj <= 0.0 || ajj !== ajj ) {
		RANK[ 0 ] = 0;
		return 1;
	}

	// Compute stopping tolerance...
	if ( tol < 0.0 ) {
		dstop = N * EPS * ajj;
	} else {
		dstop = tol;
	}

	// Initialize work array...
	for ( i = 0; i < N; i++ ) {
		WORK[ i ] = 0.0;
	}

	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			// Update WORK with squared elements from previous column...
			for ( i = j; i < N; i++ ) {
				if ( j > 0 ) {
					WORK[ i ] += A[ offsetA + ( ( j - 1 ) * sa1 ) + ( i * sa2 ) ] * A[ offsetA + ( ( j - 1 ) * sa1 ) + ( i * sa2 ) ];
				}
				WORK[ N + i ] = A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ] - WORK[ i ];
			}

			if ( j > 0 ) {
				// Find pivot in WORK(N+j:2*N-1)...
				itemp = 0;
				for ( i = 1; i < N - j; i++ ) {
					if ( WORK[ N + j + i ] > WORK[ N + j + itemp ] ) {
						itemp = i;
					}
				}
				pvt = itemp + j;
				ajj = WORK[ N + pvt ];
				if ( ajj <= dstop || ajj !== ajj ) {
					A[ offsetA + ( j * sa1 ) + ( j * sa2 ) ] = ajj;

					// Rank-deficient: record rank and return...
					RANK[ 0 ] = j;
					return 1;
				}
			}

			if ( j !== pvt ) {
				// Swap diagonal elements...
				A[ offsetA + ( pvt * sa1 ) + ( pvt * sa2 ) ] = A[ offsetA + ( j * sa1 ) + ( j * sa2 ) ];

				// Swap columns j and pvt in rows 0:j-1 (upper part)...
				if ( j > 0 ) {
					dswap( j, A, sa1, offsetA + ( j * sa2 ), A, sa1, offsetA + ( pvt * sa2 ) );
				}

				// Swap rows j and pvt in columns pvt+1:N-1...
				if ( pvt < N - 1 ) {
					dswap( N - pvt - 1, A, sa2, offsetA + ( j * sa1 ) + ( ( pvt + 1 ) * sa2 ), A, sa2, offsetA + ( pvt * sa1 ) + ( ( pvt + 1 ) * sa2 ) );
				}

				// Swap the in-between segment: A(j, j+1:pvt-1) <-> A(j+1:pvt-1, pvt)...
				// In upper: row j cols j+1..pvt-1 vs col pvt rows j+1..pvt-1
				if ( pvt - j - 1 > 0 ) {
					dswap( pvt - j - 1, A, sa2, offsetA + ( j * sa1 ) + ( ( j + 1 ) * sa2 ), A, sa1, offsetA + ( ( j + 1 ) * sa1 ) + ( pvt * sa2 ) );
				}

				// Swap work values...
				dtemp = WORK[ j ];
				WORK[ j ] = WORK[ pvt ];
				WORK[ pvt ] = dtemp;

				// Swap PIV entries...
				itemp = PIV[ offsetPIV + ( pvt * stridePIV ) ];
				PIV[ offsetPIV + ( pvt * stridePIV ) ] = PIV[ offsetPIV + ( j * stridePIV ) ];
				PIV[ offsetPIV + ( j * stridePIV ) ] = itemp;
			}

			ajj = Math.sqrt( ajj );
			A[ offsetA + ( j * sa1 ) + ( j * sa2 ) ] = ajj;

			// Compute row j of U: update A(j, j+1:N-1)...
			if ( j < N - 1 ) {
				// A(j,j+1:N-1) -= A(0:j-1,j)^T * A(0:j-1,j+1:N-1)
				if ( j > 0 ) {
					dgemv( 'transpose', j, N - j - 1, -1.0, A, sa1, sa2, offsetA + ( ( j + 1 ) * sa2 ), A, sa1, offsetA + ( j * sa2 ), 1.0, A, sa2, offsetA + ( j * sa1 ) + ( ( j + 1 ) * sa2 ) );
				}
				dscal( N - j - 1, 1.0 / ajj, A, sa2, offsetA + ( j * sa1 ) + ( ( j + 1 ) * sa2 ) );
			}
		}
	} else {
		// Lower triangular...
		for ( j = 0; j < N; j++ ) {
			// Update WORK with squared elements from previous column...
			for ( i = j; i < N; i++ ) {
				if ( j > 0 ) {
					WORK[ i ] += A[ offsetA + ( i * sa1 ) + ( ( j - 1 ) * sa2 ) ] * A[ offsetA + ( i * sa1 ) + ( ( j - 1 ) * sa2 ) ];
				}
				WORK[ N + i ] = A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ] - WORK[ i ];
			}

			if ( j > 0 ) {
				// Find pivot in WORK(N+j:2*N-1)...
				itemp = 0;
				for ( i = 1; i < N - j; i++ ) {
					if ( WORK[ N + j + i ] > WORK[ N + j + itemp ] ) {
						itemp = i;
					}
				}
				pvt = itemp + j;
				ajj = WORK[ N + pvt ];
				if ( ajj <= dstop || ajj !== ajj ) {
					A[ offsetA + ( j * sa1 ) + ( j * sa2 ) ] = ajj;

					// Rank-deficient: record rank and return...
					RANK[ 0 ] = j;
					return 1;
				}
			}

			if ( j !== pvt ) {
				// Swap diagonal elements...
				A[ offsetA + ( pvt * sa1 ) + ( pvt * sa2 ) ] = A[ offsetA + ( j * sa1 ) + ( j * sa2 ) ];

				// Swap rows j and pvt in columns 0:j-1 (lower part)...
				if ( j > 0 ) {
					dswap( j, A, sa2, offsetA + ( j * sa1 ), A, sa2, offsetA + ( pvt * sa1 ) );
				}

				// Swap columns j and pvt in rows pvt+1:N-1...
				if ( pvt < N - 1 ) {
					dswap( N - pvt - 1, A, sa1, offsetA + ( ( pvt + 1 ) * sa1 ) + ( j * sa2 ), A, sa1, offsetA + ( ( pvt + 1 ) * sa1 ) + ( pvt * sa2 ) );
				}

				// Swap the in-between segment: A(j+1:pvt-1, j) <-> A(pvt, j+1:pvt-1)
				// In lower: col j rows j+1..pvt-1 vs row pvt cols j+1..pvt-1
				if ( pvt - j - 1 > 0 ) {
					dswap( pvt - j - 1, A, sa1, offsetA + ( ( j + 1 ) * sa1 ) + ( j * sa2 ), A, sa2, offsetA + ( pvt * sa1 ) + ( ( j + 1 ) * sa2 ) );
				}

				// Swap work values...
				dtemp = WORK[ j ];
				WORK[ j ] = WORK[ pvt ];
				WORK[ pvt ] = dtemp;

				// Swap PIV entries...
				itemp = PIV[ offsetPIV + ( pvt * stridePIV ) ];
				PIV[ offsetPIV + ( pvt * stridePIV ) ] = PIV[ offsetPIV + ( j * stridePIV ) ];
				PIV[ offsetPIV + ( j * stridePIV ) ] = itemp;
			}

			ajj = Math.sqrt( ajj );
			A[ offsetA + ( j * sa1 ) + ( j * sa2 ) ] = ajj;

			// Compute column j of L: update A(j+1:N-1, j)...
			if ( j < N - 1 ) {
				// A(j+1:N-1,j) -= A(j+1:N-1,0:j-1) * A(j,0:j-1)^T
				if ( j > 0 ) {
					dgemv( 'no-transpose', N - j - 1, j, -1.0, A, sa1, sa2, offsetA + ( ( j + 1 ) * sa1 ), A, sa2, offsetA + ( j * sa1 ), 1.0, A, sa1, offsetA + ( ( j + 1 ) * sa1 ) + ( j * sa2 ) );
				}
				dscal( N - j - 1, 1.0 / ajj, A, sa1, offsetA + ( ( j + 1 ) * sa1 ) + ( j * sa2 ) );
			}
		}
	}

	// Full rank...
	RANK[ 0 ] = N;
	return 0;
}


// EXPORTS //

export default dpstf2;
