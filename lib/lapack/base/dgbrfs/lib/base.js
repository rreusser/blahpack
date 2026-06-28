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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import dgbmv from './../../../../blas/base/dgbmv/lib/base.js';
import dgbtrs from '../../dgbtrs/lib/base.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Improves the computed solution to a real system of linear equations where the coefficient matrix is banded, and provides error bounds and backward error estimates for the solution.
*
* Uses the LU factorization computed by dgbtrf. WORK (Float64Array of length 3\*N) and IWORK (Int32Array of length N) are caller-provided workspace.
*
* IPIV must contain 0-based pivot indices (as produced by dgbtrf).
*
* @private
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AB - original band matrix in band storage (KL+KU+1 by N)
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Float64Array} AFB - LU-factored band matrix from dgbtrf (2*KL+KU+1 by N)
* @param {integer} strideAFB1 - stride of the first dimension of AFB
* @param {integer} strideAFB2 - stride of the second dimension of AFB
* @param {NonNegativeInteger} offsetAFB - starting index for AFB
* @param {Int32Array} IPIV - pivot indices from dgbtrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Float64Array} B - right-hand side matrix (N by NRHS)
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
* @param {Float64Array} WORK - workspace of length at least 3*N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Int32Array} IWORK - integer workspace of length at least N
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @returns {integer} info - 0 if successful
*/
function dgbrfs( trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) {
	var notran;
	var transt;
	var lstres;
	var count;
	var ISAVE;
	var safe1;
	var safe2;
	var KASE;
	var EST;
	var nz;
	var xk;
	var kk;
	var pw;
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

	// NZ = maximum number of nonzero entries in each row of A, plus 1
	nz = Math.min( kl + ku + 2, N + 1 );
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Allocate state arrays for dlacn2
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	// Do for each right-hand side
	for ( j = 0; j < nrhs; j++ ) {
		count = 1;
		lstres = 3.0;

		// Iterative refinement loop
		while ( true ) { // eslint-disable-line no-constant-condition
			// Compute residual R = B(:,j) - op(A) * X(:,j)
			// Copy B(:,j) into WORK(N:2N-1)
			dcopy( N, B, strideB1, offsetB + ( j * strideB2 ), WORK, strideWork, offsetWork + ( N * strideWork ) );

			// WORK(N:2N-1) = B(:,j) + (-1)*op(A)*X(:,j)  (i.e. R = B(:,j) - op(A)*X(:,j))
			dgbmv( trans, N, N, kl, ku, -1.0, AB, strideAB1, strideAB2, offsetAB, X, strideX1, offsetX + ( j * strideX2 ), 1.0, WORK, strideWork, offsetWork + ( N * strideWork ) );

			// Compute componentwise relative backward error: WORK(0:N-1)(i) = |B(i,j)|
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + ( i * strideWork ) ] = Math.abs( B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] );
			}

			// Add |op(A)| * |X(:,j)| to WORK(0:N-1)
			if ( notran ) {
				for ( k = 0; k < N; k++ ) {
					kk = ku - k; // row offset in band storage: band row = KU + i - k
					xk = Math.abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
					for ( i = Math.max( 0, k - ku ); i < Math.min( N, k + kl + 1 ); i++ ) {
						WORK[ offsetWork + ( i * strideWork ) ] += Math.abs( AB[ offsetAB + ( ( kk + i ) * strideAB1 ) + ( k * strideAB2 ) ] ) * xk;
					}
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					kk = ku - k;
					for ( i = Math.max( 0, k - ku ); i < Math.min( N, k + kl + 1 ); i++ ) {
						s += Math.abs( AB[ offsetAB + ( ( kk + i ) * strideAB1 ) + ( k * strideAB2 ) ] ) * Math.abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] );
					}
					WORK[ offsetWork + ( k * strideWork ) ] += s;
				}
			}

			// Compute BERR(j)
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				pw = offsetWork + ( i * strideWork );
				if ( WORK[ pw ] > safe2 ) {
					s = Math.max( s, Math.abs( WORK[ offsetWork + ( ( N + i ) * strideWork ) ] ) / WORK[ pw ] );
				} else {
					s = Math.max( s, ( Math.abs( WORK[ offsetWork + ( ( N + i ) * strideWork ) ] ) + safe1 ) / ( WORK[ pw ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + ( j * strideBERR ) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				// Solve op(A) * dx = R
				dgbtrs( trans, N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork + ( N * strideWork ) );

				// X(:,j) += dx
				daxpy( N, 1.0, WORK, strideWork, offsetWork + ( N * strideWork ), X, strideX1, offsetX + ( j * strideX2 ) );

				lstres = s;
				count += 1;
			} else {
				break;
			}
		}

		// Bound error from formula using DLACN2
		// WORK(0:N-1)(i) = |R(i)| + NZ*EPS*(|op(A)|*|X| + |B|)(i)
		for ( i = 0; i < N; i++ ) {
			pw = offsetWork + ( i * strideWork );
			if ( WORK[ pw ] > safe2 ) {
				WORK[ pw ] = Math.abs( WORK[ offsetWork + ( ( N + i ) * strideWork ) ] ) + ( nz * EPS * WORK[ pw ] );
			} else {
				WORK[ pw ] = Math.abs( WORK[ offsetWork + ( ( N + i ) * strideWork ) ] ) + ( nz * EPS * WORK[ pw ] ) + safe1;
			}
		}

		KASE[ 0 ] = 0;

		// dlacn2 reverse communication loop
		while ( true ) { // eslint-disable-line no-constant-condition
			EST[ 0 ] = FERR[ offsetFERR + ( j * strideFERR ) ];
			dlacn2( N, WORK, strideWork, offsetWork + ( 2 * N * strideWork ), WORK, strideWork, offsetWork + ( N * strideWork ), IWORK, strideIWork, offsetIWork, EST, KASE, ISAVE, 1, 0 );
			FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W) * inv(op(A)^T)
				dgbtrs( transt, N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork + ( N * strideWork ) );
				for ( i = 0; i < N; i++ ) {
					WORK[ offsetWork + ( ( N + i ) * strideWork ) ] *= WORK[ offsetWork + ( i * strideWork ) ];
				}
			} else {
				// Multiply by inv(op(A)) * diag(W)
				for ( i = 0; i < N; i++ ) {
					WORK[ offsetWork + ( ( N + i ) * strideWork ) ] *= WORK[ offsetWork + ( i * strideWork ) ];
				}
				dgbtrs( trans, N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork + ( N * strideWork ) );
			}
		}

		// Normalize error: FERR(j) /= max_i |X(i,j)|
		lstres = 0.0;
		for ( i = 0; i < N; i++ ) {
			lstres = Math.max( lstres, Math.abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] ) );
		}
		if ( lstres !== 0.0 ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] /= lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default dgbrfs;
