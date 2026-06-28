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

/* eslint-disable max-len, max-params, max-statements, max-depth, camelcase */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import abs from '@stdlib/math/base/special/abs/lib/index.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dpotrs from '../../dpotrs/lib/base.js';


// MAIN //

/**
* Estimates the Skeel condition number for a symmetric positive-definite matrix.
*
* Uses iterative refinement with dlacn2 reverse communication. The matrix `A`
* is the original symmetric matrix and `AF` is its Cholesky factorization
* (from dpotrf). The scaling vector `C` is applied according to `cmode`:
*
* -   `cmode = 1`: multiply by `C`
* -   `cmode = 0`: no scaling
* -   `cmode = -1`: divide by `C`
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - original N-by-N symmetric positive-definite matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} AF - Cholesky-factored N-by-N matrix (from dpotrf)
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {integer} cmode - scaling mode (1, 0, or -1)
* @param {Float64Array} c - scaling vector of length N
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} WORK - workspace array of length at least 3*N
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace array of length at least N
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @returns {number} estimated Skeel condition number
*/
function dla_porcond( uplo, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, cmode, c, strideC, offsetC, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	var ainvnm;
	var ISAVE;
	var upper;
	var KASE;
	var EST;
	var tmp;
	var ow;
	var i;
	var j;

	if ( N === 0 ) {
		return 1.0;
	}

	upper = ( uplo === 'upper' );

	// Compute absolute row sums of scaled A into WORK[2*N+i]
	if ( upper ) {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			if ( cmode === 1 ) {
				// Upper triangle: column i, rows 0..i (A[j,i] for j<=i)
				for ( j = 0; j <= i; j++ ) {
					tmp += abs( A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] * c[ offsetC + ( j * strideC ) ] );
				}
				// Lower part from symmetry: row i, columns i+1..N-1 (A[i,j] for j>i)
				for ( j = i + 1; j < N; j++ ) {
					tmp += abs( A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] * c[ offsetC + ( j * strideC ) ] );
				}
			} else if ( cmode === 0 ) {
				for ( j = 0; j <= i; j++ ) {
					tmp += abs( A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] );
				}
				for ( j = i + 1; j < N; j++ ) {
					tmp += abs( A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] );
				}
			} else {
				for ( j = 0; j <= i; j++ ) {
					tmp += abs( A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] / c[ offsetC + ( j * strideC ) ] );
				}
				for ( j = i + 1; j < N; j++ ) {
					tmp += abs( A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] / c[ offsetC + ( j * strideC ) ] );
				}
			}
			WORK[ offsetWork + (( ( 2 * N ) + i ) * strideWork) ] = tmp;
		}
	} else {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			if ( cmode === 1 ) {
				// Lower triangle: column j, rows i (A[i,j] for j<=i)
				for ( j = 0; j <= i; j++ ) {
					tmp += abs( A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] * c[ offsetC + ( j * strideC ) ] );
				}
				// Upper part from symmetry: row j, column i (A[j,i] for j>i)
				for ( j = i + 1; j < N; j++ ) {
					tmp += abs( A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] * c[ offsetC + ( j * strideC ) ] );
				}
			} else if ( cmode === 0 ) {
				for ( j = 0; j <= i; j++ ) {
					tmp += abs( A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] );
				}
				for ( j = i + 1; j < N; j++ ) {
					tmp += abs( A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] );
				}
			} else {
				for ( j = 0; j <= i; j++ ) {
					tmp += abs( A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] / c[ offsetC + ( j * strideC ) ] );
				}
				for ( j = i + 1; j < N; j++ ) {
					tmp += abs( A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] / c[ offsetC + ( j * strideC ) ] );
				}
			}
			WORK[ offsetWork + (( ( 2 * N ) + i ) * strideWork) ] = tmp;
		}
	}

	// Estimate the 1-norm of inv(op(A)) using dlacn2 reverse communication
	ainvnm = 0.0;

	// Allocate dlacn2 state arrays
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	ISAVE = new Int32Array( 3 );
	KASE[ 0 ] = 0;

	ow = offsetWork;

	while ( true ) {
		// dlacn2( N, v, strideV, offsetV, x, strideX, offsetX, ISGN, strideISGN, offsetISGN, EST, KASE, ISAVE, strideISAVE, offsetISAVE )
		// V = WORK[N:2N-1], x = WORK[0:N-1], ISGN = IWORK
		dlacn2( N, WORK, strideWork, ow + ( N * strideWork ), WORK, strideWork, ow, IWORK, strideIWork, offsetIWork, EST, KASE, ISAVE, 1, 0 );
		ainvnm = EST[ 0 ];

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( KASE[ 0 ] === 2 ) {
			// Multiply by row-sums, solve, then scale by C
			for ( i = 0; i < N; i++ ) {
				WORK[ ow + ( i * strideWork ) ] *= WORK[ ow + (( ( 2 * N ) + i ) * strideWork) ];
			}

			if ( upper ) {
				dpotrs( 'upper', N, 1, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, N * strideWork, ow );
			} else {
				dpotrs( 'lower', N, 1, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, N * strideWork, ow );
			}

			if ( cmode === 1 ) {
				for ( i = 0; i < N; i++ ) {
					WORK[ ow + ( i * strideWork ) ] /= c[ offsetC + ( i * strideC ) ];
				}
			} else if ( cmode === -1 ) {
				for ( i = 0; i < N; i++ ) {
					WORK[ ow + ( i * strideWork ) ] *= c[ offsetC + ( i * strideC ) ];
				}
			}
		} else {
			// KASE === 1: scale by C, solve, then multiply by row-sums
			if ( cmode === 1 ) {
				for ( i = 0; i < N; i++ ) {
					WORK[ ow + ( i * strideWork ) ] /= c[ offsetC + ( i * strideC ) ];
				}
			} else if ( cmode === -1 ) {
				for ( i = 0; i < N; i++ ) {
					WORK[ ow + ( i * strideWork ) ] *= c[ offsetC + ( i * strideC ) ];
				}
			}

			if ( upper ) {
				dpotrs( 'upper', N, 1, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, N * strideWork, ow );
			} else {
				dpotrs( 'lower', N, 1, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, N * strideWork, ow );
			}

			for ( i = 0; i < N; i++ ) {
				WORK[ ow + ( i * strideWork ) ] *= WORK[ ow + (( ( 2 * N ) + i ) * strideWork) ];
			}
		}
	}

	if ( ainvnm !== 0.0 ) {
		return 1.0 / ainvnm;
	}
	return 0.0;
}


// EXPORTS //

export default dla_porcond;
