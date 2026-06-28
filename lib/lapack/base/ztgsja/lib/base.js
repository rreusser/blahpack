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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import zlags2 from '../../zlags2/lib/base.js';
import zlapll from '../../zlapll/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zrot from '../../zrot/lib/base.js';


// VARIABLES //

var MAXIT = 40;
var ZERO = 0.0;
var ONE = 1.0;
var HUGENUM = 1.7976931348623157e+308;
var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );
var lartgOut = new Float64Array( 3 );
var ssminArr = new Float64Array( 1 );

// Scratch arrays for passing complex sines to zrot:
var snuArr = new Float64Array( 2 );
var snvArr = new Float64Array( 2 );
var snqArr = new Float64Array( 2 );
var conjSnuArr = new Float64Array( 2 );
var conjSnvArr = new Float64Array( 2 );


// MAIN //

/**
* Computes the generalized singular value decomposition (GSVD) of two complex.
* upper triangular (or trapezoidal) matrices A and B.
*
* On entry, it is assumed that matrices A and B have the forms obtained by
* the preprocessing subroutine ZGGSVP.
*
* On exit, U^H_A_Q = D1_(0 R), V^H_B_Q = D2_(0 R), where U, V and Q are
* unitary matrices.
*
* @private
* @param {string} jobu - `'compute-vectors'`, `'initialize'`, or `'none'`
* @param {string} jobv - `'compute-vectors'`, `'initialize'`, or `'none'`
* @param {string} jobq - `'compute-vectors'`, `'initialize'`, or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {NonNegativeInteger} K - dimension of the first block
* @param {NonNegativeInteger} l - dimension of the second block
* @param {Complex128Array} A - M-by-N matrix A (overwritten)
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - P-by-N matrix B (overwritten)
* @param {integer} strideB1 - stride of first dimension of B (complex elements)
* @param {integer} strideB2 - stride of second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {number} tola - convergence tolerance for A
* @param {number} tolb - convergence tolerance for B
* @param {Float64Array} ALPHA - output array for generalized singular values (length N)
* @param {integer} strideALPHA - stride for ALPHA
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA
* @param {Float64Array} BETA - output array for generalized singular values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - starting index for BETA
* @param {Complex128Array} U - M-by-M unitary matrix U
* @param {integer} strideU1 - stride of first dimension of U (complex elements)
* @param {integer} strideU2 - stride of second dimension of U (complex elements)
* @param {NonNegativeInteger} offsetU - starting index for U (complex elements)
* @param {Complex128Array} V - P-by-P unitary matrix V
* @param {integer} strideV1 - stride of first dimension of V (complex elements)
* @param {integer} strideV2 - stride of second dimension of V (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (complex elements)
* @param {Complex128Array} Q - N-by-N unitary matrix Q
* @param {integer} strideQ1 - stride of first dimension of Q (complex elements)
* @param {integer} strideQ2 - stride of second dimension of Q (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for Q (complex elements)
* @param {Complex128Array} WORK - workspace array of length 2*N
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Int32Array} ncycle - output: ncycle[0] receives the number of cycles
* @returns {integer} info - 0 for success, 1 if not converged
*/
function ztgsja( jobu, jobv, jobq, M, p, N, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork, ncycle ) {
	var kcycle;
	var initq;
	var initu;
	var initv;
	var wantq;
	var wantu;
	var wantv;
	var upper;
	var error;
	var gamma;
	var info;
	var rot;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var Av;
	var Bv;
	var oA;
	var oB;
	var a1;
	var a2;
	var a3;
	var b1;
	var b2;
	var b3;
	var ia;
	var ib;
	var i;
	var j;

	// Decode and test the input parameters
	initu = ( jobu === 'initialize' );
	wantu = initu || ( jobu === 'compute-vectors' );

	initv = ( jobv === 'initialize' );
	wantv = initv || ( jobv === 'compute-vectors' );

	initq = ( jobq === 'initialize' );
	wantq = initq || ( jobq === 'compute-vectors' );

	info = 0;

	// Get Float64 views and convert complex strides/offsets to Float64 indices
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	oA = offsetA * 2;
	oB = offsetB * 2;

	// Initialize U, V and Q, if necessary
	if ( initu ) {
		zlaset( 'full', M, M, CZERO, CONE, U, strideU1, strideU2, offsetU );
	}
	if ( initv ) {
		zlaset( 'full', p, p, CZERO, CONE, V, strideV1, strideV2, offsetV );
	}
	if ( initq ) {
		zlaset( 'full', N, N, CZERO, CONE, Q, strideQ1, strideQ2, offsetQ );
	}

	// Loop until convergence
	upper = false;
	for ( kcycle = 1; kcycle <= MAXIT; kcycle++ ) {
		upper = !upper;

		for ( i = 0; i < l - 1; i++ ) {
			for ( j = i + 1; j < l; j++ ) {
				a1 = ZERO;
				a2 = CZERO;
				a3 = ZERO;

				// A1 = DBLE( A( K+I, N-L+I ) ) — real part of diagonal
				if ( K + i < M ) {
					ia = oA + ( ( K + i ) * sa1 ) + ( ( N - l + i ) * sa2 );
					a1 = Av[ ia ]; // real part only
				}
				// A3 = DBLE( A( K+J, N-L+J ) )
				if ( K + j < M ) {
					ia = oA + ( ( K + j ) * sa1 ) + ( ( N - l + j ) * sa2 );
					a3 = Av[ ia ]; // real part only
				}

				// B1 = DBLE( B( I, N-L+I ) )
				ib = oB + ( i * sb1 ) + ( ( N - l + i ) * sb2 );
				b1 = Bv[ ib ]; // real part only

				// B3 = DBLE( B( J, N-L+J ) )
				ib = oB + ( j * sb1 ) + ( ( N - l + j ) * sb2 );
				b3 = Bv[ ib ]; // real part only

				if ( upper ) {
					// A2 = A( K+I, N-L+J ) — complex
					if ( K + i < M ) {
						ia = oA + ( ( K + i ) * sa1 ) + ( ( N - l + j ) * sa2 );
						a2 = new Complex128( Av[ ia ], Av[ ia + 1 ] );
					}
					// B2 = B( I, N-L+J ) — complex
					ib = oB + ( i * sb1 ) + ( ( N - l + j ) * sb2 );
					b2 = new Complex128( Bv[ ib ], Bv[ ib + 1 ] );
				} else {
					// A2 = A( K+J, N-L+I ) — complex
					if ( K + j < M ) {
						ia = oA + ( ( K + j ) * sa1 ) + ( ( N - l + i ) * sa2 );
						a2 = new Complex128( Av[ ia ], Av[ ia + 1 ] );
					}
					// B2 = B( J, N-L+I ) — complex
					ib = oB + ( j * sb1 ) + ( ( N - l + i ) * sb2 );
					b2 = new Complex128( Bv[ ib ], Bv[ ib + 1 ] );
				}

				rot = zlags2( upper, a1, a2, a3, b1, b2, b3 );

				// Pack complex sines into Float64Array[2] for zrot
				snuArr[ 0 ] = rot.snuR;
				snuArr[ 1 ] = rot.snuI;
				snvArr[ 0 ] = rot.snvR;
				snvArr[ 1 ] = rot.snvI;
				snqArr[ 0 ] = rot.snqR;
				snqArr[ 1 ] = rot.snqI;

				// DCONJG(SNU) for row rotation of A
				conjSnuArr[ 0 ] = rot.snuR;
				conjSnuArr[ 1 ] = -rot.snuI;

				// DCONJG(SNV) for row rotation of B
				conjSnvArr[ 0 ] = rot.snvR;
				conjSnvArr[ 1 ] = -rot.snvI;

				// Update (K+I)-th and (K+J)-th rows of matrix A: U^H * A
				if ( K + j < M ) {
					zrot( l, A, strideA2, offsetA + ( ( K + j ) * strideA1 ) + ( ( N - l ) * strideA2 ), A, strideA2, offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l ) * strideA2 ), rot.csu, conjSnuArr );
				}

				// Update I-th and J-th rows of matrix B: V^H * B
				zrot( l, B, strideB2, offsetB + ( j * strideB1 ) + ( ( N - l ) * strideB2 ), B, strideB2, offsetB + ( i * strideB1 ) + ( ( N - l ) * strideB2 ), rot.csv, conjSnvArr );

				// Update (N-L+I)-th and (N-L+J)-th columns of matrices A and B: A*Q and B*Q
				zrot( Math.min( K + l, M ), A, strideA1, offsetA + ( ( N - l + j ) * strideA2 ), A, strideA1, offsetA + ( ( N - l + i ) * strideA2 ), rot.csq, snqArr );

				zrot( l, B, strideB1, offsetB + ( ( N - l + j ) * strideB2 ), B, strideB1, offsetB + ( ( N - l + i ) * strideB2 ), rot.csq, snqArr );

				if ( upper ) {
					// Zero out A(K+I, N-L+J) and B(I, N-L+J)
					if ( K + i < M ) {
						ia = oA + ( ( K + i ) * sa1 ) + ( ( N - l + j ) * sa2 );
						Av[ ia ] = ZERO;
						Av[ ia + 1 ] = ZERO;
					}
					ib = oB + ( i * sb1 ) + ( ( N - l + j ) * sb2 );
					Bv[ ib ] = ZERO;
					Bv[ ib + 1 ] = ZERO;
				} else {
					// Zero out A(K+J, N-L+I) and B(J, N-L+I)
					if ( K + j < M ) {
						ia = oA + ( ( K + j ) * sa1 ) + ( ( N - l + i ) * sa2 );
						Av[ ia ] = ZERO;
						Av[ ia + 1 ] = ZERO;
					}
					ib = oB + ( j * sb1 ) + ( ( N - l + i ) * sb2 );
					Bv[ ib ] = ZERO;
					Bv[ ib + 1 ] = ZERO;
				}

				// Ensure that the diagonal elements of A and B are real
				if ( K + i < M ) {
					ia = oA + ( ( K + i ) * sa1 ) + ( ( N - l + i ) * sa2 );
					Av[ ia + 1 ] = ZERO; // zero imaginary part
				}
				if ( K + j < M ) {
					ia = oA + ( ( K + j ) * sa1 ) + ( ( N - l + j ) * sa2 );
					Av[ ia + 1 ] = ZERO;
				}
				ib = oB + ( i * sb1 ) + ( ( N - l + i ) * sb2 );
				Bv[ ib + 1 ] = ZERO;
				ib = oB + ( j * sb1 ) + ( ( N - l + j ) * sb2 );
				Bv[ ib + 1 ] = ZERO;

				// Update unitary matrices U, V, Q, if desired
				if ( wantu && K + j < M ) {
					zrot( M, U, strideU1, offsetU + ( ( K + j ) * strideU2 ), U, strideU1, offsetU + ( ( K + i ) * strideU2 ), rot.csu, snuArr );
				}

				if ( wantv ) {
					zrot( p, V, strideV1, offsetV + ( j * strideV2 ), V, strideV1, offsetV + ( i * strideV2 ), rot.csv, snvArr );
				}

				if ( wantq ) {
					zrot( N, Q, strideQ1, offsetQ + ( ( N - l + j ) * strideQ2 ), Q, strideQ1, offsetQ + ( ( N - l + i ) * strideQ2 ), rot.csq, snqArr );
				}
			}
		}

		if ( !upper ) {
			// The matrices A13 and B13 were lower triangular at the start
			// Of the cycle, and are now upper triangular.
			// Convergence test: test the parallelism of the corresponding
			// Rows of A and B.
			error = ZERO;
			for ( i = 0; i < Math.min( l, M - K ); i++ ) {
				zcopy( l - i, A, strideA2, offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l + i ) * strideA2 ), WORK, strideWork, offsetWork );
				zcopy( l - i, B, strideB2, offsetB + ( i * strideB1 ) + ( ( N - l + i ) * strideB2 ), WORK, strideWork, offsetWork + ( l * strideWork ) );
				zlapll( l - i, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork + ( l * strideWork ), ssminArr );
				error = Math.max( error, ssminArr[ 0 ] );
			}

			if ( Math.abs( error ) <= Math.min( tola, tolb ) ) {
				// Converged -- jump to post-processing
				break;
			}
		}
	}

	if ( kcycle > MAXIT ) {
		// The algorithm has not converged after MAXIT cycles.
		info = 1;
		ncycle[ 0 ] = kcycle - 1;
		return info;
	}

	// If ERROR <= MIN(TOLA,TOLB), then the algorithm has converged.
	// Compute the generalized singular value pairs (ALPHA, BETA), and
	// Set the triangular matrix R to array A.

	for ( i = 0; i < K; i++ ) {
		ALPHA[ offsetALPHA + ( i * strideALPHA ) ] = ONE;
		BETA[ offsetBETA + ( i * strideBETA ) ] = ZERO;
	}

	for ( i = 0; i < Math.min( l, M - K ); i++ ) {
		// A1 = DBLE( A( K+I, N-L+I ) )  — real part of diagonal
		ia = oA + ( ( K + i ) * sa1 ) + ( ( N - l + i ) * sa2 );
		a1 = Av[ ia ];

		// B1 = DBLE( B( I, N-L+I ) )
		ib = oB + ( i * sb1 ) + ( ( N - l + i ) * sb2 );
		b1 = Bv[ ib ];

		gamma = b1 / a1;

		if ( ( gamma <= HUGENUM ) && ( gamma >= -HUGENUM ) ) {
			// Change sign if necessary
			if ( gamma < ZERO ) {
				zdscal( l - i, -ONE, B, strideB2, offsetB + ( i * strideB1 ) + ( ( N - l + i ) * strideB2 ) );
				if ( wantv ) {
					zdscal( p, -ONE, V, strideV1, offsetV + ( i * strideV2 ) );
				}
			}

			dlartg( Math.abs( gamma ), ONE, lartgOut );
			BETA[ offsetBETA + ( ( K + i ) * strideBETA ) ] = lartgOut[ 0 ];
			ALPHA[ offsetALPHA + ( ( K + i ) * strideALPHA ) ] = lartgOut[ 1 ];

			if ( ALPHA[ offsetALPHA + ( ( K + i ) * strideALPHA ) ] >= BETA[ offsetBETA + ( ( K + i ) * strideBETA ) ] ) {
				zdscal( l - i, ONE / ALPHA[ offsetALPHA + ( ( K + i ) * strideALPHA ) ], A, strideA2, offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l + i ) * strideA2 ) );
			} else {
				zdscal( l - i, ONE / BETA[ offsetBETA + ( ( K + i ) * strideBETA ) ], B, strideB2, offsetB + ( i * strideB1 ) + ( ( N - l + i ) * strideB2 ) );
				zcopy( l - i, B, strideB2, offsetB + ( i * strideB1 ) + ( ( N - l + i ) * strideB2 ), A, strideA2, offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l + i ) * strideA2 ) );
			}
		} else {
			ALPHA[ offsetALPHA + ( ( K + i ) * strideALPHA ) ] = ZERO;
			BETA[ offsetBETA + ( ( K + i ) * strideBETA ) ] = ONE;
			zcopy( l - i, B, strideB2, offsetB + ( i * strideB1 ) + ( ( N - l + i ) * strideB2 ), A, strideA2, offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l + i ) * strideA2 ) );
		}
	}

	// Post-assignment
	for ( i = M; i < K + l; i++ ) {
		ALPHA[ offsetALPHA + ( i * strideALPHA ) ] = ZERO;
		BETA[ offsetBETA + ( i * strideBETA ) ] = ONE;
	}

	if ( K + l < N ) {
		for ( i = K + l; i < N; i++ ) {
			ALPHA[ offsetALPHA + ( i * strideALPHA ) ] = ZERO;
			BETA[ offsetBETA + ( i * strideBETA ) ] = ZERO;
		}
	}

	ncycle[ 0 ] = kcycle;
	return 0;
}


// EXPORTS //

export default ztgsja;
