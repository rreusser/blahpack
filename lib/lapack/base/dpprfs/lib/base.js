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

/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
var abs = Math.abs;
var max = Math.max;
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dspmv from './../../../../blas/base/dspmv/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import dpptrs from '../../dpptrs/lib/base.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Improves the computed solution to a system of linear equations when the.
* coefficient matrix is symmetric positive definite stored in packed format,
* and provides error bounds and backward error estimates for the solution.
*
* Uses the Cholesky factorization computed by dpptrf.
*
* @private
* @param {string} uplo - 'upper' if upper Cholesky factor stored, 'lower' if lower
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AP - original symmetric matrix in packed storage
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} AFP - Cholesky-factored matrix in packed storage (from dpptrf)
* @param {integer} strideAFP - stride length for `AFP`
* @param {NonNegativeInteger} offsetAFP - starting index for `AFP`
* @param {Float64Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} X - solution matrix (improved on exit)
* @param {integer} strideX1 - stride of the first dimension of X
* @param {integer} strideX2 - stride of the second dimension of X
* @param {NonNegativeInteger} offsetX - starting index for X
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - starting index for FERR
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - starting index for BERR
* @param {Float64Array} WORK - workspace array (length >= 3*N)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace array (length >= N)
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @returns {integer} info - 0 if successful
*/
function dpprfs( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	var lstres;
	var upper;
	var count;
	var ISAVE;
	var safe1;
	var safe2;
	var KASE;
	var EST;
	var xk;
	var nz;
	var ik;
	var kk;
	var w0;
	var w1;
	var w2;
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

	upper = ( uplo === 'upper' );

	// NZ = maximum number of nonzero elements in each row of A, plus 1
	nz = N + 1;
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Workspace segment offsets
	w0 = offsetWork;                        // WORK(0:N-1)
	w1 = offsetWork + ( N * strideWork );   // WORK(N:2N-1)
	w2 = offsetWork + ( 2 * N * strideWork ); // WORK(2N:3N-1)

	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	ISAVE = new Int32Array( 3 );

	// Do for each right-hand side
	for ( j = 0; j < nrhs; j++ ) {
		count = 1;
		lstres = 3.0;

		// Loop until stopping criterion is satisfied
		while ( true ) {
			// Compute residual R = B - A * X
			// Copy B(:,j) into WORK(N:2N-1)
			dcopy( N, B, strideB1, offsetB + ( j * strideB2 ), WORK, strideWork, w1 );

			// WORK(N:2N-1) = B(:,j) - A * X(:,j)
			dspmv( uplo, N, -1.0, AP, strideAP, offsetAP, X, strideX1, offsetX + ( j * strideX2 ), 1.0, WORK, strideWork, w1 );

			// Compute componentwise relative backward error

			// WORK(0:N-1) = abs(B(:,j))
			for ( i = 0; i < N; i++ ) {
				WORK[ w0 + ( i * strideWork ) ] = abs( B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] );
			}

			// Compute abs(A)*abs(X) + abs(B), exploiting symmetry in packed storage
			kk = 0;
			if ( upper ) {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					xk = abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
					ik = kk;

					// Upper triangle: rows 0..k-1
					for ( i = 0; i < k; i++ ) {
						WORK[ w0 + ( i * strideWork ) ] += abs( AP[ offsetAP + ( ik * strideAP ) ] ) * xk;
						s += abs( AP[ offsetAP + ( ik * strideAP ) ] ) * abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] );
						ik += 1;
					}
					// Diagonal element
					WORK[ w0 + ( k * strideWork ) ] += ( abs( AP[ offsetAP + ( ( kk + k ) * strideAP ) ] ) * xk ) + s;
					kk += k + 1;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					xk = abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );

					// Diagonal element
					WORK[ w0 + ( k * strideWork ) ] += abs( AP[ offsetAP + ( kk * strideAP ) ] ) * xk;
					ik = kk + 1;

					// Lower triangle: rows k+1..N-1
					for ( i = k + 1; i < N; i++ ) {
						WORK[ w0 + ( i * strideWork ) ] += abs( AP[ offsetAP + ( ik * strideAP ) ] ) * xk;
						s += abs( AP[ offsetAP + ( ik * strideAP ) ] ) * abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] );
						ik += 1;
					}
					WORK[ w0 + ( k * strideWork ) ] += s;
					kk += N - k;
				}
			}

			// Compute BERR(j)
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				if ( WORK[ w0 + ( i * strideWork ) ] > safe2 ) {
					s = max( s, abs( WORK[ w1 + ( i * strideWork ) ] ) / WORK[ w0 + ( i * strideWork ) ] );
				} else {
					s = max( s, ( abs( WORK[ w1 + ( i * strideWork ) ] ) + safe1 ) / ( WORK[ w0 + ( i * strideWork ) ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + ( j * strideBERR ) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				// Solve A * dx = R using the Cholesky factorization
				dpptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, WORK, strideWork, N * strideWork, w1 );

				// X(:,j) += dx
				daxpy( N, 1.0, WORK, strideWork, w1, X, strideX1, offsetX + ( j * strideX2 ) );

				lstres = s;
				count += 1;
			} else {
				break;
			}
		}

		// Bound error from formula using DLACN2 to estimate the infinity-norm
		// Of inv(A) * diag(W)

		// Set up WORK(0:N-1) = abs(R) + NZ*EPS*(abs(A)*abs(X)+abs(B))
		for ( i = 0; i < N; i++ ) {
			if ( WORK[ w0 + ( i * strideWork ) ] > safe2 ) {
				WORK[ w0 + ( i * strideWork ) ] = abs( WORK[ w1 + ( i * strideWork ) ] ) + ( nz * EPS * WORK[ w0 + ( i * strideWork ) ] );
			} else {
				WORK[ w0 + ( i * strideWork ) ] = abs( WORK[ w1 + ( i * strideWork ) ] ) + ( nz * EPS * WORK[ w0 + ( i * strideWork ) ] ) + safe1;
			}
		}

		KASE[ 0 ] = 0;

		// dlacn2 reverse communication loop
		while ( true ) {
			EST[ 0 ] = FERR[ offsetFERR + ( j * strideFERR ) ];
			dlacn2( N, WORK, strideWork, w2, WORK, strideWork, w1, IWORK, strideIWork, offsetIWork, EST, KASE, ISAVE, 1, 0 );
			FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W)*inv(A^T)
				// Since A is symmetric, A^T = A, so just solve A*z = x
				dpptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, WORK, strideWork, N * strideWork, w1 );
				for ( i = 0; i < N; i++ ) {
					WORK[ w1 + ( i * strideWork ) ] = WORK[ w0 + ( i * strideWork ) ] * WORK[ w1 + ( i * strideWork ) ];
				}
			} else {
				// Multiply by inv(A)*diag(W)
				for ( i = 0; i < N; i++ ) {
					WORK[ w1 + ( i * strideWork ) ] = WORK[ w0 + ( i * strideWork ) ] * WORK[ w1 + ( i * strideWork ) ];
				}
				dpptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, WORK, strideWork, N * strideWork, w1 );
			}
		}

		// Normalize error
		lstres = 0.0;
		for ( i = 0; i < N; i++ ) {
			lstres = max( lstres, abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] ) );
		}
		if ( lstres !== 0.0 ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] = FERR[ offsetFERR + ( j * strideFERR ) ] / lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default dpprfs;
