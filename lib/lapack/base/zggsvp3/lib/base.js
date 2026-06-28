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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqp3 from '../../zgeqp3/lib/base.js';
import zgeqr2 from '../../zgeqr2/lib/base.js';
import zgerq2 from '../../zgerq2/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlapmt from '../../zlapmt/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zung2r from '../../zung2r/lib/base.js';
import zunm2r from '../../zunm2r/lib/base.js';
import zunmr2 from '../../zunmr2/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Computes unitary matrices U, V, and Q such that A and B have a triangular form suitable for GSVD.
*
* This is the preprocessing step for computing the Generalized Singular Value
* Decomposition (GSVD) of a complex matrix pair (A, B).
*
* @private
* @param {string} jobu - `'compute-U'` or `'none'`
* @param {string} jobv - `'compute-V'` or `'none'`
* @param {string} jobq - `'compute-Q'` or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {Complex128Array} A - M-by-N matrix A (overwritten on exit)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - P-by-N matrix B (overwritten on exit)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {number} tola - tolerance for A
* @param {number} tolb - tolerance for B
* @param {Array} K - output array; K[0] set to the numerical rank dimension
* @param {Array} l - output array; l[0] set to the numerical rank dimension
* @param {Complex128Array} U - M-by-M unitary matrix (if jobu=`'compute-U'`)
* @param {integer} strideU1 - stride of the first dimension of U
* @param {integer} strideU2 - stride of the second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Complex128Array} V - P-by-P unitary matrix (if jobv=`'compute-V'`)
* @param {integer} strideV1 - stride of the first dimension of V
* @param {integer} strideV2 - stride of the second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Complex128Array} Q - N-by-N unitary matrix (if jobq=`'compute-Q'`)
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Int32Array} IWORK - workspace array of length N
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @param {Float64Array} RWORK - real workspace array of length 2*N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @param {Complex128Array} TAU - workspace array of length N
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Complex128Array} WORK - complex workspace
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - length of WORK
* @returns {integer} info - 0 if successful
*/
function zggsvp3( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWork, offsetIWork, RWORK, strideRWork, offsetRWork, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line max-len
	var forwrd;
	var wantq;
	var wantu;
	var wantv;
	var kval;
	var lval;
	var oIW;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var Av;
	var Bv;
	var oA;
	var oB;
	var i;
	var j;

	wantu = ( jobu === 'compute-U' );
	wantv = ( jobv === 'compute-V' );
	wantq = ( jobq === 'compute-Q' );
	forwrd = true;

	// Workspace query (reference ZGGSVP3 returns LWKOPT and does NO work).

	// zgeqp3 allocates its own workspace internally, so zggsvp3's external

	// WORK is only the zung2r/zunm2r scratch (<= max(M,N,p)). Returning

	// Early here is essential: otherwise a caller's lwork=-1 query runs the

	// Full preprocessing destructively on A/B/U/V/Q. WORK is complex;

	// LWKOPT goes in the real part of WORK[offsetWork].
	if ( lwork === -1 ) {
		reinterpret( WORK, 0 )[ offsetWork * 2 ] = Math.max( 1, M, N, p );
		return 0;
	}

	// Reinterpret A, B as Float64 views for in-place zeroing:
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	oA = offsetA * 2;
	oB = offsetB * 2;

	// Initialize IWORK to zeros (means all columns are "free" for zgeqp3):
	oIW = offsetIWork;
	for ( i = 0; i < N; i++ ) {
		IWORK[ oIW + (i * strideIWork) ] = 0;
	}

	// QR with column pivoting of B: B*P = V*( S11 S12 )
	//                                       (  0   0  )
	zgeqp3( p, N, B, strideB1, strideB2, offsetB, IWORK, strideIWork, offsetIWork, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork );

	// Convert IWORK from 1-based (zgeqp3 output) to 0-based (zlapmt input):
	for ( i = 0; i < N; i++ ) {
		IWORK[ oIW + (i * strideIWork) ] -= 1;
	}

	// Apply column permutation to A: A := A*P
	zlapmt( forwrd, M, N, A, strideA1, strideA2, offsetA, IWORK, strideIWork, offsetIWork );

	// Determine the effective numerical rank of the matrix B: L
	lval = 0;
	for ( i = 0; i < Math.min( p, N ); i++ ) {
		// |B[i,i]| > tolb
		if ( Math.hypot( Bv[ oB + (i * sb1) + (i * sb2) ], Bv[ oB + (i * sb1) + (i * sb2) + 1 ] ) > tolb ) {
			lval += 1;
		}
	}

	if ( wantv ) {
		// Copy the lower triangular part of B into V and generate V:
		zlaset( 'full', p, p, CZERO, CZERO, V, strideV1, strideV2, offsetV );
		if ( p > 1 ) {
			zlacpy( 'lower', p - 1, N, B, strideB1, strideB2, offsetB + strideB1, V, strideV1, strideV2, offsetV + strideV1 );
		}
		zung2r( p, p, Math.min( p, N ), V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
	}

	// Clean up B: zero out below diagonal in first L columns
	for ( j = 0; j < lval - 1; j++ ) {
		for ( i = j + 1; i < lval; i++ ) {
			Bv[ oB + (i * sb1) + (j * sb2) ] = 0.0;
			Bv[ oB + (i * sb1) + (j * sb2) + 1 ] = 0.0;
		}
	}
	if ( p > lval ) {
		zlaset( 'full', p - lval, N, CZERO, CZERO, B, strideB1, strideB2, offsetB + (lval * strideB1) );
	}

	if ( wantq ) {
		// Initialize Q to identity and apply column permutation:
		zlaset( 'full', N, N, CZERO, CONE, Q, strideQ1, strideQ2, offsetQ );
		zlapmt( forwrd, N, N, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWork, offsetIWork );
	}

	if ( p >= lval && N !== lval ) {
		// RQ factorization of ( S11 S12 ): ( S11 S12 ) = ( 0 S12 )*Z
		zgerq2( lval, N, B, strideB1, strideB2, offsetB, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );

		// Update A = A*Z^H
		zunmr2( 'right', 'conjugate-transpose', M, N, lval, B, strideB1, strideB2, offsetB, TAU, strideTAU, offsetTAU, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork );

		if ( wantq ) {
			// Update Q = Q*Z^H
			zunmr2( 'right', 'conjugate-transpose', N, N, lval, B, strideB1, strideB2, offsetB, TAU, strideTAU, offsetTAU, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork );
		}

		// Clean up B:
		zlaset( 'full', lval, N - lval, CZERO, CZERO, B, strideB1, strideB2, offsetB );
		for ( j = N - lval; j < N; j++ ) {
			for ( i = j - N + lval + 1; i < lval; i++ ) {
				Bv[ oB + (i * sb1) + (j * sb2) ] = 0.0;
				Bv[ oB + (i * sb1) + (j * sb2) + 1 ] = 0.0;
			}
		}
	}

	// Second QR with column pivoting: A( :, 1:N-L )
	for ( i = 0; i < N - lval; i++ ) {
		IWORK[ oIW + (i * strideIWork) ] = 0;
	}
	zgeqp3( M, N - lval, A, strideA1, strideA2, offsetA, IWORK, strideIWork, offsetIWork, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork );

	// Convert IWORK from 1-based to 0-based again:
	for ( i = 0; i < N - lval; i++ ) {
		IWORK[ oIW + (i * strideIWork) ] -= 1;
	}

	// Determine the effective numerical rank of A(:,1:N-L): K
	kval = 0;
	for ( i = 0; i < Math.min( M, N - lval ); i++ ) {
		// |A[i,i]| > tola
		if ( Math.hypot( Av[ oA + (i * sa1) + (i * sa2) ], Av[ oA + (i * sa1) + (i * sa2) + 1 ] ) > tola ) {
			kval += 1;
		}
	}

	// Update A(:,N-L+1:N) by Q^H from the left:
	zunm2r( 'left', 'conjugate-transpose', M, lval, Math.min( M, N - lval ), A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, A, strideA1, strideA2, offsetA + ((N - lval) * strideA2), WORK, strideWork, offsetWork );

	if ( wantu ) {
		// Copy lower triangular part of A into U and generate U:
		zlaset( 'full', M, M, CZERO, CZERO, U, strideU1, strideU2, offsetU );
		if ( M > 1 ) {
			zlacpy( 'lower', M - 1, N - lval, A, strideA1, strideA2, offsetA + strideA1, U, strideU1, strideU2, offsetU + strideU1 );
		}
		zung2r( M, M, Math.min( M, N - lval ), U, strideU1, strideU2, offsetU, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
	}

	if ( wantq ) {
		// Update Q: apply column permutation to first N-L columns:
		zlapmt( forwrd, N, N - lval, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWork, offsetIWork );
	}

	// Clean up A: zero below diagonal in first K columns, and below K+L rows
	for ( j = 0; j < kval - 1; j++ ) {
		for ( i = j + 1; i < kval; i++ ) {
			Av[ oA + (i * sa1) + (j * sa2) ] = 0.0;
			Av[ oA + (i * sa1) + (j * sa2) + 1 ] = 0.0;
		}
	}
	if ( M > kval ) {
		zlaset( 'full', M - kval, N - lval, CZERO, CZERO, A, strideA1, strideA2, offsetA + (kval * strideA1) );
	}

	if ( N - lval > kval ) {
		// RQ factorization of A( 1:K, 1:N-L )
		zgerq2( kval, N - lval, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );

		if ( wantq ) {
			// Update Q: Q = Q * Z^H
			zunmr2( 'right', 'conjugate-transpose', N, N - lval, kval, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork );
		}

		// Clean up A:
		zlaset( 'full', kval, N - lval - kval, CZERO, CZERO, A, strideA1, strideA2, offsetA );
		for ( j = N - lval - kval; j < N - lval; j++ ) {
			for ( i = j - N + lval + kval + 1; i < kval; i++ ) {
				Av[ oA + (i * sa1) + (j * sa2) ] = 0.0;
				Av[ oA + (i * sa1) + (j * sa2) + 1 ] = 0.0;
			}
		}
	}

	if ( M > kval ) {
		// QR factorization of A( K+1:M, N-L+1:N )
		zgeqr2( M - kval, lval, A, strideA1, strideA2, offsetA + (kval * strideA1) + ((N - lval) * strideA2), TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );

		if ( wantu ) {
			// U = U * Q
			zunm2r( 'right', 'no-transpose', M, M - kval, Math.min( M - kval, lval ), A, strideA1, strideA2, offsetA + (kval * strideA1) + ((N - lval) * strideA2), TAU, strideTAU, offsetTAU, U, strideU1, strideU2, offsetU + (kval * strideU2), WORK, strideWork, offsetWork );
		}

		// Clean up A below the (K+L) superdiagonal:
		for ( j = N - lval; j < N; j++ ) {
			for ( i = j - N + kval + lval + 1; i < M; i++ ) {
				Av[ oA + (i * sa1) + (j * sa2) ] = 0.0;
				Av[ oA + (i * sa1) + (j * sa2) + 1 ] = 0.0;
			}
		}
	}

	// Set output values:
	K[ 0 ] = kval;
	l[ 0 ] = lval;

	return 0;
}


// EXPORTS //

export default zggsvp3;
