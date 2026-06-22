/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, max-lines */

// MAIN //

/**
* Copies a triangular matrix from Rectangular Full Packed (RFP) format to standard packed format (TP).
*
* @private
* @param {string} transr - specifies whether `ARF` is in normal or transposed format (`'no-transpose'` or `'transpose'`)
* @param {string} uplo - specifies whether the matrix is upper or lower triangular (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} ARF - input array in RFP format
* @param {integer} strideARF - stride length for `ARF`
* @param {NonNegativeInteger} offsetARF - starting index for `ARF`
* @param {Float64Array} AP - output array in standard packed format
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @returns {integer} status code (0 = success)
*/
function dtfttp( transr, uplo, N, ARF, strideARF, offsetARF, AP, strideAP, offsetAP ) {
	var normalTransr;
	var nisodd;
	var lower;
	var ijp;
	var lda;
	var ij;
	var js;
	var jp;
	var n1;
	var n2;
	var k;
	var i;
	var j;

	// Quick return if possible:
	if ( N <= 0 ) {
		return 0;
	}

	normalTransr = ( transr === 'no-transpose' );
	lower = ( uplo === 'lower' );

	if ( N === 1 ) {
		AP[ offsetAP ] = ARF[ offsetARF ];
		return 0;
	}

	// Set N1 and N2 depending on LOWER:
	if ( lower ) {
		n2 = ( N / 2 ) | 0;
		n1 = N - n2;
	} else {
		n1 = ( N / 2 ) | 0;
		n2 = N - n1;
	}

	// Determine if N is odd or even, and set LDA accordingly:
	if ( N % 2 === 0 ) {
		k = ( N / 2 ) | 0;
		nisodd = false;
		lda = N + 1;
	} else {
		nisodd = true;
		lda = N;
	}

	// If transposed, adjust LDA:
	if ( !normalTransr ) {
		lda = ( ( N + 1 ) / 2 ) | 0;
	}

	// There are eight cases:
	if ( nisodd ) {
		// N is odd...
		if ( normalTransr ) {
			// N is odd and TRANSR = 'N'...
			if ( lower ) {
				// SRPA for LOWER, NORMAL and N is odd:
				ijp = 0;
				jp = 0;
				for ( j = 0; j <= n2; j += 1 ) {
					for ( i = j; i <= N - 1; i += 1 ) {
						ij = i + jp;
						AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
						ijp += 1;
					}
					jp += lda;
				}
				for ( i = 0; i <= n2 - 1; i += 1 ) {
					for ( j = 1 + i; j <= n2; j += 1 ) {
						ij = i + ( j * lda );
						AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
						ijp += 1;
					}
				}
			} else {
				// SRPA for UPPER, NORMAL and N is odd:
				ijp = 0;
				for ( j = 0; j <= n1 - 1; j += 1 ) {
					ij = n2 + j;
					for ( i = 0; i <= j; i += 1 ) {
						AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
						ijp += 1;
						ij += lda;
					}
				}
				js = 0;
				for ( j = n1; j <= N - 1; j += 1 ) {
					for ( ij = js; ij <= js + j; ij += 1 ) {
						AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
						ijp += 1;
					}
					js += lda;
				}
			}
		} else if ( lower ) {
			// N is odd, TRANSR = 'T', and UPLO = 'L':
			ijp = 0;
			for ( i = 0; i <= n2; i += 1 ) {
				for ( ij = i * ( lda + 1 ); ij <= ( N * lda ) - 1; ij += lda ) {
					AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ijp += 1;
				}
			}
			js = 1;
			for ( j = 0; j <= n2 - 1; j += 1 ) {
				for ( ij = js; ij <= js + n2 - j - 1; ij += 1 ) {
					AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ijp += 1;
				}
				js += lda + 1;
			}
		} else {
			// N is odd, TRANSR = 'T', and UPLO = 'U':
			ijp = 0;
			js = n2 * lda;
			for ( j = 0; j <= n1 - 1; j += 1 ) {
				for ( ij = js; ij <= js + j; ij += 1 ) {
					AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ijp += 1;
				}
				js += lda;
			}
			for ( i = 0; i <= n1; i += 1 ) {
				for ( ij = i; ij <= i + ( ( n1 + i ) * lda ); ij += lda ) {
					AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ijp += 1;
				}
			}
		}
	} else if ( normalTransr ) {
		// N is even and TRANSR = 'N'...
		if ( lower ) {
			// SRPA for LOWER, NORMAL, and N is even:
			ijp = 0;
			jp = 0;
			for ( j = 0; j <= k - 1; j += 1 ) {
				for ( i = j; i <= N - 1; i += 1 ) {
					ij = 1 + i + jp;
					AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ijp += 1;
				}
				jp += lda;
			}
			for ( i = 0; i <= k - 1; i += 1 ) {
				for ( j = i; j <= k - 1; j += 1 ) {
					ij = i + ( j * lda );
					AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ijp += 1;
				}
			}
		} else {
			// SRPA for UPPER, NORMAL, and N is even:
			ijp = 0;
			for ( j = 0; j <= k - 1; j += 1 ) {
				ij = k + 1 + j;
				for ( i = 0; i <= j; i += 1 ) {
					AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ijp += 1;
					ij += lda;
				}
			}
			js = 0;
			for ( j = k; j <= N - 1; j += 1 ) {
				for ( ij = js; ij <= js + j; ij += 1 ) {
					AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
					ijp += 1;
				}
				js += lda;
			}
		}
	} else if ( lower ) {
		// N is even, TRANSR = 'T', and UPLO = 'L':
		ijp = 0;
		for ( i = 0; i <= k - 1; i += 1 ) {
			for ( ij = i + ( ( i + 1 ) * lda ); ij <= ( ( N + 1 ) * lda ) - 1; ij += lda ) {
				AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
				ijp += 1;
			}
		}
		js = 0;
		for ( j = 0; j <= k - 1; j += 1 ) {
			for ( ij = js; ij <= js + k - j - 1; ij += 1 ) {
				AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
				ijp += 1;
			}
			js += lda + 1;
		}
	} else {
		// N is even, TRANSR = 'T', and UPLO = 'U':
		ijp = 0;
		js = ( k + 1 ) * lda;
		for ( j = 0; j <= k - 1; j += 1 ) {
			for ( ij = js; ij <= js + j; ij += 1 ) {
				AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
				ijp += 1;
			}
			js += lda;
		}
		for ( i = 0; i <= k - 1; i += 1 ) {
			for ( ij = i; ij <= i + ( ( k + i ) * lda ); ij += lda ) {
				AP[ offsetAP + ( ijp * strideAP ) ] = ARF[ offsetARF + ( ij * strideARF ) ];
				ijp += 1;
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dtfttp;
