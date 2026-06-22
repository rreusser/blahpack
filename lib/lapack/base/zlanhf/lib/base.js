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

/* eslint-disable max-len, max-params, max-depth, max-lines, max-lines-per-function, max-statements, no-lonely-if */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlassq from '../../zlassq/lib/base.js';


// FUNCTIONS //

/**
* Returns the complex absolute value (modulus) at a given float64 index.
*
* @private
* @param {Float64Array} v - reinterpreted float64 view
* @param {integer} idx - index into float64 view (real part)
* @returns {number} complex modulus
*/
function cabs( v, idx ) {
	var re = v[ idx ];
	var im = v[ idx + 1 ];
	return Math.sqrt( (re * re) + (im * im) );
}

/**
* Accumulates a real diagonal element into scaled sum of squares.
*
* @private
* @param {number} aa - real diagonal value (already extracted)
* @param {number} scale - current scale
* @param {number} s - current sum of squares
* @returns {Array} [scale, s]
*/
function addDiag( aa, scale, s ) {
	if ( aa !== 0.0 ) {
		if ( scale < aa ) {
			s = 1.0 + ( s * ( scale / aa ) * ( scale / aa ) );
			scale = aa;
		} else {
			s += ( aa / scale ) * ( aa / scale );
		}
	}
	return [ scale, s ];
}


// MAIN //

/**
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the.
* largest absolute value of any element of a complex Hermitian matrix stored
* in Rectangular Full Packed (RFP) format.
*
* ## Notes
*
* -   For a Hermitian matrix, the one-norm equals the infinity-norm.
*
* -   Diagonal elements are real; only their real part is used.
*
* -   The RFP layout packs `N*(N+1)/2` complex elements into a dense 2D
*     column-major block whose dimensions depend on `transr`, `uplo`, and
*     whether `N` is odd or even.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} transr - `'no-transpose'` or `'conjugate-transpose'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the Hermitian matrix
* @param {Complex128Array} A - RFP array of length `N*(N+1)/2`
* @param {integer} strideA - stride for A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} WORK - workspace (length >= N for one/inf norms)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {number} norm value
*/
function zlanhf( norm, transr, uplo, N, A, strideA, offsetA, WORK, strideWORK, offsetWORK ) {
	var ifm;
	var ilu;
	var noe;
	var lda;
	var Av;
	var oA;
	var sA;

	if ( N === 0 ) {
		return 0.0;
	}

	Av = reinterpret( A, 0 );
	sA = strideA * 2;
	oA = offsetA * 2;

	if ( N === 1 ) {
		return Math.abs( Av[ oA ] );
	}

	// Set noe = 1 if N is odd, 0 if N is even:
	noe = ( N % 2 === 0 ) ? 0 : 1;

	// Set ifm = 1 if transr='N', 0 if transr='C':
	ifm = ( transr === 'conjugate-transpose' ) ? 0 : 1;

	// Set ilu = 1 if uplo='L', 0 if uplo='U':
	ilu = ( uplo === 'upper' ) ? 0 : 1;

	// Compute LDA (leading dimension of the RFP block, in complex elements):
	if ( ifm === 1 ) {
		lda = ( noe === 1 ) ? N : ( N + 1 );
	} else {
		lda = ( N + 1 ) / 2 | 0;
	}
	if ( norm === 'max' ) {
		return maxNorm( Av, oA, sA, N, noe, ifm, ilu, lda );
	}
	if ( norm === 'one-norm' || norm === 'inf-norm' ) {
		return oneNorm( Av, oA, sA, N, noe, ifm, ilu, lda, WORK, strideWORK, offsetWORK );
	}
	if ( norm === 'frobenius' ) {
		return frobNorm( A, Av, oA, sA, N, noe, ifm, ilu, lda, strideA, offsetA );
	}
	return 0.0;
}

