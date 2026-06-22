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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zgbmv from './../../../../blas/base/zgbmv/lib/base.js';
import zgbtrs from '../../zgbtrs/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );
var CONE = new Complex128( 1.0, 0.0 );
var CNONE = new Complex128( -1.0, 0.0 );


// FUNCTIONS //

/**
* Computes CABS1 = |re(z)| + |im(z)|.
*
* @private
* @param {Float64Array} v - Float64 view
* @param {integer} idx - index of real part
* @returns {number} CABS1 value
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Improves the computed solution to a complex system of linear equations.
* _A_ _ _X_ = _B_ or _A^H_ _ _X_ = _B_ where _A_ is a general band matrix,
* and provides error bounds and backward error estimates for the solution.
*
* Uses the LU factorization computed by zgbtrf. WORK (Complex128Array of
* length 2*N) and RWORK (Float64Array of length N) are caller-provided
* workspace.
*
* IPIV must contain 0-based pivot indices (as produced by zgbtrf).
*
* @private
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AB - original band matrix in band storage (KL+KU+1 by N)
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Complex128Array} AFB - LU-factored band matrix from zgbtrf (2*KL+KU+1 by N)
* @param {integer} strideAFB1 - stride of the first dimension of AFB
* @param {integer} strideAFB2 - stride of the second dimension of AFB
* @param {NonNegativeInteger} offsetAFB - starting index for AFB
* @param {Int32Array} IPIV - pivot indices from zgbtrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Complex128Array} B - right-hand side matrix (N by NRHS)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Complex128Array} X - solution matrix (improved on exit)
* @param {integer} strideX1 - stride of the first dimension of X
* @param {integer} strideX2 - stride of the second dimension of X
* @param {NonNegativeInteger} offsetX - starting index for X
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - starting index for FERR
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - starting index for BERR
* @param {Complex128Array} WORK - complex workspace of length at least 2*N
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of length at least N
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @returns {integer} info - 0 if successful
*/
function zgbrfs( trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) {
	var notran;
	var transn;
	var transt;
	var lstres;
	var count;
	var ISAVE;
	var safe1;
	var safe2;
	var KASE;
	var EST;
	var wv;
	var xv;
	var bv;
	var av;
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
		transn = 'no-transpose';
		transt = 'conjugate-transpose';
	} else {
		transn = 'conjugate-transpose';
		transt = 'no-transpose';
	}

	// NZ = maximum number of nonzero entries in each row of A, plus 1
	nz = Math.min( kl + ku + 2, N + 1 );
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Allocate state arrays for zlacn2
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	// Float64 views for complex arrays
	wv = reinterpret( WORK, 0 );
	xv = reinterpret( X, 0 );
	bv = reinterpret( B, 0 );
	av = reinterpret( AB, 0 );

	// Do for each right-hand side
	for ( j = 0; j < nrhs; j++ ) {
		count = 1;
		lstres = 3.0;

		// Iterative refinement loop
		while ( true ) { // eslint-disable-line no-constant-condition
			// Compute residual R = B(:,j) - op(A) * X(:,j)
			// Copy B(:,j) into WORK(0:N-1)
			zcopy( N, B, strideB1, offsetB + ( j * strideB2 ), WORK, strideWORK, offsetWORK );

			// WORK = B(:,j) + (-1)*op(A)*X(:,j)  (i.e. WORK = B(:,j) - op(A)*X(:,j))
			zgbmv( trans, N, N, kl, ku, CNONE, AB, strideAB1, strideAB2, offsetAB, X, strideX1, offsetX + ( j * strideX2 ), CONE, WORK, strideWORK, offsetWORK );

			// Compute componentwise relative backward error

			// RWORK(i) = |B(i,j)|
			for ( i = 0; i < N; i++ ) {
				RWORK[ offsetRWORK + ( i * strideRWORK ) ] = cabs1( bv, ( offsetB + ( i * strideB1 ) + ( j * strideB2 ) ) * 2 );
			}

			// Add |op(A)| * |X(:,j)| to RWORK
			if ( notran ) {
				// RWORK(i) += sum_k |A(i,k)| * |X(k,j)|
				for ( k = 0; k < N; k++ ) {
					kk = ku - k; // row offset in band storage: band row = KU + i - k
					xk = cabs1( xv, ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2 );
					for ( i = Math.max( 0, k - ku ); i < Math.min( N, k + kl + 1 ); i++ ) {
						RWORK[ offsetRWORK + ( i * strideRWORK ) ] += cabs1( av, ( offsetAB + ( ( kk + i ) * strideAB1 ) + ( k * strideAB2 ) ) * 2 ) * xk;
					}
				}
			} else {
				// RWORK(k) += sum_i |A(i,k)| * |X(i,j)|
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					kk = ku - k;
					for ( i = Math.max( 0, k - ku ); i < Math.min( N, k + kl + 1 ); i++ ) {
						s += cabs1( av, ( offsetAB + ( ( kk + i ) * strideAB1 ) + ( k * strideAB2 ) ) * 2 ) * cabs1( xv, ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2 );
					}
					RWORK[ offsetRWORK + ( k * strideRWORK ) ] += s;
				}
			}

			// Compute BERR(j)
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				pw = offsetRWORK + ( i * strideRWORK );
				if ( RWORK[ pw ] > safe2 ) {
					s = Math.max( s, cabs1( wv, ( offsetWORK + ( i * strideWORK ) ) * 2 ) / RWORK[ pw ] );
				} else {
					s = Math.max( s, ( cabs1( wv, ( offsetWORK + ( i * strideWORK ) ) * 2 ) + safe1 ) / ( RWORK[ pw ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + ( j * strideBERR ) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				// Solve op(A) * dx = R
				zgbtrs( trans, N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, N * strideWORK, offsetWORK );

				// X(:,j) += dx
				zaxpy( N, CONE, WORK, strideWORK, offsetWORK, X, strideX1, offsetX + ( j * strideX2 ) );

				lstres = s;
				count += 1;
			} else {
				break;
			}
		}

		// Bound error from formula using ZLACN2
		// RWORK(i) = |R(i)| + NZ*EPS*(|op(A)|*|X| + |B|)(i)
		for ( i = 0; i < N; i++ ) {
			pw = offsetRWORK + ( i * strideRWORK );
			if ( RWORK[ pw ] > safe2 ) {
				RWORK[ pw ] = cabs1( wv, ( offsetWORK + ( i * strideWORK ) ) * 2 ) + ( nz * EPS * RWORK[ pw ] );
			} else {
				RWORK[ pw ] = cabs1( wv, ( offsetWORK + ( i * strideWORK ) ) * 2 ) + ( nz * EPS * RWORK[ pw ] ) + safe1;
			}
		}

		KASE[ 0 ] = 0;

		// zlacn2 reverse communication loop
		while ( true ) { // eslint-disable-line no-constant-condition
			EST[ 0 ] = FERR[ offsetFERR + ( j * strideFERR ) ];
			zlacn2( N, WORK, strideWORK, offsetWORK + ( N * strideWORK ), WORK, strideWORK, offsetWORK, EST, KASE, ISAVE, 1, 0 );
			FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W) * inv(op(A)^H)
				zgbtrs( transt, N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, N * strideWORK, offsetWORK );
				for ( i = 0; i < N; i++ ) {
					pw = ( offsetWORK + ( i * strideWORK ) ) * 2;
					wv[ pw ] *= RWORK[ offsetRWORK + ( i * strideRWORK ) ];
					wv[ pw + 1 ] *= RWORK[ offsetRWORK + ( i * strideRWORK ) ];
				}
			} else {
				// Multiply by inv(op(A)) * diag(W)
				for ( i = 0; i < N; i++ ) {
					pw = ( offsetWORK + ( i * strideWORK ) ) * 2;
					wv[ pw ] *= RWORK[ offsetRWORK + ( i * strideRWORK ) ];
					wv[ pw + 1 ] *= RWORK[ offsetRWORK + ( i * strideRWORK ) ];
				}
				zgbtrs( transn, N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, N * strideWORK, offsetWORK );
			}
		}

		// Normalize error: FERR(j) /= max_i |X(i,j)|
		lstres = 0.0;
		for ( i = 0; i < N; i++ ) {
			lstres = Math.max( lstres, cabs1( xv, ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2 ) );
		}
		if ( lstres !== 0.0 ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] /= lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default zgbrfs;
