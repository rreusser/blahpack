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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
var abs = Math.abs;
var max = Math.max;
var min = Math.min;
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zhbmv from './../../../../blas/base/zhbmv/lib/base.js';
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zpbtrs from '../../zpbtrs/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var ONE = new Complex128( 1.0, 0.0 );
var NEGONE = new Complex128( -1.0, 0.0 );
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );


// FUNCTIONS //

/**
* CABS1: computes |real(z)| + |imag(z)| from a Float64 view at the given index.
*
* @private
* @param {Float64Array} v - Float64 view of complex array
* @param {integer} idx - index of real part (imag is idx+1)
* @returns {number} CABS1 value
*/
function cabs1At( v, idx ) {
	return abs( v[ idx ] ) + abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Improves the computed solution to a complex system `A * X = B` where `A` is Hermitian positive definite band, and provides error bounds and backward error estimates.
*
* Uses the Cholesky factorization computed by zpbtrf. WORK (2*N complex) and
* RWORK (N real) are passed as workspace arrays.
*
* @private
* @param {string} uplo - 'upper' if upper Cholesky factor stored, 'lower' if lower
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} kd - number of superdiagonals (or subdiagonals) of A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AB - original N-by-N Hermitian band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of AB (in complex elements)
* @param {NonNegativeInteger} offsetAB - index offset for AB (in complex elements)
* @param {Complex128Array} AFB - Cholesky-factored band matrix (from zpbtrf)
* @param {integer} strideAFB1 - stride of the first dimension of AFB (in complex elements)
* @param {integer} strideAFB2 - stride of the second dimension of AFB (in complex elements)
* @param {NonNegativeInteger} offsetAFB - index offset for AFB (in complex elements)
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @param {Complex128Array} X - solution matrix (improved on exit)
* @param {integer} strideX1 - stride of the first dimension of X (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (in complex elements)
* @param {NonNegativeInteger} offsetX - index offset for X (in complex elements)
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - starting index for FERR
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - starting index for BERR
* @param {Complex128Array} WORK - complex workspace array (length >= 2*N)
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length >= N)
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @returns {integer} info - 0 if successful
*/
function zpbrfs( uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	var lstres;
	var ISAVE;
	var upper;
	var count;
	var safe1;
	var safe2;
	var KASE;
	var ABv;
	var EST;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var Wv;
	var Xv;
	var Bv;
	var sw;
	var xk;
	var nz;
	var l;
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
	nz = min( N + 1, ( 2 * kd ) + 2 );
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Reinterpret complex arrays as Float64 views for element access
	ABv = reinterpret( AB, 0 );
	Bv = reinterpret( B, 0 );
	Xv = reinterpret( X, 0 );
	Wv = reinterpret( WORK, 0 );

	// Float64 strides (complex stride * 2)
	sa1 = strideAB1 * 2;
	sa2 = strideAB2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	sw = strideWORK * 2;

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
			zcopy( N, B, strideB1, offsetB + ( j * strideB2 ), WORK, strideWORK, offsetWORK );

			// WORK(0:N-1) = B(:,j) - A * X(:,j)
			zhbmv( uplo, N, kd, NEGONE, AB, strideAB1, strideAB2, offsetAB, X, strideX1, offsetX + ( j * strideX2 ), ONE, WORK, strideWORK, offsetWORK );

			// Compute componentwise relative backward error: RWORK(i) = CABS1( B(i,j) )
			for ( i = 0; i < N; i++ ) {
				RWORK[ offsetRWORK + ( i * strideRWORK ) ] = cabs1At( Bv, ( offsetB * 2 ) + ( i * sb1 ) + ( j * sb2 ) );
			}

			// Compute abs(A)*abs(X) + abs(B), exploiting band Hermitian structure
			if ( upper ) {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					xk = cabs1At( Xv, ( offsetX * 2 ) + ( k * sx1 ) + ( j * sx2 ) );
					l = kd - k; // L = KD + 1 - K (0-based: kd - k)

					// Upper triangle: rows max(0, k-kd)..k-1
					for ( i = max( 0, k - kd ); i < k; i++ ) {
						RWORK[ offsetRWORK + ( i * strideRWORK ) ] += cabs1At( ABv, ( offsetAB * 2 ) + ( ( l + i ) * sa1 ) + ( k * sa2 ) ) * xk;
						s += cabs1At( ABv, ( offsetAB * 2 ) + ( ( l + i ) * sa1 ) + ( k * sa2 ) ) * cabs1At( Xv, ( offsetX * 2 ) + ( i * sx1 ) + ( j * sx2 ) );
					}
					// Diagonal element: for Hermitian, use abs(real part) only
					RWORK[ offsetRWORK + ( k * strideRWORK ) ] += ( abs( ABv[ ( offsetAB * 2 ) + ( kd * sa1 ) + ( k * sa2 ) ] ) * xk ) + s;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					xk = cabs1At( Xv, ( offsetX * 2 ) + ( k * sx1 ) + ( j * sx2 ) );

					// Diagonal element: for Hermitian, use abs(real part) only
					RWORK[ offsetRWORK + ( k * strideRWORK ) ] += abs( ABv[ ( offsetAB * 2 ) + ( k * sa2 ) ] ) * xk;
					l = -k; // L = 1 - K (0-based: -k)

					// Lower triangle: rows k+1..min(N-1, k+kd)
					for ( i = k + 1; i < min( N, k + kd + 1 ); i++ ) {
						RWORK[ offsetRWORK + ( i * strideRWORK ) ] += cabs1At( ABv, ( offsetAB * 2 ) + ( ( l + i ) * sa1 ) + ( k * sa2 ) ) * xk;
						s += cabs1At( ABv, ( offsetAB * 2 ) + ( ( l + i ) * sa1 ) + ( k * sa2 ) ) * cabs1At( Xv, ( offsetX * 2 ) + ( i * sx1 ) + ( j * sx2 ) );
					}
					RWORK[ offsetRWORK + ( k * strideRWORK ) ] += s;
				}
			}

			// Compute BERR(j)
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				if ( RWORK[ offsetRWORK + ( i * strideRWORK ) ] > safe2 ) {
					s = max( s, cabs1At( Wv, ( offsetWORK * 2 ) + ( i * sw ) ) / RWORK[ offsetRWORK + ( i * strideRWORK ) ] );
				} else {
					s = max( s, ( cabs1At( Wv, ( offsetWORK * 2 ) + ( i * sw ) ) + safe1 ) / ( RWORK[ offsetRWORK + ( i * strideRWORK ) ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + ( j * strideBERR ) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				// Solve A * dx = R using the Cholesky factorization
				zpbtrs( uplo, N, kd, 1, AFB, strideAFB1, strideAFB2, offsetAFB, WORK, strideWORK, N * strideWORK, offsetWORK );

				// X(:,j) += dx
				zaxpy( N, ONE, WORK, strideWORK, offsetWORK, X, strideX1, offsetX + ( j * strideX2 ) );

				lstres = s;
				count += 1;
			} else {
				break;
			}
		}

		// Bound error from formula: use ZLACN2 to estimate ||inv(A)*diag(W)||

		// Set up RWORK(i) for scaling
		for ( i = 0; i < N; i++ ) {
			if ( RWORK[ offsetRWORK + ( i * strideRWORK ) ] > safe2 ) {
				RWORK[ offsetRWORK + ( i * strideRWORK ) ] = cabs1At( Wv, ( offsetWORK * 2 ) + ( i * sw ) ) + ( nz * EPS * RWORK[ offsetRWORK + ( i * strideRWORK ) ] );
			} else {
				RWORK[ offsetRWORK + ( i * strideRWORK ) ] = cabs1At( Wv, ( offsetWORK * 2 ) + ( i * sw ) ) + ( nz * EPS * RWORK[ offsetRWORK + ( i * strideRWORK ) ] ) + safe1;
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
				// Multiply by diag(W)*inv(A^H)
				// Since A is Hermitian, A^H = A, so just solve A*z = x
				zpbtrs( uplo, N, kd, 1, AFB, strideAFB1, strideAFB2, offsetAFB, WORK, strideWORK, N * strideWORK, offsetWORK );
				for ( i = 0; i < N; i++ ) {
					// WORK(i) = RWORK(i) * WORK(i) — scale complex by real
					Wv[ ( offsetWORK * 2 ) + ( i * sw ) ] *= RWORK[ offsetRWORK + ( i * strideRWORK ) ];
					Wv[ ( offsetWORK * 2 ) + ( i * sw ) + 1 ] *= RWORK[ offsetRWORK + ( i * strideRWORK ) ];
				}
			} else {
				// Multiply by inv(A)*diag(W)
				for ( i = 0; i < N; i++ ) {
					// WORK(i) = RWORK(i) * WORK(i) — scale complex by real
					Wv[ ( offsetWORK * 2 ) + ( i * sw ) ] *= RWORK[ offsetRWORK + ( i * strideRWORK ) ];
					Wv[ ( offsetWORK * 2 ) + ( i * sw ) + 1 ] *= RWORK[ offsetRWORK + ( i * strideRWORK ) ];
				}
				zpbtrs( uplo, N, kd, 1, AFB, strideAFB1, strideAFB2, offsetAFB, WORK, strideWORK, N * strideWORK, offsetWORK );
			}
		}

		// Normalize error
		lstres = 0.0;
		for ( i = 0; i < N; i++ ) {
			lstres = max( lstres, cabs1At( Xv, ( offsetX * 2 ) + ( i * sx1 ) + ( j * sx2 ) ) );
		}
		if ( lstres !== 0.0 ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] /= lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default zpbrfs;
