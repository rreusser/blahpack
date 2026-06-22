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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';


// MAIN //

/**
* Applies a real triangular-pentagonal block reflector `H` or its transpose.
* to the stacked matrix `C` composed of blocks `A` and `B`.
*
* The pentagonal matrix V consists of a `K`-by-`K` triangular block stacked with
* an `L`-by-`K` trapezoidal block (or analogous layout depending on DIRECT/STOREV).
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} direct - `'forward'` or `'backward'`
* @param {string} storev - `'columnwise'` or `'rowwise'`
* @param {NonNegativeInteger} M - rows of B
* @param {NonNegativeInteger} N - columns of B
* @param {NonNegativeInteger} K - order of triangular factor T
* @param {NonNegativeInteger} l - trapezoidal index
* @param {Float64Array} V - pentagonal matrix of reflector vectors
* @param {integer} strideV1 - first dim stride of V
* @param {integer} strideV2 - second dim stride of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} T - triangular factor
* @param {integer} strideT1 - first dim stride of T
* @param {integer} strideT2 - second dim stride of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} A - upper block of C, modified in-place
* @param {integer} strideA1 - first dim stride of A
* @param {integer} strideA2 - second dim stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - lower/right block of C, modified in-place
* @param {integer} strideB1 - first dim stride of B
* @param {integer} strideB2 - second dim stride of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} WORK - workspace
* @param {integer} strideWORK1 - first dim stride of WORK
* @param {integer} strideWORK2 - second dim stride of WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {void}
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var V = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 0.3, 1.0, 0.0, 1.0 ] );
* var T = new Float64Array( [ 1.2, 0.0, -0.3, 0.8 ] );
* var A = new Float64Array( [ 1.0, 4.0, 2.0, 5.0, 3.0, 6.0 ] );
* var B = new Float64Array( [ 7.0, 10.0, 13.0, 16.0, 8.0, 11.0, 14.0, 17.0, 9.0, 12.0, 15.0, 18.0 ] );
* var WORK = new Float64Array( 6 );
*
* dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, V, 1, 4, 0, T, 1, 2, 0, A, 1, 2, 0, B, 1, 4, 0, WORK, 1, 2, 0 );
*/
function dtprfb( side, trans, direct, storev, M, N, K, l, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWORK1, strideWORK2, offsetWORK ) {
	var forward;
	var column;
	var left;
	var mp;
	var np;
	var kp;
	var i;
	var j;

	if ( M <= 0 || N <= 0 || K <= 0 || l < 0 ) {
		return;
	}

	column = ( storev === 'columnwise' );
	forward = ( direct === 'forward' );
	left = ( side === 'left' );

	if ( column && forward && left ) {
		// MP = MIN( M-L+1, M ) in Fortran (1-based) -> 0-based row index = M-L
		mp = ( l > M ) ? 0 : M - l;

		// KP = MIN( L+1, K ) in Fortran -> 0-based col index = L (clamped to K)
		kp = ( l > K ) ? K : l;

		// WORK(1:L,1:N) = B(M-L+1:M, 1:N)
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ] = B[ offsetB + ((M-l+i)*strideB1) + (j*strideB2) ];
			}
		}
		// DTRMM('L','U','T','N', L, N, 1, V(MP,1), WORK)
		dtrmm( 'left', 'upper', 'transpose', 'non-unit', l, N, 1.0, V, strideV1, strideV2, offsetV + (mp*strideV1), WORK, strideWORK1, strideWORK2, offsetWORK );

		// DGEMM('T','N', L, N, M-L, 1, V, B, 1, WORK)
		dgemm( 'transpose', 'no-transpose', l, N, M-l, 1.0, V, strideV1, strideV2, offsetV, B, strideB1, strideB2, offsetB, 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );

		// DGEMM('T','N', K-L, N, M, 1, V(1,KP), B, 0, WORK(KP,1))
		dgemm( 'transpose', 'no-transpose', K-l, N, M, 1.0, V, strideV1, strideV2, offsetV + (kp*strideV2), B, strideB1, strideB2, offsetB, 0.0, WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK1) );

		// WORK(1:K,1:N) += A(1:K,1:N)
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ] += A[ offsetA + (i*strideA1) + (j*strideA2) ];
			}
		}

		// DTRMM('L','U', TRANS, 'N', K, N, 1, T, WORK)
		dtrmm( 'left', 'upper', trans, 'non-unit', K, N, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

		// A(1:K,1:N) -= WORK(1:K,1:N)
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				A[ offsetA + (i*strideA1) + (j*strideA2) ] -= WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ];
			}
		}

		// DGEMM('N','N', M-L, N, K, -1, V, WORK, 1, B)
		dgemm( 'no-transpose', 'no-transpose', M-l, N, K, -1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK, 1.0, B, strideB1, strideB2, offsetB );

		// DGEMM('N','N', L, N, K-L, -1, V(MP,KP), WORK(KP,1), 1, B(MP,1))
		dgemm( 'no-transpose', 'no-transpose', l, N, K-l, -1.0, V, strideV1, strideV2, offsetV + (mp*strideV1) + (kp*strideV2), WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK1), 1.0, B, strideB1, strideB2, offsetB + (mp*strideB1) );

		// DTRMM('L','U','N','N', L, N, 1, V(MP,1), WORK)
		dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', l, N, 1.0, V, strideV1, strideV2, offsetV + (mp*strideV1), WORK, strideWORK1, strideWORK2, offsetWORK );

		// B(M-L+1:M, 1:N) -= WORK(1:L, 1:N)
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				B[ offsetB + ((M-l+i)*strideB1) + (j*strideB2) ] -= WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ];
			}
		}
		return;
	}

	if ( column && forward && !left ) {
		np = ( l > N ) ? 0 : N - l;
		kp = ( l > K ) ? K : l;

		// WORK(1:M,1:L) = B(1:M, N-L+1:N)
		for ( j = 0; j < l; j++ ) {
			for ( i = 0; i < M; i++ ) {
				WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ] = B[ offsetB + (i*strideB1) + ((N-l+j)*strideB2) ];
			}
		}
		dtrmm( 'right', 'upper', 'no-transpose', 'non-unit', M, l, 1.0, V, strideV1, strideV2, offsetV + (np*strideV1), WORK, strideWORK1, strideWORK2, offsetWORK );
		dgemm( 'no-transpose', 'no-transpose', M, l, N-l, 1.0, B, strideB1, strideB2, offsetB, V, strideV1, strideV2, offsetV, 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
		dgemm( 'no-transpose', 'no-transpose', M, K-l, N, 1.0, B, strideB1, strideB2, offsetB, V, strideV1, strideV2, offsetV + (kp*strideV2), 0.0, WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK2) );

		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ] += A[ offsetA + (i*strideA1) + (j*strideA2) ];
			}
		}

		dtrmm( 'right', 'upper', trans, 'non-unit', M, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				A[ offsetA + (i*strideA1) + (j*strideA2) ] -= WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ];
			}
		}

		dgemm( 'no-transpose', 'transpose', M, N-l, K, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK, V, strideV1, strideV2, offsetV, 1.0, B, strideB1, strideB2, offsetB );
		dgemm( 'no-transpose', 'transpose', M, l, K-l, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK2), V, strideV1, strideV2, offsetV + (np*strideV1) + (kp*strideV2), 1.0, B, strideB1, strideB2, offsetB + (np*strideB2) );
		dtrmm( 'right', 'upper', 'transpose', 'non-unit', M, l, 1.0, V, strideV1, strideV2, offsetV + (np*strideV1), WORK, strideWORK1, strideWORK2, offsetWORK );

		for ( j = 0; j < l; j++ ) {
			for ( i = 0; i < M; i++ ) {
				B[ offsetB + (i*strideB1) + ((N-l+j)*strideB2) ] -= WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ];
			}
		}
		return;
	}

	if ( column && !forward && left ) {
		mp = ( l >= M ) ? M : l;
		kp = ( l >= K ) ? K : K - l;

		// WORK(K-L+1:K, 1:N) = B(1:L, 1:N)
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				WORK[ offsetWORK + ((K-l+i)*strideWORK1) + (j*strideWORK2) ] = B[ offsetB + (i*strideB1) + (j*strideB2) ];
			}
		}
		dtrmm( 'left', 'lower', 'transpose', 'non-unit', l, N, 1.0, V, strideV1, strideV2, offsetV + (kp*strideV2), WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK1) );
		dgemm( 'transpose', 'no-transpose', l, N, M-l, 1.0, V, strideV1, strideV2, offsetV + (mp*strideV1) + (kp*strideV2), B, strideB1, strideB2, offsetB + (mp*strideB1), 1.0, WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK1) );
		dgemm( 'transpose', 'no-transpose', K-l, N, M, 1.0, V, strideV1, strideV2, offsetV, B, strideB1, strideB2, offsetB, 0.0, WORK, strideWORK1, strideWORK2, offsetWORK );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ] += A[ offsetA + (i*strideA1) + (j*strideA2) ];
			}
		}

		dtrmm( 'left', 'lower', trans, 'non-unit', K, N, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				A[ offsetA + (i*strideA1) + (j*strideA2) ] -= WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ];
			}
		}

		dgemm( 'no-transpose', 'no-transpose', M-l, N, K, -1.0, V, strideV1, strideV2, offsetV + (mp*strideV1), WORK, strideWORK1, strideWORK2, offsetWORK, 1.0, B, strideB1, strideB2, offsetB + (mp*strideB1) );
		dgemm( 'no-transpose', 'no-transpose', l, N, K-l, -1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK, 1.0, B, strideB1, strideB2, offsetB );
		dtrmm( 'left', 'lower', 'no-transpose', 'non-unit', l, N, 1.0, V, strideV1, strideV2, offsetV + (kp*strideV2), WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK1) );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				B[ offsetB + (i*strideB1) + (j*strideB2) ] -= WORK[ offsetWORK + ((K-l+i)*strideWORK1) + (j*strideWORK2) ];
			}
		}
		return;
	}

	if ( column && !forward && !left ) {
		np = ( l >= N ) ? N : l;
		kp = ( l >= K ) ? K : K - l;

		for ( j = 0; j < l; j++ ) {
			for ( i = 0; i < M; i++ ) {
				WORK[ offsetWORK + (i*strideWORK1) + ((K-l+j)*strideWORK2) ] = B[ offsetB + (i*strideB1) + (j*strideB2) ];
			}
		}
		dtrmm( 'right', 'lower', 'no-transpose', 'non-unit', M, l, 1.0, V, strideV1, strideV2, offsetV + (kp*strideV2), WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK2) );
		dgemm( 'no-transpose', 'no-transpose', M, l, N-l, 1.0, B, strideB1, strideB2, offsetB + (np*strideB2), V, strideV1, strideV2, offsetV + (np*strideV1) + (kp*strideV2), 1.0, WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK2) );
		dgemm( 'no-transpose', 'no-transpose', M, K-l, N, 1.0, B, strideB1, strideB2, offsetB, V, strideV1, strideV2, offsetV, 0.0, WORK, strideWORK1, strideWORK2, offsetWORK );

		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ] += A[ offsetA + (i*strideA1) + (j*strideA2) ];
			}
		}

		dtrmm( 'right', 'lower', trans, 'non-unit', M, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				A[ offsetA + (i*strideA1) + (j*strideA2) ] -= WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ];
			}
		}

		dgemm( 'no-transpose', 'transpose', M, N-l, K, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK, V, strideV1, strideV2, offsetV + (np*strideV1), 1.0, B, strideB1, strideB2, offsetB + (np*strideB2) );
		dgemm( 'no-transpose', 'transpose', M, l, K-l, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK, V, strideV1, strideV2, offsetV, 1.0, B, strideB1, strideB2, offsetB );
		dtrmm( 'right', 'lower', 'transpose', 'non-unit', M, l, 1.0, V, strideV1, strideV2, offsetV + (kp*strideV2), WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK2) );

		for ( j = 0; j < l; j++ ) {
			for ( i = 0; i < M; i++ ) {
				B[ offsetB + (i*strideB1) + (j*strideB2) ] -= WORK[ offsetWORK + (i*strideWORK1) + ((K-l+j)*strideWORK2) ];
			}
		}
		return;
	}

	if ( !column && forward && left ) {
		mp = ( l > M ) ? 0 : M - l;
		kp = ( l > K ) ? K : l;

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ] = B[ offsetB + ((M-l+i)*strideB1) + (j*strideB2) ];
			}
		}
		// V(1,MP) means column MP (0-based mp)
		dtrmm( 'left', 'lower', 'no-transpose', 'non-unit', l, N, 1.0, V, strideV1, strideV2, offsetV + (mp*strideV2), WORK, strideWORK1, strideWORK2, offsetWORK );
		dgemm( 'no-transpose', 'no-transpose', l, N, M-l, 1.0, V, strideV1, strideV2, offsetV, B, strideB1, strideB2, offsetB, 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
		dgemm( 'no-transpose', 'no-transpose', K-l, N, M, 1.0, V, strideV1, strideV2, offsetV + (kp*strideV1), B, strideB1, strideB2, offsetB, 0.0, WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK1) );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ] += A[ offsetA + (i*strideA1) + (j*strideA2) ];
			}
		}

		dtrmm( 'left', 'upper', trans, 'non-unit', K, N, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				A[ offsetA + (i*strideA1) + (j*strideA2) ] -= WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ];
			}
		}

		dgemm( 'transpose', 'no-transpose', M-l, N, K, -1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK, 1.0, B, strideB1, strideB2, offsetB );
		dgemm( 'transpose', 'no-transpose', l, N, K-l, -1.0, V, strideV1, strideV2, offsetV + (kp*strideV1) + (mp*strideV2), WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK1), 1.0, B, strideB1, strideB2, offsetB + (mp*strideB1) );
		dtrmm( 'left', 'lower', 'transpose', 'non-unit', l, N, 1.0, V, strideV1, strideV2, offsetV + (mp*strideV2), WORK, strideWORK1, strideWORK2, offsetWORK );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				B[ offsetB + ((M-l+i)*strideB1) + (j*strideB2) ] -= WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ];
			}
		}
		return;
	}

	if ( !column && forward && !left ) {
		np = ( l > N ) ? 0 : N - l;
		kp = ( l > K ) ? K : l;

		for ( j = 0; j < l; j++ ) {
			for ( i = 0; i < M; i++ ) {
				WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ] = B[ offsetB + (i*strideB1) + ((N-l+j)*strideB2) ];
			}
		}
		dtrmm( 'right', 'lower', 'transpose', 'non-unit', M, l, 1.0, V, strideV1, strideV2, offsetV + (np*strideV2), WORK, strideWORK1, strideWORK2, offsetWORK );
		dgemm( 'no-transpose', 'transpose', M, l, N-l, 1.0, B, strideB1, strideB2, offsetB, V, strideV1, strideV2, offsetV, 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
		dgemm( 'no-transpose', 'transpose', M, K-l, N, 1.0, B, strideB1, strideB2, offsetB, V, strideV1, strideV2, offsetV + (kp*strideV1), 0.0, WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK2) );

		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ] += A[ offsetA + (i*strideA1) + (j*strideA2) ];
			}
		}

		dtrmm( 'right', 'upper', trans, 'non-unit', M, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				A[ offsetA + (i*strideA1) + (j*strideA2) ] -= WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ];
			}
		}

		dgemm( 'no-transpose', 'no-transpose', M, N-l, K, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK, V, strideV1, strideV2, offsetV, 1.0, B, strideB1, strideB2, offsetB );
		dgemm( 'no-transpose', 'no-transpose', M, l, K-l, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK2), V, strideV1, strideV2, offsetV + (kp*strideV1) + (np*strideV2), 1.0, B, strideB1, strideB2, offsetB + (np*strideB2) );
		dtrmm( 'right', 'lower', 'no-transpose', 'non-unit', M, l, 1.0, V, strideV1, strideV2, offsetV + (np*strideV2), WORK, strideWORK1, strideWORK2, offsetWORK );

		for ( j = 0; j < l; j++ ) {
			for ( i = 0; i < M; i++ ) {
				B[ offsetB + (i*strideB1) + ((N-l+j)*strideB2) ] -= WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ];
			}
		}
		return;
	}

	if ( !column && !forward && left ) {
		mp = ( l >= M ) ? M : l;
		kp = ( l >= K ) ? K : K - l;

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				WORK[ offsetWORK + ((K-l+i)*strideWORK1) + (j*strideWORK2) ] = B[ offsetB + (i*strideB1) + (j*strideB2) ];
			}
		}
		dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', l, N, 1.0, V, strideV1, strideV2, offsetV + (kp*strideV1), WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK1) );
		dgemm( 'no-transpose', 'no-transpose', l, N, M-l, 1.0, V, strideV1, strideV2, offsetV + (kp*strideV1) + (mp*strideV2), B, strideB1, strideB2, offsetB + (mp*strideB1), 1.0, WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK1) );
		dgemm( 'no-transpose', 'no-transpose', K-l, N, M, 1.0, V, strideV1, strideV2, offsetV, B, strideB1, strideB2, offsetB, 0.0, WORK, strideWORK1, strideWORK2, offsetWORK );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ] += A[ offsetA + (i*strideA1) + (j*strideA2) ];
			}
		}

		dtrmm( 'left', 'lower', trans, 'non-unit', K, N, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				A[ offsetA + (i*strideA1) + (j*strideA2) ] -= WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ];
			}
		}

		dgemm( 'transpose', 'no-transpose', M-l, N, K, -1.0, V, strideV1, strideV2, offsetV + (mp*strideV2), WORK, strideWORK1, strideWORK2, offsetWORK, 1.0, B, strideB1, strideB2, offsetB + (mp*strideB1) );
		dgemm( 'transpose', 'no-transpose', l, N, K-l, -1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK, 1.0, B, strideB1, strideB2, offsetB );
		dtrmm( 'left', 'upper', 'transpose', 'non-unit', l, N, 1.0, V, strideV1, strideV2, offsetV + (kp*strideV1), WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK1) );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				B[ offsetB + (i*strideB1) + (j*strideB2) ] -= WORK[ offsetWORK + ((K-l+i)*strideWORK1) + (j*strideWORK2) ];
			}
		}
		return;
	}

	// Row, backward, right
	np = ( l >= N ) ? N : l;
	kp = ( l >= K ) ? K : K - l;

	for ( j = 0; j < l; j++ ) {
		for ( i = 0; i < M; i++ ) {
			WORK[ offsetWORK + (i*strideWORK1) + ((K-l+j)*strideWORK2) ] = B[ offsetB + (i*strideB1) + (j*strideB2) ];
		}
	}
	dtrmm( 'right', 'upper', 'transpose', 'non-unit', M, l, 1.0, V, strideV1, strideV2, offsetV + (kp*strideV1), WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK2) );
	dgemm( 'no-transpose', 'transpose', M, l, N-l, 1.0, B, strideB1, strideB2, offsetB + (np*strideB2), V, strideV1, strideV2, offsetV + (kp*strideV1) + (np*strideV2), 1.0, WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK2) );
	dgemm( 'no-transpose', 'transpose', M, K-l, N, 1.0, B, strideB1, strideB2, offsetB, V, strideV1, strideV2, offsetV, 0.0, WORK, strideWORK1, strideWORK2, offsetWORK );

	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < M; i++ ) {
			WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ] += A[ offsetA + (i*strideA1) + (j*strideA2) ];
		}
	}

	dtrmm( 'right', 'lower', trans, 'non-unit', M, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ offsetA + (i*strideA1) + (j*strideA2) ] -= WORK[ offsetWORK + (i*strideWORK1) + (j*strideWORK2) ];
		}
	}

	dgemm( 'no-transpose', 'no-transpose', M, N-l, K, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK, V, strideV1, strideV2, offsetV + (np*strideV2), 1.0, B, strideB1, strideB2, offsetB + (np*strideB2) );
	dgemm( 'no-transpose', 'no-transpose', M, l, K-l, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK, V, strideV1, strideV2, offsetV, 1.0, B, strideB1, strideB2, offsetB );
	dtrmm( 'right', 'upper', 'no-transpose', 'non-unit', M, l, 1.0, V, strideV1, strideV2, offsetV + (kp*strideV1), WORK, strideWORK1, strideWORK2, offsetWORK + (kp*strideWORK2) );

	for ( j = 0; j < l; j++ ) {
		for ( i = 0; i < M; i++ ) {
			B[ offsetB + (i*strideB1) + (j*strideB2) ] -= WORK[ offsetWORK + (i*strideWORK1) + ((K-l+j)*strideWORK2) ];
		}
	}
}


// EXPORTS //

export default dtprfb;
