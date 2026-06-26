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

/* eslint-disable max-len, max-params, max-depth */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import drot from '../../../../blas/base/drot/lib/base.js';
import dlags2 from '../../dlags2/lib/base.js';
import dlapll from '../../dlapll/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';


// VARIABLES //

var MAXIT = 40;
var ZERO = 0.0;
var ONE = 1.0;
var HUGENUM = 1.7976931348623157e+308;
var lartgOut = new Float64Array( 3 );
var ssminArr = new Float64Array( 1 );


// MAIN //

/**
* Computes the generalized singular value decomposition (GSVD) of two real.
* upper triangular (or trapezoidal) matrices A and B.
*
* On entry, it is assumed that matrices A and B have the forms obtained by
* the preprocessing subroutine DGGSVP.
*
* On exit, U^T_A_Q = D1_(0 R), V^T_B_Q = D2_(0 R), where U, V and Q are
* orthogonal matrices.
*
* @private
* @param {string} jobu - `'update'`, `'initialize'`, or `'none'`
* @param {string} jobv - `'update'`, `'initialize'`, or `'none'`
* @param {string} jobq - `'update'`, `'initialize'`, or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {NonNegativeInteger} K - dimension of the first block
* @param {NonNegativeInteger} l - dimension of the second block
* @param {Float64Array} A - M-by-N matrix A (overwritten)
* @param {integer} strideA1 - stride of first dimension of A
* @param {integer} strideA2 - stride of second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - P-by-N matrix B (overwritten)
* @param {integer} strideB1 - stride of first dimension of B
* @param {integer} strideB2 - stride of second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {number} tola - convergence tolerance for A
* @param {number} tolb - convergence tolerance for B
* @param {Float64Array} ALPHA - output array for generalized singular values (length N)
* @param {integer} strideALPHA - stride for ALPHA
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA
* @param {Float64Array} BETA - output array for generalized singular values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - starting index for BETA
* @param {Float64Array} U - M-by-M orthogonal matrix U
* @param {integer} strideU1 - stride of first dimension of U
* @param {integer} strideU2 - stride of second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Float64Array} V - P-by-P orthogonal matrix V
* @param {integer} strideV1 - stride of first dimension of V
* @param {integer} strideV2 - stride of second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} Q - N-by-N orthogonal matrix Q
* @param {integer} strideQ1 - stride of first dimension of Q
* @param {integer} strideQ2 - stride of second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Float64Array} WORK - workspace array of length 2*N
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {Int32Array} ncycle - output: ncycle[0] receives the number of cycles
* @returns {integer} info - 0 for success, 1 if not converged
*/
function dtgsja( jobu, jobv, jobq, M, p, N, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK, ncycle ) {
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
	var a1;
	var a2;
	var a3;
	var b1;
	var b2;
	var b3;
	var i;
	var j;

	// Decode and test the input parameters
	initu = ( jobu === 'initialize' );
	wantu = initu || ( jobu === 'compute-U' );

	initv = ( jobv === 'initialize' );
	wantv = initv || ( jobv === 'compute-V' );

	initq = ( jobq === 'initialize' );
	wantq = initq || ( jobq === 'compute-Q' );

	info = 0;

	// Initialize U, V and Q, if necessary
	if ( initu ) {
		dlaset( 'Full', M, M, ZERO, ONE, U, strideU1, strideU2, offsetU );
	}
	if ( initv ) {
		dlaset( 'Full', p, p, ZERO, ONE, V, strideV1, strideV2, offsetV );
	}
	if ( initq ) {
		dlaset( 'Full', N, N, ZERO, ONE, Q, strideQ1, strideQ2, offsetQ );
	}

	// Loop until convergence
	upper = false;
	for ( kcycle = 1; kcycle <= MAXIT; kcycle++ ) {
		upper = !upper;

		for ( i = 0; i < l - 1; i++ ) {
			for ( j = i + 1; j < l; j++ ) {
				a1 = ZERO;
				a2 = ZERO;
				a3 = ZERO;
				if ( K + i < M ) {
					a1 = A[ offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l + i ) * strideA2 ) ];
				}
				if ( K + j < M ) {
					a3 = A[ offsetA + ( ( K + j ) * strideA1 ) + ( ( N - l + j ) * strideA2 ) ];
				}

				b1 = B[ offsetB + ( i * strideB1 ) + ( ( N - l + i ) * strideB2 ) ];
				b3 = B[ offsetB + ( j * strideB1 ) + ( ( N - l + j ) * strideB2 ) ];

				if ( upper ) {
					if ( K + i < M ) {
						a2 = A[ offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l + j ) * strideA2 ) ];
					}
					b2 = B[ offsetB + ( i * strideB1 ) + ( ( N - l + j ) * strideB2 ) ];
				} else {
					if ( K + j < M ) {
						a2 = A[ offsetA + ( ( K + j ) * strideA1 ) + ( ( N - l + i ) * strideA2 ) ];
					}
					b2 = B[ offsetB + ( j * strideB1 ) + ( ( N - l + i ) * strideB2 ) ];
				}

				rot = dlags2( upper, a1, a2, a3, b1, b2, b3 );

				// Update (K+I)-th and (K+J)-th rows of matrix A: U^T*A
				if ( K + j < M ) {
					drot( l, A, strideA2, offsetA + ( ( K + j ) * strideA1 ) + ( ( N - l ) * strideA2 ), A, strideA2, offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l ) * strideA2 ), rot.csu, rot.snu);
				}

				// Update I-th and J-th rows of matrix B: V^T*B
				drot( l, B, strideB2, offsetB + ( j * strideB1 ) + ( ( N - l ) * strideB2 ), B, strideB2, offsetB + ( i * strideB1 ) + ( ( N - l ) * strideB2 ), rot.csv, rot.snv);

				// Update (N-L+I)-th and (N-L+J)-th columns of matrices A and B: A*Q and B*Q
				drot( Math.min( K + l, M ), A, strideA1, offsetA + ( ( N - l + j ) * strideA2 ), A, strideA1, offsetA + ( ( N - l + i ) * strideA2 ), rot.csq, rot.snq);

				drot( l, B, strideB1, offsetB + ( ( N - l + j ) * strideB2 ), B, strideB1, offsetB + ( ( N - l + i ) * strideB2 ), rot.csq, rot.snq);

				if ( upper ) {
					if ( K + i < M ) {
						A[ offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l + j ) * strideA2 ) ] = ZERO;
					}
					B[ offsetB + ( i * strideB1 ) + ( ( N - l + j ) * strideB2 ) ] = ZERO;
				} else {
					if ( K + j < M ) {
						A[ offsetA + ( ( K + j ) * strideA1 ) + ( ( N - l + i ) * strideA2 ) ] = ZERO;
					}
					B[ offsetB + ( j * strideB1 ) + ( ( N - l + i ) * strideB2 ) ] = ZERO;
				}

				// Update orthogonal matrices U, V, Q, if desired.
				if ( wantu && K + j < M ) {
					drot( M, U, strideU1, offsetU + ( ( K + j ) * strideU2 ), U, strideU1, offsetU + ( ( K + i ) * strideU2 ), rot.csu, rot.snu);
				}

				if ( wantv ) {
					drot( p, V, strideV1, offsetV + ( j * strideV2 ), V, strideV1, offsetV + ( i * strideV2 ), rot.csv, rot.snv);
				}

				if ( wantq ) {
					drot( N, Q, strideQ1, offsetQ + ( ( N - l + j ) * strideQ2 ), Q, strideQ1, offsetQ + ( ( N - l + i ) * strideQ2 ), rot.csq, rot.snq);
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
				dcopy( l - i, A, strideA2, offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l + i ) * strideA2 ), WORK, strideWORK, offsetWORK);
				dcopy( l - i, B, strideB2, offsetB + ( i * strideB1 ) + ( ( N - l + i ) * strideB2 ), WORK, strideWORK, offsetWORK + ( l * strideWORK ));
				dlapll( l - i, WORK, strideWORK, offsetWORK, WORK, strideWORK, offsetWORK + ( l * strideWORK ), ssminArr);
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
		a1 = A[ offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l + i ) * strideA2 ) ];
		b1 = B[ offsetB + ( i * strideB1 ) + ( ( N - l + i ) * strideB2 ) ];
		gamma = b1 / a1;

		if ( ( gamma <= HUGENUM ) && ( gamma >= -HUGENUM ) ) {
			// Change sign if necessary
			if ( gamma < ZERO ) {
				dscal( l - i, -ONE, B, strideB2, offsetB + ( i * strideB1 ) + ( ( N - l + i ) * strideB2 ));
				if ( wantv ) {
					dscal( p, -ONE, V, strideV1, offsetV + ( i * strideV2 ) );
				}
			}

			dlartg( Math.abs( gamma ), ONE, lartgOut );
			BETA[ offsetBETA + ( ( K + i ) * strideBETA ) ] = lartgOut[ 0 ];
			ALPHA[ offsetALPHA + ( ( K + i ) * strideALPHA ) ] = lartgOut[ 1 ];

			if ( ALPHA[ offsetALPHA + ( ( K + i ) * strideALPHA ) ] >= BETA[ offsetBETA + ( ( K + i ) * strideBETA ) ] ) {
				dscal( l - i, ONE / ALPHA[ offsetALPHA + ( ( K + i ) * strideALPHA ) ], A, strideA2, offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l + i ) * strideA2 ));
			} else {
				dscal( l - i, ONE / BETA[ offsetBETA + ( ( K + i ) * strideBETA ) ], B, strideB2, offsetB + ( i * strideB1 ) + ( ( N - l + i ) * strideB2 ));
				dcopy( l - i, B, strideB2, offsetB + ( i * strideB1 ) + ( ( N - l + i ) * strideB2 ), A, strideA2, offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l + i ) * strideA2 ));
			}
		} else {
			ALPHA[ offsetALPHA + ( ( K + i ) * strideALPHA ) ] = ZERO;
			BETA[ offsetBETA + ( ( K + i ) * strideBETA ) ] = ONE;
			dcopy( l - i, B, strideB2, offsetB + ( i * strideB1 ) + ( ( N - l + i ) * strideB2 ), A, strideA2, offsetA + ( ( K + i ) * strideA1 ) + ( ( N - l + i ) * strideA2 ));
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

export default dtgsja;
