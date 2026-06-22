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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MAIN //

/**
* Converts the factorization output format used in `dsytrf` (Bunch-Kaufman) to and from the format used by `dsytrf_rk`.
*
* ## Notes
*
* -   When `way = 'convert'`, the routine converts the factorization stored in `A` (format used by `dsytrf`) into the format used by `dsytrf_rk`: the sub/super-diagonal elements of the block-diagonal factor `D` are moved into `E`, the `IPIV` encoding of interchanges is updated, and the stored rows/columns of `U` or `L` are permuted.
* -   When `way = 'revert'`, the routine performs the inverse transformation.
* -   `IPIV` is 0-based. Negative entries encode 2-by-2 pivot blocks: a negative entry `v` represents the 0-based row index `~v` (bitwise NOT).
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` contains the factorization
* @param {string} way - specifies the direction of conversion (`'convert'` or `'revert'`)
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} E - input/output auxiliary array of length `N`
* @param {integer} strideE - stride length for `E`
* @param {NonNegativeInteger} offsetE - starting index for `E`
* @param {Int32Array} IPIV - input/output pivot indices (0-based, length `N`)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @returns {integer} status code (0 = success)
*/
function dsyconvf( uplo, way, N, A, strideA1, strideA2, offsetA, E, strideE, offsetE, IPIV, strideIPIV, offsetIPIV ) {
	var convert;
	var upper;
	var temp;
	var ip;
	var i;
	var j;

	upper = ( uplo === 'upper' );
	convert = ( way === 'convert' );

	// Quick return if possible:
	if ( N === 0 ) {
		return 0;
	}

	if ( upper ) {
		if ( convert ) {
			// Convert A (A is upper).
			// Convert VALUE: extract the super-diagonal elements of the block-diagonal factor D and store them in E; zero out the corresponding entries in A.
			i = N - 1;
			E[ offsetE ] = 0.0;
			while ( i > 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
					E[ offsetE + ( i * strideE ) ] = A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( i * strideA2 ) ];
					E[ offsetE + ( ( i - 1 ) * strideE ) ] = 0.0;
					A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( i * strideA2 ) ] = 0.0;
					i -= 1;
				} else {
					E[ offsetE + ( i * strideE ) ] = 0.0;
				}
				i -= 1;
			}

			// Convert PERMUTATIONS and IPIV: apply permutations to submatrices of the upper part of A in factorization order, walking from i = N-1 down.
			i = N - 1;
			while ( i >= 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1-by-1 pivot interchange: swap rows i and ip in A( :, i+1:N-1 ).
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 ) {
						if ( ip !== i ) {
							for ( j = i + 1; j < N; j++ ) {
								temp = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = temp;
							}
						}
					}
				} else {
					// 2-by-2 pivot interchange: swap rows i-1 and ip in A( :, i+1:N-1 ).
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 ) {
						if ( ip !== i - 1 ) {
							for ( j = i + 1; j < N; j++ ) {
								temp = A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = temp;
							}
						}
					}

					// Convert IPIV: mark the upper index of the 2-by-2 block as a self-pivot in the new format.
					IPIV[ offsetIPIV + ( i * strideIPIV ) ] = i;
					i -= 1;
				}
				i -= 1;
			}
		} else {
			// Revert A (A is upper).
			// Revert PERMUTATIONS and IPIV: apply permutations in reverse factorization order, walking from i = 0 up.
			i = 0;
			while ( i < N ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1-by-1 pivot interchange.
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 ) {
						if ( ip !== i ) {
							for ( j = i + 1; j < N; j++ ) {
								temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = temp;
							}
						}
					}
				} else {
					// 2-by-2 pivot interchange: Fortran advances `i` before reading `IPIV` and reads the (still positive-valued) upper-block slot to form `ip = -IPIV(I)`. In 0-based JS that positive slot stores `i` itself, so the Fortran 1-based `-I` maps to JS `-(i+1)-1 = -i-2`. The resulting "phantom" row index is intentional and matches the Fortran memory-access pattern exactly.
					i += 1;
					ip = -IPIV[ offsetIPIV + ( i * strideIPIV ) ] - 2;
					if ( i < N - 1 ) {
						if ( ip !== i - 1 ) {
							for ( j = i + 1; j < N; j++ ) {
								temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( j * strideA2 ) ];
								A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( j * strideA2 ) ] = temp;
							}
						}
					}

					// Convert IPIV back: record the interchange in two consecutive entries in the `dsytrf` format.
					IPIV[ offsetIPIV + ( i * strideIPIV ) ] = IPIV[ offsetIPIV + ( ( i - 1 ) * strideIPIV ) ];
				}
				i += 1;
			}

			// Revert VALUE: assign super-diagonal entries of D from `E` back to the super-diagonal entries of A.
			i = N - 1;
			while ( i > 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
					A[ offsetA + ( ( i - 1 ) * strideA1 ) + ( i * strideA2 ) ] = E[ offsetE + ( i * strideE ) ];
					i -= 1;
				}
				i -= 1;
			}
		}
	} else if ( convert ) {
		// Convert A (A is lower).
		// Convert VALUE: extract the sub-diagonal elements of D.
		i = 0;
		E[ offsetE + ( ( N - 1 ) * strideE ) ] = 0.0;
		while ( i < N ) {
			if ( i < N - 1 && IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
				E[ offsetE + ( i * strideE ) ] = A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( i * strideA2 ) ];
				E[ offsetE + ( ( i + 1 ) * strideE ) ] = 0.0;
				A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( i * strideA2 ) ] = 0.0;
				i += 1;
			} else {
				E[ offsetE + ( i * strideE ) ] = 0.0;
			}
			i += 1;
		}

		// Convert PERMUTATIONS and IPIV: walk from i = 0 up.
		i = 0;
		while ( i < N ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				// 1-by-1 pivot interchange: swap rows i and ip in A( :, 0:i-1 ).
				ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( i > 0 ) {
					if ( ip !== i ) {
						for ( j = 0; j < i; j++ ) {
							temp = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				}
			} else {
				// 2-by-2 pivot interchange: swap rows i+1 and ip in A( :, 0:i-1 ).
				ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( i > 0 ) {
					if ( ip !== i + 1 ) {
						for ( j = 0; j < i; j++ ) {
							temp = A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				}

				// Convert IPIV: mark the lower index of the 2-by-2 block as a self-pivot in the new format.
				IPIV[ offsetIPIV + ( i * strideIPIV ) ] = i;
				i += 1;
			}
			i += 1;
		}
	} else {
		// Revert A (A is lower).
		// Revert PERMUTATIONS and IPIV: walk from i = N-1 down.
		i = N - 1;
		while ( i >= 0 ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				// 1-by-1 pivot interchange.
				ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( i > 0 ) {
					if ( ip !== i ) {
						for ( j = 0; j < i; j++ ) {
							temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				}
			} else {
				// 2-by-2 pivot interchange: Fortran decrements `i` before reading `IPIV` at the lower block slot (where convert stored the positive self-index). The mapping `-IPIV(I)` in Fortran becomes `-IPIV[i]-2` in JS, producing the same phantom row index.
				// NOTE: The reference dsyconvf (LAPACK 3.12.0) uses this phantom row index in a subsequent swap, which is an out-of-bounds memory access whenever the 2x2 block is not located at rows 0-1. Fortran "works" due to arbitrary stack-memory reads; this JS port follows the same index formula but cannot reproduce Fortran's memory-layout-dependent output. Fixture tests therefore only cover 2x2 Lower Revert blocks at rows 0-1, where the `i > 0` guard skips the swap entirely. For other placements, both the reference and this port exhibit undefined behaviour.
				i -= 1;
				ip = -IPIV[ offsetIPIV + ( i * strideIPIV ) ] - 2;
				if ( i > 0 ) {
					if ( ip !== i + 1 ) {
						for ( j = 0; j < i; j++ ) {
							temp = A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ip * strideA1 ) + ( j * strideA2 ) ] = A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( j * strideA2 ) ];
							A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( j * strideA2 ) ] = temp;
						}
					}
				}

				// Convert IPIV back: record the interchange in two consecutive entries.
				IPIV[ offsetIPIV + ( i * strideIPIV ) ] = IPIV[ offsetIPIV + ( ( i + 1 ) * strideIPIV ) ];
			}
			i -= 1;
		}

		// Revert VALUE: assign sub-diagonal entries of D from `E` back into A.
		i = 0;
		while ( i < N - 1 ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
				A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( i * strideA2 ) ] = E[ offsetE + ( i * strideE ) ];
				i += 1;
			}
			i += 1;
		}
	}

	return 0;
}


// EXPORTS //

export default dsyconvf;
