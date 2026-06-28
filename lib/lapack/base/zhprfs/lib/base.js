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
import zhpmv from '../../../../blas/base/zhpmv/lib/base.js';
import zhptrs from '../../zhptrs/lib/base.js';
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
* equations A * X = B where A is stored in packed format, and provides
* error bounds and backward error estimates.
*
* Uses the factorization A = U_D_U^H or A = L_D_L^H computed by zhptrf.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AP - original Hermitian N-by-N packed matrix
* @param {integer} strideAP - stride of AP (in complex elements)
* @param {NonNegativeInteger} offsetAP - offset into AP (in complex elements)
* @param {Complex128Array} AFP - factored packed matrix from zhptrf
* @param {integer} strideAFP - stride of AFP (in complex elements)
* @param {NonNegativeInteger} offsetAFP - offset into AFP (in complex elements)
* @param {Int32Array} IPIV - pivot indices from zhptrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - offset for IPIV
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - first stride of B (in complex elements)
* @param {integer} strideB2 - second stride of B (in complex elements)
* @param {NonNegativeInteger} offsetB - offset into B (in complex elements)
* @param {Complex128Array} X - solution matrix (improved on exit)
* @param {integer} strideX1 - first stride of X (in complex elements)
* @param {integer} strideX2 - second stride of X (in complex elements)
* @param {NonNegativeInteger} offsetX - offset into X (in complex elements)
* @param {Float64Array} FERR - output forward error bounds
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - offset for FERR
* @param {Float64Array} BERR - output backward error bounds
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - offset for BERR
* @param {Complex128Array} WORK - workspace (unused, allocated internally)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - offset for WORK
* @param {Float64Array} RWORK - workspace (unused, allocated internally)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - offset for RWORK
* @returns {integer} info - 0 if successful
*/
function zhprfs( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line no-unused-vars
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
	var sap;
	var oAP;
	var Bv;
	var Xv;
	var Wv;
	var oB;
	var oX;
	var nz;
	var xk;
	var re;
	var kk;
	var ik;
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

	APv = reinterpret( AP, 0 );
	Bv = reinterpret( B, 0 );
	Xv = reinterpret( X, 0 );

	sap = strideAP * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	oAP = offsetAP * 2;
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
			// Copy B(:,j) into WORK
			zcopy( N, B, strideB1, offsetB + (j * strideB2), WRK, 1, 0 );

			// WORK := -A*X(:,j) + WORK  (i.e. WORK := B(:,j) - A*X(:,j))
			zhpmv( uplo, N, NEGCONE, AP, strideAP, offsetAP, X, strideX1, offsetX + (j * strideX2), CONE, WRK, 1, 0 );

			// Compute componentwise relative backward error

			// RWK[i] = |B(i,j)|
			for ( i = 0; i < N; i++ ) {
				p = oB + (i * sb1) + (j * sb2);
				RWK[ i ] = Math.abs( Bv[ p ] ) + Math.abs( Bv[ p + 1 ] );
			}

			// Add |A|*|X(:,j)| to RWK
			// Packed storage indexing
			kk = 0;
			if ( uplo === 'upper' ) {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					p = oX + (k * sx1) + (j * sx2);
					xk = Math.abs( Xv[ p ] ) + Math.abs( Xv[ p + 1 ] );
					ik = kk;
					for ( i = 0; i < k; i++ ) {
						p = oAP + (ik * sap);
						re = Math.abs( APv[ p ] ) + Math.abs( APv[ p + 1 ] );
						RWK[ i ] += re * xk;
						p = oX + (i * sx1) + (j * sx2);
						s += re * ( Math.abs( Xv[ p ] ) + Math.abs( Xv[ p + 1 ] ) );
						ik += 1;
					}
					// Diagonal: real part only for Hermitian
					p = oAP + ((kk + k) * sap);
					RWK[ k ] += ( Math.abs( APv[ p ] ) * xk ) + s;
					kk += k + 1;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					p = oX + (k * sx1) + (j * sx2);
					xk = Math.abs( Xv[ p ] ) + Math.abs( Xv[ p + 1 ] );

					// Diagonal: real part only for Hermitian
					p = oAP + (kk * sap);
					RWK[ k ] += Math.abs( APv[ p ] ) * xk;
					ik = kk + 1;
					for ( i = k + 1; i < N; i++ ) {
						p = oAP + (ik * sap);
						re = Math.abs( APv[ p ] ) + Math.abs( APv[ p + 1 ] );
						RWK[ i ] += re * xk;
						p = oX + (i * sx1) + (j * sx2);
						s += re * ( Math.abs( Xv[ p ] ) + Math.abs( Xv[ p + 1 ] ) );
						ik += 1;
					}
					RWK[ k ] += s;
					kk += N - k;
				}
			}

			// Compute BERR
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				if ( RWK[ i ] > safe2 ) {
					s = Math.max( s, cabs1( Wv[ (2 * i) ], Wv[ (2 * i) + 1 ] ) / RWK[ i ] );
				} else {
					s = Math.max( s, ( cabs1( Wv[ (2 * i) ], Wv[ (2 * i) + 1 ] ) + safe1 ) / ( RWK[ i ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + (j * strideBERR) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				// Update solution
				zhptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, 0 );
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
				RWK[ i ] = cabs1( Wv[ (2 * i) ], Wv[ (2 * i) + 1 ] ) + ( nz * EPS * RWK[ i ] );
			} else {
				RWK[ i ] = cabs1( Wv[ (2 * i) ], Wv[ (2 * i) + 1 ] ) + ( nz * EPS * RWK[ i ] ) + safe1;
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
				zhptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, 0 );
				for ( i = 0; i < N; i++ ) {
					Wv[ (2 * i) ] *= RWK[ i ];
					Wv[ (2 * i) + 1 ] *= RWK[ i ];
				}
			} else {
				// Multiply by inv(A)*diag(W)
				for ( i = 0; i < N; i++ ) {
					Wv[ (2 * i) ] *= RWK[ i ];
					Wv[ (2 * i) + 1 ] *= RWK[ i ];
				}
				zhptrs( uplo, N, 1, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, WRK, 1, N, 0 );
			}
		}

		// Normalize FERR by max element of X(:,j)
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

export default zhprfs;
