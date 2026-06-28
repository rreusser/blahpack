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

/* eslint-disable max-len, max-params, max-lines-per-function, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlassq from '../../zlassq/lib/base.js';
import cmplx from '../../../../cmplx.js';


// FUNCTIONS //

/**
* Returns the larger of two values, propagating NaN.
*
* @private
* @param {number} value - current max
* @param {number} sum - candidate value
* @returns {number} larger value (NaN if sum is NaN)
*/
function maxNaN( value, sum ) {
	if ( value < sum || sum !== sum ) {
		return sum;
	}
	return value;
}


// MAIN //

/**
* Returns the norm of a complex triangular band matrix.
*
* The band matrix AB is stored in band format with dimensions (K+1) x N
* (complex elements). For upper triangular (UPLO='upper'), the diagonal
* is at band row K (0-indexed). For lower triangular (UPLO='lower'), the
* diagonal is at band row 0 (0-indexed).
*
* @private
* @param {string} norm - norm type: `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} K - number of super/sub-diagonals
* @param {Complex128Array} AB - band matrix in band storage
* @param {integer} strideAB1 - first dimension stride (band rows, in complex elements)
* @param {integer} strideAB2 - second dimension stride (columns, in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for AB (in complex elements)
* @param {Float64Array} WORK - workspace (length >= N for `'inf-norm'`, real)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {number} norm value
*/
function zlantb( norm, uplo, diag, N, K, AB, strideAB1, strideAB2, offsetAB, WORK, strideWork, offsetWork ) {
	var udiag;
	var value;
	var scale;
	var temp;
	var sum;
	var out;
	var sa1;
	var sa2;
	var ABv;
	var oAB;
	var kp1;
	var ai;
	var wi;
	var i;
	var j;
	var l;

	if ( N === 0 ) {
		return 0.0;
	}

	// Get Float64 view and convert strides/offset from complex elements to doubles
	ABv = reinterpret( AB, 0 );
	sa1 = strideAB1 * 2;
	sa2 = strideAB2 * 2;
	oAB = offsetAB * 2;

	udiag = ( diag === 'unit' );
	kp1 = K + 1;

	if ( norm === 'max' ) {
		// Find max(abs(A(i,j)))
		if ( udiag ) {
			value = 1.0;
			if ( uplo === 'upper' ) {
				// Fortran: DO J=1,N; DO I=MAX(K+2-J,1),K
				// Band rows MAX(K+2-J,1) to K (1-indexed), skip diagonal at K+1
				for ( j = 0; j < N; j++ ) {
					for ( i = ( ( K + 1 - j > 1 ) ? K + 1 - j : 1 ) - 1; i < K; i++ ) {
						ai = oAB + ( i * sa1 ) + ( j * sa2 );
						temp = cmplx.absAt( ABv, ai );
						value = maxNaN( value, temp );
					}
				}
			} else {
				// Lower: band rows 2 to min(N+1-J,K+1) (1-indexed), skip diagonal at 1
				for ( j = 0; j < N; j++ ) {
					for ( i = 1; i < ( ( N - j < kp1 ) ? N - j : kp1 ); i++ ) {
						ai = oAB + ( i * sa1 ) + ( j * sa2 );
						temp = cmplx.absAt( ABv, ai );
						value = maxNaN( value, temp );
					}
				}
			}
		} else {
			value = 0.0;
			if ( uplo === 'upper' ) {
				// Fortran: DO J=1,N; DO I=MAX(K+2-J,1),K+1
				// Band rows MAX(K+2-J,1) to K+1 (1-indexed), includes diagonal
				for ( j = 0; j < N; j++ ) {
					for ( i = ( ( K + 1 - j > 1 ) ? K + 1 - j : 1 ) - 1; i < kp1; i++ ) {
						ai = oAB + ( i * sa1 ) + ( j * sa2 );
						temp = cmplx.absAt( ABv, ai );
						value = maxNaN( value, temp );
					}
				}
			} else {
				// Lower: band rows 1 to min(N+1-J,K+1) (1-indexed)
				for ( j = 0; j < N; j++ ) {
					for ( i = 0; i < ( ( N - j < kp1 ) ? N - j : kp1 ); i++ ) {
						ai = oAB + ( i * sa1 ) + ( j * sa2 );
						temp = cmplx.absAt( ABv, ai );
						value = maxNaN( value, temp );
					}
				}
			}
		}
	} else if ( norm === 'one-norm' ) {
		// One-norm: maximum column sum of abs values
		value = 0.0;
		if ( uplo === 'upper' ) {
			for ( j = 0; j < N; j++ ) {
				if ( udiag ) {
					sum = 1.0;

					// Band rows MAX(K+2-J,1) to K (1-indexed), skip diagonal
					for ( i = ( ( K + 1 - j > 1 ) ? K + 1 - j : 1 ) - 1; i < K; i++ ) {
						ai = oAB + ( i * sa1 ) + ( j * sa2 );
						sum += cmplx.absAt( ABv, ai );
					}
				} else {
					sum = 0.0;

					// Band rows MAX(K+2-J,1) to K+1 (1-indexed), includes diagonal
					for ( i = ( ( K + 1 - j > 1 ) ? K + 1 - j : 1 ) - 1; i < kp1; i++ ) {
						ai = oAB + ( i * sa1 ) + ( j * sa2 );
						sum += cmplx.absAt( ABv, ai );
					}
				}
				value = maxNaN( value, sum );
			}
		} else {
			// Lower
			for ( j = 0; j < N; j++ ) {
				if ( udiag ) {
					sum = 1.0;

					// Band rows 2 to min(N+1-J,K+1) (1-indexed)
					for ( i = 1; i < ( ( N - j < kp1 ) ? N - j : kp1 ); i++ ) {
						ai = oAB + ( i * sa1 ) + ( j * sa2 );
						sum += cmplx.absAt( ABv, ai );
					}
				} else {
					sum = 0.0;

					// Band rows 1 to min(N+1-J,K+1) (1-indexed)
					for ( i = 0; i < ( ( N - j < kp1 ) ? N - j : kp1 ); i++ ) {
						ai = oAB + ( i * sa1 ) + ( j * sa2 );
						sum += cmplx.absAt( ABv, ai );
					}
				}
				value = maxNaN( value, sum );
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Infinity-norm: maximum row sum of abs values
		// Initialize WORK array
		if ( uplo === 'upper' ) {
			if ( udiag ) {
				for ( i = 0; i < N; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] = 1.0;
				}
				// Fortran: DO J=1,N; L=K+1-J; DO I=MAX(1,J-K),J-1
				// For each column j, accumulate off-diagonal elements into row sums
				for ( j = 0; j < N; j++ ) {
					l = K - j; // L = K+1-J in 1-indexed = K-j in 0-indexed offset
					for ( i = ( ( j - K > 0 ) ? j - K : 0 ); i < j; i++ ) {
						// Band row index (0-indexed): l + i = K - j + i
						ai = oAB + ( ( l + i ) * sa1 ) + ( j * sa2 );
						wi = offsetWork + ( i * strideWork );
						WORK[ wi ] += cmplx.absAt( ABv, ai );
					}
				}
			} else {
				for ( i = 0; i < N; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
				}
				// Fortran: DO J=1,N; L=K+1-J; DO I=MAX(1,J-K),J
				for ( j = 0; j < N; j++ ) {
					l = K - j;
					for ( i = ( ( j - K > 0 ) ? j - K : 0 ); i <= j; i++ ) {
						ai = oAB + ( ( l + i ) * sa1 ) + ( j * sa2 );
						wi = offsetWork + ( i * strideWork );
						WORK[ wi ] += cmplx.absAt( ABv, ai );
					}
				}
			}
		} else if ( udiag ) {
			// Lower, unit diagonal
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + ( i * strideWork ) ] = 1.0;
			}

			// Fortran: DO J=1,N; L=1-J; DO I=J+1,MIN(N,J+K)
			for ( j = 0; j < N; j++ ) {
				l = -j; // L = 1-J in 1-indexed = -j in 0-indexed
				for ( i = j + 1; i < ( ( N < j + kp1 ) ? N : j + kp1 ); i++ ) {
					ai = oAB + ( ( l + i ) * sa1 ) + ( j * sa2 );
					wi = offsetWork + ( i * strideWork );
					WORK[ wi ] += cmplx.absAt( ABv, ai );
				}
			}
		} else {
			// Lower, non-unit diagonal
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
			}

			// Fortran: DO J=1,N; L=1-J; DO I=J,MIN(N,J+K)
			for ( j = 0; j < N; j++ ) {
				l = -j;
				for ( i = j; i < ( ( N < j + kp1 ) ? N : j + kp1 ); i++ ) {
					ai = oAB + ( ( l + i ) * sa1 ) + ( j * sa2 );
					wi = offsetWork + ( i * strideWork );
					WORK[ wi ] += cmplx.absAt( ABv, ai );
				}
			}
		}
		value = 0.0;
		for ( i = 0; i < N; i++ ) {
			temp = WORK[ offsetWork + ( i * strideWork ) ];
			value = maxNaN( value, temp );
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm using zlassq
		if ( uplo === 'upper' ) {
			if ( udiag ) {
				scale = 1.0;
				sum = N;
				if ( K > 0 ) {
					// Fortran: DO J=2,N; CALL ZLASSQ(MIN(J-1,K), AB(MAX(K+2-J,1),J), 1, ...)
					for ( j = 1; j < N; j++ ) {
						// Number of off-diagonal elements in column j above diagonal
						out = zlassq(( ( j < K ) ? j : K ), AB, strideAB1, offsetAB + ( ( ( K - j > 0 ) ? K - j : 0 ) * strideAB1 ) + ( j * strideAB2 ), scale, sum);
						scale = out.scl;
						sum = out.sumsq;
					}
				}
			} else {
				scale = 0.0;
				sum = 1.0;

				// Fortran: DO J=1,N; CALL ZLASSQ(MIN(J,K+1), AB(MAX(K+2-J,1),J), 1, ...)
				for ( j = 0; j < N; j++ ) {
					out = zlassq(( ( j + 1 < kp1 ) ? j + 1 : kp1 ), AB, strideAB1, offsetAB + ( ( ( K - j > 0 ) ? K - j : 0 ) * strideAB1 ) + ( j * strideAB2 ), scale, sum);
					scale = out.scl;
					sum = out.sumsq;
				}
			}
		} else if ( udiag ) {
			// Lower, unit diagonal
			scale = 1.0;
			sum = N;
			if ( K > 0 ) {
				// Fortran: DO J=1,N-1; CALL ZLASSQ(MIN(N-J,K), AB(2,J), 1, ...)
				for ( j = 0; j < N - 1; j++ ) {
					out = zlassq(( ( N - j - 1 < K ) ? N - j - 1 : K ), AB, strideAB1, offsetAB + strideAB1 + ( j * strideAB2 ), scale, sum);
					scale = out.scl;
					sum = out.sumsq;
				}
			}
		} else {
			// Lower, non-unit diagonal
			scale = 0.0;
			sum = 1.0;

			// Fortran: DO J=1,N; CALL ZLASSQ(MIN(N-J+1,K+1), AB(1,J), 1, ...)
			for ( j = 0; j < N; j++ ) {
				out = zlassq(( ( N - j < kp1 ) ? N - j : kp1 ), AB, strideAB1, offsetAB + ( j * strideAB2 ), scale, sum);
				scale = out.scl;
				sum = out.sumsq;
			}
		}
		value = scale * Math.sqrt( sum );
	} else {
		return 0.0;
	}

	return value;
}


// EXPORTS //

export default zlantb;
