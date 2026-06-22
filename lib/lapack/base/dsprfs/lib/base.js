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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dspmv from './../../../../blas/base/dspmv/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import dsptrs from '../../dsptrs/lib/base.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Improves the computed solution to a system of linear equations when the.
* coefficient matrix is symmetric indefinite in packed storage, and provides
* error bounds and backward error estimates for the solution.
*
* Uses the factorization A = U_D_U^T or A = L_D_L^T computed by dsptrf.
* WORK (3*N) and IWORK (N) are allocated internally.
*
* IPIV must contain 0-based pivot indices (as produced by dsptrf).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AP - original symmetric packed matrix, length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} AFP - factored packed matrix from dsptrf, length N*(N+1)/2
* @param {integer} strideAFP - stride length for `AFP`
* @param {NonNegativeInteger} offsetAFP - starting index for `AFP`
* @param {Int32Array} IPIV - pivot indices from dsptrf (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
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
* @param {Float64Array} WORK - workspace (unused, allocated internally)
* @param {integer} strideWORK - stride for WORK (unused)
* @param {NonNegativeInteger} offsetWORK - offset for WORK (unused)
* @param {Int32Array} IWORK - workspace (unused, allocated internally)
* @param {integer} strideIWORK - stride for IWORK (unused)
* @param {NonNegativeInteger} offsetIWORK - offset for IWORK (unused)
* @returns {integer} info - 0 if successful
*/
function dsprfs( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) { // eslint-disable-line max-len, max-params, no-unused-vars
	var lstres;
	var upper;
	var count;
	var ISAVE;
	var safe1;
	var safe2;
	var IWRK;
	var KASE;
	var WRK;
	var EST;
	var xk;
	var nz;
	var ik;
	var kk;
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

	// Allocate workspace: WRK has 3 segments of N doubles, IWRK has N ints
	WRK = new Float64Array( 3 * N );
	IWRK = new Int32Array( N );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	ISAVE = new Int32Array( 3 );

	// Do for each right-hand side
	for ( j = 0; j < nrhs; j++ ) {
		count = 1;
		lstres = 3.0;

		// Loop until stopping criterion is satisfied
		while ( true ) { // eslint-disable-line no-constant-condition
			// Compute residual R = B - A * X
			// Copy B(:,j) into WRK(N:2N-1)
			dcopy( N, B, strideB1, offsetB + ( j * strideB2 ), WRK, 1, N );

			// WRK(N:2N-1) = B(:,j) - A * X(:,j) using packed symmetric MV
			dspmv( uplo, N, -1.0, AP, strideAP, offsetAP, X, strideX1, offsetX + ( j * strideX2 ), 1.0, WRK, 1, N );

			// Compute componentwise relative backward error

			// WRK(0:N-1) = abs(B(:,j))
			for ( i = 0; i < N; i++ ) {
				WRK[ i ] = Math.abs( B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] );
			}

			// Compute abs(A)*abs(X) + abs(B) using packed storage
			kk = 0;
			if ( upper ) {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					xk = Math.abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
					ik = kk;
					for ( i = 0; i < k; i++ ) {
						WRK[ i ] += Math.abs( AP[ offsetAP + ( ik * strideAP ) ] ) * xk;
						s += Math.abs( AP[ offsetAP + ( ik * strideAP ) ] ) * Math.abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] );
						ik += 1;
					}
					WRK[ k ] += ( Math.abs( AP[ offsetAP + ( ( kk + k ) * strideAP ) ] ) * xk ) + s;
					kk += k + 1;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					xk = Math.abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
					WRK[ k ] += Math.abs( AP[ offsetAP + ( kk * strideAP ) ] ) * xk;
					ik = kk + 1;
					for ( i = k + 1; i < N; i++ ) {
						WRK[ i ] += Math.abs( AP[ offsetAP + ( ik * strideAP ) ] ) * xk;
						s += Math.abs( AP[ offsetAP + ( ik * strideAP ) ] ) * Math.abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] );
						ik += 1;
					}
					WRK[ k ] += s;
					kk += N - k;
				}
			}

			// Compute BERR(j)
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				if ( WRK[ i ] > safe2 ) {
					s = Math.max( s, Math.abs( WRK[ N + i ] ) / WRK[ i ] );
				} else {
					s = Math.max( s, ( Math.abs( WRK[ N + i ] ) + safe1 ) / ( WRK[ i ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + ( j * strideBERR ) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				// Update solution: solve A * dx = R using the packed factorization
				dsptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, N );

				// X(:,j) += dx
				daxpy( N, 1.0, WRK, 1, N, X, strideX1, offsetX + ( j * strideX2 ) );

				lstres = s;
				count += 1;
			} else {
				break;
			}
		}

		// Bound error from formula using DLACN2 to estimate the infinity-norm
		// Of inv(A) * diag(W)

		// Set up WRK(0:N-1) = abs(R) + NZ*EPS*(abs(A)*abs(X)+abs(B))
		for ( i = 0; i < N; i++ ) {
			if ( WRK[ i ] > safe2 ) {
				WRK[ i ] = Math.abs( WRK[ N + i ] ) + ( nz * EPS * WRK[ i ] );
			} else {
				WRK[ i ] = Math.abs( WRK[ N + i ] ) + ( nz * EPS * WRK[ i ] ) + safe1;
			}
		}

		KASE[ 0 ] = 0;

		// dlacn2 reverse communication loop
		while ( true ) { // eslint-disable-line no-constant-condition
			EST[ 0 ] = FERR[ offsetFERR + ( j * strideFERR ) ];
			dlacn2( N, WRK, 1, ( 2 * N ), WRK, 1, N, IWRK, 1, 0, EST, KASE, ISAVE, 1, 0 );
			FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W)*inv(A^T)
				// Since A is symmetric, A^T = A, so we use the same uplo
				dsptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, N );
				for ( i = 0; i < N; i++ ) {
					WRK[ N + i ] = WRK[ i ] * WRK[ N + i ];
				}
			} else {
				// Multiply by inv(A)*diag(W)
				for ( i = 0; i < N; i++ ) {
					WRK[ N + i ] = WRK[ i ] * WRK[ N + i ];
				}
				dsptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, N );
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

export default dsprfs;
