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
* Computes the value of the one-norm, Frobenius norm, infinity-norm, or the.
* largest absolute value of any element of a real symmetric matrix.
*
* For a symmetric matrix, the one-norm equals the infinity-norm.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - real symmetric matrix
* @param {integer} strideA1 - first dimension stride for A
* @param {integer} strideA2 - second dimension stride for A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} WORK - workspace array (length >= N for `'one-norm'`/`'inf-norm'` norms)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {number} norm value
*/
function dlansy( norm, uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) {
	var value;
	var scale;
	var absa;
	var sum;
	var out;
	var ai;
	var wi;
	var i;
	var j;

	if ( N === 0 ) {
		return 0.0;
	}

	if ( norm === 'max' ) {
		// Max absolute value
		value = 0.0;
		if ( uplo === 'upper' ) {
			// Upper triangle: iterate j=0..N-1, i=0..j
			for ( j = 0; j < N; j++ ) {
				ai = offsetA + (j * strideA2);
				for ( i = 0; i <= j; i++ ) {
					sum = Math.abs( A[ ai ] );
					if ( value < sum || sum !== sum ) {
						value = sum;
					}
					ai += strideA1;
				}
			}
		} else {
			// Lower triangle: iterate j=0..N-1, i=j..N-1
			for ( j = 0; j < N; j++ ) {
				ai = offsetA + (j * strideA2) + (j * strideA1);
				for ( i = j; i < N; i++ ) {
					sum = Math.abs( A[ ai ] );
					if ( value < sum || sum !== sum ) {
						value = sum;
					}
					ai += strideA1;
				}
			}
		}
	} else if ( norm === 'inf-norm' || norm === 'one-norm' || norm === 'one-norm' ) {
		// One-norm = infinity-norm for symmetric matrices
		// Compute column sums, exploiting symmetry: off-diagonal element A(i,j)
		// Contributes to both column i and column j sums.
		value = 0.0;
		if ( uplo === 'upper' ) {
			for ( j = 0; j < N; j++ ) {
				sum = 0.0;
				ai = offsetA + (j * strideA2);

				// Off-diagonal elements: i = 0..j-1
				for ( i = 0; i < j; i++ ) {
					absa = Math.abs( A[ ai ] );
					sum += absa;

					// Also add to row i's sum (stored in WORK[i])
					WORK[ offsetWork + (i * strideWork) ] += absa;
					ai += strideA1;
				}
				// Diagonal element
				WORK[ offsetWork + (j * strideWork) ] = sum + Math.abs( A[ ai ] );
			}
			for ( i = 0; i < N; i++ ) {
				wi = offsetWork + (i * strideWork);
				sum = WORK[ wi ];
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		} else {
			// Lower triangle
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + (i * strideWork) ] = 0.0;
			}
			for ( j = 0; j < N; j++ ) {
				// Diagonal element
				sum = WORK[ offsetWork + (j * strideWork) ] + Math.abs( A[ offsetA + (j * strideA2) + (j * strideA1) ] );
				ai = offsetA + (j * strideA2) + (( j + 1 ) * strideA1);

				// Off-diagonal elements: i = j+1..N-1
				for ( i = j + 1; i < N; i++ ) {
					absa = Math.abs( A[ ai ] );
					sum += absa;
					WORK[ offsetWork + (i * strideWork) ] += absa;
					ai += strideA1;
				}
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		}
	} else if ( norm === 'frobenius' || norm === 'frobenius' ) {
		// Frobenius norm
		// Count off-diagonal elements twice (symmetry), then add diagonal
		scale = 0.0;
		sum = 1.0;
		if ( uplo === 'upper' ) {
			// Upper triangle off-diagonal: columns j=1..N-1, rows 0..j-1
			for ( j = 1; j < N; j++ ) {
				out = dlassq( j, A, strideA1, offsetA + (j * strideA2), scale, sum );
				scale = out.scl;
				sum = out.sumsq;
			}
		} else {
			// Lower triangle off-diagonal: columns j=0..N-2, rows j+1..N-1
			for ( j = 0; j < N - 1; j++ ) {
				out = dlassq( N - j - 1, A, strideA1, offsetA + (j * strideA2) + (( j + 1 ) * strideA1), scale, sum );
				scale = out.scl;
				sum = out.sumsq;
			}
		}
		// Off-diagonal elements counted once, but appear twice in the full matrix
		sum *= 2.0;

		// Add diagonal elements
		out = dlassq( N, A, strideA1 + strideA2, offsetA, scale, sum );
		scale = out.scl;
		sum = out.sumsq;
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default dlansy;
