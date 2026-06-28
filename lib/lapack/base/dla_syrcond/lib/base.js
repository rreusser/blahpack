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

/* eslint-disable max-len, max-params, max-statements, max-depth, camelcase */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import abs from '@stdlib/math/base/special/abs/lib/index.js';
import dsytrs from '../../dsytrs/lib/base.js';
import dlacn2 from '../../dlacn2/lib/base.js';


// MAIN //

/**
* Estimates the Skeel condition number for a symmetric indefinite matrix.
*
* Uses iterative refinement with dlacn2 reverse communication.
* Takes the factored form `A = U*D*U^T` or `A = L*D*L^T` from dsytrf.
*
* WORK must have length >= 3*N. IWORK must have length >= N.
*
* IPIV must contain 0-based pivot indices (as produced by dsytf2/dsytrf).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, specifies whether the upper or lower triangle of A is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - original symmetric N-by-N matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} AF - factored N-by-N matrix (from dsytrf)
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Int32Array} IPIV - pivot indices from dsytrf (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {integer} cmode - scaling mode: 1 = multiply by C, 0 = no scaling, -1 = divide by C
* @param {Float64Array} c - scaling vector of length N
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} WORK - workspace array of length >= 3*N
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace array of length >= N
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @returns {number} estimated reciprocal Skeel condition number
*/
function dla_syrcond( uplo, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, cmode, c, strideC, offsetC, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	var ainvnm;
	var isave;
	var kase;
	var twoN;
	var est;
	var tmp;
	var up;
	var sw;
	var i;
	var j;

	if ( N === 0 ) {
		return 1.0;
	}

	twoN = 2 * N;

	up = ( uplo === 'upper' );

	// Compute absolute row sums of A scaled by C (stored in WORK[2*N..3*N-1])
	sw = strideWork;
	for ( i = 0; i < N; i += 1 ) {
		tmp = 0.0;
		if ( up && cmode === 1 ) {
			for ( j = 0; j < i; j += 1 ) {
				tmp += abs( A[ offsetA + (j * strideA1) + (i * strideA2) ] * c[ offsetC + (j * strideC) ] );
			}
			for ( j = i; j < N; j += 1 ) {
				tmp += abs( A[ offsetA + (i * strideA1) + (j * strideA2) ] * c[ offsetC + (j * strideC) ] );
			}
		} else if ( up && cmode === 0 ) {
			for ( j = 0; j < i; j += 1 ) {
				tmp += abs( A[ offsetA + (j * strideA1) + (i * strideA2) ] );
			}
			for ( j = i; j < N; j += 1 ) {
				tmp += abs( A[ offsetA + (i * strideA1) + (j * strideA2) ] );
			}
		} else if ( up ) {
			for ( j = 0; j < i; j += 1 ) {
				tmp += abs( A[ offsetA + (j * strideA1) + (i * strideA2) ] / c[ offsetC + (j * strideC) ] );
			}
			for ( j = i; j < N; j += 1 ) {
				tmp += abs( A[ offsetA + (i * strideA1) + (j * strideA2) ] / c[ offsetC + (j * strideC) ] );
			}
		} else if ( cmode === 1 ) {
			for ( j = 0; j < i; j += 1 ) {
				tmp += abs( A[ offsetA + (i * strideA1) + (j * strideA2) ] * c[ offsetC + (j * strideC) ] );
			}
			for ( j = i; j < N; j += 1 ) {
				tmp += abs( A[ offsetA + (j * strideA1) + (i * strideA2) ] * c[ offsetC + (j * strideC) ] );
			}
		} else if ( cmode === 0 ) {
			for ( j = 0; j < i; j += 1 ) {
				tmp += abs( A[ offsetA + (i * strideA1) + (j * strideA2) ] );
			}
			for ( j = i; j < N; j += 1 ) {
				tmp += abs( A[ offsetA + (j * strideA1) + (i * strideA2) ] );
			}
		} else {
			for ( j = 0; j < i; j += 1 ) {
				tmp += abs( A[ offsetA + (i * strideA1) + (j * strideA2) ] / c[ offsetC + (j * strideC) ] );
			}
			for ( j = i; j < N; j += 1 ) {
				tmp += abs( A[ offsetA + (j * strideA1) + (i * strideA2) ] / c[ offsetC + (j * strideC) ] );
			}
		}
		WORK[ offsetWork + (( twoN + i ) * sw) ] = tmp;
	}

	// Estimate the reciprocal condition number using dlacn2 reverse communication
	ainvnm = 0.0;
	kase = new Int32Array( 1 );
	est = new Float64Array( 1 );
	isave = new Int32Array( 3 );
	kase[ 0 ] = 0;

	while ( true ) { // eslint-disable-line no-constant-condition
		dlacn2( N, WORK, sw, offsetWork + ( N * sw ), WORK, sw, offsetWork, IWORK, strideIWork, offsetIWork, est, kase, isave, 1, 0 );
		ainvnm = est[ 0 ];

		if ( kase[ 0 ] === 0 ) {
			break;
		}

		if ( kase[ 0 ] === 2 ) {
			// Multiply by abs(A) * C scaling, solve, then apply inverse C scaling
			for ( i = 0; i < N; i += 1 ) {
				WORK[ offsetWork + ( i * sw ) ] *= WORK[ offsetWork + (( twoN + i ) * sw) ];
			}

			if ( up ) {
				dsytrs( 'upper', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWork );
			} else {
				dsytrs( 'lower', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWork );
			}

			if ( cmode === 1 ) {
				for ( i = 0; i < N; i += 1 ) {
					WORK[ offsetWork + ( i * sw ) ] /= c[ offsetC + ( i * strideC ) ];
				}
			} else if ( cmode === -1 ) {
				for ( i = 0; i < N; i += 1 ) {
					WORK[ offsetWork + ( i * sw ) ] *= c[ offsetC + ( i * strideC ) ];
				}
			}
		} else {
			// kase === 1: apply C scaling, solve, then multiply by abs(A)
			if ( cmode === 1 ) {
				for ( i = 0; i < N; i += 1 ) {
					WORK[ offsetWork + ( i * sw ) ] /= c[ offsetC + ( i * strideC ) ];
				}
			} else if ( cmode === -1 ) {
				for ( i = 0; i < N; i += 1 ) {
					WORK[ offsetWork + ( i * sw ) ] *= c[ offsetC + ( i * strideC ) ];
				}
			}

			if ( up ) {
				dsytrs( 'upper', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWork );
			} else {
				dsytrs( 'lower', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWork );
			}

			for ( i = 0; i < N; i += 1 ) {
				WORK[ offsetWork + ( i * sw ) ] *= WORK[ offsetWork + (( twoN + i ) * sw) ];
			}
		}
	}

	if ( ainvnm !== 0.0 ) {
		return 1.0 / ainvnm;
	}
	return 0.0;
}


// EXPORTS //

export default dla_syrcond;
