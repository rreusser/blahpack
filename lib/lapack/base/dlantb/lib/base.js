/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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


// FUNCTIONS //

/**
* Returns the minimum of two values.
*
* @private
* @param {number} a - first value
* @param {number} b - second value
* @returns {number} minimum
*/
function min( a, b ) {
	return ( a < b ) ? a : b;
}

/**
* Returns the maximum of two values.
*
* @private
* @param {number} a - first value
* @param {number} b - second value
* @returns {number} maximum
*/
function max( a, b ) {
	return ( a > b ) ? a : b;
}


// MAIN //

/**
* Returns the value of the one norm, Frobenius norm, infinity norm, or largest absolute value of a real triangular band matrix.
*
* ## Notes
*
* Band storage: the matrix A is stored in band format in AB with (K+1) rows
* and N columns. For upper triangular:
* `AB(k+1+i-j, j) = A(i,j)` for `max(1,j-k) <= i <= j` (Fortran 1-indexed).
* For lower triangular:
* `AB(1+i-j, j) = A(i,j)` for `j <= i <= min(n, j+k)` (Fortran 1-indexed).
*
* @private
* @param {string} norm - norm type: 'max' (max abs), 'one-norm' (one-norm), 'inf-norm' (infinity-norm), 'frobenius' (Frobenius)
* @param {string} uplo - specifies whether the matrix is upper or lower triangular: 'upper' or 'lower'
* @param {string} diag - specifies whether the diagonal is unit: 'unit' or 'non-unit'
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} K - number of super-diagonals (upper) or sub-diagonals (lower)
* @param {Float64Array} AB - band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} WORK - workspace array (length >= N for 'inf-norm')
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {number} norm value
*/
function dlantb( norm, uplo, diag, N, K, AB, strideAB1, strideAB2, offsetAB, WORK, strideWork, offsetWork ) {
	var udiag;
	var value;
	var scale;
	var temp;
	var sum;
	var out;
	var nn;
	var l;
	var i;
	var j;

	if ( N === 0 ) {
		return 0.0;
	}

	udiag = ( diag === 'unit' );

	if ( norm === 'max' ) {
		// Find max(abs(A(i,j)))
		if ( udiag ) {
			value = 1.0;
			if ( uplo === 'upper' ) {
				// Upper triangular, unit diagonal: skip diagonal row (row K in 0-indexed)
				// Fortran: DO J=1,N; DO I=MAX(K+2-J,1),K
				// 0-indexed: for j=0..N-1; for i=max(K+1-j,1)-1..K-1 = max(K-j,0)..K-1
				for ( j = 0; j < N; j++ ) {
					for ( i = max( K - j, 0 ); i <= K - 1; i++ ) {
						temp = Math.abs( AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
			} else {
				// Lower triangular, unit diagonal: skip diagonal row (row 0 in 0-indexed)
				// Fortran: DO J=1,N; DO I=2,MIN(N+1-J,K+1)
				// 0-indexed: for j=0..N-1; for i=1..min(N-j,K+1)-1 = 1..min(N-j,K+1)-1
				for ( j = 0; j < N; j++ ) {
					nn = min( N - j, K + 1 );
					for ( i = 1; i < nn; i++ ) {
						temp = Math.abs( AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
			}
		} else {
			value = 0.0;
			if ( uplo === 'upper' ) {
				// Upper triangular, non-unit: include diagonal row (row K in 0-indexed)
				// Fortran: DO J=1,N; DO I=MAX(K+2-J,1),K+1
				// 0-indexed: for j=0..N-1; for i=max(K-j,0)..K
				for ( j = 0; j < N; j++ ) {
					for ( i = max( K - j, 0 ); i <= K; i++ ) {
						temp = Math.abs( AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
			} else {
				// Lower triangular, non-unit: include diagonal row (row 0 in 0-indexed)
				// Fortran: DO J=1,N; DO I=1,MIN(N+1-J,K+1)
				// 0-indexed: for j=0..N-1; for i=0..min(N-j,K+1)-1
				for ( j = 0; j < N; j++ ) {
					nn = min( N - j, K + 1 );
					for ( i = 0; i < nn; i++ ) {
						temp = Math.abs( AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
					}
				}
			}
		}
	} else if ( norm === 'one-norm' ) {
		// One-norm: maximum column sum of absolute values
		value = 0.0;
		if ( uplo === 'upper' ) {
			for ( j = 0; j < N; j++ ) {
				if ( udiag ) {
					sum = 1.0;
					// Fortran: DO I=MAX(K+2-J,1),K => 0-indexed: i=max(K-j,0)..K-1
					for ( i = max( K - j, 0 ); i <= K - 1; i++ ) {
						sum += Math.abs( AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] );
					}
				} else {
					sum = 0.0;
					// Fortran: DO I=MAX(K+2-J,1),K+1 => 0-indexed: i=max(K-j,0)..K
					for ( i = max( K - j, 0 ); i <= K; i++ ) {
						sum += Math.abs( AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] );
					}
				}
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				if ( udiag ) {
					sum = 1.0;
					// Fortran: DO I=2,MIN(N+1-J,K+1) => 0-indexed: i=1..min(N-j,K+1)-1
					nn = min( N - j, K + 1 );
					for ( i = 1; i < nn; i++ ) {
						sum += Math.abs( AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] );
					}
				} else {
					sum = 0.0;
					// Fortran: DO I=1,MIN(N+1-J,K+1) => 0-indexed: i=0..min(N-j,K+1)-1
					nn = min( N - j, K + 1 );
					for ( i = 0; i < nn; i++ ) {
						sum += Math.abs( AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] );
					}
				}
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Infinity-norm: maximum row sum (uses WORK array to accumulate row sums)
		value = 0.0;
		if ( uplo === 'upper' ) {
			if ( udiag ) {
				for ( i = 0; i < N; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] = 1.0;
				}
				// Fortran: DO J=1,N; L=K+1-J; DO I=MAX(1,J-K),J-1; WORK(I)+=|AB(L+I,J)|
				// 0-indexed: for j=0..N-1; l=K-j; for i=max(0,j-K)..j-1; WORK[i]+=|AB[l+i,j]|
				for ( j = 0; j < N; j++ ) {
					l = K - j;
					for ( i = max( 0, j - K ); i <= j - 1; i++ ) {
						WORK[ offsetWork + ( i * strideWork ) ] += Math.abs( AB[ offsetAB + ( ( l + i ) * strideAB1 ) + ( j * strideAB2 ) ] );
					}
				}
			} else {
				for ( i = 0; i < N; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
				}
				// Fortran: DO J=1,N; L=K+1-J; DO I=MAX(1,J-K),J; WORK(I)+=|AB(L+I,J)|
				// 0-indexed: for j=0..N-1; l=K-j; for i=max(0,j-K)..j; WORK[i]+=|AB[l+i,j]|
				for ( j = 0; j < N; j++ ) {
					l = K - j;
					for ( i = max( 0, j - K ); i <= j; i++ ) {
						WORK[ offsetWork + ( i * strideWork ) ] += Math.abs( AB[ offsetAB + ( ( l + i ) * strideAB1 ) + ( j * strideAB2 ) ] );
					}
				}
			}
		} else if ( udiag ) {
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + ( i * strideWork ) ] = 1.0;
			}

			// Fortran: DO J=1,N; L=1-J; DO I=J+1,MIN(N,J+K); WORK(I)+=|AB(L+I,J)|
			// 0-indexed: for j=0..N-1; l=-j; for i=j+1..min(N,j+K+1)-1; WORK[i]+=|AB[l+i,j]|
			for ( j = 0; j < N; j++ ) {
				l = -j;
				for ( i = j + 1; i <= min( N - 1, j + K ); i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] += Math.abs( AB[ offsetAB + ( ( l + i ) * strideAB1 ) + ( j * strideAB2 ) ] );
				}
			}
		} else {
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
			}

			// Fortran: DO J=1,N; L=1-J; DO I=J,MIN(N,J+K); WORK(I)+=|AB(L+I,J)|
			// 0-indexed: for j=0..N-1; l=-j; for i=j..min(N-1,j+K); WORK[i]+=|AB[l+i,j]|
			for ( j = 0; j < N; j++ ) {
				l = -j;
				for ( i = j; i <= min( N - 1, j + K ); i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] += Math.abs( AB[ offsetAB + ( ( l + i ) * strideAB1 ) + ( j * strideAB2 ) ] );
				}
			}
		}
		for ( i = 0; i < N; i++ ) {
			temp = WORK[ offsetWork + ( i * strideWork ) ];
			if ( value < temp || temp !== temp ) {
				value = temp;
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm
		if ( uplo === 'upper' ) {
			if ( udiag ) {
				scale = 1.0;
				sum = N;
				if ( K > 0 ) {
					// Fortran: DO J=2,N; CALL DLASSQ(MIN(J-1,K), AB(MAX(K+2-J,1),J), 1, SCALE, SUM)
					// 0-indexed: for j=1..N-1; count=min(j,K); startRow=max(K-j,0)
					for ( j = 1; j < N; j++ ) {
						nn = min( j, K );
						if ( nn > 0 ) {
							out = dlassq( nn, AB, strideAB1, offsetAB + ( max( K - j, 0 ) * strideAB1 ) + ( j * strideAB2 ), scale, sum );
							scale = out.scl;
							sum = out.sumsq;
						}
					}
				}
			} else {
				scale = 0.0;
				sum = 1.0;

				// Fortran: DO J=1,N; CALL DLASSQ(MIN(J,K+1), AB(MAX(K+2-J,1),J), 1, SCALE, SUM); 0-indexed: for j=0..N-1; count=min(j+1,K+1); startRow=max(K-j,0)
				for ( j = 0; j < N; j++ ) {
					nn = min( j + 1, K + 1 );
					if ( nn > 0 ) {
						out = dlassq( nn, AB, strideAB1, offsetAB + ( max( K - j, 0 ) * strideAB1 ) + ( j * strideAB2 ), scale, sum );
						scale = out.scl;
						sum = out.sumsq;
					}
				}
			}
		} else if ( udiag ) {
			scale = 1.0;
			sum = N;
			if ( K > 0 ) {
				// Fortran: DO J=1,N-1; CALL DLASSQ(MIN(N-J,K), AB(2,J), 1, SCALE, SUM); 0-indexed: for j=0..N-2; count=min(N-j-1,K); startRow=1
				for ( j = 0; j < N - 1; j++ ) {
					nn = min( N - j - 1, K );
					if ( nn > 0 ) {
						out = dlassq( nn, AB, strideAB1, offsetAB + ( 1 * strideAB1 ) + ( j * strideAB2 ), scale, sum );
						scale = out.scl;
						sum = out.sumsq;
					}
				}
			}
		} else {
			scale = 0.0;
			sum = 1.0;

			// Fortran: DO J=1,N; CALL DLASSQ(MIN(N-J+1,K+1), AB(1,J), 1, SCALE, SUM); 0-indexed: for j=0..N-1; count=min(N-j,K+1); startRow=0
			for ( j = 0; j < N; j++ ) {
				nn = min( N - j, K + 1 );
				if ( nn > 0 ) {
					out = dlassq( nn, AB, strideAB1, offsetAB + ( j * strideAB2 ), scale, sum );
					scale = out.scl;
					sum = out.sumsq;
				}
			}
		}
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default dlantb;
