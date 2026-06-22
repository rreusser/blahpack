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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import dgeqp3 from '../../dgeqp3/lib/base.js';
import dgeqr2 from '../../dgeqr2/lib/base.js';
import dgerq2 from '../../dgerq2/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlapmt from '../../dlapmt/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dorg2r from '../../dorg2r/lib/base.js';
import dorm2r from '../../dorm2r/lib/base.js';
import dormr2 from '../../dormr2/lib/base.js';


// MAIN //

/**
* Computes orthogonal matrices U, V, and Q such that:.
*
*                  N-K-L  K    L
*   U^T_A_Q =   K ( 0    A12  A13 )  if M-K-L >= 0;
*               L ( 0     0   A23 )
*           M-K-L ( 0     0    0  )
*
*                N-K-L  K    L
*       =     K ( 0    A12  A13 )  if M-K-L < 0;
*           M-K ( 0     0   A23 )
*
*                N-K-L  K    L
*   V^T_B_Q = L ( 0     0   B13 )
*           P-L ( 0     0    0  )
*
* This is the preprocessing step for computing the Generalized
* Singular Value Decomposition (GSVD).
*
* @private
* @param {string} jobu - `'compute-U'` or `'none'`
* @param {string} jobv - `'compute-V'` or `'none'`
* @param {string} jobq - `'compute-Q'` or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {Float64Array} A - M-by-N matrix A (overwritten on exit)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - P-by-N matrix B (overwritten on exit)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {number} tola - tolerance for A
* @param {number} tolb - tolerance for B
* @param {Array} K - output array; K[0] set to the numerical rank dimension
* @param {Array} l - output array; l[0] set to the numerical rank dimension
* @param {Float64Array} U - M-by-M orthogonal matrix (if jobu=`'compute-U'`)
* @param {integer} strideU1 - stride of the first dimension of U
* @param {integer} strideU2 - stride of the second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Float64Array} V - P-by-P orthogonal matrix (if jobv=`'compute-V'`)
* @param {integer} strideV1 - stride of the first dimension of V
* @param {integer} strideV2 - stride of the second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} Q - N-by-N orthogonal matrix (if jobq=`'compute-Q'`)
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Int32Array} IWORK - workspace array of length N
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @param {Float64Array} TAU - workspace array of length N
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - length of WORK
* @returns {integer} info - 0 if successful
*/
function dggsvp3( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWORK, offsetIWORK, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len
	var forwrd;
	var wantq;
	var wantu;
	var wantv;
	var kval;
	var lval;
	var oIW;
	var i;
	var j;

	wantu = ( jobu === 'compute-U' );
	wantv = ( jobv === 'compute-V' );
	wantq = ( jobq === 'compute-Q' );
	forwrd = true;

	// Workspace query (reference DGGSVP3 returns LWKOPT and does NO work).
	// dgeqp3 allocates its own workspace internally, so dggsvp3's external
	// WORK is only the dorg2r/dorm2r scratch (<= max(M,N,p)). Returning
	// early here is essential: otherwise a caller's lwork=-1 query runs the
	// full preprocessing destructively on A/B/U/V/Q.
	if ( lwork === -1 ) {
		WORK[ offsetWORK ] = Math.max( 1, M, N, p );
		return 0;
	}

	// Initialize IWORK to zeros (means all columns are "free" for dgeqp3)
	oIW = offsetIWORK;
	for ( i = 0; i < N; i++ ) {
		IWORK[ oIW + (i * strideIWORK) ] = 0;
	}

	// QR with column pivoting of B: B*P = V*( S11 S12 )
	//                                       (  0   0  )
	dgeqp3( p, N, B, strideB1, strideB2, offsetB, IWORK, strideIWORK, offsetIWORK, TAU, strideTAU, offsetTAU );

	// Convert IWORK from 1-based (dgeqp3 output) to 0-based (dlapmt input)
	for ( i = 0; i < N; i++ ) {
		IWORK[ oIW + (i * strideIWORK) ] -= 1;
	}

	// Apply column permutation to A: A := A*P
	dlapmt( forwrd, M, N, A, strideA1, strideA2, offsetA, IWORK, strideIWORK, offsetIWORK );

	// Determine the effective numerical rank of the matrix B: L
	lval = 0;
	for ( i = 0; i < Math.min( p, N ); i++ ) {
		if ( Math.abs( B[ offsetB + (i * strideB1) + (i * strideB2) ] ) > tolb ) {
			lval += 1;
		}
	}

	if ( wantv ) {
		// Copy the lower triangular part of B into V and generate V
		dlaset( 'full', p, p, 0.0, 0.0, V, strideV1, strideV2, offsetV );
		if ( p > 1 ) {
			dlacpy( 'lower', p - 1, N, B, strideB1, strideB2, offsetB + strideB1, V, strideV1, strideV2, offsetV + strideV1 );
		}
		dorg2r( p, p, Math.min( p, N ), V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );
	}

	// Clean up B: zero out below diagonal in first L columns
	for ( j = 0; j < lval - 1; j++ ) {
		for ( i = j + 1; i < lval; i++ ) {
			B[ offsetB + (i * strideB1) + (j * strideB2) ] = 0.0;
		}
	}
	if ( p > lval ) {
		dlaset( 'full', p - lval, N, 0.0, 0.0, B, strideB1, strideB2, offsetB + (lval * strideB1) );
	}

	if ( wantq ) {
		// Initialize Q to identity and apply column permutation
		dlaset( 'full', N, N, 0.0, 1.0, Q, strideQ1, strideQ2, offsetQ );
		dlapmt( forwrd, N, N, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWORK, offsetIWORK );
	}

	if ( p >= lval && N !== lval ) {
		// RQ factorization of ( S11 S12 ): ( S11 S12 ) = ( 0 S12 )*Z
		dgerq2( lval, N, B, strideB1, strideB2, offsetB, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );

		// Update A = A*Z^T
		dormr2( 'right', 'transpose', M, N, lval, B, strideB1, strideB2, offsetB, TAU, strideTAU, offsetTAU, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK );

		if ( wantq ) {
			// Update Q = Q*Z^T
			dormr2( 'right', 'transpose', N, N, lval, B, strideB1, strideB2, offsetB, TAU, strideTAU, offsetTAU, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK );
		}

		// Clean up B
		dlaset( 'full', lval, N - lval, 0.0, 0.0, B, strideB1, strideB2, offsetB );
		for ( j = N - lval; j < N; j++ ) {
			for ( i = j - N + lval + 1; i < lval; i++ ) {
				B[ offsetB + (i * strideB1) + (j * strideB2) ] = 0.0;
			}
		}
	}

	// Second QR with column pivoting: A( :, 1:N-L ) = U*( D11 D12 )
	//                                                    (  0  D22 )
	// Initialize IWORK for second dgeqp3
	for ( i = 0; i < N - lval; i++ ) {
		IWORK[ oIW + (i * strideIWORK) ] = 0;
	}
	dgeqp3( M, N - lval, A, strideA1, strideA2, offsetA, IWORK, strideIWORK, offsetIWORK, TAU, strideTAU, offsetTAU );

	// Convert IWORK from 1-based to 0-based again
	for ( i = 0; i < N - lval; i++ ) {
		IWORK[ oIW + (i * strideIWORK) ] -= 1;
	}

	// Determine the effective numerical rank of A(:,1:N-L): K
	kval = 0;
	for ( i = 0; i < Math.min( M, N - lval ); i++ ) {
		if ( Math.abs( A[ offsetA + (i * strideA1) + (i * strideA2) ] ) > tola ) {
			kval += 1;
		}
	}

	// Update A(:,N-L+1:N) by Q^T from left
	dorm2r( 'left', 'transpose', M, lval, Math.min( M, N - lval ), A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, A, strideA1, strideA2, offsetA + ((N - lval) * strideA2), WORK, strideWORK, offsetWORK );

	if ( wantu ) {
		// Copy lower triangular part of A into U and generate U
		dlaset( 'full', M, M, 0.0, 0.0, U, strideU1, strideU2, offsetU );
		if ( M > 1 ) {
			dlacpy( 'lower', M - 1, N - lval, A, strideA1, strideA2, offsetA + strideA1, U, strideU1, strideU2, offsetU + strideU1 );
		}
		dorg2r( M, M, Math.min( M, N - lval ), U, strideU1, strideU2, offsetU, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );
	}

	if ( wantq ) {
		// Update Q: apply column permutation to first N-L columns
		dlapmt( forwrd, N, N - lval, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWORK, offsetIWORK );
	}

	// Clean up A: zero out below diagonal in first K columns and below K+L rows
	for ( j = 0; j < kval - 1; j++ ) {
		for ( i = j + 1; i < kval; i++ ) {
			A[ offsetA + (i * strideA1) + (j * strideA2) ] = 0.0;
		}
	}
	if ( M > kval ) {
		dlaset( 'full', M - kval, N - lval, 0.0, 0.0, A, strideA1, strideA2, offsetA + (kval * strideA1) );
	}

	if ( N - lval > kval ) {
		// RQ factorization of A( 1:K, 1:N-L )
		dgerq2( kval, N - lval, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );

		if ( wantq ) {
			// Update Q: Q = Q * Z^T
			dormr2( 'right', 'transpose', N, N - lval, kval, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK );
		}

		// Clean up A
		dlaset( 'full', kval, N - lval - kval, 0.0, 0.0, A, strideA1, strideA2, offsetA );
		for ( j = N - lval - kval; j < N - lval; j++ ) {
			for ( i = j - N + lval + kval + 1; i < kval; i++ ) {
				A[ offsetA + (i * strideA1) + (j * strideA2) ] = 0.0;
			}
		}
	}

	if ( M > kval ) {
		// QR factorization of A( K+1:M, N-L+1:N )
		dgeqr2( M - kval, lval, A, strideA1, strideA2, offsetA + (kval * strideA1) + ((N - lval) * strideA2), TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );

		if ( wantu ) {
			// U = U * Q
			dorm2r( 'right', 'no-transpose', M, M - kval, Math.min( M - kval, lval ), A, strideA1, strideA2, offsetA + (kval * strideA1) + ((N - lval) * strideA2), TAU, strideTAU, offsetTAU, U, strideU1, strideU2, offsetU + (kval * strideU2), WORK, strideWORK, offsetWORK );
		}

		// Clean up A below the (K+L) superdiagonal
		for ( j = N - lval; j < N; j++ ) {
			for ( i = j - N + kval + lval + 1; i < M; i++ ) {
				A[ offsetA + (i * strideA1) + (j * strideA2) ] = 0.0;
			}
		}
	}

	// Set output values
	K[ 0 ] = kval;
	l[ 0 ] = lval;

	return 0;
}


// EXPORTS //

export default dggsvp3;
