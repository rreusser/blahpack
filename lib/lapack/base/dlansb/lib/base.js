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
* Returns the value of the one norm, Frobenius norm, infinity norm, or largest absolute value of a real symmetric band matrix.
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
* @param {string} uplo - specifies whether the upper or lower triangular part is stored: 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} K - number of super-diagonals (upper) or sub-diagonals (lower)
* @param {Float64Array} AB - band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} WORK - workspace array (length >= N for 'one-norm' or 'inf-norm')
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {number} norm value
*/
function dlansb( norm, uplo, N, K, AB, strideAB1, strideAB2, offsetAB, WORK, strideWORK, offsetWORK ) {
	var value;
	var scale;
	var absa;
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

	if ( norm === 'max' ) {
		// Find max(abs(A(i,j)))
		value = 0.0;
		if ( uplo === 'upper' ) {
			// Fortran: DO J=1,N; DO I=MAX(K+2-J,1),K+1
			// 0-indexed: for j=0..N-1; for i=max(K+1-j,1)-1..K = max(K-j,0)..K
			for ( j = 0; j < N; j++ ) {
				for ( i = max( K - j, 0 ); i <= K; i++ ) {
					temp = Math.abs( AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
			}
		} else {
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
	} else if ( norm === 'one-norm' || norm === 'inf-norm' ) {
		// For symmetric matrices, norm1 = normI
		value = 0.0;
		if ( uplo === 'upper' ) {
			// Fortran: DO J=1,N; SUM=0; L=K+1-J; DO I=MAX(1,J-K),J-1; ABSA=|AB(L+I,J)|; SUM+=ABSA; WORK(I)+=ABSA; WORK(J)=SUM+|AB(K+1,J)|
			// 0-indexed: for j=0..N-1; l=K-j; for i=max(0,j-K)..j-1; WORK[i]+=absa; WORK[j]=sum+|AB[K,j]|
			for ( j = 0; j < N; j++ ) {
				sum = 0.0;
				l = K - j;
				for ( i = max( 0, j - K ); i <= j - 1; i++ ) {
					absa = Math.abs( AB[ offsetAB + ( ( l + i ) * strideAB1 ) + ( j * strideAB2 ) ] );
					sum += absa;
					WORK[ offsetWORK + ( i * strideWORK ) ] += absa;
				}
				WORK[ offsetWORK + ( j * strideWORK ) ] = sum + Math.abs( AB[ offsetAB + ( K * strideAB1 ) + ( j * strideAB2 ) ] );
			}
			for ( i = 0; i < N; i++ ) {
				temp = WORK[ offsetWORK + ( i * strideWORK ) ];
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
			}
		} else {
			// Lower case
			// Fortran: DO I=1,N; WORK(I)=0; DO J=1,N; SUM=WORK(J)+|AB(1,J)|; L=1-J; DO I=J+1,MIN(N,J+K); ABSA=|AB(L+I,J)|; SUM+=ABSA; WORK(I)+=ABSA
			// 0-indexed: WORK[i]=0; for j=0..N-1; sum=WORK[j]+|AB[0,j]|; l=-j; for i=j+1..min(N-1,j+K)
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWORK + ( i * strideWORK ) ] = 0.0;
			}
			for ( j = 0; j < N; j++ ) {
				sum = WORK[ offsetWORK + ( j * strideWORK ) ] + Math.abs( AB[ offsetAB + ( j * strideAB2 ) ] );
				l = -j;
				for ( i = j + 1; i <= min( N - 1, j + K ); i++ ) {
					absa = Math.abs( AB[ offsetAB + ( ( l + i ) * strideAB1 ) + ( j * strideAB2 ) ] );
					sum += absa;
					WORK[ offsetWORK + ( i * strideWORK ) ] += absa;
				}
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm
		scale = 0.0;
		sum = 1.0;
		if ( K > 0 ) {
			if ( uplo === 'upper' ) {
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
				l = K;
			} else {
				// Fortran: DO J=1,N-1; CALL DLASSQ(MIN(N-J,K), AB(2,J), 1, SCALE, SUM)
				// 0-indexed: for j=0..N-2; count=min(N-j-1,K); startRow=1
				for ( j = 0; j < N - 1; j++ ) {
					nn = min( N - j - 1, K );
					if ( nn > 0 ) {
						out = dlassq( nn, AB, strideAB1, offsetAB + ( 1 * strideAB1 ) + ( j * strideAB2 ), scale, sum );
						scale = out.scl;
						sum = out.sumsq;
					}
				}
				l = 0;
			}
			sum *= 2.0;
		} else {
			l = 0;
		}
		// Add diagonal: CALL DLASSQ(N, AB(L,1), LDAB, SCALE, SUM).
		// In Fortran, AB(L,1) with stride LDAB walks the diagonal:
		// AB[l*strideAB1 + j*strideAB2] for j=0..N-1, stride = strideAB2.
		out = dlassq( N, AB, strideAB2, offsetAB + ( l * strideAB1 ), scale, sum );
		scale = out.scl;
		sum = out.sumsq;
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default dlansb;
