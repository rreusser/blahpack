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

/* eslint-disable max-len, max-params, max-statements, max-depth, camelcase */

// MAIN //

/**
* Converts the factorization output format used in `dsytrf_rook`.
*
* ## Notes
*
* -   WAY `'convert'`: extracts the off-diagonal of the block-diagonal factor
*     `D` into `e`, zeroes the corresponding positions in `A`, then applies the
*     row/column interchanges stored in `IPIV` to the triangular factor.
*
* -   WAY `'revert'`: reverses the interchanges, then reinserts `e` back into
*     `A`.
*
* -   Rook pivoting encodes a 2-by-2 pivot block by making BOTH `IPIV[i-1]` and
*     `IPIV[i]` (upper) or `IPIV[i]` and `IPIV[i+1]` (lower) negative. Each
*     entry records a distinct row interchange, in contrast to standard
*     Bunch-Kaufman which uses a single interchange per 2-by-2 block.
*
* -   `IPIV` uses 0-based indices. Use `~IPIV[i]` (bitwise NOT) to decode the
*     0-based row/column index for the interchange associated with a negative
*     entry.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} way - `'convert'` or `'revert'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - input/output matrix (column-major via strides)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} e - array to store off-diagonal elements of `D`
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Int32Array} IPIV - pivot indices from `dsytrf_rook` (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @returns {integer} status code (`0` = success)
*/
function dsyconvf_rook( uplo, way, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV ) {
	var convert;
	var upper;
	var temp;
	var ip2;
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
			// Upper, Convert VALUE: walk from i=N-1 down to i=1
			i = N - 1;
			e[ offsetE ] = 0.0;
			while ( i > 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
					// e[i] = A[i-1, i]
					e[ offsetE + ( i * strideE ) ] = A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( i * strideA2 ) ];
					e[ offsetE + ( ( i - 1 ) * strideE ) ] = 0.0;
					A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( i * strideA2 ) ] = 0.0;
					i -= 1;
				} else {
					e[ offsetE + ( i * strideE ) ] = 0.0;
				}
				i -= 1;
			}

			// Upper, Convert PERMUTATIONS: walk from i=N-1 down to i=0
			i = N - 1;
			while ( i >= 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1x1 pivot: swap rows i and ip for columns i+1..N-1
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 && ip !== i ) {
						for ( j = i + 1; j < N; j++ ) {
							temp = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				} else {
					// 2x2 pivot (rook): both IPIV[i] and IPIV[i-1] are
					// negative; each records its own interchange.
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					ip2 = ~IPIV[ offsetIPIV + ( ( i - 1 ) * strideIPIV ) ];
					if ( i < N - 1 ) {
						if ( ip !== i ) {
							for ( j = i + 1; j < N; j++ ) {
								temp = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = temp;
							}
						}
						if ( ip2 !== i - 1 ) {
							for ( j = i + 1; j < N; j++ ) {
								temp = A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ip2 * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( ip2 * strideA1 ) + ( j * strideA2 ) ] = temp;
							}
						}
					}
					i -= 1;
				}
				i -= 1;
			}
		} else {
			// Upper, Revert PERMUTATIONS: walk from i=0 up to i=N-1
			i = 0;
			while ( i < N ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1x1 pivot
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 && ip !== i ) {
						for ( j = i + 1; j < N; j++ ) {
							temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				} else {
					// 2x2 pivot (rook): Fortran increments I before swap. The
					// Inner swaps run in reverse order compared to convert.
					i += 1;
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					ip2 = ~IPIV[ offsetIPIV + ( ( i - 1 ) * strideIPIV ) ];
					if ( i < N - 1 ) {
						if ( ip2 !== i - 1 ) {
							for ( j = i + 1; j < N; j++ ) {
								temp = A[ offsetA + ( ip2 * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( ip2 * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( j * strideA2 ) ] = temp;
							}
						}
						if ( ip !== i ) {
							for ( j = i + 1; j < N; j++ ) {
								temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = temp;
							}
						}
					}
				}
				i += 1;
			}

			// Upper, Revert VALUE: walk from i=N-1 down to i=1
			i = N - 1;
			while ( i > 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
					A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( i * strideA2 ) ] = e[ offsetE + ( i * strideE ) ];
					i -= 1;
				}
				i -= 1;
			}
		}
	} else if ( convert ) {
		// Lower, Convert VALUE: walk from i=0 up to i=N-1
		i = 0;
		e[ offsetE + ( ( N - 1 ) * strideE ) ] = 0.0;
		while ( i < N ) {
			if ( i < N - 1 && IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
				// e[i] = A[i+1, i]
				e[ offsetE + ( i * strideE ) ] = A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( i * strideA2 ) ];
				e[ offsetE + ( ( i + 1 ) * strideE ) ] = 0.0;
				A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( i * strideA2 ) ] = 0.0;
				i += 1;
			} else {
				e[ offsetE + ( i * strideE ) ] = 0.0;
			}
			i += 1;
		}

		// Lower, Convert PERMUTATIONS: walk from i=0 up to i=N-1
		i = 0;
		while ( i < N ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot: swap rows i and ip for columns 0..i-1
				ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( i > 0 && ip !== i ) {
					for ( j = 0; j < i; j++ ) {
						temp = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
						A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
						A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = temp;
					}
				}
			} else {
				// 2x2 pivot (rook): both IPIV[i] and IPIV[i+1] are negative.
				ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				ip2 = ~IPIV[ offsetIPIV + ( ( i + 1 ) * strideIPIV ) ];
				if ( i > 0 ) {
					if ( ip !== i ) {
						for ( j = 0; j < i; j++ ) {
							temp = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
					if ( ip2 !== i + 1 ) {
						for ( j = 0; j < i; j++ ) {
							temp = A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ip2 * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip2 * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				}
				i += 1;
			}
			i += 1;
		}
	} else {
		// Lower, Revert PERMUTATIONS: walk from i=N-1 down to i=0
		i = N - 1;
		while ( i >= 0 ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot
				ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( i > 0 && ip !== i ) {
					for ( j = 0; j < i; j++ ) {
						temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
						A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
						A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = temp;
					}
				}
			} else {
				// 2x2 pivot: Fortran decrements I before swap.
				i -= 1;
				ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				ip2 = ~IPIV[ offsetIPIV + ( ( i + 1 ) * strideIPIV ) ];
				if ( i > 0 ) {
					if ( ip2 !== i + 1 ) {
						for ( j = 0; j < i; j++ ) {
							temp = A[ offsetA + ( ip2 * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip2 * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
					if ( ip !== i ) {
						for ( j = 0; j < i; j++ ) {
							temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				}
			}
			i -= 1;
		}

		// Lower, Revert VALUE: walk from i=0 up to i=N-2
		i = 0;
		while ( i < N - 1 ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
				A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( i * strideA2 ) ] = e[ offsetE + ( i * strideE ) ];
				i += 1;
			}
			i += 1;
		}
	}

	return 0;
}


// EXPORTS //

export default dsyconvf_rook;
