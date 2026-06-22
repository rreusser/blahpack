/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, max-lines */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Copies a complex triangular matrix from standard full format (TR) to Rectangular Full Packed format (TF).
*
* @private
* @param {string} transr - specifies whether the RFP format is in normal or conjugate-transpose mode (`'no-transpose'` or `'conjugate-transpose'`)
* @param {string} uplo - specifies whether the matrix is upper or lower triangular (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - input triangular matrix in standard full format
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {integer} lda - leading dimension of `A`
* @param {Complex128Array} ARF - output array in RFP format
* @param {integer} strideARF - stride for `ARF` (in complex elements)
* @param {NonNegativeInteger} offsetARF - starting index for `ARF` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function ztrttf( transr, uplo, N, A, strideA1, strideA2, offsetA, lda, ARF, strideARF, offsetARF ) { // eslint-disable-line no-unused-vars
	var normalTransr;
	var nisodd;
	var np1x2;
	var lower;
	var nx2;
	var sa1;
	var sa2;
	var Av;
	var Rv;
	var oA;
	var oR;
	var sr;
	var ia;
	var ir;
	var ij;
	var n1;
	var n2;
	var nt;
	var k;
	var i;
	var j;
	var l;

	// Quick return if possible:
	if ( N <= 1 ) {
		if ( N === 1 ) {
			Av = reinterpret( A, 0 );
			Rv = reinterpret( ARF, 0 );
			sa1 = strideA1 * 2;
			sa2 = strideA2 * 2;
			oA = offsetA * 2;
			sr = strideARF * 2;
			oR = offsetARF * 2;
			normalTransr = ( transr === 'no-transpose' );
			if ( normalTransr ) {
				// ARF(0) = A(0,0):
				Rv[ oR ] = Av[ oA ];
				Rv[ oR + 1 ] = Av[ oA + 1 ];
			} else {
				// ARF(0) = conj(A(0,0)):
				Rv[ oR ] = Av[ oA ];
				Rv[ oR + 1 ] = -Av[ oA + 1 ];
			}
		}
		return 0;
	}

	normalTransr = ( transr === 'no-transpose' );
	lower = ( uplo === 'lower' );

	// Reinterpret Complex128Arrays to Float64Arrays for direct element access:
	Av = reinterpret( A, 0 );
	Rv = reinterpret( ARF, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets:
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	sr = strideARF * 2;
	oR = offsetARF * 2;

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
					for ( i = n1; i <= n2 + j; i += 1 ) {
						// ARF(ij) = conj(A(n2+j, i)):
						ia = oA + ( ( n2 + j ) * sa1 ) + ( i * sa2 );
						ir = oR + ( ij * sr );
						Rv[ ir ] = Av[ ia ];
						Rv[ ir + 1 ] = -Av[ ia + 1 ];
						ij += 1;
					}
					for ( i = j; i <= N - 1; i += 1 ) {
						// ARF(ij) = A(i, j):
						ia = oA + ( i * sa1 ) + ( j * sa2 );
						ir = oR + ( ij * sr );
						Rv[ ir ] = Av[ ia ];
						Rv[ ir + 1 ] = Av[ ia + 1 ];
						ij += 1;
					}
				}
			} else {
				// N is odd, TRANSR = 'N', and UPLO = 'U':
				ij = nt - N;
				for ( j = N - 1; j >= n1; j -= 1 ) {
					for ( i = 0; i <= j; i += 1 ) {
						// ARF(ij) = A(i, j):
						ia = oA + ( i * sa1 ) + ( j * sa2 );
						ir = oR + ( ij * sr );
						Rv[ ir ] = Av[ ia ];
						Rv[ ir + 1 ] = Av[ ia + 1 ];
						ij += 1;
					}
					for ( l = j - n1; l <= n1 - 1; l += 1 ) {
						// ARF(ij) = conj(A(j-n1, l)):
						ia = oA + ( ( j - n1 ) * sa1 ) + ( l * sa2 );
						ir = oR + ( ij * sr );
						Rv[ ir ] = Av[ ia ];
						Rv[ ir + 1 ] = -Av[ ia + 1 ];
						ij += 1;
					}
					ij -= nx2;
				}
			}
		} else if ( lower ) {
			// N is odd, TRANSR = 'C', and UPLO = 'L':
			ij = 0;
			for ( j = 0; j <= n2 - 1; j += 1 ) {
				for ( i = 0; i <= j; i += 1 ) {
					// ARF(ij) = conj(A(j, i)):
					ia = oA + ( j * sa1 ) + ( i * sa2 );
					ir = oR + ( ij * sr );
					Rv[ ir ] = Av[ ia ];
					Rv[ ir + 1 ] = -Av[ ia + 1 ];
					ij += 1;
				}
				for ( i = n1 + j; i <= N - 1; i += 1 ) {
					// ARF(ij) = A(i, n1+j):
					ia = oA + ( i * sa1 ) + ( ( n1 + j ) * sa2 );
					ir = oR + ( ij * sr );
					Rv[ ir ] = Av[ ia ];
					Rv[ ir + 1 ] = Av[ ia + 1 ];
					ij += 1;
				}
			}
			for ( j = n2; j <= N - 1; j += 1 ) {
				for ( i = 0; i <= n1 - 1; i += 1 ) {
					// ARF(ij) = conj(A(j, i)):
					ia = oA + ( j * sa1 ) + ( i * sa2 );
					ir = oR + ( ij * sr );
					Rv[ ir ] = Av[ ia ];
					Rv[ ir + 1 ] = -Av[ ia + 1 ];
					ij += 1;
				}
			}
		} else {
			// N is odd, TRANSR = 'C', and UPLO = 'U':
			ij = 0;
			for ( j = 0; j <= n1; j += 1 ) {
				for ( i = n1; i <= N - 1; i += 1 ) {
					// ARF(ij) = conj(A(j, i)):
					ia = oA + ( j * sa1 ) + ( i * sa2 );
					ir = oR + ( ij * sr );
					Rv[ ir ] = Av[ ia ];
					Rv[ ir + 1 ] = -Av[ ia + 1 ];
					ij += 1;
				}
			}
			for ( j = 0; j <= n1 - 1; j += 1 ) {
				for ( i = 0; i <= j; i += 1 ) {
					// ARF(ij) = A(i, j):
					ia = oA + ( i * sa1 ) + ( j * sa2 );
					ir = oR + ( ij * sr );
					Rv[ ir ] = Av[ ia ];
					Rv[ ir + 1 ] = Av[ ia + 1 ];
					ij += 1;
				}
				for ( l = n2 + j; l <= N - 1; l += 1 ) {
					// ARF(ij) = conj(A(n2+j, l)):
					ia = oA + ( ( n2 + j ) * sa1 ) + ( l * sa2 );
					ir = oR + ( ij * sr );
					Rv[ ir ] = Av[ ia ];
					Rv[ ir + 1 ] = -Av[ ia + 1 ];
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
				for ( i = k; i <= k + j; i += 1 ) {
					// ARF(ij) = conj(A(k+j, i)):
					ia = oA + ( ( k + j ) * sa1 ) + ( i * sa2 );
					ir = oR + ( ij * sr );
					Rv[ ir ] = Av[ ia ];
					Rv[ ir + 1 ] = -Av[ ia + 1 ];
					ij += 1;
				}
				for ( i = j; i <= N - 1; i += 1 ) {
					// ARF(ij) = A(i, j):
					ia = oA + ( i * sa1 ) + ( j * sa2 );
					ir = oR + ( ij * sr );
					Rv[ ir ] = Av[ ia ];
					Rv[ ir + 1 ] = Av[ ia + 1 ];
					ij += 1;
				}
			}
		} else {
			// N is even, TRANSR = 'N', and UPLO = 'U':
			ij = nt - N - 1;
			for ( j = N - 1; j >= k; j -= 1 ) {
				for ( i = 0; i <= j; i += 1 ) {
					// ARF(ij) = A(i, j):
					ia = oA + ( i * sa1 ) + ( j * sa2 );
					ir = oR + ( ij * sr );
					Rv[ ir ] = Av[ ia ];
					Rv[ ir + 1 ] = Av[ ia + 1 ];
					ij += 1;
				}
				for ( l = j - k; l <= k - 1; l += 1 ) {
					// ARF(ij) = conj(A(j-k, l)):
					ia = oA + ( ( j - k ) * sa1 ) + ( l * sa2 );
					ir = oR + ( ij * sr );
					Rv[ ir ] = Av[ ia ];
					Rv[ ir + 1 ] = -Av[ ia + 1 ];
					ij += 1;
				}
				ij -= np1x2;
			}
		}
	} else if ( lower ) {
		// N is even, TRANSR = 'C', and UPLO = 'L':
		ij = 0;
		j = k;
		for ( i = k; i <= N - 1; i += 1 ) {
			// ARF(ij) = A(i, j):
			ia = oA + ( i * sa1 ) + ( j * sa2 );
			ir = oR + ( ij * sr );
			Rv[ ir ] = Av[ ia ];
			Rv[ ir + 1 ] = Av[ ia + 1 ];
			ij += 1;
		}
		for ( j = 0; j <= k - 2; j += 1 ) {
			for ( i = 0; i <= j; i += 1 ) {
				// ARF(ij) = conj(A(j, i)):
				ia = oA + ( j * sa1 ) + ( i * sa2 );
				ir = oR + ( ij * sr );
				Rv[ ir ] = Av[ ia ];
				Rv[ ir + 1 ] = -Av[ ia + 1 ];
				ij += 1;
			}
			for ( i = k + 1 + j; i <= N - 1; i += 1 ) {
				// ARF(ij) = A(i, k+1+j):
				ia = oA + ( i * sa1 ) + ( ( k + 1 + j ) * sa2 );
				ir = oR + ( ij * sr );
				Rv[ ir ] = Av[ ia ];
				Rv[ ir + 1 ] = Av[ ia + 1 ];
				ij += 1;
			}
		}
		for ( j = k - 1; j <= N - 1; j += 1 ) {
			for ( i = 0; i <= k - 1; i += 1 ) {
				// ARF(ij) = conj(A(j, i)):
				ia = oA + ( j * sa1 ) + ( i * sa2 );
				ir = oR + ( ij * sr );
				Rv[ ir ] = Av[ ia ];
				Rv[ ir + 1 ] = -Av[ ia + 1 ];
				ij += 1;
			}
		}
	} else {
		// N is even, TRANSR = 'C', and UPLO = 'U':
		ij = 0;
		for ( j = 0; j <= k; j += 1 ) {
			for ( i = k; i <= N - 1; i += 1 ) {
				// ARF(ij) = conj(A(j, i)):
				ia = oA + ( j * sa1 ) + ( i * sa2 );
				ir = oR + ( ij * sr );
				Rv[ ir ] = Av[ ia ];
				Rv[ ir + 1 ] = -Av[ ia + 1 ];
				ij += 1;
			}
		}
		for ( j = 0; j <= k - 2; j += 1 ) {
			for ( i = 0; i <= j; i += 1 ) {
				// ARF(ij) = A(i, j):
				ia = oA + ( i * sa1 ) + ( j * sa2 );
				ir = oR + ( ij * sr );
				Rv[ ir ] = Av[ ia ];
				Rv[ ir + 1 ] = Av[ ia + 1 ];
				ij += 1;
			}
			for ( l = k + 1 + j; l <= N - 1; l += 1 ) {
				// ARF(ij) = conj(A(k+1+j, l)):
				ia = oA + ( ( k + 1 + j ) * sa1 ) + ( l * sa2 );
				ir = oR + ( ij * sr );
				Rv[ ir ] = Av[ ia ];
				Rv[ ir + 1 ] = -Av[ ia + 1 ];
				ij += 1;
			}
		}

		// Note that here, on exit of the loop, j = k-1:
		for ( i = 0; i <= j; i += 1 ) {
			// ARF(ij) = A(i, j):
			ia = oA + ( i * sa1 ) + ( j * sa2 );
			ir = oR + ( ij * sr );
			Rv[ ir ] = Av[ ia ];
			Rv[ ir + 1 ] = Av[ ia + 1 ];
			ij += 1;
		}
	}
	return 0;
}


// EXPORTS //

export default ztrttf;