/**
* Computes the max-norm of a Hermitian matrix in RFP format.
*
* @private
* @param {Float64Array} Av - reinterpreted float64 view
* @param {integer} oA - float64 offset
* @param {integer} sA - float64 stride
* @param {NonNegativeInteger} N - order of the matrix
* @param {integer} noe - 1 if N is odd, 0 if N is even
* @param {integer} ifm - 1 if normal, 0 if conjugate-transposed
* @param {integer} ilu - 1 if lower, 0 if upper
* @param {integer} lda - leading dimension of the RFP block
* @returns {number} max-norm value
*/
function maxNorm( Av, oA, sA, N, noe, ifm, ilu, lda ) {
	var value = 0.0;
	var temp;
	var k;
	var i;
	var j;

	k = ( N + 1 ) / 2 | 0;

	if ( noe === 1 ) {
		// N is odd, k = (N+1)/2, N = 2k-1
		if ( ifm === 1 ) {
			// A is N by k
			if ( ilu === 1 ) {
				// Uplo = 'L'
				j = 0;

				// L(0,0) diagonal
				temp = Math.abs( Av[ oA + ((j + (j * lda)) * sA) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				for ( i = 1; i <= N - 1; i++ ) {
					temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
				for ( j = 1; j <= k - 1; j++ ) {
					for ( i = 0; i <= j - 2; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
					i = j - 1;

					// L(k+j,k+j) diagonal
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					i = j;

					// L(j,j) diagonal
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					for ( i = j + 1; i <= N - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
			} else {
				// Uplo = 'U'
				for ( j = 0; j <= k - 2; j++ ) {
					for ( i = 0; i <= k + j - 2; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
					i = k + j - 1;

					// U(i,i) diagonal
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					i += 1;

					// U(j,j) diagonal
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					for ( i = k + j + 1; i <= N - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
				// j = k - 1
				for ( i = 0; i <= N - 2; i++ ) {
					temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
				// i = N - 1, U(n-1,n-1)
				temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
			}
		} else {
			// Xpose case; A is k by n
			if ( ilu === 1 ) {
				// Uplo = 'L'
				for ( j = 0; j <= k - 2; j++ ) {
					for ( i = 0; i <= j - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
					i = j;

					// L(i,i)
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					i = j + 1;

					// L(j+k,j+k)
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					for ( i = j + 2; i <= k - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
				j = k - 1;
				for ( i = 0; i <= k - 2; i++ ) {
					temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
				i = k - 1;

				// L(i,i)
				temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				for ( j = k; j <= N - 1; j++ ) {
					for ( i = 0; i <= k - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
			} else {
				// Uplo = 'U'
				for ( j = 0; j <= k - 2; j++ ) {
					for ( i = 0; i <= k - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
				j = k - 1;

				// U(j,j) at A(0,j)
				temp = Math.abs( Av[ oA + ((0 + (j * lda)) * sA) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				for ( i = 1; i <= k - 1; i++ ) {
					temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
				for ( j = k; j <= N - 1; j++ ) {
					for ( i = 0; i <= j - k - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
					i = j - k;

					// U(i,i)
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					i = j - k + 1;

					// U(j,j)
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					for ( i = j - k + 2; i <= k - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
			}
		}
	} else {
		// N is even, k = n/2
		if ( ifm === 1 ) {
			// A is n+1 by k
			if ( ilu === 1 ) {
				// Uplo = 'L'
				j = 0;

				// L(k,k) and L(0,0)
				temp = Math.abs( Av[ oA + ((j + (j * lda)) * sA) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				temp = Math.abs( Av[ oA + (((j + 1) + (j * lda)) * sA) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				for ( i = 2; i <= N; i++ ) {
					temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
				for ( j = 1; j <= k - 1; j++ ) {
					for ( i = 0; i <= j - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
					i = j;

					// L(k+j,k+j)
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					i = j + 1;

					// L(j,j)
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					for ( i = j + 2; i <= N; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
			} else {
				// Uplo = 'U'
				for ( j = 0; j <= k - 2; j++ ) {
					for ( i = 0; i <= k + j - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
					i = k + j;

					// U(i,i)
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					i += 1;

					// U(j,j)
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					for ( i = k + j + 2; i <= N; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
				// j = k - 1
				for ( i = 0; i <= N - 2; i++ ) {
					temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
				// i = N - 1, U(n-1,n-1)
				temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				i = N;

				// U(k-1,k-1)
				temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
			}
		} else {
			// Xpose case; A is k by n+1
			if ( ilu === 1 ) {
				// Uplo = 'L'
				j = 0;

				// L(k,k) at A(0,0)
				temp = Math.abs( Av[ oA + ((j + (j * lda)) * sA) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				for ( i = 1; i <= k - 1; i++ ) {
					temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
				for ( j = 1; j <= k - 1; j++ ) {
					for ( i = 0; i <= j - 2; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
					i = j - 1;

					// L(i,i)
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					i = j;

					// L(j+k,j+k)
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					for ( i = j + 1; i <= k - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
				j = k;
				for ( i = 0; i <= k - 2; i++ ) {
					temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
				i = k - 1;

				// L(i,i)
				temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				for ( j = k + 1; j <= N; j++ ) {
					for ( i = 0; i <= k - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
			} else {
				// Uplo = 'U'
				for ( j = 0; j <= k - 1; j++ ) {
					for ( i = 0; i <= k - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
				j = k;

				// U(j,j) at A(0,j)
				temp = Math.abs( Av[ oA + ((0 + (j * lda)) * sA) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				for ( i = 1; i <= k - 1; i++ ) {
					temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
				for ( j = k + 1; j <= N - 1; j++ ) {
					for ( i = 0; i <= j - k - 2; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
					i = j - k - 1;

					// U(i,i)
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					i = j - k;

					// U(j,j)
					temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
					for ( i = j - k + 1; i <= k - 1; i++ ) {
						temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
				j = N;
				for ( i = 0; i <= k - 2; i++ ) {
					temp = cabs( Av, oA + ((i + (j * lda)) * sA) );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
				i = k - 1;

				// U(k,k)
				temp = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
			}
		}
	}
	return value;
}

/**
* Computes the one-norm (infinity-norm) of a Hermitian matrix in RFP format.
*
* @private
* @param {Float64Array} Av - reinterpreted float64 view
* @param {integer} oA - float64 offset
* @param {integer} sA - float64 stride
* @param {NonNegativeInteger} N - order of the matrix
* @param {integer} noe - 1 if N is odd, 0 if N is even
* @param {integer} ifm - 1 if normal, 0 if conjugate-transposed
* @param {integer} ilu - 1 if lower, 0 if upper
* @param {integer} lda - leading dimension of the RFP block
* @param {Float64Array} WORK - workspace array
* @param {integer} sW - stride for WORK
* @param {integer} oW - offset for WORK
* @returns {number} one-norm value
*/
function oneNorm( Av, oA, sA, N, noe, ifm, ilu, lda, WORK, sW, oW ) {
	var value;
	var temp;
	var aa;
	var n1;
	var k;
	var l;
	var s;
	var i;
	var j;

	if ( ifm === 1 ) {
		// A is 'N' (no transpose)
		k = N / 2 | 0;
		if ( noe === 1 ) {
			// N is odd, A is N by (N+1)/2
			if ( ilu === 0 ) {
				// Uplo = 'U'
				for ( i = 0; i <= k - 1; i++ ) {
					WORK[ oW + (i * sW) ] = 0.0;
				}
				for ( j = 0; j <= k; j++ ) {
					s = 0.0;
					for ( i = 0; i <= k + j - 1; i++ ) {
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						s += aa;
						WORK[ oW + (i * sW) ] += aa;
					}
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					WORK[ oW + ((j + k) * sW) ] = s + aa;
					if ( i === k + k ) {
						break; // GO TO 10
					}
					i += 1;
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					WORK[ oW + (j * sW) ] = ( WORK[ oW + (j * sW) ] || 0 ) + aa;
					s = 0.0;
					for ( l = j + 1; l <= k - 1; l++ ) {
						i += 1;
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						s += aa;
						WORK[ oW + (l * sW) ] += aa;
					}
					WORK[ oW + (j * sW) ] += s;
				}
				// Label 10 continue
				value = WORK[ oW ];
				for ( i = 1; i <= N - 1; i++ ) {
					temp = WORK[ oW + (i * sW) ];
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
			} else {
				// ilu = 1, uplo = 'L'
				k += 1;

				// k = (n+1)/2
				for ( i = k; i <= N - 1; i++ ) {
					WORK[ oW + (i * sW) ] = 0.0;
				}
				for ( j = k - 1; j >= 0; j-- ) {
					s = 0.0;
					for ( i = 0; i <= j - 2; i++ ) {
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						s += aa;
						WORK[ oW + ((i + k) * sW) ] += aa;
					}
					if ( j > 0 ) {
						aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
						s += aa;
						WORK[ oW + ((i + k) * sW) ] += s;
						i += 1;
					}
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					WORK[ oW + (j * sW) ] = aa;
					s = 0.0;
					for ( l = j + 1; l <= N - 1; l++ ) {
						i += 1;
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						s += aa;
						WORK[ oW + (l * sW) ] += aa;
					}
					WORK[ oW + (j * sW) ] += s;
				}
				value = WORK[ oW ];
				for ( i = 1; i <= N - 1; i++ ) {
					temp = WORK[ oW + (i * sW) ];
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
			}
		} else {
			// N is even, A is n+1 by k = n/2
			if ( ilu === 0 ) {
				// Uplo = 'U'
				for ( i = 0; i <= k - 1; i++ ) {
					WORK[ oW + (i * sW) ] = 0.0;
				}
				for ( j = 0; j <= k - 1; j++ ) {
					s = 0.0;
					for ( i = 0; i <= k + j - 1; i++ ) {
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						s += aa;
						WORK[ oW + (i * sW) ] += aa;
					}
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					WORK[ oW + ((j + k) * sW) ] = s + aa;
					i += 1;
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					WORK[ oW + (j * sW) ] += aa;
					s = 0.0;
					for ( l = j + 1; l <= k - 1; l++ ) {
						i += 1;
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						s += aa;
						WORK[ oW + (l * sW) ] += aa;
					}
					WORK[ oW + (j * sW) ] += s;
				}
				value = WORK[ oW ];
				for ( i = 1; i <= N - 1; i++ ) {
					temp = WORK[ oW + (i * sW) ];
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
			} else {
				// ilu = 1, uplo = 'L'
				for ( i = k; i <= N - 1; i++ ) {
					WORK[ oW + (i * sW) ] = 0.0;
				}
				for ( j = k - 1; j >= 0; j-- ) {
					s = 0.0;
					for ( i = 0; i <= j - 1; i++ ) {
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						s += aa;
						WORK[ oW + ((i + k) * sW) ] += aa;
					}
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					s += aa;
					WORK[ oW + ((i + k) * sW) ] += s;
					i += 1;
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					WORK[ oW + (j * sW) ] = aa;
					s = 0.0;
					for ( l = j + 1; l <= N - 1; l++ ) {
						i += 1;
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						s += aa;
						WORK[ oW + (l * sW) ] += aa;
					}
					WORK[ oW + (j * sW) ] += s;
				}
				value = WORK[ oW ];
				for ( i = 1; i <= N - 1; i++ ) {
					temp = WORK[ oW + (i * sW) ];
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
			}
		}
	} else {
		// ifm = 0, xpose case
		k = N / 2 | 0;
		if ( noe === 1 ) {
			// N is odd, A is (n+1)/2 by n
			if ( ilu === 0 ) {
				// Uplo = 'U'
				n1 = k;
				k += 1;

				// k is the row size and lda
				for ( i = n1; i <= N - 1; i++ ) {
					WORK[ oW + (i * sW) ] = 0.0;
				}
				for ( j = 0; j <= n1 - 1; j++ ) {
					s = 0.0;
					for ( i = 0; i <= k - 1; i++ ) {
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						WORK[ oW + ((i + n1) * sW) ] += aa;
						s += aa;
					}
					WORK[ oW + (j * sW) ] = s;
				}
				// j = n1 = k - 1 is special
				s = Math.abs( Av[ oA + ((0 + (j * lda)) * sA) ] );
				for ( i = 1; i <= k - 1; i++ ) {
					aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
					WORK[ oW + ((i + n1) * sW) ] += aa;
					s += aa;
				}
				WORK[ oW + (j * sW) ] = ( WORK[ oW + (j * sW) ] || 0 ) + s;
				for ( j = k; j <= N - 1; j++ ) {
					s = 0.0;
					for ( i = 0; i <= j - k - 1; i++ ) {
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						WORK[ oW + (i * sW) ] += aa;
						s += aa;
					}
					// i = j - k
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					s += aa;
					WORK[ oW + ((j - k) * sW) ] += s;
					i += 1;
					s = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					for ( l = j + 1; l <= N - 1; l++ ) {
						i += 1;
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						WORK[ oW + (l * sW) ] += aa;
						s += aa;
					}
					WORK[ oW + (j * sW) ] = ( WORK[ oW + (j * sW) ] || 0 ) + s;
				}
				value = WORK[ oW ];
				for ( i = 1; i <= N - 1; i++ ) {
					temp = WORK[ oW + (i * sW) ];
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
			} else {
				// ilu = 1, uplo = 'L'
				k += 1;

				// k = (n+1)/2
				for ( i = k; i <= N - 1; i++ ) {
					WORK[ oW + (i * sW) ] = 0.0;
				}
				for ( j = 0; j <= k - 2; j++ ) {
					s = 0.0;
					for ( i = 0; i <= j - 1; i++ ) {
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						WORK[ oW + (i * sW) ] += aa;
						s += aa;
					}
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					s += aa;
					WORK[ oW + (j * sW) ] = s;
					i += 1;
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					s = aa;
					for ( l = k + j + 1; l <= N - 1; l++ ) {
						i += 1;
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						s += aa;
						WORK[ oW + (l * sW) ] += aa;
					}
					WORK[ oW + ((k + j) * sW) ] += s;
				}
				// j = k - 1, special column
				s = 0.0;
				for ( i = 0; i <= k - 2; i++ ) {
					aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
					WORK[ oW + (i * sW) ] += aa;
					s += aa;
				}
				// i = k - 1
				aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
				s += aa;
				WORK[ oW + (i * sW) ] = s;
				for ( j = k; j <= N - 1; j++ ) {
					s = 0.0;
					for ( i = 0; i <= k - 1; i++ ) {
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						WORK[ oW + (i * sW) ] += aa;
						s += aa;
					}
					WORK[ oW + (j * sW) ] += s;
				}
				value = WORK[ oW ];
				for ( i = 1; i <= N - 1; i++ ) {
					temp = WORK[ oW + (i * sW) ];
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
			}
		} else {
			// N is even, A is k=n/2 by n+1
			if ( ilu === 0 ) {
				// Uplo = 'U'
				for ( i = k; i <= N - 1; i++ ) {
					WORK[ oW + (i * sW) ] = 0.0;
				}
				for ( j = 0; j <= k - 1; j++ ) {
					s = 0.0;
					for ( i = 0; i <= k - 1; i++ ) {
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						WORK[ oW + ((i + k) * sW) ] += aa;
						s += aa;
					}
					WORK[ oW + (j * sW) ] = s;
				}
				// j = k
				aa = Math.abs( Av[ oA + ((0 + (j * lda)) * sA) ] );
				s = aa;
				for ( i = 1; i <= k - 1; i++ ) {
					aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
					WORK[ oW + ((i + k) * sW) ] += aa;
					s += aa;
				}
				WORK[ oW + (j * sW) ] = ( WORK[ oW + (j * sW) ] || 0 ) + s;
				for ( j = k + 1; j <= N - 1; j++ ) {
					s = 0.0;
					for ( i = 0; i <= j - 2 - k; i++ ) {
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						WORK[ oW + (i * sW) ] += aa;
						s += aa;
					}
					// i = j - 1 - k
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					s += aa;
					WORK[ oW + ((j - k - 1) * sW) ] += s;
					i += 1;
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					s = aa;
					for ( l = j + 1; l <= N - 1; l++ ) {
						i += 1;
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						WORK[ oW + (l * sW) ] += aa;
						s += aa;
					}
					WORK[ oW + (j * sW) ] += s;
				}
				// j = n
				s = 0.0;
				for ( i = 0; i <= k - 2; i++ ) {
					aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
					WORK[ oW + (i * sW) ] += aa;
					s += aa;
				}
				// i = k - 1
				aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
				s += aa;
				WORK[ oW + (i * sW) ] += s;
				value = WORK[ oW ];
				for ( i = 1; i <= N - 1; i++ ) {
					temp = WORK[ oW + (i * sW) ];
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
			} else {
				// ilu = 1, uplo = 'L'
				for ( i = k; i <= N - 1; i++ ) {
					WORK[ oW + (i * sW) ] = 0.0;
				}
				// j = 0 is special
				s = Math.abs( Av[ oA ] );
				for ( i = 1; i <= k - 1; i++ ) {
					aa = cabs( Av, oA + (i * sA) );
					WORK[ oW + ((i + k) * sW) ] += aa;
					s += aa;
				}
				WORK[ oW + (k * sW) ] += s;
				for ( j = 1; j <= k - 1; j++ ) {
					s = 0.0;
					for ( i = 0; i <= j - 2; i++ ) {
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						WORK[ oW + (i * sW) ] += aa;
						s += aa;
					}
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					s += aa;
					WORK[ oW + ((j - 1) * sW) ] = s;
					i += 1;
					aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
					s = aa;
					for ( l = k + j + 1; l <= N - 1; l++ ) {
						i += 1;
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						s += aa;
						WORK[ oW + (l * sW) ] += aa;
					}
					WORK[ oW + ((k + j) * sW) ] += s;
				}
				// j = k, special column
				s = 0.0;
				for ( i = 0; i <= k - 2; i++ ) {
					aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
					WORK[ oW + (i * sW) ] += aa;
					s += aa;
				}
				// i = k - 1
				aa = Math.abs( Av[ oA + ((i + (j * lda)) * sA) ] );
				s += aa;
				WORK[ oW + (i * sW) ] = s;
				for ( j = k + 1; j <= N; j++ ) {
					s = 0.0;
					for ( i = 0; i <= k - 1; i++ ) {
						aa = cabs( Av, oA + ((i + (j * lda)) * sA) );
						WORK[ oW + (i * sW) ] += aa;
						s += aa;
					}
					WORK[ oW + ((j - 1) * sW) ] += s;
				}
				value = WORK[ oW ];
				for ( i = 1; i <= N - 1; i++ ) {
					temp = WORK[ oW + (i * sW) ];
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
			}
		}
	}
	return value;
}

/**
* Computes the Frobenius norm of a Hermitian matrix in RFP format.
*
* @private
* @param {Complex128Array} A - RFP array
* @param {Float64Array} Av - reinterpreted float64 view
* @param {integer} oA - float64 offset
* @param {integer} sA - float64 stride
* @param {NonNegativeInteger} N - order of the matrix
* @param {integer} noe - 1 if N is odd, 0 if N is even
* @param {integer} ifm - 1 if normal, 0 if conjugate-transposed
* @param {integer} ilu - 1 if lower, 0 if upper
* @param {integer} lda - leading dimension of the RFP block
* @param {integer} strideA - stride for A in complex elements
* @param {NonNegativeInteger} offsetA - offset for A in complex elements
* @returns {number} Frobenius norm value
*/
function frobNorm( A, Av, oA, sA, N, noe, ifm, ilu, lda, strideA, offsetA ) {
	var scale;
	var out;
	var aa;
	var ds;
	var k;
	var l;
	var s;
	var i;
	var j;

	k = ( N + 1 ) / 2 | 0;
	scale = 0.0;
	s = 1.0;

	if ( noe === 1 ) {
		// N is odd
		if ( ifm === 1 ) {
			// A is normal, N by k
			if ( ilu === 0 ) {
				// A is upper
				for ( j = 0; j <= k - 3; j++ ) {
					out = zlassq( k - j - 2, A, strideA, offsetA + (k + j + 1 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				for ( j = 0; j <= k - 1; j++ ) {
					out = zlassq( k + j - 1, A, strideA, offsetA + (0 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				s += s;
				l = k - 1;
				for ( i = 0; i <= k - 2; i++ ) {
					aa = Av[ oA + (l * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					aa = Av[ oA + ((l + 1) * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					l += lda + 1;
				}
				aa = Av[ oA + (l * sA) ];
				ds = addDiag( aa, scale, s );
				scale = ds[ 0 ];
				s = ds[ 1 ];
			} else {
				// ilu = 1, A is lower
				for ( j = 0; j <= k - 1; j++ ) {
					out = zlassq( N - j - 1, A, strideA, offsetA + (j + 1 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				for ( j = 1; j <= k - 2; j++ ) {
					out = zlassq( j, A, strideA, offsetA + (0 + ((1 + j) * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				s += s;
				aa = Av[ oA ];
				ds = addDiag( aa, scale, s );
				scale = ds[ 0 ];
				s = ds[ 1 ];
				l = lda;
				for ( i = 1; i <= k - 1; i++ ) {
					aa = Av[ oA + (l * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					aa = Av[ oA + ((l + 1) * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					l += lda + 1;
				}
			}
		} else {
			// A is xpose, k by n
			if ( ilu === 0 ) {
				// A**H is upper
				for ( j = 1; j <= k - 2; j++ ) {
					out = zlassq( j, A, strideA, offsetA + (0 + ((k + j) * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				for ( j = 0; j <= k - 2; j++ ) {
					out = zlassq( k, A, strideA, offsetA + (0 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				for ( j = 0; j <= k - 2; j++ ) {
					out = zlassq( k - j - 1, A, strideA, offsetA + (j + 1 + ((j + k - 1) * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				s += s;
				l = (k * lda) - lda;
				aa = Av[ oA + (l * sA) ];
				ds = addDiag( aa, scale, s );
				scale = ds[ 0 ];
				s = ds[ 1 ];
				l += lda;
				for ( j = k; j <= N - 1; j++ ) {
					aa = Av[ oA + (l * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					aa = Av[ oA + ((l + 1) * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					l += lda + 1;
				}
			} else {
				// A**H is lower
				for ( j = 1; j <= k - 1; j++ ) {
					out = zlassq( j, A, strideA, offsetA + (0 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				for ( j = k; j <= N - 1; j++ ) {
					out = zlassq( k, A, strideA, offsetA + (0 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				for ( j = 0; j <= k - 3; j++ ) {
					out = zlassq( k - j - 2, A, strideA, offsetA + (j + 2 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				s += s;
				l = 0;
				for ( i = 0; i <= k - 2; i++ ) {
					aa = Av[ oA + (l * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					aa = Av[ oA + ((l + 1) * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					l += lda + 1;
				}
				aa = Av[ oA + (l * sA) ];
				ds = addDiag( aa, scale, s );
				scale = ds[ 0 ];
				s = ds[ 1 ];
			}
		}
	} else {
		// N is even
		if ( ifm === 1 ) {
			// A is normal
			if ( ilu === 0 ) {
				// A is upper
				for ( j = 0; j <= k - 2; j++ ) {
					out = zlassq( k - j - 1, A, strideA, offsetA + (k + j + 2 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				for ( j = 0; j <= k - 1; j++ ) {
					out = zlassq( k + j, A, strideA, offsetA + (0 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				s += s;
				l = k;
				for ( i = 0; i <= k - 1; i++ ) {
					aa = Av[ oA + (l * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					aa = Av[ oA + ((l + 1) * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					l += lda + 1;
				}
			} else {
				// ilu = 1, A is lower
				for ( j = 0; j <= k - 1; j++ ) {
					out = zlassq( N - j - 1, A, strideA, offsetA + (j + 2 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				for ( j = 1; j <= k - 1; j++ ) {
					out = zlassq( j, A, strideA, offsetA + (0 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				s += s;
				l = 0;
				for ( i = 0; i <= k - 1; i++ ) {
					aa = Av[ oA + (l * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					aa = Av[ oA + ((l + 1) * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					l += lda + 1;
				}
			}
		} else {
			// A is xpose
			if ( ilu === 0 ) {
				// A**H is upper
				for ( j = 1; j <= k - 1; j++ ) {
					out = zlassq( j, A, strideA, offsetA + (0 + ((k + 1 + j) * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				for ( j = 0; j <= k - 1; j++ ) {
					out = zlassq( k, A, strideA, offsetA + (0 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				for ( j = 0; j <= k - 2; j++ ) {
					out = zlassq( k - j - 1, A, strideA, offsetA + (j + 1 + ((j + k) * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				s += s;
				l = k * lda;
				aa = Av[ oA + (l * sA) ];
				ds = addDiag( aa, scale, s );
				scale = ds[ 0 ];
				s = ds[ 1 ];
				l += lda;
				for ( j = k + 1; j <= N - 1; j++ ) {
					aa = Av[ oA + (l * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					aa = Av[ oA + ((l + 1) * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					l += lda + 1;
				}
				// Last element
				aa = Av[ oA + (l * sA) ];
				ds = addDiag( aa, scale, s );
				scale = ds[ 0 ];
				s = ds[ 1 ];
			} else {
				// A**H is lower
				for ( j = 1; j <= k - 1; j++ ) {
					out = zlassq( j, A, strideA, offsetA + (0 + ((j + 1) * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				for ( j = k + 1; j <= N; j++ ) {
					out = zlassq( k, A, strideA, offsetA + (0 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				for ( j = 0; j <= k - 2; j++ ) {
					out = zlassq( k - j - 1, A, strideA, offsetA + (j + 1 + (j * lda)), scale, s );
					scale = out.scl;
					s = out.sumsq;
				}
				s += s;
				l = 0;
				aa = Av[ oA + (l * sA) ];
				ds = addDiag( aa, scale, s );
				scale = ds[ 0 ];
				s = ds[ 1 ];
				l = lda;
				for ( i = 0; i <= k - 2; i++ ) {
					aa = Av[ oA + (l * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					aa = Av[ oA + ((l + 1) * sA) ];
					ds = addDiag( aa, scale, s );
					scale = ds[ 0 ];
					s = ds[ 1 ];
					l += lda + 1;
				}
				aa = Av[ oA + (l * sA) ];
				ds = addDiag( aa, scale, s );
				scale = ds[ 0 ];
				s = ds[ 1 ];
			}
		}
	}
	return scale * Math.sqrt( s );
}


// EXPORTS //

export default zlanhf;
