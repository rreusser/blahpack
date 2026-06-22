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

/* eslint-disable max-len, max-params */

// MODULES //

import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dgemv from './../../../../blas/base/dgemv/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import dgetrs from '../../dgetrs/lib/base.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Improves the computed solution to a system of linear equations and provides.
* error bounds and backward error estimates for the solution.
*
* Uses the LU factorization computed by dgetrf. WORK (3*N) and IWORK (N)
* are allocated internally.
*
* IPIV must contain 0-based pivot indices (as produced by dgetrf).
*
* @private
* @param {string} trans - specifies the form of the system: 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - original N-by-N matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} AF - LU-factored N-by-N matrix (from dgetrf)
* @param {integer} strideAF1 - stride of the first dimension of AF
* @param {integer} strideAF2 - stride of the second dimension of AF
* @param {NonNegativeInteger} offsetAF - index offset for AF
* @param {Int32Array} IPIV - pivot indices from dgetrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Float64Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {Float64Array} X - solution matrix (improved on exit)
* @param {integer} strideX1 - stride of the first dimension of X
* @param {integer} strideX2 - stride of the second dimension of X
* @param {NonNegativeInteger} offsetX - index offset for X
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - index offset for FERR
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - index offset for BERR
* @returns {integer} info - 0 if successful
*/
function dgerfs( trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR ) {
	var notran;
	var transt;
	var lstres;
	var count;
	var ISAVE;
	var IWORK;
	var safe1;
	var safe2;
	var WORK;
	var KASE;
	var EST;
	var xk;
	var nz;
	var s;
	var i;
	var j;
	var k;

	// Quick return if possible
	if ( N === 0 || nrhs === 0 ) {
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] = 0.0;
			BERR[ offsetBERR + ( j * strideBERR ) ] = 0.0;
		}
		return 0;
	}

	notran = ( trans === 'no-transpose' );
	if ( notran ) {
		transt = 'transpose';
	} else {
		transt = 'no-transpose';
	}

	// NZ = maximum number of nonzero elements in each row of A, plus 1
	nz = N + 1;
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Allocate workspace: WORK has 3 segments of N doubles, IWORK has N ints
	WORK = new Float64Array( 3 * N );
	IWORK = new Int32Array( N );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	ISAVE = new Int32Array( 3 );

	// Do for each right-hand side
	for ( j = 0; j < nrhs; j++ ) {
		count = 1;
		lstres = 3.0;

		// Loop until stopping criterion is satisfied (label 20)
		while ( true ) {
			// Compute residual R = B - op(A) * X
			// Copy B(:,j) into WORK(N:2N-1)
			dcopy( N, B, strideB1, offsetB + ( j * strideB2 ), WORK, 1, N );

			// WORK(N:2N-1) = B(:,j) - op(A) * X(:,j)
			dgemv( trans, N, N, -1.0, A, strideA1, strideA2, offsetA, X, strideX1, offsetX + ( j * strideX2 ), 1.0, WORK, 1, N );

			// Compute componentwise relative backward error

			// WORK(0:N-1) = abs(B(:,j))
			for ( i = 0; i < N; i++ ) {
				WORK[ i ] = Math.abs( B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] );
			}

			// Compute abs(op(A))*abs(X) + abs(B)
			if ( notran ) {
				for ( k = 0; k < N; k++ ) {
					xk = Math.abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
					for ( i = 0; i < N; i++ ) {
						WORK[ i ] += Math.abs( A[ offsetA + ( i * strideA1 ) + ( k * strideA2 ) ] ) * xk;
					}
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					for ( i = 0; i < N; i++ ) {
						s += Math.abs( A[ offsetA + ( i * strideA1 ) + ( k * strideA2 ) ] ) * Math.abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] );
					}
					WORK[ k ] += s;
				}
			}

			// Compute BERR(j)
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				if ( WORK[ i ] > safe2 ) {
					s = Math.max( s, Math.abs( WORK[ N + i ] ) / WORK[ i ] );
				} else {
					s = Math.max( s, ( Math.abs( WORK[ N + i ] ) + safe1 ) / ( WORK[ i ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + ( j * strideBERR ) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				// Update solution and try again
				// Solve op(A) * dx = R using the LU factorization
				dgetrs( trans, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, 1, N, N );

				// X(:,j) += dx
				daxpy( N, 1.0, WORK, 1, N, X, strideX1, offsetX + ( j * strideX2 ) );

				lstres = s;
				count += 1;
			} else {
				break;
			}
		}

		// Bound error from formula using DLACN2 to estimate the infinity-norm
		// Of inv(op(A)) * diag(W)

		// Set up WORK(0:N-1) = abs(R) + NZ*EPS*(abs(op(A))*abs(X)+abs(B))
		for ( i = 0; i < N; i++ ) {
			if ( WORK[ i ] > safe2 ) {
				WORK[ i ] = Math.abs( WORK[ N + i ] ) + ( nz * EPS * WORK[ i ] );
			} else {
				WORK[ i ] = Math.abs( WORK[ N + i ] ) + ( nz * EPS * WORK[ i ] ) + safe1;
			}
		}

		KASE[ 0 ] = 0;

		// dlacn2 reverse communication loop (label 100)
		while ( true ) {
			EST[ 0 ] = FERR[ offsetFERR + ( j * strideFERR ) ];
			dlacn2( N, WORK, 1, ( 2 * N ), WORK, 1, N, IWORK, 1, 0, EST, KASE, ISAVE, 1, 0 );
			FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W)*inv(op(A)**T)
				dgetrs( transt, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, 1, N, N );
				for ( i = 0; i < N; i++ ) {
					WORK[ N + i ] = WORK[ i ] * WORK[ N + i ];
				}
			} else {
				// Multiply by inv(op(A))*diag(W)
				for ( i = 0; i < N; i++ ) {
					WORK[ N + i ] = WORK[ i ] * WORK[ N + i ];
				}
				dgetrs( trans, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, 1, N, N );
			}
		}

		// Normalize error
		lstres = 0.0;
		for ( i = 0; i < N; i++ ) {
			lstres = Math.max( lstres, Math.abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] ) );
		}
		if ( lstres !== 0.0 ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] = FERR[ offsetFERR + ( j * strideFERR ) ] / lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default dgerfs;
