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

// MAIN //

/**
* Computes row and column scalings intended to equilibrate a symmetric positive.
* definite matrix A and reduce its condition number.
*
* S(i) = 1 / sqrt(A(i,i)). The choice of S puts the condition number of
* B = S_A_S within a factor N of the smallest possible condition number.
*
* Returns an object with:
* - info: 0 if successful; i (1-based) if the i-th diagonal element is non-positive.
* - scond: ratio of smallest to largest scaling factor
* - amax: absolute value of the largest diagonal element
*
* @private
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input N-by-N symmetric positive definite matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} s - output scale factors, length N
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - index offset for s
* @returns {Object} result with info, scond, amax
*/
function dpoequ( N, A, strideA1, strideA2, offsetA, s, strideS, offsetS ) {
	var smin;
	var amax;
	var si;
	var i;

	// Quick return if possible
	if ( N === 0 ) {
		return {
			'info': 0,
			'scond': 1.0,
			'amax': 0.0
		};
	}

	// Extract the diagonal elements into S
	si = offsetS;
	s[ si ] = A[ offsetA ];
	smin = s[ si ];
	amax = s[ si ];
	for ( i = 1; i < N; i++ ) {
		si = offsetS + ( i * strideS );
		s[ si ] = A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ];
		if ( s[ si ] < smin ) {
			smin = s[ si ];
		}
		if ( s[ si ] > amax ) {
			amax = s[ si ];
		}
	}

	if ( smin <= 0.0 ) {
		// Find the first non-positive diagonal element and return
		for ( i = 0; i < N; i++ ) {
			if ( s[ offsetS + ( i * strideS ) ] <= 0.0 ) {
				return {
					'info': i + 1,
					'scond': 0.0,
					'amax': amax
				};
			}
		}
	}

	// Compute scaling factors: S(i) = 1 / sqrt(A(i,i))
	for ( i = 0; i < N; i++ ) {
		si = offsetS + ( i * strideS );
		s[ si ] = 1.0 / Math.sqrt( s[ si ] );
	}

	// Compute SCOND = sqrt(min(diag)) / sqrt(max(diag))
	return {
		'info': 0,
		'scond': Math.sqrt( smin ) / Math.sqrt( amax ),
		'amax': amax
	};
}


// EXPORTS //

export default dpoequ;
