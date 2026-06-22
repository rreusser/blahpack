/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, camelcase, no-mixed-operators */

// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a symmetric indefinite matrix.
*
* ## Notes
*
* -   The "max absolute element" norm is used.
* -   If the result is much less than 1, the stability of the LU factorization of the (equilibrated) matrix A could be poor.
* -   `info` is the value returned from dsytrf (0 = success, k > 0 = zero pivot at column k, 1-based).
* -   `IPIV` uses 0-based indexing. Positive values indicate 1x1 pivots; negative values (via bitwise NOT) indicate 2x2 pivots.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
* @param {NonNegativeInteger} N - number of rows and columns of the matrix A
* @param {NonNegativeInteger} info - value of INFO returned from dsytrf (0 = success, k > 0 = singular at column k, 1-based)
* @param {Float64Array} A - input matrix A
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} AF - factored matrix from dsytrf
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Int32Array} IPIV - pivot indices from dsytrf (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} WORK - workspace array of length at least `2*N`
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {number} reciprocal pivot growth factor
*/
function dla_syrpvgrw( uplo, N, info, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK ) {
	var rpvgrw;
	var ncols;
	var upper;
	var amax;
	var umax;
	var tmp;
	var kp;
	var sW;
	var oW;
	var i;
	var k;

	upper = ( uplo === 'upper' );
	sW = strideWORK;
	oW = offsetWORK;

	// Determine the number of columns to consider:
	if ( info === 0 ) {
		if ( upper ) {
			ncols = 1;
		} else {
			ncols = N;
		}
	} else {
		ncols = info;
	}

	rpvgrw = 1.0;

	// Zero out WORK (2*N elements):
	for ( i = 0; i < 2 * N; i += 1 ) {
		WORK[ oW + (i * sW) ] = 0.0;
	}

	// Find the max magnitude entry of each column of A. Compute the max for all N columns so we can apply the pivot permutation while looping below. Assume a full factorization is the common case.
	if ( upper ) {
		for ( k = 0; k < N; k += 1 ) {
			for ( i = 0; i <= k; i += 1 ) {
				tmp = Math.abs( A[ offsetA + (i * strideA1) + (k * strideA2) ] );
				if ( tmp > WORK[ oW + ((N + i) * sW) ] ) {
					WORK[ oW + ((N + i) * sW) ] = tmp;
				}
				if ( tmp > WORK[ oW + ((N + k) * sW) ] ) {
					WORK[ oW + ((N + k) * sW) ] = tmp;
				}
			}
		}
	} else {
		for ( k = 0; k < N; k += 1 ) {
			for ( i = k; i < N; i += 1 ) {
				tmp = Math.abs( A[ offsetA + (i * strideA1) + (k * strideA2) ] );
				if ( tmp > WORK[ oW + ((N + i) * sW) ] ) {
					WORK[ oW + ((N + i) * sW) ] = tmp;
				}
				if ( tmp > WORK[ oW + ((N + k) * sW) ] ) {
					WORK[ oW + ((N + k) * sW) ] = tmp;
				}
			}
		}
	}

	// Now find the max magnitude entry of each column of U or L. Also permute the magnitudes of A above so they are in the same order as the factor. The iteration orders and permutations were copied from dsytrs. Fortran IPIV is 1-based; JS IPIV is 0-based. Positive IPIV[k] indicates a 1x1 pivot at row IPIV[k]. Negative IPIV[k] (via bitwise NOT) indicates a 2x2 pivot block.
	if ( upper ) {
		// NOTE: This while loop is unreachable in the upper branch. K starts at N
		// And NCOLS is either 1 (INFO=0) or INFO (INFO>0, INFO<=N), so K >= NCOLS
		// Always holds. The code is preserved to match the reference Fortran exactly.
		k = N - 1;
		while ( (k + 1) < ncols && k >= 0 ) {
			kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
			if ( kp >= 0 ) {
				if ( kp !== k ) {
					tmp = WORK[ oW + ((N + k) * sW) ];
					WORK[ oW + ((N + k) * sW) ] = WORK[ oW + ((N + kp) * sW) ];
					WORK[ oW + ((N + kp) * sW) ] = tmp;
				}
				for ( i = 0; i <= k; i += 1 ) {
					tmp = Math.abs( AF[ offsetAF + (i * strideAF1) + (k * strideAF2) ] );
					if ( tmp > WORK[ oW + (k * sW) ] ) {
						WORK[ oW + (k * sW) ] = tmp;
					}
				}
				k -= 1;
			} else {
				kp = ~kp;
				tmp = WORK[ oW + ((N + k - 1) * sW) ];
				WORK[ oW + ((N + k - 1) * sW) ] = WORK[ oW + ((N + kp) * sW) ];
				WORK[ oW + ((N + kp) * sW) ] = tmp;
				for ( i = 0; i < k; i += 1 ) {
					tmp = Math.abs( AF[ offsetAF + (i * strideAF1) + (k * strideAF2) ] );
					if ( tmp > WORK[ oW + (k * sW) ] ) {
						WORK[ oW + (k * sW) ] = tmp;
					}
					tmp = Math.abs( AF[ offsetAF + (i * strideAF1) + ((k - 1) * strideAF2) ] );
					if ( tmp > WORK[ oW + ((k - 1) * sW) ] ) {
						WORK[ oW + ((k - 1) * sW) ] = tmp;
					}
				}
				tmp = Math.abs( AF[ offsetAF + (k * strideAF1) + (k * strideAF2) ] );
				if ( tmp > WORK[ oW + (k * sW) ] ) {
					WORK[ oW + (k * sW) ] = tmp;
				}
				k -= 2;
			}
		}

		// Second pass: permute remaining
		k = ncols - 1;
		while ( k < N ) {
			kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
			if ( kp >= 0 ) {
				if ( kp !== k ) {
					tmp = WORK[ oW + ((N + k) * sW) ];
					WORK[ oW + ((N + k) * sW) ] = WORK[ oW + ((N + kp) * sW) ];
					WORK[ oW + ((N + kp) * sW) ] = tmp;
				}
				k += 1;
			} else {
				kp = ~kp;
				tmp = WORK[ oW + ((N + k) * sW) ];
				WORK[ oW + ((N + k) * sW) ] = WORK[ oW + ((N + kp) * sW) ];
				WORK[ oW + ((N + kp) * sW) ] = tmp;
				k += 2;
			}
		}
	} else {
		// Lower triangle: process from top to bottom
		k = 0;
		while ( k < ncols ) {
			kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
			if ( kp >= 0 ) {
				// 1x1 pivot
				if ( kp !== k ) {
					tmp = WORK[ oW + ((N + k) * sW) ];
					WORK[ oW + ((N + k) * sW) ] = WORK[ oW + ((N + kp) * sW) ];
					WORK[ oW + ((N + kp) * sW) ] = tmp;
				}
				for ( i = k; i < N; i += 1 ) {
					tmp = Math.abs( AF[ offsetAF + (i * strideAF1) + (k * strideAF2) ] );
					if ( tmp > WORK[ oW + (k * sW) ] ) {
						WORK[ oW + (k * sW) ] = tmp;
					}
				}
				k += 1;
			} else {
				// 2x2 pivot
				kp = ~kp;
				tmp = WORK[ oW + ((N + k + 1) * sW) ];
				WORK[ oW + ((N + k + 1) * sW) ] = WORK[ oW + ((N + kp) * sW) ];
				WORK[ oW + ((N + kp) * sW) ] = tmp;
				for ( i = k + 1; i < N; i += 1 ) {
					tmp = Math.abs( AF[ offsetAF + (i * strideAF1) + (k * strideAF2) ] );
					if ( tmp > WORK[ oW + (k * sW) ] ) {
						WORK[ oW + (k * sW) ] = tmp;
					}
					tmp = Math.abs( AF[ offsetAF + (i * strideAF1) + ((k + 1) * strideAF2) ] );
					if ( tmp > WORK[ oW + ((k + 1) * sW) ] ) {
						WORK[ oW + ((k + 1) * sW) ] = tmp;
					}
				}

				// NOTE: This diagonal update branch is hard to trigger because DSYTRF
				// Picks 2x2 pivots when the off-diagonal AF[k+1,k] dominates AF[k,k],
				// So the max is typically already set from the loop above.
				tmp = Math.abs( AF[ offsetAF + (k * strideAF1) + (k * strideAF2) ] );
				if ( tmp > WORK[ oW + (k * sW) ] ) {
					WORK[ oW + (k * sW) ] = tmp;
				}
				k += 2;
			}
		}

		// Second pass: permute remaining (lower direction, from ncols downward)
		k = ncols - 1;
		while ( k >= 0 ) {
			kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
			if ( kp >= 0 ) {
				if ( kp !== k ) {
					tmp = WORK[ oW + ((N + k) * sW) ];
					WORK[ oW + ((N + k) * sW) ] = WORK[ oW + ((N + kp) * sW) ];
					WORK[ oW + ((N + kp) * sW) ] = tmp;
				}
				k -= 1;
			} else {
				kp = ~kp;
				tmp = WORK[ oW + ((N + k) * sW) ];
				WORK[ oW + ((N + k) * sW) ] = WORK[ oW + ((N + kp) * sW) ];
				WORK[ oW + ((N + kp) * sW) ] = tmp;
				k -= 2;
			}
		}
	}

	// Compute the inverse of the max element growth factor. Dividing by zero would imply the largest entry of the factor column is zero. That can happen when either the column of A is zero or massive pivots made the factor underflow to zero. Neither counts as growth in itself, so simply ignore terms with zero denominators.
	if ( upper ) {
		// NOTE: In the upper branch, the first-pass while loop (above) never executes
		// (see NOTE there), so WORK[0..N-1] remains 0. As a result, the umax !== 0
		// Check always fails and rpvgrw is always returned as 1.0 for the upper case.
		// The code is preserved to match the reference Fortran exactly.
		for ( i = ncols - 1; i < N; i += 1 ) {
			umax = WORK[ oW + (i * sW) ];
			amax = WORK[ oW + ((N + i) * sW) ];
			if ( umax !== 0.0 ) {
				rpvgrw = Math.min( amax / umax, rpvgrw );
			}
		}
	} else {
		for ( i = 0; i < ncols; i += 1 ) {
			umax = WORK[ oW + (i * sW) ];
			amax = WORK[ oW + ((N + i) * sW) ];
			if ( umax !== 0.0 ) {
				rpvgrw = Math.min( amax / umax, rpvgrw );
			}
		}
	}
	return rpvgrw;
}


// EXPORTS //

export default dla_syrpvgrw;
