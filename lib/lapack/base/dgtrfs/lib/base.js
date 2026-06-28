/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import dgttrs from '../../dgttrs/lib/base.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dlagtm from '../../dlagtm/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var EPS = dlamch( 'Epsilon' );
var SAFMIN = dlamch( 'Safe minimum' );


// MAIN //

/**
* Improves the computed solution to a system of linear equations when.
* the coefficient matrix is tridiagonal, and provides error bounds
* and backward error estimates for the solution.
*
* @private
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {Float64Array} DL - sub-diagonal of original A (length N-1)
* @param {integer} strideDL - stride for DL
* @param {NonNegativeInteger} offsetDL - offset for DL
* @param {Float64Array} d - diagonal of original A (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Float64Array} DU - super-diagonal of original A (length N-1)
* @param {integer} strideDU - stride for DU
* @param {NonNegativeInteger} offsetDU - offset for DU
* @param {Float64Array} DLF - factored sub-diagonal from dgttrf
* @param {integer} strideDLF - stride for DLF
* @param {NonNegativeInteger} offsetDLF - offset for DLF
* @param {Float64Array} DF - factored diagonal from dgttrf
* @param {integer} strideDF - stride for DF
* @param {NonNegativeInteger} offsetDF - offset for DF
* @param {Float64Array} DUF - factored super-diagonal from dgttrf
* @param {integer} strideDUF - stride for DUF
* @param {NonNegativeInteger} offsetDUF - offset for DUF
* @param {Float64Array} DU2 - second superdiagonal from dgttrf
* @param {integer} strideDU2 - stride for DU2
* @param {NonNegativeInteger} offsetDU2 - offset for DU2
* @param {Int32Array} IPIV - pivot indices from dgttrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - offset for IPIV
* @param {Float64Array} B - right hand side matrix (N x NRHS)
* @param {integer} strideB1 - row stride of B
* @param {integer} strideB2 - column stride of B
* @param {NonNegativeInteger} offsetB - offset for B
* @param {Float64Array} X - solution matrix (N x NRHS), refined on output
* @param {integer} strideX1 - row stride of X
* @param {integer} strideX2 - column stride of X
* @param {NonNegativeInteger} offsetX - offset for X
* @param {Float64Array} FERR - output: forward error bound for each RHS
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - offset for FERR
* @param {Float64Array} BERR - output: backward error for each RHS
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - offset for BERR
* @param {Float64Array} WORK - workspace of length at least 3*N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - offset for WORK
* @param {Int32Array} IWORK - integer workspace of length at least N
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - offset for IWORK
* @returns {integer} info - 0 if successful
*/
function dgtrfs( trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) {
	var notran;
	var transn;
	var transt;
	var lstres;
	var count;
	var safe1;
	var safe2;
	var ISAVE;
	var KASE;
	var EST;
	var pw;
	var pb;
	var px;
	var nz;
	var s;
	var i;
	var j;

	notran = ( trans === 'no-transpose' );

	// Quick return
	if ( N === 0 || nrhs === 0 ) {
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] = 0.0;
			BERR[ offsetBERR + ( j * strideBERR ) ] = 0.0;
		}
		return 0;
	}

	if ( notran ) {
		transn = 'no-transpose';
		transt = 'transpose';
	} else {
		transn = 'transpose';
		transt = 'no-transpose';
	}

	nz = 4;
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Allocate state for dlacn2
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	for ( j = 0; j < nrhs; j++ ) {
		count = 1;
		lstres = 3.0;

		// Iterative refinement loop
		while ( true ) {
			// Compute residual: WORK[N..2N-1] = B[:,j] - A*X[:,j]
			// Copy B[:,j] to WORK[N..2N-1]
			pb = offsetB + ( j * strideB2 );
			pw = offsetWork + ( N * strideWork );
			for ( i = 0; i < N; i++ ) {
				WORK[ pw ] = B[ pb ];
				pw += strideWork;
				pb += strideB1;
			}

			// WORK[N..2N-1] += -1 * A * X[:,j]
			// Use dlagtm with a single-column view of X
			dlagtm( trans, N, 1, -1.0, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, X, strideX1, strideX2, offsetX + ( j * strideX2 ), 1.0, WORK, strideWork, N * strideWork, offsetWork + ( N * strideWork ) );

			// Compute componentwise relative backward error

			// WORK[0..N-1] = |B[:,j]| + |A| * |X[:,j]| (row sums)
			if ( notran ) {
				px = offsetX + ( j * strideX2 );
				pb = offsetB + ( j * strideB2 );
				if ( N === 1 ) {
					WORK[ offsetWork ] = Math.abs( B[ pb ] ) + Math.abs( d[ offsetD ] * X[ px ] );
				} else {
					WORK[ offsetWork ] = Math.abs( B[ pb ] ) + Math.abs( d[ offsetD ] * X[ px ] ) + Math.abs( DU[ offsetDU ] * X[ px + strideX1 ] );
					for ( i = 1; i < N - 1; i++ ) {
						WORK[ offsetWork + ( i * strideWork ) ] = Math.abs( B[ pb + ( i * strideB1 ) ] ) + Math.abs( DL[ offsetDL + ( ( i - 1 ) * strideDL ) ] * X[ px + ( ( i - 1 ) * strideX1 ) ] ) + Math.abs( d[ offsetD + ( i * strideD ) ] * X[ px + ( i * strideX1 ) ] ) + Math.abs( DU[ offsetDU + ( i * strideDU ) ] * X[ px + ( ( i + 1 ) * strideX1 ) ] );
					}
					WORK[ offsetWork + ( ( N - 1 ) * strideWork ) ] = Math.abs( B[ pb + ( ( N - 1 ) * strideB1 ) ] ) + Math.abs( DL[ offsetDL + ( ( N - 2 ) * strideDL ) ] * X[ px + ( ( N - 2 ) * strideX1 ) ] ) + Math.abs( d[ offsetD + ( ( N - 1 ) * strideD ) ] * X[ px + ( ( N - 1 ) * strideX1 ) ] );
				}
			} else {
				px = offsetX + ( j * strideX2 );
				pb = offsetB + ( j * strideB2 );
				if ( N === 1 ) {
					WORK[ offsetWork ] = Math.abs( B[ pb ] ) + Math.abs( d[ offsetD ] * X[ px ] );
				} else {
					WORK[ offsetWork ] = Math.abs( B[ pb ] ) + Math.abs( d[ offsetD ] * X[ px ] ) + Math.abs( DL[ offsetDL ] * X[ px + strideX1 ] );
					for ( i = 1; i < N - 1; i++ ) {
						WORK[ offsetWork + ( i * strideWork ) ] = Math.abs( B[ pb + ( i * strideB1 ) ] ) + Math.abs( DU[ offsetDU + ( ( i - 1 ) * strideDU ) ] * X[ px + ( ( i - 1 ) * strideX1 ) ] ) + Math.abs( d[ offsetD + ( i * strideD ) ] * X[ px + ( i * strideX1 ) ] ) + Math.abs( DL[ offsetDL + ( i * strideDL ) ] * X[ px + ( ( i + 1 ) * strideX1 ) ] );
					}
					WORK[ offsetWork + ( ( N - 1 ) * strideWork ) ] = Math.abs( B[ pb + ( ( N - 1 ) * strideB1 ) ] ) + Math.abs( DU[ offsetDU + ( ( N - 2 ) * strideDU ) ] * X[ px + ( ( N - 2 ) * strideX1 ) ] ) + Math.abs( d[ offsetD + ( ( N - 1 ) * strideD ) ] * X[ px + ( ( N - 1 ) * strideX1 ) ] );
				}
			}

			// Compute backward error
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				pw = offsetWork + ( i * strideWork );
				if ( WORK[ pw ] > safe2 ) {
					s = Math.max( s, Math.abs( WORK[ pw + ( N * strideWork ) ] ) / WORK[ pw ] );
				} else {
					s = Math.max( s, ( Math.abs( WORK[ pw + ( N * strideWork ) ] ) + safe1 ) / ( WORK[ pw ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + ( j * strideBERR ) ] = s;

			// Test whether the error is acceptable. If so, skip to forward error estimation.
			if ( BERR[ offsetBERR + ( j * strideBERR ) ] > EPS && 2.0 * BERR[ offsetBERR + ( j * strideBERR ) ] <= lstres && count <= ITMAX ) {
				// Update solution: solve A * dx = residual
				dgttrs( trans, N, 1, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork + ( N * strideWork ) );

				// X[:,j] += correction
				px = offsetX + ( j * strideX2 );
				daxpy( N, 1.0, WORK, strideWork, offsetWork + ( N * strideWork ), X, strideX1, px );
				lstres = BERR[ offsetBERR + ( j * strideBERR ) ];
				count += 1;
			} else {
				break;
			}
		}

		// Estimate forward error using dlacn2
		// WORK[0..N-1] = bound on absolute error
		for ( i = 0; i < N; i++ ) {
			pw = offsetWork + ( i * strideWork );
			if ( WORK[ pw ] > safe2 ) {
				WORK[ pw ] = Math.abs( WORK[ pw + ( N * strideWork ) ] ) + ( nz * EPS * WORK[ pw ] );
			} else {
				WORK[ pw ] = Math.abs( WORK[ pw + ( N * strideWork ) ] ) + ( nz * EPS * WORK[ pw ] ) + safe1;
			}
		}

		KASE[ 0 ] = 0;
		while ( true ) {
			dlacn2( N, WORK, strideWork, offsetWork + ( 2 * N * strideWork ), WORK, strideWork, offsetWork + ( N * strideWork ), IWORK, strideIWork, offsetIWork, EST, KASE, ISAVE, 1, 0 );

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === 1 ) {
				// Multiply by inv(A^T) or inv(A)
				dgttrs( transt, N, 1, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork + ( N * strideWork ) );
				for ( i = 0; i < N; i++ ) {
					pw = offsetWork + ( ( N + i ) * strideWork );
					WORK[ pw ] = WORK[ offsetWork + ( i * strideWork ) ] * WORK[ pw ];
				}
			} else {
				// Multiply by diag(W) then solve
				for ( i = 0; i < N; i++ ) {
					pw = offsetWork + ( ( N + i ) * strideWork );
					WORK[ pw ] = WORK[ offsetWork + ( i * strideWork ) ] * WORK[ pw ];
				}
				dgttrs( transn, N, 1, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork + ( N * strideWork ) );
			}
		}

		// Normalize: FERR[j] = EST / max_i(|X[i,j]|)
		FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];
		lstres = 0.0;
		px = offsetX + ( j * strideX2 );
		for ( i = 0; i < N; i++ ) {
			lstres = Math.max( lstres, Math.abs( X[ px ] ) );
			px += strideX1;
		}
		if ( lstres !== 0.0 ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] /= lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default dgtrfs;
