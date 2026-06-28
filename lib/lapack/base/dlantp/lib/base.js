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

/* eslint-disable max-len, max-params, max-depth, max-lines-per-function, max-statements */

// MODULES //

import dlassq from '../../dlassq/lib/base.js';


// MAIN //

/**
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the largest absolute value of any element of a real triangular matrix supplied in packed form.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} AP - packed triangular matrix (length >= N*(N+1)/2)
* @param {integer} strideAP - stride for AP
* @param {NonNegativeInteger} offsetAP - starting index for AP
* @param {Float64Array} WORK - workspace array (length >= N for `'inf-norm'`)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {number} norm value
*/
function dlantp( norm, uplo, diag, N, AP, strideAP, offsetAP, WORK, strideWork, offsetWork ) {
	var udiag;
	var value;
	var scale;
	var sum;
	var out;
	var k;
	var i;
	var j;

	if ( N === 0 ) {
		return 0.0;
	}

	udiag = ( diag === 'unit' );

	if ( norm === 'max' ) {
		// Find max(abs(A(i,j)))
		k = 0;
		if ( udiag ) {
			value = 1.0;
			if ( uplo === 'upper' ) {
				// Upper packed, unit diagonal: skip diagonal element at end of each column
				for ( j = 0; j < N; j++ ) {
					// Column j has j+1 elements (indices k..k+j); diagonal is at k+j
					// Off-diagonal elements: k..k+j-1
					for ( i = k; i < k + j; i++ ) {
						sum = Math.abs( AP[ offsetAP + ( i * strideAP ) ] );
						if ( value < sum || sum !== sum ) {
							value = sum;
						}
					}
					k += j + 1;
				}
			} else {
				// Lower packed, unit diagonal: skip diagonal element at start of each column
				for ( j = 0; j < N; j++ ) {
					// Column j has N-j elements (indices k..k+N-j-1); diagonal is at k
					// Off-diagonal elements: k+1..k+N-j-1
					for ( i = k + 1; i <= k + N - j - 1; i++ ) {
						sum = Math.abs( AP[ offsetAP + ( i * strideAP ) ] );
						if ( value < sum || sum !== sum ) {
							value = sum;
						}
					}
					k += N - j;
				}
			}
		} else {
			value = 0.0;
			if ( uplo === 'upper' ) {
				// Upper packed, non-unit: include diagonal
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
				// Lower packed, non-unit: include diagonal
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
		}
	} else if ( norm === 'one-norm' ) {
		// One-norm: maximum column sum of absolute values
		value = 0.0;
		k = 0;
		if ( uplo === 'upper' ) {
			for ( j = 0; j < N; j++ ) {
				if ( udiag ) {
					// Unit diagonal: start at 1, sum off-diagonal elements (k..k+j-1)
					sum = 1.0;
					for ( i = k; i < k + j; i++ ) {
						sum += Math.abs( AP[ offsetAP + ( i * strideAP ) ] );
					}
				} else {
					// Non-unit: sum all elements including diagonal (k..k+j)
					sum = 0.0;
					for ( i = k; i <= k + j; i++ ) {
						sum += Math.abs( AP[ offsetAP + ( i * strideAP ) ] );
					}
				}
				k += j + 1;
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				if ( udiag ) {
					// Unit diagonal: start at 1, sum off-diagonal elements (k+1..k+N-j-1)
					sum = 1.0;
					for ( i = k + 1; i <= k + N - j - 1; i++ ) {
						sum += Math.abs( AP[ offsetAP + ( i * strideAP ) ] );
					}
				} else {
					// Non-unit: sum all elements including diagonal (k..k+N-j-1)
					sum = 0.0;
					for ( i = k; i <= k + N - j - 1; i++ ) {
						sum += Math.abs( AP[ offsetAP + ( i * strideAP ) ] );
					}
				}
				k += N - j;
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Infinity-norm: maximum row sum of absolute values
		// Use WORK array to accumulate row sums
		k = 0;
		if ( uplo === 'upper' ) {
			if ( udiag ) {
				// Initialize all row sums to 1 (unit diagonal)
				for ( i = 0; i < N; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] = 1.0;
				}
				// Walk through packed upper triangle, column by column
				for ( j = 0; j < N; j++ ) {
					// Off-diagonal rows 0..j-1
					for ( i = 0; i < j; i++ ) {
						WORK[ offsetWork + ( i * strideWork ) ] += Math.abs( AP[ offsetAP + ( k * strideAP ) ] );
						k += 1;
					}
					// Skip diagonal element
					k += 1;
				}
			} else {
				// Initialize all row sums to 0
				for ( i = 0; i < N; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
				}
				// Walk through packed upper triangle, column by column
				for ( j = 0; j < N; j++ ) {
					// Rows 0..j (including diagonal)
					for ( i = 0; i <= j; i++ ) {
						WORK[ offsetWork + ( i * strideWork ) ] += Math.abs( AP[ offsetAP + ( k * strideAP ) ] );
						k += 1;
					}
				}
			}
		} else if ( udiag ) {
			// Initialize all row sums to 1 (unit diagonal)
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + ( i * strideWork ) ] = 1.0;
			}

			// Walk through packed lower triangle, column by column
			for ( j = 0; j < N; j++ ) {
				// Skip diagonal element
				k += 1;

				// Off-diagonal rows j+1..N-1
				for ( i = j + 1; i < N; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] += Math.abs( AP[ offsetAP + ( k * strideAP ) ] );
					k += 1;
				}
			}
		} else {
			// Initialize all row sums to 0
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
			}

			// Walk through packed lower triangle, column by column
			for ( j = 0; j < N; j++ ) {
				// Rows j..N-1 (including diagonal)
				for ( i = j; i < N; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] += Math.abs( AP[ offsetAP + ( k * strideAP ) ] );
					k += 1;
				}
			}
		}

		// Find maximum row sum
		value = 0.0;
		for ( i = 0; i < N; i++ ) {
			sum = WORK[ offsetWork + ( i * strideWork ) ];
			if ( value < sum || sum !== sum ) {
				value = sum;
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm using dlassq
		if ( uplo === 'upper' ) {
			if ( udiag ) {
				// Unit diagonal contributes N ones
				scale = 1.0;
				sum = N;

				// Off-diagonal: for column j (j=1..N-1), j elements starting at k
				k = 1; // skip diagonal of column 0
				for ( j = 1; j < N; j++ ) {
					out = dlassq( j, AP, strideAP, offsetAP + ( k * strideAP ), scale, sum );
					scale = out.scl;
					sum = out.sumsq;
					k += j + 1;
				}
			} else {
				// Non-unit: all elements including diagonal
				scale = 0.0;
				sum = 1.0;
				k = 0;
				for ( j = 0; j < N; j++ ) {
					out = dlassq( j + 1, AP, strideAP, offsetAP + ( k * strideAP ), scale, sum );
					scale = out.scl;
					sum = out.sumsq;
					k += j + 1;
				}
			}
		} else if ( udiag ) {
			// Unit diagonal contributes N ones
			scale = 1.0;
			sum = N;

			// Off-diagonal: for column j (j=0..N-2), N-j-1 elements starting at k+1
			k = 1; // skip diagonal of column 0
			for ( j = 0; j < N - 1; j++ ) {
				out = dlassq( N - j - 1, AP, strideAP, offsetAP + ( k * strideAP ), scale, sum );
				scale = out.scl;
				sum = out.sumsq;
				k += N - j; // advance past remaining elements + skip next diagonal
			}
		} else {
			// Non-unit: all elements including diagonal
			scale = 0.0;
			sum = 1.0;
			k = 0;
			for ( j = 0; j < N; j++ ) {
				out = dlassq( N - j, AP, strideAP, offsetAP + ( k * strideAP ), scale, sum );
				scale = out.scl;
				sum = out.sumsq;
				k += N - j;
			}
		}
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default dlantp;
