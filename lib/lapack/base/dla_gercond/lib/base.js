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
import dgetrs from '../../dgetrs/lib/base.js';
import dlacn2 from '../../dlacn2/lib/base.js';


// MAIN //

/**
* Estimates the Skeel condition number for a general matrix.
*
* Uses iterative refinement with a dlacn2 reverse communication loop.
*
* ## Notes
*
* -   WORK must have length at least `3*N`.
* -   IWORK must have length at least `N`.
* -   `cmode` controls column scaling: 1 means multiply by `C`, 0 means no scaling, -1 means divide by `C`.
*
* @private
* @param {string} trans - specifies the operation type (`'no-transpose'` or `'transpose'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - original N-by-N matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} AF - LU-factored N-by-N matrix (from dgetrf)
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Int32Array} IPIV - pivot indices from dgetrf (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {integer} cmode - column scaling mode (1, 0, or -1)
* @param {Float64Array} c - scaling vector of length N
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} WORK - workspace array of length at least `3*N`
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace array of length at least `N`
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @returns {number} estimated reciprocal Skeel condition number
*/
function dla_gercond( trans, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, cmode, c, strideC, offsetC, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len
	var notrans;
	var ainvnm;
	var ISAVE;
	var KASE;
	var EST;
	var tmp;
	var iw;
	var ic;
	var ia;
	var i;
	var j;

	if ( N === 0 ) {
		return 1.0;
	}

	notrans = ( trans === 'no-transpose' );

	// Compute the norm of the scaled matrix: WORK[2*N..3*N-1]
	if ( notrans ) {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			ia = offsetA + ( i * strideA1 );
			ic = offsetC;
			if ( cmode === 1 ) {
				for ( j = 0; j < N; j++ ) {
					tmp += Math.abs( A[ ia + ( j * strideA2 ) ] * c[ ic ] );
					ic += strideC;
				}
			} else if ( cmode === 0 ) {
				for ( j = 0; j < N; j++ ) {
					tmp += Math.abs( A[ ia + ( j * strideA2 ) ] );
				}
			} else {
				for ( j = 0; j < N; j++ ) {
					tmp += Math.abs( A[ ia + ( j * strideA2 ) ] / c[ ic ] );
					ic += strideC;
				}
			}
			WORK[ offsetWork + ( ( ( 2 * N ) + i ) * strideWork ) ] = tmp;
		}
	} else {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			ia = offsetA + ( i * strideA2 );
			ic = offsetC;
			if ( cmode === 1 ) {
				for ( j = 0; j < N; j++ ) {
					tmp += Math.abs( A[ ia + ( j * strideA1 ) ] * c[ ic ] );
					ic += strideC;
				}
			} else if ( cmode === 0 ) {
				for ( j = 0; j < N; j++ ) {
					tmp += Math.abs( A[ ia + ( j * strideA1 ) ] );
				}
			} else {
				for ( j = 0; j < N; j++ ) {
					tmp += Math.abs( A[ ia + ( j * strideA1 ) ] / c[ ic ] );
					ic += strideC;
				}
			}
			WORK[ offsetWork + ( ( ( 2 * N ) + i ) * strideWork ) ] = tmp;
		}
	}

	// Estimate the norm of inv(op(A)) using dlacn2 reverse communication
	ainvnm = 0.0;
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	ISAVE = new Int32Array( 3 );

	while ( true ) { // eslint-disable-line no-constant-condition
		dlacn2( N, WORK, strideWork, offsetWork + (N * strideWork), WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork, EST, KASE, ISAVE, 1, 0 );
		ainvnm = EST[ 0 ];

		if ( KASE[ 0 ] === 0 ) {
			break;
		}
		if ( KASE[ 0 ] === 2 ) {
			// Multiply by scaled matrix and solve
			iw = offsetWork;
			for ( i = 0; i < N; i++ ) {
				WORK[ iw ] *= WORK[ offsetWork + ( ( ( 2 * N ) + i ) * strideWork ) ];
				iw += strideWork;
			}
			if ( notrans ) {
				dgetrs( 'no-transpose', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			} else {
				dgetrs( 'transpose', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			}

			// Apply column scaling
			if ( cmode === 1 ) {
				iw = offsetWork;
				ic = offsetC;
				for ( i = 0; i < N; i++ ) {
					WORK[ iw ] /= c[ ic ];
					iw += strideWork;
					ic += strideC;
				}
			} else if ( cmode === -1 ) {
				iw = offsetWork;
				ic = offsetC;
				for ( i = 0; i < N; i++ ) {
					WORK[ iw ] *= c[ ic ];
					iw += strideWork;
					ic += strideC;
				}
			}
		} else {
			// KASE === 1: Apply column scaling, solve transposed, multiply by scaled matrix
			if ( cmode === 1 ) {
				iw = offsetWork;
				ic = offsetC;
				for ( i = 0; i < N; i++ ) {
					WORK[ iw ] /= c[ ic ];
					iw += strideWork;
					ic += strideC;
				}
			} else if ( cmode === -1 ) {
				iw = offsetWork;
				ic = offsetC;
				for ( i = 0; i < N; i++ ) {
					WORK[ iw ] *= c[ ic ];
					iw += strideWork;
					ic += strideC;
				}
			}

			if ( notrans ) {
				dgetrs( 'transpose', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			} else {
				dgetrs( 'no-transpose', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			}

			// Multiply by row norms
			iw = offsetWork;
			for ( i = 0; i < N; i++ ) {
				WORK[ iw ] *= WORK[ offsetWork + ( ( ( 2 * N ) + i ) * strideWork ) ];
				iw += strideWork;
			}
		}
	}

	// Compute reciprocal condition number
	if ( ainvnm !== 0.0 ) {
		return 1.0 / ainvnm;
	}
	return 0.0;
}


// EXPORTS //

export default dla_gercond;
