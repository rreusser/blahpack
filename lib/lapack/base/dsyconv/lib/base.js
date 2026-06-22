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
* Converts a symmetric matrix given by `dsytrf` (Bunch-Kaufman factorization).
* to L and D and vice-versa. Extracts (or reinserts) the off-diagonal elements
* of the block-diagonal factor D into a separate array E, and applies (or
* reverts) the permutations stored in IPIV.
*
* ## Notes
*
* -   WAY='C' (convert): extracts off-diagonal of D into E, zeroes them in A,
*     then applies permutations from IPIV to the triangular factor rows/columns.
* -   WAY='R' (revert): reverses the permutations, then reinserts E back into A.
* -   IPIV uses 0-based indices. Negative IPIV[i] indicates a 2x2 pivot block.
*     `~IPIV[i]` gives the 0-based row/column index of the interchange.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} way - `'convert'` or `'revert'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - input/output matrix (column-major via strides)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Int32Array} IPIV - pivot indices from dsytrf (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} E - array to store off-diagonal elements of D
* @param {integer} strideE - stride length for `E`
* @param {NonNegativeInteger} offsetE - starting index for `E`
* @returns {integer} status code (0 = success)
*/
function dsyconv( uplo, way, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, E, strideE, offsetE ) {
	var convert;
	var upper;
	var temp;
	var ip;
	var i;
	var j;

	upper = ( uplo === 'upper' );
	convert = ( way === 'convert' );

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	if ( upper ) {
		if ( convert ) {
			// Upper, Convert VALUE:
			// Walk from i = N-1 (last row, 0-based) down to i = 1
			// Extract off-diagonal of 2x2 blocks into E, zero them in A
			i = N - 1;
			E[ offsetE ] = 0.0; // E[0] = 0
			while ( i > 0 ) {
				// Fortran: IPIV(I) < 0 means 2x2 block
				// JS: IPIV[i] < 0 means 2x2 block
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
					// E(I) = A(I-1, I) in Fortran (1-based)
					// JS 0-based: E[i] = A[i-1, i]
					E[ offsetE + ( i * strideE ) ] = A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( i * strideA2 ) ];
					E[ offsetE + ( ( i - 1 ) * strideE ) ] = 0.0;
					A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( i * strideA2 ) ] = 0.0;
					i -= 1;
				} else {
					E[ offsetE + ( i * strideE ) ] = 0.0;
				}
				i -= 1;
			}

			// Upper, Convert PERMUTATIONS:
			// Walk from i = N-1 down to i = 0
			i = N - 1;
			while ( i >= 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1x1 pivot: swap rows ip and i for columns i+1..N-1
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 ) {
						for ( j = i + 1; j < N; j++ ) {
							temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				} else {
					// 2x2 pivot: swap rows ip and i-1 for columns i+1..N-1
					// Fortran: IP = -IPIV(I), swap A(IP,J) with A(I-1,J)
					// JS 0-based: ip = -(IPIV[i]+1), i.e. the absolute 0-based index
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 ) {
						for ( j = i + 1; j < N; j++ ) {
							temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
					i -= 1;
				}
				i -= 1;
			}
		} else {
			// Upper, Revert PERMUTATIONS:
			// Walk from i = 0 up to i = N-1
			i = 0;
			while ( i < N ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1x1 pivot
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 ) {
						for ( j = i + 1; j < N; j++ ) {
							temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				} else {
					// 2x2 pivot: Fortran increments I before swap
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					i += 1;
					if ( i < N - 1 ) {
						for ( j = i + 1; j < N; j++ ) {
							temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				}
				i += 1;
			}

			// Upper, Revert VALUE:
			// Walk from i = N-1 down to i = 1
			i = N - 1;
			while ( i > 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
					// A(I-1, I) = E(I) in Fortran 1-based
					// JS 0-based: A[i-1, i] = E[i]
					A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( i * strideA2 ) ] = E[ offsetE + ( i * strideE ) ];
					i -= 1;
				}
				i -= 1;
			}
		}
	} else {
		// LOWER
		if ( convert ) {
			// Lower, Convert VALUE:
			// Walk from i = 0 up to i = N-1
			i = 0;
			E[ offsetE + ( ( N - 1 ) * strideE ) ] = 0.0; // E[N-1] = 0
			while ( i < N ) {
				if ( i < N - 1 && IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
					// E(I) = A(I+1, I) in Fortran 1-based
					// JS 0-based: E[i] = A[i+1, i]
					E[ offsetE + ( i * strideE ) ] = A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( i * strideA2 ) ];
					E[ offsetE + ( ( i + 1 ) * strideE ) ] = 0.0;
					A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( i * strideA2 ) ] = 0.0;
					i += 1;
				} else {
					E[ offsetE + ( i * strideE ) ] = 0.0;
				}
				i += 1;
			}

			// Lower, Convert PERMUTATIONS:
			// Walk from i = 0 up to i = N-1
			i = 0;
			while ( i < N ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1x1 pivot: swap rows ip and i for columns 0..i-1
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i > 0 ) {
						for ( j = 0; j < i; j++ ) {
							temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				} else {
					// 2x2 pivot: swap rows ip and i+1 for columns 0..i-1
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i > 0 ) {
						for ( j = 0; j < i; j++ ) {
							temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
					i += 1;
				}
				i += 1;
			}
		} else {
			// Lower, Revert PERMUTATIONS:
			// Walk from i = N-1 down to i = 0
			i = N - 1;
			while ( i >= 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1x1 pivot
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i > 0 ) {
						for ( j = 0; j < i; j++ ) {
							temp = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				} else {
					// 2x2 pivot: Fortran decrements I before swap
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					i -= 1;
					if ( i > 0 ) {
						for ( j = 0; j < i; j++ ) {
							temp = A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				}
				i -= 1;
			}

			// Lower, Revert VALUE:
			// Walk from i = 0 up to i = N-2
			i = 0;
			while ( i < N - 1 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
					// A(I+1, I) = E(I) in Fortran 1-based
					// JS 0-based: A[i+1, i] = E[i]
					A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( i * strideA2 ) ] = E[ offsetE + ( i * strideE ) ];
					i += 1;
				}
				i += 1;
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dsyconv;
