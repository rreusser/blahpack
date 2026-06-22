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

/* eslint-disable max-len, max-params, max-statements, max-depth */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zherk from '../../../../blas/base/zherk/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';
import zpstf2 from '../../zpstf2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var NB = 64;
var EPS = dlamch( 'epsilon' );
var CONE = new Complex128( 1.0, 0.0 );
var CMONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes the Cholesky factorization with complete pivoting of a complex Hermitian positive semi-definite matrix using a blocked algorithm.
*
* The factorization has the form
* `P^T * A * P = U^H * U` if uplo = 'upper', or
* `P^T * A * P = L * L^H` if uplo = 'lower',
* where U is upper triangular, L is lower triangular, and P is stored
* as a permutation vector.
*
* This is the blocked version. For small matrices (N <= NB), it delegates
* to the unblocked zpstf2. For larger matrices, it processes NB columns
* at a time and calls zherk to update the trailing submatrix.
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
* @param {Complex128Array} A - input/output Hermitian matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Int32Array} PIV - output permutation array of length N (0-based)
* @param {integer} stridePIV - stride for PIV
* @param {NonNegativeInteger} offsetPIV - index offset for PIV
* @param {Int32Array} RANK - 1-element array; on exit, RANK[0] = computed rank
* @param {number} tol - user-defined tolerance; if negative, machine epsilon is used
* @param {Float64Array} WORK - workspace array of length 2*N
* @returns {integer} info - 0 if successful (full rank), 1 if rank-deficient
*/
function zpstrf( uplo, N, A, strideA1, strideA2, offsetA, PIV, stridePIV, offsetPIV, RANK, tol, WORK ) {
	var ztemp0;
	var ztemp1;
	var dstop;
	var dtemp;
	var itemp;
	var info;
	var pvt;
	var ajj;
	var sa1;
	var sa2;
	var oA;
	var Av;
	var da;
	var dp;
	var re;
	var im;
	var jb;
	var i;
	var j;
	var k;

	// Quick return if possible...
	if ( N === 0 ) {
		return 0;
	}

	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;

	// Use unblocked code for small matrices or block size >= N...
	if ( NB <= 1 || NB >= N ) {
		return zpstf2( uplo, N, A, strideA1, strideA2, offsetA, PIV, stridePIV, offsetPIV, RANK, tol, WORK );
	}

	// Initialize PIV to identity (0-based)...
	for ( i = 0; i < N; i++ ) {
		PIV[ offsetPIV + ( i * stridePIV ) ] = i;
	}

	// Compute initial diagonal values and find pivot...
	pvt = 0;
	ajj = Av[ oA ];
	for ( i = 0; i < N; i++ ) {
		da = oA + ( i * sa1 ) + ( i * sa2 );
		WORK[ i ] = Av[ da ];
		if ( Av[ da ] > ajj ) {
			pvt = i;
			ajj = Av[ da ];
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

	if ( uplo === 'upper' ) {
		// Upper triangular: process in blocks of NB columns...
		for ( k = 0; k < N; k += NB ) {
			jb = Math.min( NB, N - k );

			// Zero the work array for this block...
			for ( i = k; i < N; i++ ) {
				WORK[ i ] = 0.0;
			}

			for ( j = k; j < k + jb; j++ ) {
				// Update work with |A(j-1, i)|^2...
				for ( i = j; i < N; i++ ) {
					if ( j > k ) {
						da = oA + ( ( j - 1 ) * sa1 ) + ( i * sa2 );
						re = Av[ da ];
						im = Av[ da + 1 ];
						WORK[ i ] += ( re * re ) + ( im * im );
					}
					WORK[ N + i ] = Av[ oA + ( i * sa1 ) + ( i * sa2 ) ] - WORK[ i ];
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
						Av[ oA + ( j * sa1 ) + ( j * sa2 ) ] = ajj;
						Av[ oA + ( j * sa1 ) + ( j * sa2 ) + 1 ] = 0.0;

						// Rank-deficient...
						RANK[ 0 ] = j;
						return 1;
					}
				}

				if ( j !== pvt ) {
					// Swap diagonal elements...
					Av[ oA + ( pvt * sa1 ) + ( pvt * sa2 ) ] = Av[ oA + ( j * sa1 ) + ( j * sa2 ) ];
					Av[ oA + ( pvt * sa1 ) + ( pvt * sa2 ) + 1 ] = 0.0;

					// Swap columns j and pvt in rows 0:j-1...
					if ( j > 0 ) {
						zswap( j, A, strideA1, offsetA + ( j * strideA2 ), A, strideA1, offsetA + ( pvt * strideA2 ) );
					}

					// Swap rows j and pvt in columns pvt+1:N-1...
					if ( pvt < N - 1 ) {
						zswap( N - pvt - 1, A, strideA2, offsetA + ( j * strideA1 ) + ( ( pvt + 1 ) * strideA2 ), A, strideA2, offsetA + ( pvt * strideA1 ) + ( ( pvt + 1 ) * strideA2 ) );
					}

					// Swap the in-between segment with conjugation...
					for ( i = j + 1; i < pvt; i++ ) {
						da = oA + ( j * sa1 ) + ( i * sa2 );
						dp = oA + ( i * sa1 ) + ( pvt * sa2 );
						ztemp0 = Av[ da ];
						ztemp1 = -Av[ da + 1 ];
						Av[ da ] = Av[ dp ];
						Av[ da + 1 ] = -Av[ dp + 1 ];
						Av[ dp ] = ztemp0;
						Av[ dp + 1 ] = ztemp1;
					}
					// Conjugate A(j, pvt)...
					da = oA + ( j * sa1 ) + ( pvt * sa2 );
					Av[ da + 1 ] = -Av[ da + 1 ];

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
				Av[ oA + ( j * sa1 ) + ( j * sa2 ) ] = ajj;
				Av[ oA + ( j * sa1 ) + ( j * sa2 ) + 1 ] = 0.0;

				// Compute row j of U...
				if ( j < N - 1 ) {
					// Conjugate column j (rows k:j-1) before gemv...
					if ( j > k ) {
						zlacgv( j - k, A, strideA1, offsetA + ( k * strideA1 ) + ( j * strideA2 ) );
					}

					// A(j,j+1:N-1) -= A(k:j-1,j)^T * A(k:j-1,j+1:N-1)
					if ( j > k ) {
						zgemv( 'transpose', j - k, N - j - 1, CMONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ) + ( ( j + 1 ) * strideA2 ), A, strideA1, offsetA + ( k * strideA1 ) + ( j * strideA2 ), CONE, A, strideA2, offsetA + ( j * strideA1 ) + ( ( j + 1 ) * strideA2 ) );
					}

					// Undo conjugation...
					if ( j > k ) {
						zlacgv( j - k, A, strideA1, offsetA + ( k * strideA1 ) + ( j * strideA2 ) );
					}

					// Scale by 1/ajj...
					zdscal( N - j - 1, 1.0 / ajj, A, strideA2, offsetA + ( j * strideA1 ) + ( ( j + 1 ) * strideA2 ) );
				}
			}

			// Update trailing submatrix with zherk...
			if ( k + jb < N ) {
				zherk( 'upper', 'conjugate-transpose', N - j, jb, -1.0, A, strideA1, strideA2, offsetA + ( k * strideA1 ) + ( j * strideA2 ), 1.0, A, strideA1, strideA2, offsetA + ( j * strideA1 ) + ( j * strideA2 ) );
			}
		}
	} else {
		// Lower triangular: process in blocks of NB columns...
		for ( k = 0; k < N; k += NB ) {
			jb = Math.min( NB, N - k );

			// Zero the work array for this block...
			for ( i = k; i < N; i++ ) {
				WORK[ i ] = 0.0;
			}

			for ( j = k; j < k + jb; j++ ) {
				// Update work with |A(i, j-1)|^2...
				for ( i = j; i < N; i++ ) {
					if ( j > k ) {
						da = oA + ( i * sa1 ) + ( ( j - 1 ) * sa2 );
						re = Av[ da ];
						im = Av[ da + 1 ];
						WORK[ i ] += ( re * re ) + ( im * im );
					}
					WORK[ N + i ] = Av[ oA + ( i * sa1 ) + ( i * sa2 ) ] - WORK[ i ];
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
						Av[ oA + ( j * sa1 ) + ( j * sa2 ) ] = ajj;
						Av[ oA + ( j * sa1 ) + ( j * sa2 ) + 1 ] = 0.0;

						// Rank-deficient...
						RANK[ 0 ] = j;
						return 1;
					}
				}

				if ( j !== pvt ) {
					// Swap diagonal elements...
					Av[ oA + ( pvt * sa1 ) + ( pvt * sa2 ) ] = Av[ oA + ( j * sa1 ) + ( j * sa2 ) ];
					Av[ oA + ( pvt * sa1 ) + ( pvt * sa2 ) + 1 ] = 0.0;

					// Swap rows j and pvt in columns 0:j-1...
					if ( j > 0 ) {
						zswap( j, A, strideA2, offsetA + ( j * strideA1 ), A, strideA2, offsetA + ( pvt * strideA1 ) );
					}

					// Swap columns j and pvt in rows pvt+1:N-1...
					if ( pvt < N - 1 ) {
						zswap( N - pvt - 1, A, strideA1, offsetA + ( ( pvt + 1 ) * strideA1 ) + ( j * strideA2 ), A, strideA1, offsetA + ( ( pvt + 1 ) * strideA1 ) + ( pvt * strideA2 ) );
					}

					// Swap the in-between segment with conjugation...
					for ( i = j + 1; i < pvt; i++ ) {
						da = oA + ( i * sa1 ) + ( j * sa2 );
						dp = oA + ( pvt * sa1 ) + ( i * sa2 );
						ztemp0 = Av[ da ];
						ztemp1 = -Av[ da + 1 ];
						Av[ da ] = Av[ dp ];
						Av[ da + 1 ] = -Av[ dp + 1 ];
						Av[ dp ] = ztemp0;
						Av[ dp + 1 ] = ztemp1;
					}
					// Conjugate A(pvt, j)...
					da = oA + ( pvt * sa1 ) + ( j * sa2 );
					Av[ da + 1 ] = -Av[ da + 1 ];

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
				Av[ oA + ( j * sa1 ) + ( j * sa2 ) ] = ajj;
				Av[ oA + ( j * sa1 ) + ( j * sa2 ) + 1 ] = 0.0;

				// Compute column j of L...
				if ( j < N - 1 ) {
					// Conjugate row j (cols k:j-1) before gemv...
					if ( j > k ) {
						zlacgv( j - k, A, strideA2, offsetA + ( j * strideA1 ) + ( k * strideA2 ) );
					}

					// A(j+1:N-1,j) -= A(j+1:N-1,k:j-1) * A(j,k:j-1)^T
					if ( j > k ) {
						zgemv( 'no-transpose', N - j - 1, j - k, CMONE, A, strideA1, strideA2, offsetA + ( ( j + 1 ) * strideA1 ) + ( k * strideA2 ), A, strideA2, offsetA + ( j * strideA1 ) + ( k * strideA2 ), CONE, A, strideA1, offsetA + ( ( j + 1 ) * strideA1 ) + ( j * strideA2 ) );
					}

					// Undo conjugation...
					if ( j > k ) {
						zlacgv( j - k, A, strideA2, offsetA + ( j * strideA1 ) + ( k * strideA2 ) );
					}

					// Scale by 1/ajj...
					zdscal( N - j - 1, 1.0 / ajj, A, strideA1, offsetA + ( ( j + 1 ) * strideA1 ) + ( j * strideA2 ) );
				}
			}

			// Update trailing submatrix with zherk...
			if ( k + jb < N ) {
				zherk( 'lower', 'no-transpose', N - j, jb, -1.0, A, strideA1, strideA2, offsetA + ( j * strideA1 ) + ( k * strideA2 ), 1.0, A, strideA1, strideA2, offsetA + ( j * strideA1 ) + ( j * strideA2 ) );
			}
		}
	}

	// Full rank...
	RANK[ 0 ] = N;
	info = 0;
	return info;
}


// EXPORTS //

export default zpstrf;
