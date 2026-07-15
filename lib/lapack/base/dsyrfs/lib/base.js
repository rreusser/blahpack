/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dsymv from './../../../../blas/base/dsymv/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import dsytrs from '../../dsytrs/lib/base.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Improves the computed solution to a system of linear equations when the.
* coefficient matrix is symmetric indefinite, and provides error bounds
* and backward error estimates for the solution.
*
* Uses the factorization A = U_D_U^T or A = L_D_L^T computed by dsytrf.
*
* IPIV must contain 0-based pivot indices (as produced by dsytf2/dsytrf).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - original symmetric N-by-N matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} AF - factored N-by-N matrix (from dsytrf)
* @param {integer} strideAF1 - stride of the first dimension of AF
* @param {integer} strideAF2 - stride of the second dimension of AF
* @param {NonNegativeInteger} offsetAF - index offset for AF
* @param {Int32Array} IPIV - pivot indices from dsytrf (0-based)
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
* @param {Float64Array} WORK - caller-owned workspace of at least `3*N` elements (partitioned into three contiguous N-length segments); base.js never allocates
* @param {integer} strideWork - stride for WORK (must be 1; workspace is contiguous)
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Int32Array} IWORK - caller-owned integer workspace of at least `N` elements; base.js never allocates
* @param {integer} strideIWork - stride for IWORK (must be 1; workspace is contiguous)
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @returns {integer} info - 0 if successful
*/
function dsyrfs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
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

	// Partition the caller-owned workspace: WRK has 3 contiguous N-length
	// segments (indexed [0:N], [N:2N], [2N:3N]); IWRK has N ints. base.js never
	// allocates — the caller (wrapper/ndarray) owns and sizes the buffers.
	WRK = ( offsetWork === 0 ) ? WORK : WORK.subarray( offsetWork );
	IWRK = ( offsetIWork === 0 ) ? IWORK : IWORK.subarray( offsetIWork );

	// Fixed-size bookkeeping arrays for the DLACN2 reverse-communication loop.
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

			// WRK(N:2N-1) = B(:,j) - A * X(:,j)

			// dsymv: y := alpha*A*x + beta*y
			dsymv( uplo, N, -1.0, A, strideA1, strideA2, offsetA, X, strideX1, offsetX + ( j * strideX2 ), 1.0, WRK, 1, N );

			// Compute componentwise relative backward error

			// WRK(0:N-1) = abs(B(:,j))
			for ( i = 0; i < N; i++ ) {
				WRK[ i ] = Math.abs( B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] );
			}

			// Compute abs(A)*abs(X) + abs(B)
			if ( upper ) {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					xk = Math.abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
					for ( i = 0; i < k; i++ ) {
						WRK[ i ] += Math.abs( A[ offsetA + ( i * strideA1 ) + ( k * strideA2 ) ] ) * xk;
						s += Math.abs( A[ offsetA + ( i * strideA1 ) + ( k * strideA2 ) ] ) * Math.abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] );
					}
					WRK[ k ] += Math.abs( A[ offsetA + ( k * strideA1 ) + ( k * strideA2 ) ] ) * xk + s;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					xk = Math.abs( X[ offsetX + ( k * strideX1 ) + ( j * strideX2 ) ] );
					WRK[ k ] += Math.abs( A[ offsetA + ( k * strideA1 ) + ( k * strideA2 ) ] ) * xk;
					for ( i = k + 1; i < N; i++ ) {
						WRK[ i ] += Math.abs( A[ offsetA + ( i * strideA1 ) + ( k * strideA2 ) ] ) * xk;
						s += Math.abs( A[ offsetA + ( i * strideA1 ) + ( k * strideA2 ) ] ) * Math.abs( X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] );
					}
					WRK[ k ] += s;
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
				// Update solution: solve A * dx = R using the factorization
				dsytrs( uplo, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, N );

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
				dsytrs( uplo, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, N );
				for ( i = 0; i < N; i++ ) {
					WRK[ N + i ] = WRK[ i ] * WRK[ N + i ];
				}
			} else {
				// Multiply by inv(A)*diag(W)
				for ( i = 0; i < N; i++ ) {
					WRK[ N + i ] = WRK[ i ] * WRK[ N + i ];
				}
				dsytrs( uplo, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, N );
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

export default dsyrfs;
