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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlassq from '../../zlassq/lib/base.js';
import cmplx from '../../../../cmplx.js';


// FUNCTIONS //

/**
* Returns the larger of two values, propagating NaN.
*
* @private
* @param {number} value - current max
* @param {number} candidate - candidate value
* @returns {number} larger value (NaN if candidate is NaN)
*/
function maxNaN( value, candidate ) {
	if ( value < candidate || candidate !== candidate ) {
		return candidate;
	}
	return value;
}


// MAIN //

/**
* Returns the norm of a complex general band matrix.
*
* The band matrix AB is stored in band format with dimensions (KL+KU+1) x N
* (complex elements). The diagonal is at band row KU (0-indexed). Element
* A(i,j) is stored at AB(KU+i-j, j) (0-indexed).
*
* @private
* @param {string} norm - norm type: `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} KL - number of sub-diagonals
* @param {NonNegativeInteger} KU - number of super-diagonals
* @param {Complex128Array} AB - band matrix in band storage
* @param {integer} strideAB1 - first dimension stride (band rows, in complex elements)
* @param {integer} strideAB2 - second dimension stride (columns, in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for AB (in complex elements)
* @param {Float64Array} WORK - workspace (length >= N for `'inf-norm'`, real)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {number} norm value
*/
function zlangb( norm, N, KL, KU, AB, strideAB1, strideAB2, offsetAB, WORK, strideWork, offsetWork ) {
	var value;
	var scale;
	var temp;
	var sum;
	var out;
	var sa1;
	var sa2;
	var ABv;
	var oAB;
	var ai;
	var wi;
	var i;
	var j;
	var k;
	var l;

	if ( N === 0 ) {
		return 0.0;
	}

	// Get Float64 view and convert strides/offset from complex elements to doubles
	ABv = reinterpret( AB, 0 );
	sa1 = strideAB1 * 2;
	sa2 = strideAB2 * 2;
	oAB = offsetAB * 2;

	if ( norm === 'max' ) {
		// Find max(abs(A(i,j)))
		// Fortran: DO J=1,N; DO I=MAX(KU+2-J,1),MIN(N+KU+1-J,KL+KU+1)
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			for ( i = ( ( KU + 1 - j > 1 ) ? KU + 1 - j : 1 ) - 1; i < ( ( N + KU - j < KL + KU + 1 ) ? N + KU - j : KL + KU + 1 ); i++ ) {
				ai = oAB + ( i * sa1 ) + ( j * sa2 );
				temp = cmplx.absAt( ABv, ai );
				value = maxNaN( value, temp );
			}
		}
	} else if ( norm === 'one-norm' ) {
		// One-norm: maximum column sum of abs values
		// Fortran: DO J=1,N; SUM=0; DO I=MAX(KU+2-J,1),MIN(N+KU+1-J,KL+KU+1)
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( i = ( ( KU + 1 - j > 1 ) ? KU + 1 - j : 1 ) - 1; i < ( ( N + KU - j < KL + KU + 1 ) ? N + KU - j : KL + KU + 1 ); i++ ) {
				ai = oAB + ( i * sa1 ) + ( j * sa2 );
				sum += cmplx.absAt( ABv, ai );
			}
			value = maxNaN( value, sum );
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
				ai = oAB + ( ( k + i ) * sa1 ) + ( j * sa2 );
				wi = offsetWork + ( i * strideWork );
				WORK[ wi ] += cmplx.absAt( ABv, ai );
			}
		}
		value = 0.0;
		for ( i = 0; i < N; i++ ) {
			temp = WORK[ offsetWork + ( i * strideWork ) ];
			value = maxNaN( value, temp );
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm using zlassq
		// Fortran: DO J=1,N; L=MAX(1,J-KU); K=KU+1-J+L;
		//   CALL ZLASSQ(MIN(N,J+KL)-L+1, AB(K,J), 1, SCALE, SUM)
		scale = 0.0;
		sum = 1.0;
		for ( j = 0; j < N; j++ ) {
			// l = MAX(1, J-KU) in 1-indexed => MAX(0, j-KU) in 0-indexed
			l = ( ( j - KU > 0 ) ? j - KU : 0 );
			// k = KU+1-J+L in 1-indexed => KU - j + l in 0-indexed (band row index)
			k = KU - j + l;
			// Count = MIN(N, J+KL) - L + 1 in 1-indexed => MIN(N, j+KL+1) - l in 0-indexed
			out = zlassq( ( ( N < j + KL + 1 ) ? N : j + KL + 1 ) - l, AB, strideAB1, offsetAB + ( k * strideAB1 ) + ( j * strideAB2 ), scale, sum );
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

export default zlangb;
