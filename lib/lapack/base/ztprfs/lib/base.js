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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
var abs = Math.abs;
var max = Math.max;
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import ztpmv from './../../../../blas/base/ztpmv/lib/base.js';
import ztpsv from './../../../../blas/base/ztpsv/lib/base.js';
import zlacn2 from './../../zlacn2/lib/base.js';
import dlamch from './../../dlamch/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var MONE = new Complex128( -1.0, 0.0 );
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );


// FUNCTIONS //

/**
* Computes CABS1: |Re(z)| + |Im(z)|.
*
* @private
* @param {number} re - real part
* @param {number} im - imaginary part
* @returns {number} result
*/
function cabs1( re, im ) {
	return abs( re ) + abs( im );
}


// MAIN //

/**
* Provides error bounds and backward error estimates for the solution to a system of linear equations with a packed complex triangular coefficient matrix.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} AP - packed triangular matrix A, length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Complex128Array} B - right-hand side matrix B, shape [N, nrhs]
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @param {Complex128Array} X - solution matrix X, shape [N, nrhs]
* @param {integer} strideX1 - stride of the first dimension of `X` (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of `X` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
* @param {Float64Array} FERR - output array of length nrhs for forward error bounds
* @param {integer} strideFERR - stride length for `FERR`
* @param {NonNegativeInteger} offsetFERR - starting index for `FERR`
* @param {Float64Array} BERR - output array of length nrhs for backward errors
* @param {integer} strideBERR - stride length for `BERR`
* @param {NonNegativeInteger} offsetBERR - starting index for `BERR`
* @param {Complex128Array} WORK - workspace array of length 2*N (complex)
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @param {Float64Array} RWORK - real workspace array of length N
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {integer} status code (0 = success)
*/
function ztprfs( uplo, trans, diag, N, nrhs, AP, strideAP, offsetAP, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var transtLong;
	var transnLong;
	var notran;
	var nounit;
	var lstres;
	var upper;
	var safe1;
	var safe2;
	var ISAVE;
	var KASE;
	var EST;
	var APv;
	var Bv;
	var Xv;
	var Wv;
	var nz;
	var kc;
	var xk;
	var ow;
	var s;
	var i;
	var j;
	var k;

	// Decode parameters
	upper = ( uplo === 'upper' );
	notran = ( trans === 'no-transpose' );
	nounit = ( diag === 'non-unit' );

	// Quick return if possible
	if ( N === 0 || nrhs === 0 ) {
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] = ZERO;
			BERR[ offsetBERR + ( j * strideBERR ) ] = ZERO;
		}
		return 0;
	}

	// Set transpose types for condition estimation
	if ( notran ) {
		transnLong = 'no-transpose';
		transtLong = 'conjugate-transpose';
	} else {
		transnLong = 'conjugate-transpose';
		transtLong = 'no-transpose';
	}

	// NZ = maximum number of nonzero entries in each row of A, plus 1
	nz = N + 1;
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Reinterpret complex arrays as Float64 views for element access
	APv = reinterpret( AP, 0 );
	Bv = reinterpret( B, 0 );
	Xv = reinterpret( X, 0 );
	Wv = reinterpret( WORK, 0 );

	// Real workspace offset
	ow = offsetRWork;

	// Allocate state arrays for zlacn2
	KASE = new Int32Array( 1 );
	ISAVE = new Int32Array( 3 );
	EST = new Float64Array( 1 );

	// Loop over each right-hand side
	for ( j = 0; j < nrhs; j++ ) {
		// Compute residual: WORK(0..N-1) = A*X(:,j) - B(:,j)

		// Copy X(:,j) into WORK(0..N-1) (complex copy)
		zcopy( N, X, strideX1, offsetX + ( j * strideX2 ), WORK, strideWork, offsetWork );

		// Multiply: WORK(0..N-1) = op(A) * WORK(0..N-1)
		ztpmv( uplo, trans, diag, N, AP, strideAP, offsetAP, WORK, strideWork, offsetWork );

		// Subtract B(:,j): WORK(0..N-1) -= B(:,j)
		zaxpy( N, MONE, B, strideB1, offsetB + ( j * strideB2 ), WORK, strideWork, offsetWork );

		// Compute componentwise bound in RWORK: RWORK(i) = CABS1(B(i,j)) initially
		for ( i = 0; i < N; i++ ) {
			RWORK[ ow + ( i * strideRWork ) ] = cabs1( Bv[ ( ( offsetB + ( i * strideB1 ) + ( j * strideB2 ) ) * 2 ) ], Bv[ ( ( offsetB + ( i * strideB1 ) + ( j * strideB2 ) ) * 2 ) + 1 ] );
		}

		if ( notran ) {
			// Compute |A|*|X(:,j)|
			if ( upper ) {
				kc = 0;
				if ( nounit ) {
					for ( k = 0; k < N; k++ ) {
						xk = cabs1( Xv[ ( ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 ) ], Xv[ ( ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 ) + 1 ] );
						for ( i = 0; i <= k; i++ ) {
							RWORK[ ow + ( i * strideRWork ) ] += cabs1( APv[ ( ( offsetAP + kc + i ) * 2 ) ], APv[ ( ( offsetAP + kc + i ) * 2 ) + 1 ] ) * xk; // eslint-disable-line no-mixed-operators
						}
						kc += k + 1;
					}
				} else {
					for ( k = 0; k < N; k++ ) {
						xk = cabs1( Xv[ ( ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 ) ], Xv[ ( ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 ) + 1 ] );
						for ( i = 0; i < k; i++ ) {
							RWORK[ ow + ( i * strideRWork ) ] += cabs1( APv[ ( ( offsetAP + kc + i ) * 2 ) ], APv[ ( ( offsetAP + kc + i ) * 2 ) + 1 ] ) * xk; // eslint-disable-line no-mixed-operators
						}
						RWORK[ ow + ( k * strideRWork ) ] += xk;
						kc += k + 1;
					}
				}
			} else {
				// Lower
				kc = 0;
				if ( nounit ) {
					for ( k = 0; k < N; k++ ) {
						xk = cabs1( Xv[ ( ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 ) ], Xv[ ( ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 ) + 1 ] );
						for ( i = k; i < N; i++ ) {
							RWORK[ ow + ( i * strideRWork ) ] += cabs1( APv[ ( ( offsetAP + kc + i - k ) * 2 ) ], APv[ ( ( offsetAP + kc + i - k ) * 2 ) + 1 ] ) * xk; // eslint-disable-line no-mixed-operators
						}
						kc += N - k;
					}
				} else {
					for ( k = 0; k < N; k++ ) {
						xk = cabs1( Xv[ ( ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 ) ], Xv[ ( ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 ) + 1 ] );
						for ( i = k + 1; i < N; i++ ) {
							RWORK[ ow + ( i * strideRWork ) ] += cabs1( APv[ ( ( offsetAP + kc + i - k ) * 2 ) ], APv[ ( ( offsetAP + kc + i - k ) * 2 ) + 1 ] ) * xk; // eslint-disable-line no-mixed-operators
						}
						RWORK[ ow + ( k * strideRWork ) ] += xk;
						kc += N - k;
					}
				}
			}
		} else if ( upper ) {
			// Conjugate-transpose: compute |A**H|*|X(:,j)|, upper
			kc = 0;
			if ( nounit ) {
				for ( k = 0; k < N; k++ ) {
					s = ZERO;
					for ( i = 0; i <= k; i++ ) {
						s += cabs1( APv[ ( ( offsetAP + kc + i ) * 2 ) ], APv[ ( ( offsetAP + kc + i ) * 2 ) + 1 ] ) * cabs1( Xv[ ( ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2 ) ], Xv[ ( ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2 ) + 1 ] ); // eslint-disable-line no-mixed-operators
					}
					RWORK[ ow + ( k * strideRWork ) ] += s;
					kc += k + 1;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = cabs1( Xv[ ( ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 ) ], Xv[ ( ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 ) + 1 ] );
					for ( i = 0; i < k; i++ ) {
						s += cabs1( APv[ ( ( offsetAP + kc + i ) * 2 ) ], APv[ ( ( offsetAP + kc + i ) * 2 ) + 1 ] ) * cabs1( Xv[ ( ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2 ) ], Xv[ ( ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2 ) + 1 ] ); // eslint-disable-line no-mixed-operators
					}
					RWORK[ ow + ( k * strideRWork ) ] += s;
					kc += k + 1;
				}
			}
		} else {
			// Conjugate-transpose, lower
			kc = 0;
			if ( nounit ) {
				for ( k = 0; k < N; k++ ) {
					s = ZERO;
					for ( i = k; i < N; i++ ) {
						s += cabs1( APv[ ( ( offsetAP + kc + i - k ) * 2 ) ], APv[ ( ( offsetAP + kc + i - k ) * 2 ) + 1 ] ) * cabs1( Xv[ ( ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2 ) ], Xv[ ( ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2 ) + 1 ] ); // eslint-disable-line no-mixed-operators
					}
					RWORK[ ow + ( k * strideRWork ) ] += s;
					kc += N - k;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = cabs1( Xv[ ( ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 ) ], Xv[ ( ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 ) + 1 ] );
					for ( i = k + 1; i < N; i++ ) {
						s += cabs1( APv[ ( ( offsetAP + kc + i - k ) * 2 ) ], APv[ ( ( offsetAP + kc + i - k ) * 2 ) + 1 ] ) * cabs1( Xv[ ( ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2 ) ], Xv[ ( ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2 ) + 1 ] ); // eslint-disable-line no-mixed-operators
					}
					RWORK[ ow + ( k * strideRWork ) ] += s;
					kc += N - k;
				}
			}
		}

		// Compute componentwise relative backward error: BERR(j)
		s = ZERO;
		for ( i = 0; i < N; i++ ) {
			if ( RWORK[ ow + ( i * strideRWork ) ] > safe2 ) {
				s = max( s, cabs1( Wv[ ( ( offsetWork + ( i * strideWork ) ) * 2 ) ], Wv[ ( ( offsetWork + ( i * strideWork ) ) * 2 ) + 1 ] ) / RWORK[ ow + ( i * strideRWork ) ] );
			} else {
				s = max( s, ( cabs1( Wv[ ( ( offsetWork + ( i * strideWork ) ) * 2 ) ], Wv[ ( ( offsetWork + ( i * strideWork ) ) * 2 ) + 1 ] ) + safe1 ) / ( RWORK[ ow + ( i * strideRWork ) ] + safe1 ) );
			}
		}
		BERR[ offsetBERR + ( j * strideBERR ) ] = s;

		// Estimate forward error bound using zlacn2

		// Set up the right-hand side for the condition estimator
		for ( i = 0; i < N; i++ ) {
			if ( RWORK[ ow + ( i * strideRWork ) ] > safe2 ) {
				RWORK[ ow + ( i * strideRWork ) ] = cabs1( Wv[ ( ( offsetWork + ( i * strideWork ) ) * 2 ) ], Wv[ ( ( offsetWork + ( i * strideWork ) ) * 2 ) + 1 ] ) + ( nz * EPS * RWORK[ ow + ( i * strideRWork ) ] );
			} else {
				RWORK[ ow + ( i * strideRWork ) ] = cabs1( Wv[ ( ( offsetWork + ( i * strideWork ) ) * 2 ) ], Wv[ ( ( offsetWork + ( i * strideWork ) ) * 2 ) + 1 ] ) + ( nz * EPS * RWORK[ ow + ( i * strideRWork ) ] ) + safe1;
			}
		}

		// Reverse communication loop for condition estimation
		KASE[ 0 ] = 0;
		EST[ 0 ] = 0.0;
		ISAVE[ 0 ] = 0;
		ISAVE[ 1 ] = 0;
		ISAVE[ 2 ] = 0;
		while ( true ) { // eslint-disable-line no-constant-condition
			// zlacn2(N, V, strideV, offsetV, X, strideX, offsetX, EST, KASE, ISAVE, strideISAVE, offsetISAVE)
			// V = WORK(N..2N-1), X = WORK(0..N-1) in complex elements
			zlacn2( N, WORK, strideWork, offsetWork + ( N * strideWork ), WORK, strideWork, offsetWork, EST, KASE, ISAVE, 1, 0 );
			if ( KASE[ 0 ] === 0 ) {
				break;
			}
			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W)*inv(op(A)**H): solve op(A)**H * x = work(0..N-1)
				ztpsv( uplo, transtLong, diag, N, AP, strideAP, offsetAP, WORK, strideWork, offsetWork );

				// Scale by RWORK: WORK(i) = RWORK(i) * WORK(i)
				for ( i = 0; i < N; i++ ) {
					Wv[ ( ( offsetWork + ( i * strideWork ) ) * 2 ) ] *= RWORK[ ow + ( i * strideRWork ) ];
					Wv[ ( ( offsetWork + ( i * strideWork ) ) * 2 ) + 1 ] *= RWORK[ ow + ( i * strideRWork ) ];
				}
			} else {
				// KASE === 2: scale then solve
				for ( i = 0; i < N; i++ ) {
					Wv[ ( ( offsetWork + ( i * strideWork ) ) * 2 ) ] *= RWORK[ ow + ( i * strideRWork ) ];
					Wv[ ( ( offsetWork + ( i * strideWork ) ) * 2 ) + 1 ] *= RWORK[ ow + ( i * strideRWork ) ];
				}
				// Solve op(A) * x = work(0..N-1)
				ztpsv( uplo, transnLong, diag, N, AP, strideAP, offsetAP, WORK, strideWork, offsetWork );
			}
		}

		// Copy EST result to FERR(j) and normalize by max element of X(:,j)
		FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];
		lstres = ZERO;
		for ( i = 0; i < N; i++ ) {
			lstres = max( lstres, cabs1( Xv[ ( ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2 ) ], Xv[ ( ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2 ) + 1 ] ) );
		}
		if ( lstres !== ZERO ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] /= lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default ztprfs;
