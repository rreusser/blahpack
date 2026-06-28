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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlassq from '../../zlassq/lib/base.js';
import cmplx from '../../../../cmplx.js';


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
* Returns the value of the one norm, Frobenius norm, infinity norm, or largest absolute value of a complex Hermitian band matrix.
*
* ## Notes
*
* Band storage: the matrix A is stored in band format in AB with (K+1) rows
* and N columns (complex elements). For upper triangular:
* `AB(k+1+i-j, j) = A(i,j)` for `max(1,j-k) <= i <= j` (Fortran 1-indexed).
* For lower triangular:
* `AB(1+i-j, j) = A(i,j)` for `j <= i <= min(n, j+k)` (Fortran 1-indexed).
*
* The diagonal elements of a Hermitian matrix are real. Off-diagonal elements
* are complex and their absolute values (complex modulus) are used.
*
* @private
* @param {string} norm - norm type: 'max' (max abs), 'one-norm' (one-norm), 'inf-norm' (infinity-norm), 'frobenius' (Frobenius)
* @param {string} uplo - specifies whether the upper or lower triangular part is stored: 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} K - number of super-diagonals (upper) or sub-diagonals (lower)
* @param {Complex128Array} AB - band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB` (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (in complex elements)
* @param {Float64Array} WORK - workspace array (length >= N for 'one-norm' or 'inf-norm')
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {number} norm value
*/
function zlanhb( norm, uplo, N, K, AB, strideAB1, strideAB2, offsetAB, WORK, strideWork, offsetWork ) {
	var value;
	var scale;
	var absa;
	var temp;
	var sum;
	var out;
	var sa1;
	var sa2;
	var ABv;
	var oAB;
	var ai;
	var l;
	var i;
	var j;

	if ( N === 0 ) {
		return 0.0;
	}

	// Get Float64 view and convert strides/offset from complex elements to doubles
	ABv = reinterpret( AB, 0 );
	sa1 = strideAB1 * 2;
	sa2 = strideAB2 * 2;
	oAB = offsetAB * 2;

	if ( norm === 'max' ) {
		// Find max(abs(A(i,j)))
		value = 0.0;
		if ( uplo === 'upper' ) {
			// Fortran: DO J=1,N; DO I=MAX(K+2-J,1),K; SUM=ABS(AB(I,J))
			// Off-diagonal: complex modulus; Diagonal at row K: real part only
			// 0-indexed: for j=0..N-1; off-diag i=max(K-j,0)..K-1; diag at i=K
			for ( j = 0; j < N; j++ ) {
				for ( i = max( K - j, 0 ); i < K; i++ ) {
					ai = oAB + ( i * sa1 ) + ( j * sa2 );
					temp = cmplx.absAt( ABv, ai );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
				// Diagonal element (real): AB(K+1, J) in 1-indexed = row K in 0-indexed
				temp = Math.abs( ABv[ oAB + ( K * sa1 ) + ( j * sa2 ) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
			}
		} else {
			// Lower: diagonal at row 0, off-diagonal below
			// Fortran: DO J=1,N; SUM=ABS(DBLE(AB(1,J))); DO I=2,MIN(N+1-J,K+1)
			// 0-indexed: diag at i=0 (real); off-diag i=1..min(N-j,K+1)-1
			for ( j = 0; j < N; j++ ) {
				// Diagonal element (real)
				temp = Math.abs( ABv[ oAB + ( j * sa2 ) ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				for ( i = 1; i < min( N - j, K + 1 ); i++ ) {
					ai = oAB + ( i * sa1 ) + ( j * sa2 );
					temp = cmplx.absAt( ABv, ai );
					if ( value < temp || temp !== temp ) {
						value = temp;
					}
				}
			}
		}
	} else if ( norm === 'one-norm' || norm === 'inf-norm' ) {
		// For Hermitian matrices, norm1 = normI
		value = 0.0;
		if ( uplo === 'upper' ) {
			// Fortran: DO J=1,N; SUM=0; L=K+1-J; DO I=MAX(1,J-K),J-1; ABSA=|AB(L+I,J)|; SUM+=ABSA; WORK(I)+=ABSA; WORK(J)=SUM+|DBLE(AB(K+1,J))|
			// 0-indexed: for j=0..N-1; l=K-j; for i=max(0,j-K)..j-1
			for ( j = 0; j < N; j++ ) {
				sum = 0.0;
				l = K - j;
				for ( i = max( 0, j - K ); i <= j - 1; i++ ) {
					ai = oAB + ( ( l + i ) * sa1 ) + ( j * sa2 );
					absa = cmplx.absAt( ABv, ai );
					sum += absa;
					WORK[ offsetWork + ( i * strideWork ) ] += absa;
				}
				WORK[ offsetWork + ( j * strideWork ) ] = sum + Math.abs( ABv[ oAB + ( K * sa1 ) + ( j * sa2 ) ] );
			}
			for ( i = 0; i < N; i++ ) {
				temp = WORK[ offsetWork + ( i * strideWork ) ];
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
			}
		} else {
			// Lower case
			// Fortran: DO I=1,N; WORK(I)=0; DO J=1,N; SUM=WORK(J)+|DBLE(AB(1,J))|; L=1-J; DO I=J+1,MIN(N,J+K); ABSA=|AB(L+I,J)|; SUM+=ABSA; WORK(I)+=ABSA
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
			}
			for ( j = 0; j < N; j++ ) {
				sum = WORK[ offsetWork + ( j * strideWork ) ] + Math.abs( ABv[ oAB + ( j * sa2 ) ] );
				l = -j;
				for ( i = j + 1; i <= min( N - 1, j + K ); i++ ) {
					ai = oAB + ( ( l + i ) * sa1 ) + ( j * sa2 );
					absa = cmplx.absAt( ABv, ai );
					sum += absa;
					WORK[ offsetWork + ( i * strideWork ) ] += absa;
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
				// Fortran: DO J=2,N; CALL ZLASSQ(MIN(J-1,K), AB(MAX(K+2-J,1),J), 1, SCALE, SUM)
				// 0-indexed: for j=1..N-1; count=min(j,K); startRow=max(K-j,0)
				for ( j = 1; j < N; j++ ) {
					out = zlassq( min( j, K ), AB, strideAB1, offsetAB + ( max( K - j, 0 ) * strideAB1 ) + ( j * strideAB2 ), scale, sum );
					scale = out.scl;
					sum = out.sumsq;
				}
			} else {
				// Fortran: DO J=1,N-1; CALL ZLASSQ(MIN(N-J,K), AB(2,J), 1, SCALE, SUM)
				// 0-indexed: for j=0..N-2; count=min(N-j-1,K); startRow=1
				for ( j = 0; j < N - 1; j++ ) {
					out = zlassq( min( N - j - 1, K ), AB, strideAB1, offsetAB + strideAB1 + ( j * strideAB2 ), scale, sum );
					scale = out.scl;
					sum = out.sumsq;
				}
			}
			sum *= 2.0;
		}
		// Add diagonal contribution (real values only, manual sum-of-squares)
		// Fortran: L = K+1 (upper) or L = 1 (lower); in 0-indexed: l = K or l = 0
		l = ( uplo === 'upper' ) ? K : 0;
		for ( j = 0; j < N; j++ ) {
			// Diagonal is real part only: DBLE(AB(L,J))
			absa = Math.abs( ABv[ oAB + ( l * sa1 ) + ( j * sa2 ) ] );
			if ( absa !== 0.0 ) {
				if ( scale < absa ) {
					sum = 1.0 + ( sum * ( ( scale / absa ) * ( scale / absa ) ) );
					scale = absa;
				} else {
					sum += ( absa / scale ) * ( absa / scale );
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

export default zlanhb;
