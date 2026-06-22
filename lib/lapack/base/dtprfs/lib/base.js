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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
var abs = Math.abs;
var max = Math.max;
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dtpmv from './../../../../blas/base/dtpmv/lib/base.js';
import dtpsv from './../../../../blas/base/dtpsv/lib/base.js';
import dlacn2 from './../../dlacn2/lib/base.js';
import dlamch from './../../dlamch/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Provides error bounds and backward error estimates for the solution to a system of linear equations with a packed triangular coefficient matrix.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} AP - packed triangular matrix A, length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} B - right-hand side matrix B, shape [N, nrhs]
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} X - solution matrix X, shape [N, nrhs]
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} FERR - output array of length nrhs for forward error bounds
* @param {integer} strideFERR - stride length for `FERR`
* @param {NonNegativeInteger} offsetFERR - starting index for `FERR`
* @param {Float64Array} BERR - output array of length nrhs for backward errors
* @param {integer} strideBERR - stride length for `BERR`
* @param {NonNegativeInteger} offsetBERR - starting index for `BERR`
* @param {Float64Array} WORK - workspace array of length 3*N
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace array of length N
* @param {integer} strideIWORK - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
* @returns {integer} status code (0 = success)
*/
function dtprfs( uplo, trans, diag, N, nrhs, AP, strideAP, offsetAP, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) {
	var transtLong;
	var notran;
	var nounit;
	var lstres;
	var upper;
	var safe1;
	var safe2;
	var ISAVE;
	var KASE;
	var EST;
	var ow2;
	var xk;
	var nz;
	var kc;
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

	// Set transpose type for condition estimation
	if ( notran ) {
		transtLong = 'transpose';
	} else {
		transtLong = 'no-transpose';
	}

	// NZ = maximum number of nonzero entries in each row of A, plus 1
	nz = N + 1;
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Workspace: WORK(1..N) = bounds, WORK(N+1..2N) = residual, WORK(2N+1..3N) = dlacn2 V
	ow = offsetWORK;
	ow2 = offsetWORK + ( N * strideWORK );

	// Allocate state arrays for dlacn2
	KASE = new Int32Array( 1 );
	ISAVE = new Int32Array( 3 );
	EST = new Float64Array( 1 );

	// Loop over each right-hand side
	for ( j = 0; j < nrhs; j++ ) {
		// Compute residual: WORK(N+1..2N) = A*X(:,j) - B(:,j)

		// Copy X(:,j) into WORK(N+1..2N)
		dcopy( N, X, strideX1, offsetX + ( j * strideX2 ), WORK, strideWORK, ow2 );

		// Multiply: WORK(N+1..2N) = A * WORK(N+1..2N) (or A^T * ...)
		dtpmv( uplo, trans, diag, N, AP, strideAP, offsetAP, WORK, strideWORK, ow2 );

		// Subtract B(:,j): WORK(N+1..2N) -= B(:,j)
		daxpy( N, -ONE, B, strideB1, offsetB + ( j * strideB2 ), WORK, strideWORK, ow2 );

		// Compute componentwise bound in WORK(1..N)

		// WORK(i) = |B(i,j)| initially
		for ( i = 0; i < N; i++ ) {
			WORK[ ow + ( i * strideWORK ) ] = abs( B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] );
		}

		if ( notran ) {
			// Compute |A|*|X(:,j)|
			if ( upper ) {
				kc = 0;
				if ( nounit ) {
					for ( k = 0; k < N; k++ ) {
						xk = abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
						for ( i = 0; i <= k; i++ ) {
							WORK[ ow + ( i * strideWORK ) ] += abs( AP[ offsetAP + ( ( kc + i ) * strideAP ) ] ) * xk;
						}
						kc += k + 1;
					}
				} else {
					for ( k = 0; k < N; k++ ) {
						xk = abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
						for ( i = 0; i < k; i++ ) {
							WORK[ ow + ( i * strideWORK ) ] += abs( AP[ offsetAP + ( ( kc + i ) * strideAP ) ] ) * xk;
						}
						WORK[ ow + ( k * strideWORK ) ] += xk;
						kc += k + 1;
					}
				}
			} else {
				// Lower
				kc = 0;
				if ( nounit ) {
					for ( k = 0; k < N; k++ ) {
						xk = abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
						for ( i = k; i < N; i++ ) {
							WORK[ ow + ( i * strideWORK ) ] += abs( AP[ offsetAP + ( ( kc + i - k ) * strideAP ) ] ) * xk;
						}
						kc += N - k;
					}
				} else {
					for ( k = 0; k < N; k++ ) {
						xk = abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
						for ( i = k + 1; i < N; i++ ) {
							WORK[ ow + ( i * strideWORK ) ] += abs( AP[ offsetAP + ( ( kc + i - k ) * strideAP ) ] ) * xk;
						}
						WORK[ ow + ( k * strideWORK ) ] += xk;
						kc += N - k;
					}
				}
			}
		} else if ( upper ) {
			// Transpose: compute |A^T|*|X(:,j)| = (|A|^T)*|X(:,j)|, upper
			kc = 0;
			if ( nounit ) {
				for ( k = 0; k < N; k++ ) {
					s = ZERO;
					for ( i = 0; i <= k; i++ ) {
						s += abs( AP[ offsetAP + ( ( kc + i ) * strideAP ) ] ) * abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] );
					}
					WORK[ ow + ( k * strideWORK ) ] += s;
					kc += k + 1;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
					for ( i = 0; i < k; i++ ) {
						s += abs( AP[ offsetAP + ( ( kc + i ) * strideAP ) ] ) * abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] );
					}
					WORK[ ow + ( k * strideWORK ) ] += s;
					kc += k + 1;
				}
			}
		} else {
			// Transpose, lower
			kc = 0;
			if ( nounit ) {
				for ( k = 0; k < N; k++ ) {
					s = ZERO;
					for ( i = k; i < N; i++ ) {
						s += abs( AP[ offsetAP + ( ( kc + i - k ) * strideAP ) ] ) * abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] );
					}
					WORK[ ow + ( k * strideWORK ) ] += s;
					kc += N - k;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
					for ( i = k + 1; i < N; i++ ) {
						s += abs( AP[ offsetAP + ( ( kc + i - k ) * strideAP ) ] ) * abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] );
					}
					WORK[ ow + ( k * strideWORK ) ] += s;
					kc += N - k;
				}
			}
		}

		// Compute componentwise relative backward error: BERR(j)
		s = ZERO;
		for ( i = 0; i < N; i++ ) {
			if ( WORK[ ow + ( i * strideWORK ) ] > safe2 ) {
				s = max( s, abs( WORK[ ow2 + ( i * strideWORK ) ] ) / WORK[ ow + ( i * strideWORK ) ] );
			} else {
				s = max( s, ( abs( WORK[ ow2 + ( i * strideWORK ) ] ) + safe1 ) / ( WORK[ ow + ( i * strideWORK ) ] + safe1 ) );
			}
		}
		BERR[ offsetBERR + ( j * strideBERR ) ] = s;

		// Estimate forward error bound using dlacn2

		// Set up the right-hand side for the condition estimator
		for ( i = 0; i < N; i++ ) {
			if ( WORK[ ow + ( i * strideWORK ) ] > safe2 ) {
				WORK[ ow + ( i * strideWORK ) ] = abs( WORK[ ow2 + ( i * strideWORK ) ] ) + ( nz * EPS * WORK[ ow + ( i * strideWORK ) ] );
			} else {
				WORK[ ow + ( i * strideWORK ) ] = abs( WORK[ ow2 + ( i * strideWORK ) ] ) + ( nz * EPS * WORK[ ow + ( i * strideWORK ) ] ) + safe1;
			}
		}

		// Reverse communication loop for condition estimation
		KASE[ 0 ] = 0;
		EST[ 0 ] = 0.0;
		ISAVE[ 0 ] = 0;
		ISAVE[ 1 ] = 0;
		ISAVE[ 2 ] = 0;
		while ( true ) { // eslint-disable-line no-constant-condition
			dlacn2( N, WORK, strideWORK, offsetWORK + ( 2 * N * strideWORK ), WORK, strideWORK, ow2, IWORK, strideIWORK, offsetIWORK, EST, KASE, ISAVE, 1, 0 );
			if ( KASE[ 0 ] === 0 ) {
				break;
			}
			if ( KASE[ 0 ] === 1 ) {
				// Multiply by inv(op(A))^T: solve op(A)^T * x = work(N+1..2N)
				dtpsv( uplo, transtLong, diag, N, AP, strideAP, offsetAP, WORK, strideWORK, ow2 );

				// Scale by WORK(1..N)
				for ( i = 0; i < N; i++ ) {
					WORK[ ow2 + ( i * strideWORK ) ] = WORK[ ow + ( i * strideWORK ) ] * WORK[ ow2 + ( i * strideWORK ) ];
				}
			} else {
				// KASE === 2: scale then solve
				for ( i = 0; i < N; i++ ) {
					WORK[ ow2 + ( i * strideWORK ) ] = WORK[ ow + ( i * strideWORK ) ] * WORK[ ow2 + ( i * strideWORK ) ];
				}
				// Solve op(A) * x = work(N+1..2N)
				dtpsv( uplo, trans, diag, N, AP, strideAP, offsetAP, WORK, strideWORK, ow2 );
			}
		}

		// Copy EST result to FERR(j) and normalize by max element of X(:,j)
		FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];
		lstres = ZERO;
		for ( i = 0; i < N; i++ ) {
			lstres = max( lstres, abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] ) );
		}
		if ( lstres !== ZERO ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] /= lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default dtprfs;
