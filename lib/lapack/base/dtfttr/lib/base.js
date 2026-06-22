/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, max-lines */

// MAIN //

/**
* Copies a triangular matrix from Rectangular Full Packed (RFP) format to standard full format.
*
* @private
* @param {string} transr - specifies whether `ARF` is in normal or transposed format (`'no-transpose'` or `'transpose'`)
* @param {string} uplo - specifies whether the matrix is upper or lower triangular (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} ARF - input array in RFP format
* @param {integer} strideARF - stride length for `ARF`
* @param {NonNegativeInteger} offsetARF - starting index for `ARF`
* @param {Float64Array} A - output matrix in full format
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {integer} lda - leading dimension of `A`
* @returns {integer} status code (0 = success)
*/
function dtfttr( transr, uplo, N, ARF, strideARF, offsetARF, A, strideA1, strideA2, offsetA, lda ) { // eslint-disable-line no-unused-vars
	var normalTransr;
	var nisodd;
	var lower;
	var np1x2;
	var nx2;
	var ij;
	var n1;
	var n2;
	var nt;
	var da;
	var k;
	var i;
	var j;
	var l;

	// Quick return if possible:
	if ( N <= 1 ) {
		if ( N === 1 ) {
			A[ offsetA ] = ARF[ offsetARF ];
		}
		return 0;
	}

	normalTransr = ( transr === 'no-transpose' );
	lower = ( uplo === 'lower' );

	// Size of array ARF(0:nt-1):
	nt = ( N * ( N + 1 ) ) / 2;

	// Set N1 and N2 depending on LOWER:
	if ( lower ) {
		n2 = ( N / 2 ) | 0;
		n1 = N - n2;
	} else {
		n1 = ( N / 2 ) | 0;
		n2 = N - n1;
	}

	// Determine if N is odd or even:
	if ( N % 2 === 0 ) {
		k = ( N / 2 ) | 0;
		nisodd = false;
		if ( !lower ) {
			np1x2 = N + N + 2;
		}
	} else {
		nisodd = true;
		if ( !lower ) {
			nx2 = N + N;
		}
	}

	if ( nisodd ) {
		// N is odd...
		if ( normalTransr ) {
			// N is odd and TRANSR = 'N'...
			if ( lower ) {
				// N is odd, TRANSR = 'N', and UPLO = 'L':
				ij = 0;
				for ( j = 0; j <= n2; j += 1 ) {
					da = offsetA + ( ( n2 + j ) * strideA1 );
					for ( i = n1; i <= n2 + j; i += 1 ) {
						A[ da + ( i * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
						ij += 1;
					}
					da = offsetA + ( j * strideA2 );
					for ( i = j; i <= N - 1; i += 1 ) {
						A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
						ij += 1;
					}
				}
			} else {
				// N is odd, TRANSR = 'N', and UPLO = 'U':
				ij = nt - N;
				for ( j = N - 1; j >= n1; j -= 1 ) {
					for ( i = 0; i <= j; i += 1 ) {
						A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
						ij += 1;
					}
					for ( l = j - n1; l <= n1 - 1; l += 1 ) {
						A[ offsetA + ( ( j - n1 ) * strideA1 ) + ( l * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
						ij += 1;
					}
					ij -= nx2;
				}
			}
		} else if ( lower ) {
			// N is odd, TRANSR = 'T', and UPLO = 'L':
			ij = 0;
			for ( j = 0; j <= n2 - 1; j += 1 ) {
				for ( i = 0; i <= j; i += 1 ) {
					A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ij += 1;
				}
				for ( i = n1 + j; i <= N - 1; i += 1 ) {
					A[ offsetA + ( i * strideA1 ) + ( ( n1 + j ) * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ij += 1;
				}
			}
			for ( j = n2; j <= N - 1; j += 1 ) {
				for ( i = 0; i <= n1 - 1; i += 1 ) {
					A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ij += 1;
				}
			}
		} else {
			// N is odd, TRANSR = 'T', and UPLO = 'U':
			ij = 0;
			for ( j = 0; j <= n1; j += 1 ) {
				for ( i = n1; i <= N - 1; i += 1 ) {
					A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ij += 1;
				}
			}
			for ( j = 0; j <= n1 - 1; j += 1 ) {
				for ( i = 0; i <= j; i += 1 ) {
					A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ij += 1;
				}
				for ( l = n2 + j; l <= N - 1; l += 1 ) {
					A[ offsetA + ( ( n2 + j ) * strideA1 ) + ( l * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ij += 1;
				}
			}
		}
	} else if ( normalTransr ) {
		// N is even and TRANSR = 'N'...
		if ( lower ) {
			// N is even, TRANSR = 'N', and UPLO = 'L':
			ij = 0;
			for ( j = 0; j <= k - 1; j += 1 ) {
				da = offsetA + ( ( k + j ) * strideA1 );
				for ( i = k; i <= k + j; i += 1 ) {
					A[ da + ( i * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ij += 1;
				}
				for ( i = j; i <= N - 1; i += 1 ) {
					A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ij += 1;
				}
			}
		} else {
			// N is even, TRANSR = 'N', and UPLO = 'U':
			ij = nt - N - 1;
			for ( j = N - 1; j >= k; j -= 1 ) {
				for ( i = 0; i <= j; i += 1 ) {
					A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ij += 1;
				}
				for ( l = j - k; l <= k - 1; l += 1 ) {
					A[ offsetA + ( ( j - k ) * strideA1 ) + ( l * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ij += 1;
				}
				ij -= np1x2;
			}
		}
	} else if ( lower ) {
		// N is even, TRANSR = 'T', and UPLO = 'L':
		ij = 0;
		j = k;
		for ( i = k; i <= N - 1; i += 1 ) {
			A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
			ij += 1;
		}
		for ( j = 0; j <= k - 2; j += 1 ) {
			for ( i = 0; i <= j; i += 1 ) {
				A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
				ij += 1;
			}
			for ( i = k + 1 + j; i <= N - 1; i += 1 ) {
				A[ offsetA + ( i * strideA1 ) + ( ( k + 1 + j ) * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
				ij += 1;
			}
		}
		for ( j = k - 1; j <= N - 1; j += 1 ) {
			for ( i = 0; i <= k - 1; i += 1 ) {
				A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
				ij += 1;
			}
		}
	} else {
		// N is even, TRANSR = 'T', and UPLO = 'U':
		ij = 0;
		for ( j = 0; j <= k; j += 1 ) {
			for ( i = k; i <= N - 1; i += 1 ) {
				A[ offsetA + ( j * strideA1 ) + ( i * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
				ij += 1;
			}
		}
		for ( j = 0; j <= k - 2; j += 1 ) {
			for ( i = 0; i <= j; i += 1 ) {
				A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
				ij += 1;
			}
			for ( l = k + 1 + j; l <= N - 1; l += 1 ) {
				A[ offsetA + ( ( k + 1 + j ) * strideA1 ) + ( l * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
				ij += 1;
			}
		}

		// Note that here, on exit of the loop, j = k-1:
		for ( i = 0; i <= j; i += 1 ) {
			A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
			ij += 1;
		}
	}
	return 0;
}


// EXPORTS //

export default dtfttr;
