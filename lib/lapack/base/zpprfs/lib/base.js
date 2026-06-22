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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
var abs = Math.abs;
var max = Math.max;
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zhpmv from './../../../../blas/base/zhpmv/lib/base.js';
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zpptrs from '../../zpptrs/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var CONE = new Complex128( 1.0, 0.0 );
var NCONE = new Complex128( -1.0, 0.0 );
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );


// FUNCTIONS //

/**
* CABS1 returns |re(z)| + |im(z)|, matching the Fortran CABS1 statement function.
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
* Improves the computed solution to a complex system of linear equations when.
* the coefficient matrix is Hermitian positive definite stored in packed format,
* and provides error bounds and backward error estimates for the solution.
*
* Uses the Cholesky factorization computed by zpptrf.
*
* @private
* @param {string} uplo - 'upper' if upper Cholesky factor stored, 'lower' if lower
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AP - original Hermitian matrix in packed storage
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Complex128Array} AFP - Cholesky-factored matrix in packed storage (from zpptrf)
* @param {integer} strideAFP - stride length for `AFP` (in complex elements)
* @param {NonNegativeInteger} offsetAFP - starting index for `AFP` (in complex elements)
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128Array} X - solution matrix (improved on exit)
* @param {integer} strideX1 - stride of the first dimension of X (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for X (in complex elements)
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - starting index for FERR
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - starting index for BERR
* @param {Complex128Array} WORK - workspace array (length >= 2*N)
* @param {integer} strideWORK - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length >= N)
* @param {integer} strideRWORK - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWORK - starting index for `RWORK`
* @returns {integer} info - 0 if successful
*/
function zpprfs( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	var lstres;
	var upper;
	var count;
	var ISAVE;
	var safe1;
	var safe2;
	var KASE;
	var EST;
	var APv;
	var sap;
	var oap;
	var xv;
	var bv;
	var wv;
	var xk;
	var nz;
	var ik;
	var kk;
	var w0;
	var w1;
	var pa;
	var px;
	var rw;
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

	// Reinterpret complex arrays as Float64 views for element access
	APv = reinterpret( AP, 0 );
	sap = strideAP * 2;
	oap = offsetAP * 2;
	xv = reinterpret( X, 0 );
	bv = reinterpret( B, 0 );
	wv = reinterpret( WORK, 0 );

	// Workspace segment offsets (in complex elements)
	w0 = offsetWORK;                        // WORK(0:N-1)
	w1 = offsetWORK + ( N * strideWORK );   // WORK(N:2N-1)

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
			// Copy B(:,j) into WORK(0:N-1)
			zcopy( N, B, strideB1, offsetB + ( j * strideB2 ), WORK, strideWORK, w0 );

			// WORK(0:N-1) = B(:,j) - A * X(:,j)
			zhpmv( uplo, N, NCONE, AP, strideAP, offsetAP, X, strideX1, offsetX + ( j * strideX2 ), CONE, WORK, strideWORK, w0 );

			// Compute componentwise relative backward error

			// RWORK(0:N-1) = CABS1( B(:,j) )
			for ( i = 0; i < N; i++ ) {
				px = ( offsetB + ( i * strideB1 ) + ( j * strideB2 ) ) * 2;
				RWORK[ offsetRWORK + ( i * strideRWORK ) ] = cabs1( bv[ px ], bv[ px + 1 ] );
			}

			// Compute abs(A)*abs(X) + abs(B), exploiting Hermitian packed storage
			kk = 0;
			if ( upper ) {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					px = ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2;
					xk = cabs1( xv[ px ], xv[ px + 1 ] );
					ik = kk;

					// Upper triangle: rows 0..k-1
					for ( i = 0; i < k; i++ ) {
						pa = oap + ( ik * sap );
						RWORK[ offsetRWORK + ( i * strideRWORK ) ] += cabs1( APv[ pa ], APv[ pa + 1 ] ) * xk;
						px = ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2;
						s += cabs1( APv[ pa ], APv[ pa + 1 ] ) * cabs1( xv[ px ], xv[ px + 1 ] );
						ik += 1;
					}
					// Diagonal element: Hermitian => only real part contributes
					pa = oap + ( ( kk + k ) * sap );
					RWORK[ offsetRWORK + ( k * strideRWORK ) ] += ( abs( APv[ pa ] ) * xk ) + s;
					kk += k + 1;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					px = ( offsetX + ( k * strideX1 ) + ( j * strideX2 ) ) * 2;
					xk = cabs1( xv[ px ], xv[ px + 1 ] );

					// Diagonal element
					pa = oap + ( kk * sap );
					RWORK[ offsetRWORK + ( k * strideRWORK ) ] += abs( APv[ pa ] ) * xk;
					ik = kk + 1;

					// Lower triangle: rows k+1..N-1
					for ( i = k + 1; i < N; i++ ) {
						pa = oap + ( ik * sap );
						RWORK[ offsetRWORK + ( i * strideRWORK ) ] += cabs1( APv[ pa ], APv[ pa + 1 ] ) * xk;
						px = ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2;
						s += cabs1( APv[ pa ], APv[ pa + 1 ] ) * cabs1( xv[ px ], xv[ px + 1 ] );
						ik += 1;
					}
					RWORK[ offsetRWORK + ( k * strideRWORK ) ] += s;
					kk += N - k;
				}
			}

			// Compute BERR(j)
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				px = ( w0 + ( i * strideWORK ) ) * 2;
				rw = RWORK[ offsetRWORK + ( i * strideRWORK ) ];
				if ( rw > safe2 ) {
					s = max( s, cabs1( wv[ px ], wv[ px + 1 ] ) / rw );
				} else {
					s = max( s, ( cabs1( wv[ px ], wv[ px + 1 ] ) + safe1 ) / ( rw + safe1 ) );
				}
			}
			BERR[ offsetBERR + ( j * strideBERR ) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				// Solve A * dx = R using the Cholesky factorization
				zpptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, WORK, strideWORK, N * strideWORK, w0 );

				// X(:,j) += dx
				zaxpy( N, CONE, WORK, strideWORK, w0, X, strideX1, offsetX + ( j * strideX2 ) );

				lstres = s;
				count += 1;
			} else {
				break;
			}
		}

		// Bound error from formula using ZLACN2 to estimate the infinity-norm

		// Set up RWORK(0:N-1) = CABS1(R) + NZ*EPS*(abs(A)*abs(X)+abs(B))
		for ( i = 0; i < N; i++ ) {
			px = ( w0 + ( i * strideWORK ) ) * 2;
			rw = RWORK[ offsetRWORK + ( i * strideRWORK ) ];
			if ( rw > safe2 ) {
				RWORK[ offsetRWORK + ( i * strideRWORK ) ] = cabs1( wv[ px ], wv[ px + 1 ] ) + ( nz * EPS * rw );
			} else {
				RWORK[ offsetRWORK + ( i * strideRWORK ) ] = cabs1( wv[ px ], wv[ px + 1 ] ) + ( nz * EPS * rw ) + safe1;
			}
		}

		KASE[ 0 ] = 0;

		// zlacn2 reverse communication loop
		while ( true ) { // eslint-disable-line no-constant-condition
			EST[ 0 ] = FERR[ offsetFERR + ( j * strideFERR ) ];
			zlacn2( N, WORK, strideWORK, w1, WORK, strideWORK, w0, EST, KASE, ISAVE, 1, 0 );
			FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W)*inv(A^H)
				// Since A is Hermitian, A^H = A, so just solve A*z = x
				zpptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, WORK, strideWORK, N * strideWORK, w0 );
				for ( i = 0; i < N; i++ ) {
					px = ( w0 + ( i * strideWORK ) ) * 2;
					rw = RWORK[ offsetRWORK + ( i * strideRWORK ) ];
					wv[ px ] = rw * wv[ px ];
					wv[ px + 1 ] = rw * wv[ px + 1 ];
				}
			} else {
				// Multiply by inv(A)*diag(W)
				for ( i = 0; i < N; i++ ) {
					px = ( w0 + ( i * strideWORK ) ) * 2;
					rw = RWORK[ offsetRWORK + ( i * strideRWORK ) ];
					wv[ px ] = rw * wv[ px ];
					wv[ px + 1 ] = rw * wv[ px + 1 ];
				}
				zpptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, WORK, strideWORK, N * strideWORK, w0 );
			}
		}

		// Normalize error
		lstres = 0.0;
		for ( i = 0; i < N; i++ ) {
			px = ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2;
			lstres = max( lstres, cabs1( xv[ px ], xv[ px + 1 ] ) );
		}
		if ( lstres !== 0.0 ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] = FERR[ offsetFERR + ( j * strideFERR ) ] / lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default zpprfs;
