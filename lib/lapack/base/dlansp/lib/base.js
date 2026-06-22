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
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the largest absolute value of any element of a real symmetric matrix supplied in packed storage.
*
* For a symmetric matrix, the one-norm equals the infinity-norm.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} AP - packed symmetric matrix (length >= N*(N+1)/2)
* @param {integer} strideAP - stride for AP
* @param {NonNegativeInteger} offsetAP - starting index for AP
* @param {Float64Array} WORK - workspace array (length >= N for `'one-norm'`/`'inf-norm'` norms)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {number} norm value
*/
function dlansp( norm, uplo, N, AP, strideAP, offsetAP, WORK, strideWORK, offsetWORK ) {
	var value;
	var scale;
	var absa;
	var sum;
	var out;
	var k;
	var i;
	var j;

	if ( N === 0 ) {
		return 0.0;
	}

	if ( norm === 'max' ) {
		// Find the maximum absolute value of any element
		value = 0.0;
		if ( uplo === 'upper' ) {
			// Upper packed: column j has elements (0..j) at positions k..k+j
			k = 0;
			for ( j = 0; j < N; j++ ) {
				for ( i = k; i <= k + j; i++ ) {
					sum = Math.abs( AP[ offsetAP + ( i * strideAP ) ] );
					if ( value < sum || sum !== sum ) {
						value = sum;
					}
				}
				k += j + 1;
			}
		} else {
			// Lower packed: column j has elements (j..N-1) at positions k..k+N-j-1
			k = 0;
			for ( j = 0; j < N; j++ ) {
				for ( i = k; i <= k + N - j - 1; i++ ) {
					sum = Math.abs( AP[ offsetAP + ( i * strideAP ) ] );
					if ( value < sum || sum !== sum ) {
						value = sum;
					}
				}
				k += N - j;
			}
		}
	} else if ( norm === 'inf-norm' || norm === 'one-norm' ) {
		// One-norm = infinity-norm for symmetric matrices
		// Accumulate column sums, exploiting symmetry
		value = 0.0;
		k = 0;
		if ( uplo === 'upper' ) {
			for ( j = 0; j < N; j++ ) {
				sum = 0.0;

				// Off-diagonal elements: i = 0..j-1
				for ( i = 0; i < j; i++ ) {
					absa = Math.abs( AP[ offsetAP + ( k * strideAP ) ] );
					sum += absa;
					WORK[ offsetWORK + ( i * strideWORK ) ] += absa;
					k += 1;
				}
				// Diagonal element
				WORK[ offsetWORK + ( j * strideWORK ) ] = sum + Math.abs( AP[ offsetAP + ( k * strideAP ) ] );
				k += 1;
			}
			for ( i = 0; i < N; i++ ) {
				sum = WORK[ offsetWORK + ( i * strideWORK ) ];
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		} else {
			// Lower triangle
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWORK + ( i * strideWORK ) ] = 0.0;
			}
			for ( j = 0; j < N; j++ ) {
				// Diagonal element
				sum = WORK[ offsetWORK + ( j * strideWORK ) ] + Math.abs( AP[ offsetAP + ( k * strideAP ) ] );
				k += 1;

				// Off-diagonal elements: i = j+1..N-1
				for ( i = j + 1; i < N; i++ ) {
					absa = Math.abs( AP[ offsetAP + ( k * strideAP ) ] );
					sum += absa;
					WORK[ offsetWORK + ( i * strideWORK ) ] += absa;
					k += 1;
				}
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm
		// Count off-diagonal elements twice (symmetry), then add diagonal
		scale = 0.0;
		sum = 1.0;
		k = 1; // Start at second element (first off-diagonal)
		if ( uplo === 'upper' ) {
			// Upper packed: for column j (j=1..N-1), the off-diagonal elements are the first j elements
			for ( j = 1; j < N; j++ ) {
				out = dlassq( j, AP, strideAP, offsetAP + ( k * strideAP ), scale, sum );
				scale = out.scl;
				sum = out.sumsq;
				k += j + 1;
			}
		} else {
			// Lower packed: for column j (j=0..N-2), the off-diagonal elements start at position k+1
			k = 1;
			for ( j = 0; j < N - 1; j++ ) {
				out = dlassq( N - j - 1, AP, strideAP, offsetAP + ( k * strideAP ), scale, sum );
				scale = out.scl;
				sum = out.sumsq;
				k += N - j;
			}
		}
		// Off-diagonal elements counted once; multiply by 2 for full matrix
		sum *= 2.0;

		// Add diagonal elements

		// In upper packed, diagonal element of column j is at position j*(j+1)/2 + j = j*(j+3)/2

		// In lower packed, diagonal element of column j is at position j*N - j*(j-1)/2

		// But it's simpler to walk with a stride:
		k = 0;
		for ( i = 0; i < N; i++ ) {
			if ( AP[ offsetAP + ( k * strideAP ) ] !== 0.0 ) {
				absa = Math.abs( AP[ offsetAP + ( k * strideAP ) ] );
				if ( scale < absa ) {
					sum = 1.0 + ( sum * ( ( scale / absa ) * ( scale / absa ) ) );
					scale = absa;
				} else {
					sum += ( absa / scale ) * ( absa / scale );
				}
			}
			if ( uplo === 'upper' ) {
				k += i + 2;
			} else {
				k += N - i;
			}
		}
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default dlansp;
