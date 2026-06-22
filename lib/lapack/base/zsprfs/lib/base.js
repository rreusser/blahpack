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
import zspmv from '../../zspmv/lib/base.js';
import zsptrs from '../../zsptrs/lib/base.js';
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
* Improves the computed solution to a complex system of linear equations with.
* a symmetric coefficient matrix stored in packed format, and provides error
* bounds and backward error estimates.
*
* Uses the factorization A = U_D_U^T or A = L_D_L^T computed by zsptrf.
*
* NOTE: SYMMETRIC (not Hermitian). No conjugation.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AP - original symmetric matrix in packed storage
* @param {integer} strideAP - stride for AP
* @param {NonNegativeInteger} offsetAP - offset into AP
* @param {Complex128Array} AFP - factored matrix from zsptrf in packed storage
* @param {integer} strideAFP - stride for AFP
* @param {NonNegativeInteger} offsetAFP - offset into AFP
* @param {Int32Array} IPIV - pivot indices from zsptrf (0-based)
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
function zsprfs( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line no-unused-vars
	var lstres;
	var count;
	var ISAVE;
	var safe1;
	var safe2;
	var KASE;
	var EST;
	var APv;
	var WRK;
	var RWK;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var Bv;
	var Xv;
	var Wv;
	var nz;
	var oB;
	var oX;
	var xk;
	var kk;
	var ik;
	var V;
	var s;
	var i;
	var j;
	var k;

	if ( N === 0 || nrhs === 0 ) {
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + (j * strideFERR) ] = 0.0;
			BERR[ offsetBERR + (j * strideBERR) ] = 0.0;
		}
		return 0;
	}

	APv = reinterpret( AP, 0 );
	Bv = reinterpret( B, 0 );
	Xv = reinterpret( X, 0 );

	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	oB = offsetB * 2;
	oX = offsetX * 2;

	nz = N + 1;
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Allocate workspace
	WRK = new Complex128Array( N );
	RWK = new Float64Array( N );
	V = new Complex128Array( N );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	ISAVE = new Int32Array( 3 );

	Wv = reinterpret( WRK, 0 );

	for ( j = 0; j < nrhs; j++ ) {
		count = 1;
		lstres = 3.0;

		while ( true ) { // eslint-disable-line no-constant-condition
			// Compute residual R = B - A*X
			zcopy( N, B, strideB1, offsetB + (j * strideB2), WRK, 1, 0 );
			zspmv( uplo, N, NEGCONE, AP, strideAP, offsetAP, X, strideX1, offsetX + (j * strideX2), CONE, WRK, 1, 0 );

			// Compute componentwise relative backward error

			// RWK[i] = |B(i,j)|
			for ( i = 0; i < N; i++ ) {
				k = oB + (i * sb1) + (j * sb2);
				RWK[ i ] = cabs1( Bv[ k ], Bv[ k + 1 ] );
			}

			// Add |A|*|X| to RWK (packed storage traversal)
			kk = offsetAP * 2;
			if ( uplo === 'upper' ) {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					xk = cabs1( Xv[ oX + (k * sx1) + (j * sx2) ], Xv[ oX + (k * sx1) + (j * sx2) + 1 ] );
					ik = kk;
					for ( i = 0; i < k; i++ ) {
						RWK[ i ] += cabs1( APv[ ik ], APv[ ik + 1 ] ) * xk;
						s += cabs1( APv[ ik ], APv[ ik + 1 ] ) * cabs1( Xv[ oX + (i * sx1) + (j * sx2) ], Xv[ oX + (i * sx1) + (j * sx2) + 1 ] );
						ik += (strideAP * 2);
					}
					RWK[ k ] += ( cabs1( APv[ ik ], APv[ ik + 1 ] ) * xk ) + s;
					kk += (k + 1) * strideAP * 2;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					xk = cabs1( Xv[ oX + (k * sx1) + (j * sx2) ], Xv[ oX + (k * sx1) + (j * sx2) + 1 ] );
					RWK[ k ] += cabs1( APv[ kk ], APv[ kk + 1 ] ) * xk;
					ik = kk + (strideAP * 2);
					for ( i = k + 1; i < N; i++ ) {
						RWK[ i ] += cabs1( APv[ ik ], APv[ ik + 1 ] ) * xk;
						s += cabs1( APv[ ik ], APv[ ik + 1 ] ) * cabs1( Xv[ oX + (i * sx1) + (j * sx2) ], Xv[ oX + (i * sx1) + (j * sx2) + 1 ] );
						ik += (strideAP * 2);
					}
					RWK[ k ] += s;
					kk += (N - k) * strideAP * 2;
				}
			}

			// Compute BERR
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				if ( RWK[ i ] > safe2 ) {
					s = Math.max( s, cabs1( Wv[ 2 * i ], Wv[ (2 * i) + 1 ] ) / RWK[ i ] );
				} else {
					s = Math.max( s, ( cabs1( Wv[ 2 * i ], Wv[ (2 * i) + 1 ] ) + safe1 ) / ( RWK[ i ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + (j * strideBERR) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				zsptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, 0 );
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
				RWK[ i ] = cabs1( Wv[ 2 * i ], Wv[ (2 * i) + 1 ] ) + ( nz * EPS * RWK[ i ] );
			} else {
				RWK[ i ] = cabs1( Wv[ 2 * i ], Wv[ (2 * i) + 1 ] ) + ( nz * EPS * RWK[ i ] ) + safe1;
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
				// Multiply by inv(A) then diag(W)
				zsptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, 0 );
				for ( i = 0; i < N; i++ ) {
					Wv[ 2 * i ] *= RWK[ i ];
					Wv[ (2 * i) + 1 ] *= RWK[ i ];
				}
			} else {
				// Multiply by diag(W) then inv(A)
				for ( i = 0; i < N; i++ ) {
					Wv[ 2 * i ] *= RWK[ i ];
					Wv[ (2 * i) + 1 ] *= RWK[ i ];
				}
				zsptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, 0 );
			}
		}

		// Normalize
		lstres = 0.0;
		for ( i = 0; i < N; i++ ) {
			k = oX + (i * sx1) + (j * sx2);
			lstres = Math.max( lstres, cabs1( Xv[ k ], Xv[ k + 1 ] ) );
		}
		if ( lstres !== 0.0 ) {
			FERR[ offsetFERR + (j * strideFERR) ] /= lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default zsprfs;
