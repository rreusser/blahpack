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

/* eslint-disable max-len, max-params */

// MODULES //

import dlassq from '../../dlassq/lib/base.js';


// MAIN //

/**
* Computes the value of the one norm, Frobenius norm, infinity norm, or.
* largest absolute value of a real matrix.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} WORK - workspace array (length >= M for `'inf-norm'`)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {number} norm value
*/
function dlange( norm, M, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK ) {
	var value;
	var scale;
	var temp;
	var sum;
	var out;
	var ai;
	var wi;
	var i;
	var j;

	if ( M === 0 || N === 0 ) {
		return 0.0;
	}

	if ( norm === 'max' ) {
		// Max absolute value
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			ai = offsetA + (j * strideA2);
			for ( i = 0; i < M; i++ ) {
				temp = Math.abs( A[ ai ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				ai += strideA1;
			}
		}
	} else if ( norm === 'one-norm' ) {
		// One-norm: maximum column sum of absolute values
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			ai = offsetA + (j * strideA2);
			for ( i = 0; i < M; i++ ) {
				sum += Math.abs( A[ ai ] );
				ai += strideA1;
			}
			if ( value < sum || sum !== sum ) {
				value = sum;
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Infinity-norm: maximum row sum of absolute values
		for ( i = 0; i < M; i++ ) {
			wi = offsetWORK + (i * strideWORK);
			WORK[ wi ] = 0.0;
		}
		for ( j = 0; j < N; j++ ) {
			ai = offsetA + (j * strideA2);
			wi = offsetWORK;
			for ( i = 0; i < M; i++ ) {
				WORK[ wi ] += Math.abs( A[ ai ] );
				ai += strideA1;
				wi += strideWORK;
			}
		}
		value = 0.0;
		for ( i = 0; i < M; i++ ) {
			wi = offsetWORK + (i * strideWORK);
			temp = WORK[ wi ];
			if ( value < temp || temp !== temp ) {
				value = temp;
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm: scale * sqrt(sumsq) using dlassq per column
		scale = 0.0;
		sum = 1.0;
		for ( j = 0; j < N; j++ ) {
			out = dlassq( M, A, strideA1, offsetA + (j * strideA2), scale, sum );
			scale = out.scl;
			sum = out.sumsq;
		}
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default dlange;
