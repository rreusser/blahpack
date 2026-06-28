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

/* eslint-disable max-len, max-params, max-statements, max-depth */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zgetrs from '../../zgetrs/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );
var CONE = new Complex128( 1.0, 0.0 );
var CNEGONE = new Complex128( -1.0, 0.0 );


// FUNCTIONS //

/**
* CABS1: |re(z)| + |im(z)|.
*
* @private
* @param {Float64Array} v - Float64 view of complex array
* @param {integer} idx - index of real part in Float64 view
* @returns {number} CABS1 value
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Improves the computed solution to a complex system of linear equations and.
* provides error bounds and backward error estimates for the solution.
*
* Uses the LU factorization computed by zgetrf. WORK and RWORK are provided
* by the caller.
*
* IPIV must contain 0-based pivot indices (as produced by zgetrf).
*
* For TRANS:
*   'no-transpose' - A _ X = B
_   'transpose' - A^T _ X = B
*   'conjugate-transpose' - A^H * X = B
*
* Note: In zgerfs, when NOTRAN, the transposed solve uses 'conjugate-transpose'
* (A^H), not 'transpose' (A^T), because the forward error bound estimation
* requires the adjoint for complex matrices.
*
* @private
* @param {string} trans - specifies the form of the system
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - original N-by-N complex matrix
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Complex128Array} AF - LU-factored N-by-N complex matrix (from zgetrf)
* @param {integer} strideAF1 - stride of the first dimension of AF (complex elements)
* @param {integer} strideAF2 - stride of the second dimension of AF (complex elements)
* @param {NonNegativeInteger} offsetAF - index offset for AF (complex elements)
* @param {Int32Array} IPIV - pivot indices from zgetrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
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
* @param {Complex128Array} WORK - workspace of length >= 2*N complex elements
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - index offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of length >= N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - index offset for RWORK
* @returns {integer} info - 0 if successful
*/
function zgerfs( trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var notran;
	var transn;
	var transt;
	var lstres;
	var count;
	var ISAVE;
	var safe1;
	var safe2;
	var WORKv;
	var KASE;
	var EST;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var Av;
	var Bv;
	var Xv;
	var sw;
	var oA;
	var oB;
	var oX;
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

	notran = ( trans === 'no-transpose' );
	if ( notran ) {
		transn = 'no-transpose';
		transt = 'conjugate-transpose';
	} else {
		transn = 'conjugate-transpose';
		transt = 'no-transpose';
	}

	// NZ = maximum number of nonzero elements in each row of A, plus 1
	nz = N + 1;
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Get Float64 views for element access
	WORKv = reinterpret( WORK, 0 );
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Xv = reinterpret( X, 0 );

	// Double-based strides and offsets
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	sw = strideWork * 2;
	oA = offsetA * 2;
	oB = offsetB * 2;
	oX = offsetX * 2;
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
		while ( true ) {
			// Compute residual R = B - op(A) * X
			// Copy B(:,j) into WORK(0:N-1)
			zcopy( N, B, strideB1, offsetB + ( j * strideB2 ), WORK, strideWork, offsetWork );

			// WORK(0:N-1) = B(:,j) - op(A) * X(:,j)
			zgemv( trans, N, N, CNEGONE, A, strideA1, strideA2, offsetA, X, strideX1, offsetX + ( j * strideX2 ), CONE, WORK, strideWork, offsetWork );

			// Compute componentwise relative backward error

			// RWORK(0:N-1) = CABS1(B(:,j))
			for ( i = 0; i < N; i++ ) {
				RWORK[ offsetRWork + ( i * strideRWork ) ] = cabs1( Bv, oB + ( i * sb1 ) + ( j * sb2 ) );
			}

			// Compute |op(A)|*|X| + |B|
			if ( notran ) {
				for ( k = 0; k < N; k++ ) {
					xk = cabs1( Xv, oX + ( k * sx1 ) + ( j * sx2 ) );
					for ( i = 0; i < N; i++ ) {
						RWORK[ offsetRWork + ( i * strideRWork ) ] += cabs1( Av, oA + ( i * sa1 ) + ( k * sa2 ) ) * xk;
					}
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					for ( i = 0; i < N; i++ ) {
						s += cabs1( Av, oA + ( i * sa1 ) + ( k * sa2 ) ) * cabs1( Xv, oX + ( i * sx1 ) + ( j * sx2 ) );
					}
					RWORK[ offsetRWork + ( k * strideRWork ) ] += s;
				}
			}

			// Compute BERR(j)
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				if ( RWORK[ offsetRWork + ( i * strideRWork ) ] > safe2 ) {
					s = Math.max( s, cabs1( WORKv, oW + ( i * sw ) ) / RWORK[ offsetRWork + ( i * strideRWork ) ] );
				} else {
					s = Math.max( s, ( cabs1( WORKv, oW + ( i * sw ) ) + safe1 ) / ( RWORK[ offsetRWork + ( i * strideRWork ) ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + ( j * strideBERR ) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				// Update solution and try again
				// Solve op(A) * dx = R using the LU factorization
				zgetrs( trans, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, strideWork * N, offsetWork );

				// X(:,j) += dx
				zaxpy( N, CONE, WORK, strideWork, offsetWork, X, strideX1, offsetX + ( j * strideX2 ) );

				lstres = s;
				count += 1;
			} else {
				break;
			}
		}

		// Bound error from formula using zlacn2 to estimate the infinity-norm
		// Of inv(op(A)) * diag(W)

		// Set up RWORK(0:N-1) for the error bound estimation
		for ( i = 0; i < N; i++ ) {
			if ( RWORK[ offsetRWork + ( i * strideRWork ) ] > safe2 ) {
				RWORK[ offsetRWork + ( i * strideRWork ) ] = cabs1( WORKv, oW + ( i * sw ) ) + ( nz * EPS * RWORK[ offsetRWork + ( i * strideRWork ) ] );
			} else {
				RWORK[ offsetRWork + ( i * strideRWork ) ] = cabs1( WORKv, oW + ( i * sw ) ) + ( nz * EPS * RWORK[ offsetRWork + ( i * strideRWork ) ] ) + safe1;
			}
		}

		KASE[ 0 ] = 0;

		// zlacn2 reverse communication loop
		while ( true ) {
			EST[ 0 ] = FERR[ offsetFERR + ( j * strideFERR ) ];
			zlacn2( N, WORK, strideWork, offsetWork + ( N * strideWork ), // V = WORK(N:2N-1)
				WORK, strideWork, offsetWork,                       // X = WORK(0:N-1)
				EST, KASE, ISAVE, 1, 0);
			FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W)*inv(op(A)**H)
				zgetrs( transt, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, strideWork * N, offsetWork );
				for ( i = 0; i < N; i++ ) {
					// WORK(i) = RWORK(i) * WORK(i) -- real scalar times complex
					WORKv[ oW + ( i * sw ) ] = RWORK[ offsetRWork + ( i * strideRWork ) ] * WORKv[ oW + ( i * sw ) ];
					WORKv[ oW + ( i * sw ) + 1 ] = RWORK[ offsetRWork + ( i * strideRWork ) ] * WORKv[ oW + ( i * sw ) + 1 ];
				}
			} else {
				// Multiply by inv(op(A))*diag(W)
				for ( i = 0; i < N; i++ ) {
					// WORK(i) = RWORK(i) * WORK(i) -- real scalar times complex
					WORKv[ oW + ( i * sw ) ] = RWORK[ offsetRWork + ( i * strideRWork ) ] * WORKv[ oW + ( i * sw ) ];
					WORKv[ oW + ( i * sw ) + 1 ] = RWORK[ offsetRWork + ( i * strideRWork ) ] * WORKv[ oW + ( i * sw ) + 1 ];
				}
				zgetrs( transn, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, strideWork * N, offsetWork );
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

export default zgerfs;
