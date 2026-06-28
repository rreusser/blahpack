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

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zhemv from './../../../../blas/base/zhemv/lib/base.js';
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zpotrs from '../../zpotrs/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var CONE = new Complex128( 1.0, 0.0 );
var MCONE = new Complex128( -1.0, 0.0 );
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );


// FUNCTIONS //

/**
* CABS1: |re(z)| + |im(z)|.
*
* @private
* @param {Float64Array} v - Float64 view of complex array
* @param {integer} idx - index of real part
* @returns {number} CABS1 value
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Improves the computed solution to a system of linear equations when the.
* coefficient matrix is Hermitian positive definite, and provides error
* bounds and backward error estimates for the solution.
*
* Uses the Cholesky factorization computed by zpotrf.
*
* @private
* @param {string} uplo - 'upper' if upper Cholesky factor stored, 'lower' if lower
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - original N-by-N Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Complex128Array} AF - Cholesky-factored N-by-N matrix (from zpotrf)
* @param {integer} strideAF1 - stride of the first dimension of AF (complex elements)
* @param {integer} strideAF2 - stride of the second dimension of AF (complex elements)
* @param {NonNegativeInteger} offsetAF - index offset for AF (complex elements)
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (complex elements)
* @param {Complex128Array} X - solution matrix (improved on exit)
* @param {integer} strideX1 - stride of the first dimension of X (complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (complex elements)
* @param {NonNegativeInteger} offsetX - index offset for X (complex elements)
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - index offset for FERR
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - index offset for BERR
* @param {Complex128Array} WORK - workspace of length 2*N (complex)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of length N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - offset for RWORK
* @returns {integer} info - 0 if successful
*/
function zporfs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var lstres;
	var upper;
	var count;
	var ISAVE;
	var safe1;
	var safe2;
	var KASE;
	var EST;
	var Av;
	var Xv;
	var Bv;
	var Wv;
	var sa1;
	var sa2;
	var sx1;
	var sx2;
	var sb1;
	var sb2;
	var sw;
	var oA;
	var oX;
	var oB;
	var oW;
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

	// Float64 views of complex arrays
	Av = reinterpret( A, 0 );
	Xv = reinterpret( X, 0 );
	Bv = reinterpret( B, 0 );
	Wv = reinterpret( WORK, 0 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sw = strideWork * 2;
	oA = offsetA * 2;
	oX = offsetX * 2;
	oB = offsetB * 2;
	oW = offsetWork * 2;

	// Allocate state arrays for zlacn2
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
			// Copy B(:,j) into WORK
			zcopy( N, B, strideB1, offsetB + ( j * strideB2 ), WORK, strideWork, offsetWork );

			// WORK = B(:,j) - A * X(:,j) = -1*A*X + 1*WORK
			zhemv( uplo, N, MCONE, A, strideA1, strideA2, offsetA, X, strideX1, offsetX + ( j * strideX2 ), CONE, WORK, strideWork, offsetWork );

			// Compute componentwise relative backward error

			// RWORK(i) = |B(i,j)|
			for ( i = 0; i < N; i++ ) {
				RWORK[ offsetRWork + ( i * strideRWork ) ] = cabs1( Bv, oB + ( i * sb1 ) + ( j * sb2 ) );
			}

			// Compute |A|*|X| + |B|, exploiting Hermitian structure
			if ( upper ) {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					xk = cabs1( Xv, oX + ( k * sx1 ) + ( j * sx2 ) );

					// Upper triangle: rows 0..k-1
					for ( i = 0; i < k; i++ ) {
						RWORK[ offsetRWork + ( i * strideRWork ) ] += cabs1( Av, oA + ( i * sa1 ) + ( k * sa2 ) ) * xk;
						s += cabs1( Av, oA + ( i * sa1 ) + ( k * sa2 ) ) * cabs1( Xv, oX + ( i * sx1 ) + ( j * sx2 ) );
					}
					// Diagonal: real part only for Hermitian
					RWORK[ offsetRWork + ( k * strideRWork ) ] += Math.abs( Av[ oA + ( k * sa1 ) + ( k * sa2 ) ] ) * xk + s;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					xk = cabs1( Xv, oX + ( k * sx1 ) + ( j * sx2 ) );

					// Diagonal: real part only for Hermitian
					RWORK[ offsetRWork + ( k * strideRWork ) ] += Math.abs( Av[ oA + ( k * sa1 ) + ( k * sa2 ) ] ) * xk;

					// Lower triangle: rows k+1..N-1
					for ( i = k + 1; i < N; i++ ) {
						RWORK[ offsetRWork + ( i * strideRWork ) ] += cabs1( Av, oA + ( i * sa1 ) + ( k * sa2 ) ) * xk;
						s += cabs1( Av, oA + ( i * sa1 ) + ( k * sa2 ) ) * cabs1( Xv, oX + ( i * sx1 ) + ( j * sx2 ) );
					}
					RWORK[ offsetRWork + ( k * strideRWork ) ] += s;
				}
			}

			// Compute BERR(j)
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				if ( RWORK[ offsetRWork + ( i * strideRWork ) ] > safe2 ) {
					s = Math.max( s, cabs1( Wv, oW + ( i * sw ) ) / RWORK[ offsetRWork + ( i * strideRWork ) ] );
				} else {
					s = Math.max( s, ( cabs1( Wv, oW + ( i * sw ) ) + safe1 ) / ( RWORK[ offsetRWork + ( i * strideRWork ) ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + ( j * strideBERR ) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				// Solve A * dx = R using the Cholesky factorization
				zpotrs( uplo, N, 1, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, N * strideWork, offsetWork );

				// X(:,j) += dx
				zaxpy( N, CONE, WORK, strideWork, offsetWork, X, strideX1, offsetX + ( j * strideX2 ) );

				lstres = s;
				count += 1;
			} else {
				break;
			}
		}

		// Bound error from formula using ZLACN2 to estimate the infinity-norm
		// Of inv(A) * diag(W)

		// Set up RWORK(i) = |R(i)| + NZ*EPS*(|A|*|X|+|B|)(i)
		for ( i = 0; i < N; i++ ) {
			if ( RWORK[ offsetRWork + ( i * strideRWork ) ] > safe2 ) {
				RWORK[ offsetRWork + ( i * strideRWork ) ] = cabs1( Wv, oW + ( i * sw ) ) + ( nz * EPS * RWORK[ offsetRWork + ( i * strideRWork ) ] );
			} else {
				RWORK[ offsetRWork + ( i * strideRWork ) ] = cabs1( Wv, oW + ( i * sw ) ) + ( nz * EPS * RWORK[ offsetRWork + ( i * strideRWork ) ] ) + safe1;
			}
		}

		KASE[ 0 ] = 0;

		// zlacn2 reverse communication loop
		while ( true ) { // eslint-disable-line no-constant-condition
			EST[ 0 ] = FERR[ offsetFERR + ( j * strideFERR ) ];
			zlacn2( N,
				WORK, strideWork, offsetWork + ( N * strideWork ), // v
				WORK, strideWork, offsetWork, // x
				EST, KASE, ISAVE, 1, 0
			);
			FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W)*inv(A^H)
				// For Hermitian A, A^H = A, so just solve A*z = x
				zpotrs( uplo, N, 1, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, N * strideWork, offsetWork );
				for ( i = 0; i < N; i++ ) {
					// WORK(i) = RWORK(i) * WORK(i)
					Wv[ oW + ( i * sw ) ] = RWORK[ offsetRWork + ( i * strideRWork ) ] * Wv[ oW + ( i * sw ) ];
					Wv[ oW + ( i * sw ) + 1 ] = RWORK[ offsetRWork + ( i * strideRWork ) ] * Wv[ oW + ( i * sw ) + 1 ];
				}
			} else {
				// Multiply by inv(A)*diag(W)
				for ( i = 0; i < N; i++ ) {
					// WORK(i) = RWORK(i) * WORK(i)
					Wv[ oW + ( i * sw ) ] = RWORK[ offsetRWork + ( i * strideRWork ) ] * Wv[ oW + ( i * sw ) ];
					Wv[ oW + ( i * sw ) + 1 ] = RWORK[ offsetRWork + ( i * strideRWork ) ] * Wv[ oW + ( i * sw ) + 1 ];
				}
				zpotrs( uplo, N, 1, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, N * strideWork, offsetWork );
			}
		}

		// Normalize error
		lstres = 0.0;
		for ( i = 0; i < N; i++ ) {
			lstres = Math.max( lstres, cabs1( Xv, oX + ( i * sx1 ) + ( j * sx2 ) ) );
		}
		if ( lstres !== 0.0 ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] = FERR[ offsetFERR + ( j * strideFERR ) ] / lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default zporfs;
