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
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import ztrmv from './../../../../blas/base/ztrmv/lib/base.js';
import ztrsv from './../../../../blas/base/ztrsv/lib/base.js';
import zlacn2 from './../../zlacn2/lib/base.js';
import dlamch from './../../dlamch/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var NONE = new Complex128( -1.0, 0.0 );
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );


// FUNCTIONS //

/**
* Computes CABS1(z) = |re(z)| + |im(z)| from a Float64 view at a given index.
*
* @private
* @param {Float64Array} v - reinterpreted view
* @param {integer} idx - Float64 index of the real part
* @returns {number} CABS1 value
*/
function cabs1At( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Provides error bounds and backward error estimates for the solution to a system of linear equations with a complex triangular coefficient matrix.
*
* Given a triangular matrix A and its computed solution X to A_X = B (or
* A__H_X = B), this routine computes:
*
* -   FERR: componentwise relative forward error bound for each solution vector
* -   BERR: componentwise relative backward error for each solution vector
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - triangular matrix A, shape [N, N]
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} B - right-hand side matrix B, shape [N, nrhs]
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} X - solution matrix X, shape [N, nrhs]
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} FERR - output array of length nrhs for forward error bounds
* @param {integer} strideFERR - stride length for `FERR`
* @param {NonNegativeInteger} offsetFERR - starting index for `FERR`
* @param {Float64Array} BERR - output array of length nrhs for backward errors
* @param {integer} strideBERR - stride length for `BERR`
* @param {NonNegativeInteger} offsetBERR - starting index for `BERR`
* @param {Complex128Array} WORK - workspace array of length 2*N
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Float64Array} RWORK - real workspace array of length N
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {integer} status code (0 = success)
*/
function ztrrfs( uplo, trans, diag, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var transtLong;
	var transnLong;
	var uploLong;
	var diagLong;
	var notran;
	var nounit;
	var lstres;
	var upper;
	var ISAVE;
	var safe1;
	var safe2;
	var KASE;
	var EST;
	var wv;
	var bv;
	var av;
	var xv;
	var xk;
	var nz;
	var or;
	var pj;
	var ib;
	var ix;
	var ia;
	var iw;
	var s;
	var i;
	var j;
	var k;

	// Decode parameters
	upper = ( uplo === 'upper' );
	notran = ( trans === 'no-transpose' );
	nounit = ( diag === 'non-unit' );

	uploLong = uplo;
	diagLong = diag;

	// Quick return if possible
	if ( N === 0 || nrhs === 0 ) {
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] = ZERO;
			BERR[ offsetBERR + ( j * strideBERR ) ] = ZERO;
		}
		return 0;
	}

	// Set transpose type for the condition estimation
	if ( notran ) {
		transnLong = 'no-transpose';
		transtLong = 'conjugate-transpose';
	} else {
		transnLong = 'conjugate-transpose';
		transtLong = 'no-transpose';
	}

	// NZ = maximum number of nonzero entries in each row of A, plus 1
	nz = N + 1;
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Get Float64 views of complex arrays
	av = reinterpret( A, 0 );
	bv = reinterpret( B, 0 );
	xv = reinterpret( X, 0 );
	wv = reinterpret( WORK, 0 );

	or = offsetRWork;

	// Allocate state arrays for zlacn2
	KASE = new Int32Array( 1 );
	ISAVE = new Int32Array( 3 );
	EST = new Float64Array( 1 );

	// Loop over each right-hand side
	for ( j = 0; j < nrhs; j++ ) {
		pj = j;

		// Compute residual: WORK(1..N) = op(A)*X(:,j) - B(:,j)
		zcopy( N, X, strideX1, offsetX + ( pj * strideX2 ), WORK, strideWork, offsetWork );
		ztrmv( uploLong, trans, diagLong, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork );
		zaxpy( N, NONE, B, strideB1, offsetB + ( pj * strideB2 ), WORK, strideWork, offsetWork );

		// Compute componentwise bound in RWORK: RWORK(i) = CABS1(B(i,j))
		for ( i = 0; i < N; i++ ) {
			ib = ( offsetB + ( i * strideB1 ) + ( pj * strideB2 ) ) * 2;
			RWORK[ or + ( i * strideRWork ) ] = cabs1At( bv, ib );
		}

		if ( notran ) {
			// Compute |A|*|X(:,j)| + |B(:,j)|
			if ( upper ) {
				if ( nounit ) {
					for ( k = 0; k < N; k++ ) {
						ix = ( offsetX + ( k * strideX1 ) + ( pj * strideX2 ) ) * 2;
						xk = cabs1At( xv, ix );
						for ( i = 0; i <= k; i++ ) {
							ia = ( offsetA + ( i * strideA1 ) + ( k * strideA2 ) ) * 2;
							RWORK[ or + ( i * strideRWork ) ] += cabs1At( av, ia ) * xk;
						}
					}
				} else {
					for ( k = 0; k < N; k++ ) {
						ix = ( offsetX + ( k * strideX1 ) + ( pj * strideX2 ) ) * 2;
						xk = cabs1At( xv, ix );
						for ( i = 0; i < k; i++ ) {
							ia = ( offsetA + ( i * strideA1 ) + ( k * strideA2 ) ) * 2;
							RWORK[ or + ( i * strideRWork ) ] += cabs1At( av, ia ) * xk;
						}
						RWORK[ or + ( k * strideRWork ) ] += xk;
					}
				}
			} else if ( nounit ) {
				for ( k = 0; k < N; k++ ) {
					ix = ( offsetX + ( k * strideX1 ) + ( pj * strideX2 ) ) * 2;
					xk = cabs1At( xv, ix );
					for ( i = k; i < N; i++ ) {
						ia = ( offsetA + ( i * strideA1 ) + ( k * strideA2 ) ) * 2;
						RWORK[ or + ( i * strideRWork ) ] += cabs1At( av, ia ) * xk;
					}
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					ix = ( offsetX + ( k * strideX1 ) + ( pj * strideX2 ) ) * 2;
					xk = cabs1At( xv, ix );
					for ( i = k + 1; i < N; i++ ) {
						ia = ( offsetA + ( i * strideA1 ) + ( k * strideA2 ) ) * 2;
						RWORK[ or + ( i * strideRWork ) ] += cabs1At( av, ia ) * xk;
					}
					RWORK[ or + ( k * strideRWork ) ] += xk;
				}
			}
		} else if ( upper ) {
			// conjugate-transpose: compute |A^H|*|X(:,j)| = (|A|^T)*|X(:,j)|
			if ( nounit ) {
				for ( k = 0; k < N; k++ ) {
					s = ZERO;
					for ( i = 0; i <= k; i++ ) {
						ia = ( offsetA + ( i * strideA1 ) + ( k * strideA2 ) ) * 2;
						ix = ( offsetX + ( i * strideX1 ) + ( pj * strideX2 ) ) * 2;
						s += cabs1At( av, ia ) * cabs1At( xv, ix );
					}
					RWORK[ or + ( k * strideRWork ) ] += s;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					ix = ( offsetX + ( k * strideX1 ) + ( pj * strideX2 ) ) * 2;
					s = cabs1At( xv, ix );
					for ( i = 0; i < k; i++ ) {
						ia = ( offsetA + ( i * strideA1 ) + ( k * strideA2 ) ) * 2;
						ix = ( offsetX + ( i * strideX1 ) + ( pj * strideX2 ) ) * 2;
						s += cabs1At( av, ia ) * cabs1At( xv, ix );
					}
					RWORK[ or + ( k * strideRWork ) ] += s;
				}
			}
		} else if ( nounit ) {
			for ( k = 0; k < N; k++ ) {
				s = ZERO;
				for ( i = k; i < N; i++ ) {
					ia = ( offsetA + ( i * strideA1 ) + ( k * strideA2 ) ) * 2;
					ix = ( offsetX + ( i * strideX1 ) + ( pj * strideX2 ) ) * 2;
					s += cabs1At( av, ia ) * cabs1At( xv, ix );
				}
				RWORK[ or + ( k * strideRWork ) ] += s;
			}
		} else {
			for ( k = 0; k < N; k++ ) {
				ix = ( offsetX + ( k * strideX1 ) + ( pj * strideX2 ) ) * 2;
				s = cabs1At( xv, ix );
				for ( i = k + 1; i < N; i++ ) {
					ia = ( offsetA + ( i * strideA1 ) + ( k * strideA2 ) ) * 2;
					ix = ( offsetX + ( i * strideX1 ) + ( pj * strideX2 ) ) * 2;
					s += cabs1At( av, ia ) * cabs1At( xv, ix );
				}
				RWORK[ or + ( k * strideRWork ) ] += s;
			}
		}

		// Compute componentwise relative backward error: BERR(j)
		s = ZERO;
		for ( i = 0; i < N; i++ ) {
			iw = ( offsetWork + ( i * strideWork ) ) * 2;
			if ( RWORK[ or + ( i * strideRWork ) ] > safe2 ) {
				s = Math.max( s, cabs1At( wv, iw ) / RWORK[ or + ( i * strideRWork ) ] );
			} else {
				s = Math.max( s, ( cabs1At( wv, iw ) + safe1 ) / ( RWORK[ or + ( i * strideRWork ) ] + safe1 ) );
			}
		}
		BERR[ offsetBERR + ( j * strideBERR ) ] = s;

		// Prepare the right-hand side for the condition estimator
		for ( i = 0; i < N; i++ ) {
			iw = ( offsetWork + ( i * strideWork ) ) * 2;
			if ( RWORK[ or + ( i * strideRWork ) ] > safe2 ) {
				RWORK[ or + ( i * strideRWork ) ] = cabs1At( wv, iw ) + ( nz * EPS * RWORK[ or + ( i * strideRWork ) ] );
			} else {
				RWORK[ or + ( i * strideRWork ) ] = cabs1At( wv, iw ) + ( nz * EPS * RWORK[ or + ( i * strideRWork ) ] ) + safe1;
			}
		}

		// Reverse communication loop for condition estimation
		KASE[ 0 ] = 0;
		EST[ 0 ] = 0.0;
		ISAVE[ 0 ] = 0;
		ISAVE[ 1 ] = 0;
		ISAVE[ 2 ] = 0;
		while ( true ) { // eslint-disable-line no-constant-condition
			zlacn2( N, WORK, strideWork, offsetWork + N, WORK, strideWork, offsetWork, EST, KASE, ISAVE, 1, 0 );
			if ( KASE[ 0 ] === 0 ) {
				break;
			}
			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W)*inv(op(A)**H): solve op(A)**H * x = work(1..N)
				ztrsv( uploLong, transtLong, diagLong, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork );

				// Scale by RWORK(i): WORK(i) = RWORK(i) * WORK(i)
				for ( i = 0; i < N; i++ ) {
					iw = ( offsetWork + ( i * strideWork ) ) * 2;
					wv[ iw ] *= RWORK[ or + ( i * strideRWork ) ];
					wv[ iw + 1 ] *= RWORK[ or + ( i * strideRWork ) ];
				}
			} else {
				// KASE === 2: scale then solve
				for ( i = 0; i < N; i++ ) {
					iw = ( offsetWork + ( i * strideWork ) ) * 2;
					wv[ iw ] *= RWORK[ or + ( i * strideRWork ) ];
					wv[ iw + 1 ] *= RWORK[ or + ( i * strideRWork ) ];
				}

				// Solve op(A) * x = work(1..N)
				ztrsv( uploLong, transnLong, diagLong, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork );
			}
		}

		// Copy EST result to FERR(j) and normalize by max element of X(:,j)
		FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];
		lstres = ZERO;
		for ( i = 0; i < N; i++ ) {
			ix = ( offsetX + ( i * strideX1 ) + ( pj * strideX2 ) ) * 2;
			lstres = Math.max( lstres, cabs1At( xv, ix ) );
		}
		if ( lstres !== ZERO ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] /= lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default ztrrfs;
