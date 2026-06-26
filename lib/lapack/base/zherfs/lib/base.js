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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zhemv from '../../../../blas/base/zhemv/lib/base.js';
import zhetrs from '../../zhetrs/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var CONE = new Complex128( 1.0, 0.0 );
var NEGCONE = new Complex128( -1.0, 0.0 );
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );


// FUNCTIONS //

/**
* CABS1: |re(z)| + |im(z)|.
*
* @private
* @param {number} re - real part
* @param {number} im - imaginary part
* @returns {number} cabs1 value
*/
function cabs1( re, im ) {
	return Math.abs( re ) + Math.abs( im );
}


// MAIN //

/**
* Improves the computed solution to a complex Hermitian system of linear.
* equations and provides error bounds and backward error estimates.
*
* Uses the factorization A = U_D_U^H or A = L_D_L^H computed by zhetrf.
*
* NOTE: HERMITIAN (not symmetric). Uses conjugate transpose.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - original Hermitian N-by-N matrix
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {NonNegativeInteger} offsetA - offset into A
* @param {Complex128Array} AF - factored matrix from zhetrf
* @param {integer} strideAF1 - first stride of AF
* @param {integer} strideAF2 - second stride of AF
* @param {NonNegativeInteger} offsetAF - offset into AF
* @param {Int32Array} IPIV - pivot indices from zhetrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - offset for IPIV
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - first stride of B
* @param {integer} strideB2 - second stride of B
* @param {NonNegativeInteger} offsetB - offset into B
* @param {Complex128Array} X - solution matrix (improved on exit)
* @param {integer} strideX1 - first stride of X
* @param {integer} strideX2 - second stride of X
* @param {NonNegativeInteger} offsetX - offset into X
* @param {Float64Array} FERR - output forward error bounds
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - offset for FERR
* @param {Float64Array} BERR - output backward error bounds
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - offset for BERR
* @param {Complex128Array} WORK - workspace (unused, allocated internally)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - offset for WORK
* @param {Float64Array} RWORK - workspace (unused, allocated internally)
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - offset for RWORK
* @returns {integer} info - 0 if successful
*/
function zherfs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line no-unused-vars
	var lstres;
	var count;
	var ISAVE;
	var KASE;
	var safe1;
	var safe2;
	var EST;
	var Bv;
	var Xv;
	var Av;
	var Wv;
	var WRK;
	var RWK;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var sa1;
	var sa2;
	var oB;
	var oX;
	var oA;
	var nz;
	var xk;
	var re;
	var V;
	var s;
	var i;
	var j;
	var k;
	var p;

	if ( N === 0 || nrhs === 0 ) {
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + (j * strideFERR) ] = 0.0;
			BERR[ offsetBERR + (j * strideBERR) ] = 0.0;
		}
		return 0;
	}

	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Xv = reinterpret( X, 0 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	oA = offsetA * 2;
	oB = offsetB * 2;
	oX = offsetX * 2;

	nz = N + 1;
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Allocate workspace
	WRK = new Complex128Array( N );   // residual workspace
	RWK = new Float64Array( N );       // real workspace for RWORK
	V = new Complex128Array( N );      // for zlacn2
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	ISAVE = new Int32Array( 3 );

	Wv = reinterpret( WRK, 0 );

	for ( j = 0; j < nrhs; j++ ) {
		count = 1;
		lstres = 3.0;

		while ( true ) { // eslint-disable-line no-constant-condition
			// Compute residual R = B - A*X
			// Zhemv computes y := alpha*A*x + beta*y (Hermitian)
			zcopy( N, B, strideB1, offsetB + (j * strideB2), WRK, 1, 0 );
			zhemv( uplo, N, NEGCONE, A, strideA1, strideA2, offsetA, X, strideX1, offsetX + (j * strideX2), CONE, WRK, 1, 0 );

			// Compute componentwise relative backward error
			for ( i = 0; i < N; i++ ) {
				p = oB + (i * sb1) + (j * sb2);
				RWK[ i ] = Math.abs( Bv[ p ] ) + Math.abs( Bv[ p + 1 ] );
			}

			// Compute |A|*|X| + |B|
			// For Hermitian: diagonal is real, off-diag uses CABS1
			if ( uplo === 'upper' ) {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					p = oX + (k * sx1) + (j * sx2);
					xk = Math.abs( Xv[ p ] ) + Math.abs( Xv[ p + 1 ] );
					for ( i = 0; i < k; i++ ) {
						p = oA + (i * sa1) + (k * sa2);
						re = Math.abs( Av[ p ] ) + Math.abs( Av[ p + 1 ] );
						RWK[ i ] += re * xk;
						p = oX + (i * sx1) + (j * sx2);
						s += re * ( Math.abs( Xv[ p ] ) + Math.abs( Xv[ p + 1 ] ) );
					}
					// Diagonal: A(k,k) is real for Hermitian, use abs(real(A(k,k)))
					p = oA + (k * sa1) + (k * sa2);
					RWK[ k ] += Math.abs( Av[ p ] ) * xk + s;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					p = oX + (k * sx1) + (j * sx2);
					xk = Math.abs( Xv[ p ] ) + Math.abs( Xv[ p + 1 ] );

					// Diagonal: real
					p = oA + (k * sa1) + (k * sa2);
					RWK[ k ] += Math.abs( Av[ p ] ) * xk;
					for ( i = k + 1; i < N; i++ ) {
						p = oA + (i * sa1) + (k * sa2);
						re = Math.abs( Av[ p ] ) + Math.abs( Av[ p + 1 ] );
						RWK[ i ] += re * xk;
						p = oX + (i * sx1) + (j * sx2);
						s += re * ( Math.abs( Xv[ p ] ) + Math.abs( Xv[ p + 1 ] ) );
					}
					RWK[ k ] += s;
				}
			}

			// Compute BERR
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				if ( RWK[ i ] > safe2 ) {
					s = Math.max( s, cabs1( Wv[ 2 * i ], Wv[ 2 * i + 1 ] ) / RWK[ i ] );
				} else {
					s = Math.max( s, ( cabs1( Wv[ 2 * i ], Wv[ 2 * i + 1 ] ) + safe1 ) / ( RWK[ i ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + (j * strideBERR) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				zhetrs( uplo, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, 0 );
				zaxpy( N, CONE, WRK, 1, 0, X, strideX1, offsetX + (j * strideX2) );
				lstres = s;
				count += 1;
			} else {
				break;
			}
		}

		// Forward error bound using zlacn2
		for ( i = 0; i < N; i++ ) {
			if ( RWK[ i ] > safe2 ) {
				RWK[ i ] = cabs1( Wv[ 2 * i ], Wv[ 2 * i + 1 ] ) + ( nz * EPS * RWK[ i ] );
			} else {
				RWK[ i ] = cabs1( Wv[ 2 * i ], Wv[ 2 * i + 1 ] ) + ( nz * EPS * RWK[ i ] ) + safe1;
			}
		}

		KASE[ 0 ] = 0;

		while ( true ) { // eslint-disable-line no-constant-condition
			EST[ 0 ] = FERR[ offsetFERR + (j * strideFERR) ];
			zlacn2( N, V, 1, 0, WRK, 1, 0, EST, KASE, ISAVE, 1, 0 );
			FERR[ offsetFERR + (j * strideFERR) ] = EST[ 0 ];

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W)*inv(A^H) — for Hermitian, inv(A^H) = inv(A)
				zhetrs( uplo, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, 0 );
				for ( i = 0; i < N; i++ ) {
					Wv[ 2 * i ] *= RWK[ i ];
					Wv[ 2 * i + 1 ] *= RWK[ i ];
				}
			} else {
				// Multiply by inv(A)*diag(W)
				for ( i = 0; i < N; i++ ) {
					Wv[ 2 * i ] *= RWK[ i ];
					Wv[ 2 * i + 1 ] *= RWK[ i ];
				}
				zhetrs( uplo, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, 0 );
			}
		}

		// Normalize
		lstres = 0.0;
		for ( i = 0; i < N; i++ ) {
			p = oX + (i * sx1) + (j * sx2);
			lstres = Math.max( lstres, Math.abs( Xv[ p ] ) + Math.abs( Xv[ p + 1 ] ) );
		}
		if ( lstres !== 0.0 ) {
			FERR[ offsetFERR + (j * strideFERR) ] /= lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default zherfs;
