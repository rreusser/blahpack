/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, max-lines */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Copies a complex triangular matrix from Rectangular Full Packed (RFP) format to standard full format.
*
* @private
* @param {string} transr - specifies whether `ARF` is in normal or conjugate-transpose format (`'no-transpose'` or `'conjugate-transpose'`)
* @param {string} uplo - specifies whether the matrix is upper or lower triangular (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} ARF - input array in RFP format
* @param {integer} strideARF - stride length for `ARF` (in complex elements)
* @param {NonNegativeInteger} offsetARF - starting index for `ARF` (in complex elements)
* @param {Complex128Array} A - output matrix in full format
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {integer} lda - leading dimension of `A`
* @returns {integer} status code (0 = success)
*/
function ztfttr( transr, uplo, N, ARF, strideARF, offsetARF, A, strideA1, strideA2, offsetA, lda ) { // eslint-disable-line no-unused-vars
	var normalTransr;
	var nisodd;
	var lower;
	var np1x2;
	var sarf;
	var oARF;
	var nx2;
	var sa1;
	var sa2;
	var Av;
	var Fv;
	var ij;
	var n1;
	var n2;
	var nt;
	var oA;
	var da;
	var k;
	var p;
	var i;
	var j;
	var l;

	// Reinterpret Complex128Arrays as Float64Arrays:
	Fv = reinterpret( ARF, 0 );
	Av = reinterpret( A, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets:
	sarf = strideARF * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oARF = offsetARF * 2;
	oA = offsetA * 2;

	// Quick return if possible:
	if ( N <= 1 ) {
		if ( N === 1 ) {
			if ( transr === 'no-transpose' ) {
				// A(0,0) = ARF(0)
				Av[ oA ] = Fv[ oARF ];
				Av[ oA + 1 ] = Fv[ oARF + 1 ];
			} else {
				// A(0,0) = conj(ARF(0))
				Av[ oA ] = Fv[ oARF ];
				Av[ oA + 1 ] = -Fv[ oARF + 1 ];
			}
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
					for ( i = n1; i <= n2 + j; i += 1 ) {
						// A(n2+j, i) = conj(ARF(ij))
						p = oA + ( ( n2 + j ) * sa1 ) + ( i * sa2 );
						da = oARF + ( ij * sarf );
						Av[ p ] = Fv[ da ];
						Av[ p + 1 ] = -Fv[ da + 1 ];
						ij += 1;
					}
					for ( i = j; i <= N - 1; i += 1 ) {
						// A(i, j) = ARF(ij)
						p = oA + ( i * sa1 ) + ( j * sa2 );
						da = oARF + ( ij * sarf );
						Av[ p ] = Fv[ da ];
						Av[ p + 1 ] = Fv[ da + 1 ];
						ij += 1;
					}
				}
			} else {
				// N is odd, TRANSR = 'N', and UPLO = 'U':
				ij = nt - N;
				for ( j = N - 1; j >= n1; j -= 1 ) {
					for ( i = 0; i <= j; i += 1 ) {
						// A(i, j) = ARF(ij)
						p = oA + ( i * sa1 ) + ( j * sa2 );
						da = oARF + ( ij * sarf );
						Av[ p ] = Fv[ da ];
						Av[ p + 1 ] = Fv[ da + 1 ];
						ij += 1;
					}
					for ( l = j - n1; l <= n1 - 1; l += 1 ) {
						// A(j-n1, l) = conj(ARF(ij))
						p = oA + ( ( j - n1 ) * sa1 ) + ( l * sa2 );
						da = oARF + ( ij * sarf );
						Av[ p ] = Fv[ da ];
						Av[ p + 1 ] = -Fv[ da + 1 ];
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
					// A(j, i) = conj(ARF(ij))
					p = oA + ( j * sa1 ) + ( i * sa2 );
					da = oARF + ( ij * sarf );
					Av[ p ] = Fv[ da ];
					Av[ p + 1 ] = -Fv[ da + 1 ];
					ij += 1;
				}
				for ( i = n1 + j; i <= N - 1; i += 1 ) {
					// A(i, n1+j) = ARF(ij)
					p = oA + ( i * sa1 ) + ( ( n1 + j ) * sa2 );
					da = oARF + ( ij * sarf );
					Av[ p ] = Fv[ da ];
					Av[ p + 1 ] = Fv[ da + 1 ];
					ij += 1;
				}
			}
			for ( j = n2; j <= N - 1; j += 1 ) {
				for ( i = 0; i <= n1 - 1; i += 1 ) {
					// A(j, i) = conj(ARF(ij))
					p = oA + ( j * sa1 ) + ( i * sa2 );
					da = oARF + ( ij * sarf );
					Av[ p ] = Fv[ da ];
					Av[ p + 1 ] = -Fv[ da + 1 ];
					ij += 1;
				}
			}
		} else {
			// N is odd, TRANSR = 'C', and UPLO = 'U':
			ij = 0;
			for ( j = 0; j <= n1; j += 1 ) {
				for ( i = n1; i <= N - 1; i += 1 ) {
					// A(j, i) = conj(ARF(ij))
					p = oA + ( j * sa1 ) + ( i * sa2 );
					da = oARF + ( ij * sarf );
					Av[ p ] = Fv[ da ];
					Av[ p + 1 ] = -Fv[ da + 1 ];
					ij += 1;
				}
			}
			for ( j = 0; j <= n1 - 1; j += 1 ) {
				for ( i = 0; i <= j; i += 1 ) {
					// A(i, j) = ARF(ij)
					p = oA + ( i * sa1 ) + ( j * sa2 );
					da = oARF + ( ij * sarf );
					Av[ p ] = Fv[ da ];
					Av[ p + 1 ] = Fv[ da + 1 ];
					ij += 1;
				}
				for ( l = n2 + j; l <= N - 1; l += 1 ) {
					// A(n2+j, l) = conj(ARF(ij))
					p = oA + ( ( n2 + j ) * sa1 ) + ( l * sa2 );
					da = oARF + ( ij * sarf );
					Av[ p ] = Fv[ da ];
					Av[ p + 1 ] = -Fv[ da + 1 ];
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
					// A(k+j, i) = conj(ARF(ij))
					p = oA + ( ( k + j ) * sa1 ) + ( i * sa2 );
					da = oARF + ( ij * sarf );
					Av[ p ] = Fv[ da ];
					Av[ p + 1 ] = -Fv[ da + 1 ];
					ij += 1;
				}
				for ( i = j; i <= N - 1; i += 1 ) {
					// A(i, j) = ARF(ij)
					p = oA + ( i * sa1 ) + ( j * sa2 );
					da = oARF + ( ij * sarf );
					Av[ p ] = Fv[ da ];
					Av[ p + 1 ] = Fv[ da + 1 ];
					ij += 1;
				}
			}
		} else {
			// N is even, TRANSR = 'N', and UPLO = 'U':
			ij = nt - N - 1;
			for ( j = N - 1; j >= k; j -= 1 ) {
				for ( i = 0; i <= j; i += 1 ) {
					// A(i, j) = ARF(ij)
					p = oA + ( i * sa1 ) + ( j * sa2 );
					da = oARF + ( ij * sarf );
					Av[ p ] = Fv[ da ];
					Av[ p + 1 ] = Fv[ da + 1 ];
					ij += 1;
				}
				for ( l = j - k; l <= k - 1; l += 1 ) {
					// A(j-k, l) = conj(ARF(ij))
					p = oA + ( ( j - k ) * sa1 ) + ( l * sa2 );
					da = oARF + ( ij * sarf );
					Av[ p ] = Fv[ da ];
					Av[ p + 1 ] = -Fv[ da + 1 ];
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
			// A(i, j) = ARF(ij)
			p = oA + ( i * sa1 ) + ( j * sa2 );
			da = oARF + ( ij * sarf );
			Av[ p ] = Fv[ da ];
			Av[ p + 1 ] = Fv[ da + 1 ];
			ij += 1;
		}
		for ( j = 0; j <= k - 2; j += 1 ) {
			for ( i = 0; i <= j; i += 1 ) {
				// A(j, i) = conj(ARF(ij))
				p = oA + ( j * sa1 ) + ( i * sa2 );
				da = oARF + ( ij * sarf );
				Av[ p ] = Fv[ da ];
				Av[ p + 1 ] = -Fv[ da + 1 ];
				ij += 1;
			}
			for ( i = k + 1 + j; i <= N - 1; i += 1 ) {
				// A(i, k+1+j) = ARF(ij)
				p = oA + ( i * sa1 ) + ( ( k + 1 + j ) * sa2 );
				da = oARF + ( ij * sarf );
				Av[ p ] = Fv[ da ];
				Av[ p + 1 ] = Fv[ da + 1 ];
				ij += 1;
			}
		}
		for ( j = k - 1; j <= N - 1; j += 1 ) {
			for ( i = 0; i <= k - 1; i += 1 ) {
				// A(j, i) = conj(ARF(ij))
				p = oA + ( j * sa1 ) + ( i * sa2 );
				da = oARF + ( ij * sarf );
				Av[ p ] = Fv[ da ];
				Av[ p + 1 ] = -Fv[ da + 1 ];
				ij += 1;
			}
		}
	} else {
		// N is even, TRANSR = 'C', and UPLO = 'U':
		ij = 0;
		for ( j = 0; j <= k; j += 1 ) {
			for ( i = k; i <= N - 1; i += 1 ) {
				// A(j, i) = conj(ARF(ij))
				p = oA + ( j * sa1 ) + ( i * sa2 );
				da = oARF + ( ij * sarf );
				Av[ p ] = Fv[ da ];
				Av[ p + 1 ] = -Fv[ da + 1 ];
				ij += 1;
			}
		}
		for ( j = 0; j <= k - 2; j += 1 ) {
			for ( i = 0; i <= j; i += 1 ) {
				// A(i, j) = ARF(ij)
				p = oA + ( i * sa1 ) + ( j * sa2 );
				da = oARF + ( ij * sarf );
				Av[ p ] = Fv[ da ];
				Av[ p + 1 ] = Fv[ da + 1 ];
				ij += 1;
			}
			for ( l = k + 1 + j; l <= N - 1; l += 1 ) {
				// A(k+1+j, l) = conj(ARF(ij))
				p = oA + ( ( k + 1 + j ) * sa1 ) + ( l * sa2 );
				da = oARF + ( ij * sarf );
				Av[ p ] = Fv[ da ];
				Av[ p + 1 ] = -Fv[ da + 1 ];
				ij += 1;
			}
		}

		// Note that here, on exit of the loop, j = k-1:
		for ( i = 0; i <= j; i += 1 ) {
			// A(i, j) = ARF(ij)
			p = oA + ( i * sa1 ) + ( j * sa2 );
			da = oARF + ( ij * sarf );
			Av[ p ] = Fv[ da ];
			Av[ p + 1 ] = Fv[ da + 1 ];
			ij += 1;
		}
	}
	return 0;
}


// EXPORTS //

export default ztfttr;
