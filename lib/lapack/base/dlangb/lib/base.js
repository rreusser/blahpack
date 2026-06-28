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

/* eslint-disable max-len, max-params, max-lines-per-function, max-statements */

// MODULES //

import dlassq from '../../dlassq/lib/base.js';


// MAIN //

/**
* Returns the norm of a real general band matrix.
*
* The band matrix AB is stored in band format with dimensions (KL+KU+1) x N.
* The diagonal is at band row KU (0-indexed). Element A(i,j) is stored at
* AB(KU+i-j, j) (0-indexed).
*
* @private
* @param {string} norm - norm type: `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} KL - number of sub-diagonals
* @param {NonNegativeInteger} KU - number of super-diagonals
* @param {Float64Array} AB - band matrix in band storage
* @param {integer} strideAB1 - first dimension stride (band rows)
* @param {integer} strideAB2 - second dimension stride (columns)
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Float64Array} WORK - workspace (length >= N for `'inf-norm'`)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {number} norm value
*/
function dlangb( norm, N, KL, KU, AB, strideAB1, strideAB2, offsetAB, WORK, strideWork, offsetWork ) {
	var value;
	var scale;
	var temp;
	var sum;
	var out;
	var i;
	var j;
	var k;
	var l;

	if ( N === 0 ) {
		return 0.0;
	}

	if ( norm === 'max' ) {
		// Find max(abs(A(i,j)))
		// Fortran: DO J=1,N; DO I=MAX(KU+2-J,1),MIN(N+KU+1-J,KL+KU+1)
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			for ( i = ( ( KU + 1 - j > 1 ) ? KU + 1 - j : 1 ) - 1; i < ( ( N + KU - j < KL + KU + 1 ) ? N + KU - j : KL + KU + 1 ); i++ ) {
				temp = Math.abs( AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
			}
		}
	} else if ( norm === 'one-norm' ) {
		// One-norm: maximum column sum of abs values
		// Fortran: DO J=1,N; SUM=0; DO I=MAX(KU+2-J,1),MIN(N+KU+1-J,KL+KU+1)
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( i = ( ( KU + 1 - j > 1 ) ? KU + 1 - j : 1 ) - 1; i < ( ( N + KU - j < KL + KU + 1 ) ? N + KU - j : KL + KU + 1 ); i++ ) {
				sum += Math.abs( AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] );
			}
			if ( value < sum || sum !== sum ) {
				value = sum;
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Infinity-norm: maximum row sum of abs values
		// Initialize WORK array to zero
		for ( i = 0; i < N; i++ ) {
			WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
		}
		// Fortran: DO J=1,N; K=KU+1-J; DO I=MAX(1,J-KU),MIN(N,J+KL)
		//   WORK(I) = WORK(I) + ABS(AB(K+I,J))
		for ( j = 0; j < N; j++ ) {
			k = KU - j; // K = KU+1-J in 1-indexed = KU-j in 0-indexed offset
			for ( i = ( ( j - KU > 0 ) ? j - KU : 0 ); i < ( ( N < j + KL + 1 ) ? N : j + KL + 1 ); i++ ) {
				WORK[ offsetWork + ( i * strideWork ) ] += Math.abs( AB[ offsetAB + ( ( k + i ) * strideAB1 ) + ( j * strideAB2 ) ] );
			}
		}
		value = 0.0;
		for ( i = 0; i < N; i++ ) {
			temp = WORK[ offsetWork + ( i * strideWork ) ];
			if ( value < temp || temp !== temp ) {
				value = temp;
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm using dlassq
		// Fortran: DO J=1,N; L=MAX(1,J-KU); K=KU+1-J+L;
		//   CALL DLASSQ(MIN(N,J+KL)-L+1, AB(K,J), 1, SCALE, SUM)
		scale = 0.0;
		sum = 1.0;
		for ( j = 0; j < N; j++ ) {
			// l = MAX(1, J-KU) in 1-indexed => MAX(0, j-KU) in 0-indexed
			l = ( ( j - KU > 0 ) ? j - KU : 0 );
			// k = KU+1-J+L in 1-indexed => KU - j + l in 0-indexed (band row index)
			k = KU - j + l;
			// Count = MIN(N, J+KL) - L + 1 in 1-indexed => MIN(N, j+KL+1) - l in 0-indexed
			out = dlassq( ( ( N < j + KL + 1 ) ? N : j + KL + 1 ) - l, AB, strideAB1, offsetAB + ( k * strideAB1 ) + ( j * strideAB2 ), scale, sum );
			scale = out.scl;
			sum = out.sumsq;
		}
		value = scale * Math.sqrt( sum );
	} else {
		return 0.0;
	}

	return value;
}


// EXPORTS //

export default dlangb;
