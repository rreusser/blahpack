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

/* eslint-disable max-len, max-params, max-statements, camelcase */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import zpotrs from '../../zpotrs/lib/base.js';


// MAIN //

/**
* Estimates the infinity-norm condition number of a Hermitian positive-definite matrix with inverse-`c` scaling.
*
* Uses a `zlacn2` reverse communication loop with `zpotrs` solves to estimate
* `|| A * inv(diag(C)) ||_inf * || (A * inv(diag(C)))^{-1} ||_inf`.
*
* ## Notes
*
* -   `A` stores the original Hermitian positive-definite N-by-N matrix; only the triangle indicated by `uplo` is referenced. The diagonal is real; off-diagonal mirror entries are conjugates of the stored half.
* -   `AF` holds the Cholesky factorization produced by `zpotrf` (`A = U^H*U` or `A = L*L^H`).
* -   `WORK` must have length at least `2*N` complex elements.
* -   `RWORK` must have length at least `N`.
* -   When `capply` is `true`, `C` is applied as inverse column scaling; otherwise `C` is ignored.
* -   `|A[i,j]|` is computed via the `CABS1` measure `|re| + |im|`, matching the reference LAPACK routine.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, specifies whether the upper or lower triangle of `A` is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - original Hermitian positive-definite N-by-N matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} AF - Cholesky-factored N-by-N matrix (from `zpotrf`)
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Float64Array} c - real scaling vector of length `N`
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {boolean} capply - if `true`, apply inverse column scaling by `C`
* @param {Complex128Array} WORK - complex workspace of length at least `2*N`
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {Float64Array} RWORK - real workspace of length at least `N`
* @param {integer} strideRWORK - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWORK - starting index for `RWORK`
* @returns {number} estimated reciprocal infinity-norm condition number
*/
function zla_porcond_c( uplo, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, c, strideC, offsetC, capply, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len
	var ainvnm;
	var WORKv;
	var ISAVE;
	var anorm;
	var KASE;
	var EST;
	var sa1;
	var sa2;
	var tmp;
	var Av;
	var up;
	var sw;
	var oA;
	var oW;
	var ir;
	var ic;
	var i;
	var j;

	if ( N === 0 ) {
		return 1.0;
	}

	up = ( uplo === 'upper' );

	// Reinterpret complex arrays as Float64 views for element access
	Av = reinterpret( A, 0 );
	WORKv = reinterpret( WORK, 0 );

	// Double-based strides/offsets
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sw = strideWORK * 2;
	oA = offsetA * 2;
	oW = offsetWORK * 2;

	// Compute the row-wise sum of CABS1 entries of the scaled Hermitian matrix; only the stored triangle is referenced (mirror entries are implicit via Hermitian symmetry, and `CABS1(conj(z)) === CABS1(z)`)
	anorm = 0.0;
	if ( up ) {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			if ( capply ) {
				// j <= i: read A(j,i) (column i, upper)
				ic = offsetC;
				for ( j = 0; j <= i; j++ ) {
					// CABS1(A(j,i)) / C(j)
					tmp += ( Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) ] ) + Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) + 1 ] ) ) / c[ ic ];
					ic += strideC;
				}

				// j > i: read A(i,j) (row i, upper)
				for ( j = i + 1; j < N; j++ ) {
					// CABS1(A(i,j)) / C(j)
					tmp += ( Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) ] ) + Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) + 1 ] ) ) / c[ ic ];
					ic += strideC;
				}
			} else {
				for ( j = 0; j <= i; j++ ) {
					// CABS1(A(j,i))
					tmp += Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) ] ) + Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) + 1 ] );
				}
				for ( j = i + 1; j < N; j++ ) {
					// CABS1(A(i,j))
					tmp += Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) ] ) + Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) + 1 ] );
				}
			}
			RWORK[ offsetRWORK + ( i * strideRWORK ) ] = tmp;
			if ( tmp > anorm ) {
				anorm = tmp;
			}
		}
	} else {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			if ( capply ) {
				// j <= i: read A(i,j) (row i, lower)
				ic = offsetC;
				for ( j = 0; j <= i; j++ ) {
					// CABS1(A(i,j)) / C(j)
					tmp += ( Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) ] ) + Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) + 1 ] ) ) / c[ ic ];
					ic += strideC;
				}

				// j > i: read A(j,i) (column i, lower)
				for ( j = i + 1; j < N; j++ ) {
					// CABS1(A(j,i)) / C(j)
					tmp += ( Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) ] ) + Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) + 1 ] ) ) / c[ ic ];
					ic += strideC;
				}
			} else {
				for ( j = 0; j <= i; j++ ) {
					// CABS1(A(i,j))
					tmp += Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) ] ) + Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) + 1 ] );
				}
				for ( j = i + 1; j < N; j++ ) {
					// CABS1(A(j,i))
					tmp += Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) ] ) + Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) + 1 ] );
				}
			}
			RWORK[ offsetRWORK + ( i * strideRWORK ) ] = tmp;
			if ( tmp > anorm ) {
				anorm = tmp;
			}
		}
	}

	// Quick return if zero
	if ( anorm === 0.0 ) {
		return 0.0;
	}

	// Estimate the norm of inv(A) via zlacn2 reverse communication
	ainvnm = 0.0;
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	ISAVE = new Int32Array( 3 );

	while ( true ) { // eslint-disable-line no-constant-condition
		zlacn2( N, WORK, strideWORK, offsetWORK + ( N * strideWORK ), WORK, strideWORK, offsetWORK, EST, KASE, ISAVE, 1, 0 );
		ainvnm = EST[ 0 ];

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( KASE[ 0 ] === 2 ) {
			// Multiply by R: WORK(i) = WORK(i) * RWORK(i)
			ir = oW;
			for ( i = 0; i < N; i++ ) {
				WORKv[ ir ] *= RWORK[ offsetRWORK + ( i * strideRWORK ) ];
				WORKv[ ir + 1 ] *= RWORK[ offsetRWORK + ( i * strideRWORK ) ];
				ir += sw;
			}

			// Solve A * X = WORK using the Cholesky factorization
			if ( up ) {
				zpotrs( 'upper', N, 1, AF, strideAF1, strideAF2, offsetAF, WORK, strideWORK, N * strideWORK, offsetWORK );
			} else {
				zpotrs( 'lower', N, 1, AF, strideAF1, strideAF2, offsetAF, WORK, strideWORK, N * strideWORK, offsetWORK );
			}

			// Apply column scaling if requested: WORK(i) *= C(i)
			if ( capply ) {
				ir = oW;
				ic = offsetC;
				for ( i = 0; i < N; i++ ) {
					WORKv[ ir ] *= c[ ic ];
					WORKv[ ir + 1 ] *= c[ ic ];
					ir += sw;
					ic += strideC;
				}
			}
		} else {
			// KASE === 1: scale by C, solve, then multiply by row-sums
			if ( capply ) {
				ir = oW;
				ic = offsetC;
				for ( i = 0; i < N; i++ ) {
					WORKv[ ir ] *= c[ ic ];
					WORKv[ ir + 1 ] *= c[ ic ];
					ir += sw;
					ic += strideC;
				}
			}

			if ( up ) {
				zpotrs( 'upper', N, 1, AF, strideAF1, strideAF2, offsetAF, WORK, strideWORK, N * strideWORK, offsetWORK );
			} else {
				zpotrs( 'lower', N, 1, AF, strideAF1, strideAF2, offsetAF, WORK, strideWORK, N * strideWORK, offsetWORK );
			}

			// Multiply by row norms: WORK(i) *= RWORK(i)
			ir = oW;
			for ( i = 0; i < N; i++ ) {
				WORKv[ ir ] *= RWORK[ offsetRWORK + ( i * strideRWORK ) ];
				WORKv[ ir + 1 ] *= RWORK[ offsetRWORK + ( i * strideRWORK ) ];
				ir += sw;
			}
		}
	}

	// Compute the reciprocal condition number
	if ( ainvnm !== 0.0 ) {
		return 1.0 / ainvnm;
	}
	return 0.0;
}


// EXPORTS //

export default zla_porcond_c;
