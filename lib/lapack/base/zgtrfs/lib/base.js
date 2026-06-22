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

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function, no-mixed-operators */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zgttrs from '../../zgttrs/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import zlagtm from '../../zlagtm/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var EPS = dlamch( 'Epsilon' );
var SAFMIN = dlamch( 'Safe minimum' );
var CONE = new Complex128( 1.0, 0.0 );


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
* Improves the computed solution to a complex tridiagonal system and provides error bounds.
*
* ## Notes
*
* -   Uses the LU factorization computed by zgttrf.
* -   IPIV must contain 0-based pivot indices (as produced by zgttrf).
* -   `trans`: `no-transpose` (A\*X=B), `transpose` (A^T\*X=B), or `conjugate-transpose` (A^H\*X=B).
* -   When NOTRAN, the forward error bound estimation uses `conjugate-transpose` (A^H), not `transpose`, as required for complex matrices.
*
* @private
* @param {string} trans - specifies the form of the system
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} DL - sub-diagonal of original A (length N-1)
* @param {integer} strideDL - stride for DL (complex elements)
* @param {NonNegativeInteger} offsetDL - offset for DL (complex elements)
* @param {Complex128Array} d - diagonal of original A (length N)
* @param {integer} strideD - stride for d (complex elements)
* @param {NonNegativeInteger} offsetD - offset for d (complex elements)
* @param {Complex128Array} DU - super-diagonal of original A (length N-1)
* @param {integer} strideDU - stride for DU (complex elements)
* @param {NonNegativeInteger} offsetDU - offset for DU (complex elements)
* @param {Complex128Array} DLF - factored sub-diagonal from zgttrf (length N-1)
* @param {integer} strideDLF - stride for DLF (complex elements)
* @param {NonNegativeInteger} offsetDLF - offset for DLF (complex elements)
* @param {Complex128Array} DF - factored diagonal from zgttrf (length N)
* @param {integer} strideDF - stride for DF (complex elements)
* @param {NonNegativeInteger} offsetDF - offset for DF (complex elements)
* @param {Complex128Array} DUF - factored super-diagonal from zgttrf (length N-1)
* @param {integer} strideDUF - stride for DUF (complex elements)
* @param {NonNegativeInteger} offsetDUF - offset for DUF (complex elements)
* @param {Complex128Array} DU2 - second superdiagonal from zgttrf (length N-2)
* @param {integer} strideDU2 - stride for DU2 (complex elements)
* @param {NonNegativeInteger} offsetDU2 - offset for DU2 (complex elements)
* @param {Int32Array} IPIV - pivot indices from zgttrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - offset for IPIV
* @param {Complex128Array} B - right-hand side matrix (N x NRHS)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - offset for B (complex elements)
* @param {Complex128Array} X - solution matrix (N x NRHS), refined on output
* @param {integer} strideX1 - stride of the first dimension of X (complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (complex elements)
* @param {NonNegativeInteger} offsetX - offset for X (complex elements)
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - offset for FERR
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - offset for BERR
* @param {Complex128Array} WORK - workspace of length >= 2*N complex elements
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of length >= N
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - offset for RWORK
* @returns {integer} info - 0 if successful
*/
function zgtrfs( trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) {
	var notran;
	var transn;
	var transt;
	var lstres;
	var count;
	var WORKv;
	var ISAVE;
	var safe1;
	var safe2;
	var KASE;
	var DLv;
	var DUv;
	var EST;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var sdl;
	var sdu;
	var oDL;
	var oDU;
	var Bv;
	var Xv;
	var dv;
	var sd;
	var sw;
	var oB;
	var oX;
	var oW;
	var oD;
	var nz;
	var s;
	var i;
	var j;

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
	nz = 4;
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Get Float64 views for element access
	WORKv = reinterpret( WORK, 0 );
	Bv = reinterpret( B, 0 );
	Xv = reinterpret( X, 0 );
	DLv = reinterpret( DL, 0 );
	DUv = reinterpret( DU, 0 );
	dv = reinterpret( d, 0 );

	// Convert complex-element strides to Float64 strides
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	sw = strideWORK * 2;
	sdl = strideDL * 2;
	sdu = strideDU * 2;
	sd = strideD * 2;
	oB = offsetB * 2;
	oX = offsetX * 2;
	oW = offsetWORK * 2;
	oDL = offsetDL * 2;
	oDU = offsetDU * 2;
	oD = offsetD * 2;

	// Allocate state arrays for zlacn2
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	ISAVE = new Int32Array( 3 );

	// Do for each right-hand side
	for ( j = 0; j < nrhs; j++ ) {
		count = 1;
		lstres = 3.0;

		// Iterative refinement loop
		while ( true ) {
			// Compute residual R = B(:,j) - op(A) * X(:,j)
			// Copy B(:,j) into WORK(0:N-1)
			zcopy( N, B, strideB1, offsetB + ( j * strideB2 ), WORK, strideWORK, offsetWORK );

			// WORK(0:N-1) += -1 * op(A) * X(:,j)
			zlagtm( trans, N, 1, -1.0, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, X, strideX1, strideX2, offsetX + ( j * strideX2 ), 1.0, WORK, strideWORK, N * strideWORK, offsetWORK );

			// Compute componentwise relative backward error

			// RWORK(0:N-1) = |B(:,j)| + |op(A)| * |X(:,j)|  (using CABS1)
			if ( notran ) {
				if ( N === 1 ) {
					RWORK[ offsetRWORK ] = cabs1( Bv, oB + ( j * sb2 ) ) + cabs1( dv, oD ) * cabs1( Xv, oX + ( j * sx2 ) );
				} else {
					RWORK[ offsetRWORK ] = cabs1( Bv, oB + ( j * sb2 ) ) + cabs1( dv, oD ) * cabs1( Xv, oX + ( j * sx2 ) ) + cabs1( DUv, oDU ) * cabs1( Xv, oX + sx1 + ( j * sx2 ) );
					for ( i = 1; i < N - 1; i++ ) {
						RWORK[ offsetRWORK + ( i * strideRWORK ) ] = cabs1( Bv, oB + ( i * sb1 ) + ( j * sb2 ) ) + cabs1( DLv, oDL + ( ( i - 1 ) * sdl ) ) * cabs1( Xv, oX + ( ( i - 1 ) * sx1 ) + ( j * sx2 ) ) + cabs1( dv, oD + ( i * sd ) ) * cabs1( Xv, oX + ( i * sx1 ) + ( j * sx2 ) ) + cabs1( DUv, oDU + ( i * sdu ) ) * cabs1( Xv, oX + ( ( i + 1 ) * sx1 ) + ( j * sx2 ) );
					}
					RWORK[ offsetRWORK + ( ( N - 1 ) * strideRWORK ) ] = cabs1( Bv, oB + ( ( N - 1 ) * sb1 ) + ( j * sb2 ) ) + cabs1( DLv, oDL + ( ( N - 2 ) * sdl ) ) * cabs1( Xv, oX + ( ( N - 2 ) * sx1 ) + ( j * sx2 ) ) + cabs1( dv, oD + ( ( N - 1 ) * sd ) ) * cabs1( Xv, oX + ( ( N - 1 ) * sx1 ) + ( j * sx2 ) );
				}
			} else if ( N === 1 ) {
				RWORK[ offsetRWORK ] = cabs1( Bv, oB + ( j * sb2 ) ) + cabs1( dv, oD ) * cabs1( Xv, oX + ( j * sx2 ) );
			} else {
				RWORK[ offsetRWORK ] = cabs1( Bv, oB + ( j * sb2 ) ) + cabs1( dv, oD ) * cabs1( Xv, oX + ( j * sx2 ) ) + cabs1( DLv, oDL ) * cabs1( Xv, oX + sx1 + ( j * sx2 ) );
				for ( i = 1; i < N - 1; i++ ) {
					RWORK[ offsetRWORK + ( i * strideRWORK ) ] = cabs1( Bv, oB + ( i * sb1 ) + ( j * sb2 ) ) + cabs1( DUv, oDU + ( ( i - 1 ) * sdu ) ) * cabs1( Xv, oX + ( ( i - 1 ) * sx1 ) + ( j * sx2 ) ) + cabs1( dv, oD + ( i * sd ) ) * cabs1( Xv, oX + ( i * sx1 ) + ( j * sx2 ) ) + cabs1( DLv, oDL + ( i * sdl ) ) * cabs1( Xv, oX + ( ( i + 1 ) * sx1 ) + ( j * sx2 ) );
				}
				RWORK[ offsetRWORK + ( ( N - 1 ) * strideRWORK ) ] = cabs1( Bv, oB + ( ( N - 1 ) * sb1 ) + ( j * sb2 ) ) + cabs1( DUv, oDU + ( ( N - 2 ) * sdu ) ) * cabs1( Xv, oX + ( ( N - 2 ) * sx1 ) + ( j * sx2 ) ) + cabs1( dv, oD + ( ( N - 1 ) * sd ) ) * cabs1( Xv, oX + ( ( N - 1 ) * sx1 ) + ( j * sx2 ) );
			}

			// Compute backward error BERR(j)
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				if ( RWORK[ offsetRWORK + ( i * strideRWORK ) ] > safe2 ) {
					s = Math.max( s, cabs1( WORKv, oW + ( i * sw ) ) / RWORK[ offsetRWORK + ( i * strideRWORK ) ] );
				} else {
					s = Math.max( s, ( cabs1( WORKv, oW + ( i * sw ) ) + safe1 ) / ( RWORK[ offsetRWORK + ( i * strideRWORK ) ] + safe1 ) );
				}
			}
			BERR[ offsetBERR + ( j * strideBERR ) ] = s;

			// Test stopping criterion
			if ( s > EPS && ( 2.0 * s ) <= lstres && count <= ITMAX ) {
				// Solve op(A) * dx = R using the LU factorization
				// Zgttrs expects Float64-based strides for B
				zgttrs( trans, N, 1, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, oW );

				// X(:,j) += correction
				zaxpy( N, CONE, WORK, strideWORK, offsetWORK, X, strideX1, offsetX + ( j * strideX2 ) );

				lstres = s;
				count += 1;
			} else {
				break;
			}
		}

		// Bound error from formula using zlacn2 to estimate the infinity-norm

		// Set up RWORK(0:N-1) for the error bound estimation
		for ( i = 0; i < N; i++ ) {
			if ( RWORK[ offsetRWORK + ( i * strideRWORK ) ] > safe2 ) {
				RWORK[ offsetRWORK + ( i * strideRWORK ) ] = cabs1( WORKv, oW + ( i * sw ) ) + ( nz * EPS * RWORK[ offsetRWORK + ( i * strideRWORK ) ] );
			} else {
				RWORK[ offsetRWORK + ( i * strideRWORK ) ] = cabs1( WORKv, oW + ( i * sw ) ) + ( nz * EPS * RWORK[ offsetRWORK + ( i * strideRWORK ) ] ) + safe1;
			}
		}

		KASE[ 0 ] = 0;

		// zlacn2 reverse communication loop
		while ( true ) {
			EST[ 0 ] = FERR[ offsetFERR + ( j * strideFERR ) ];
			zlacn2( N, WORK, strideWORK, offsetWORK + ( N * strideWORK ), WORK, strideWORK, offsetWORK, EST, KASE, ISAVE, 1, 0 );
			FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W) * inv(op(A)^H)
				zgttrs( transt, N, 1, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, oW );
				for ( i = 0; i < N; i++ ) {
					// WORK(i) = RWORK(i) * WORK(i)  -- real scalar times complex
					WORKv[ oW + ( i * sw ) ] = RWORK[ offsetRWORK + ( i * strideRWORK ) ] * WORKv[ oW + ( i * sw ) ];
					WORKv[ oW + ( i * sw ) + 1 ] = RWORK[ offsetRWORK + ( i * strideRWORK ) ] * WORKv[ oW + ( i * sw ) + 1 ];
				}
			} else {
				// Multiply by diag(W) then solve with inv(op(A))
				for ( i = 0; i < N; i++ ) {
					// WORK(i) = RWORK(i) * WORK(i)  -- real scalar times complex
					WORKv[ oW + ( i * sw ) ] = RWORK[ offsetRWORK + ( i * strideRWORK ) ] * WORKv[ oW + ( i * sw ) ];
					WORKv[ oW + ( i * sw ) + 1 ] = RWORK[ offsetRWORK + ( i * strideRWORK ) ] * WORKv[ oW + ( i * sw ) + 1 ];
				}
				zgttrs( transn, N, 1, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, oW );
			}
		}

		// Normalize: FERR(j) = EST / max_i(CABS1(X(i,j)))
		lstres = 0.0;
		for ( i = 0; i < N; i++ ) {
			lstres = Math.max( lstres, cabs1( Xv, oX + ( i * sx1 ) + ( j * sx2 ) ) );
		}
		if ( lstres !== 0.0 ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] /= lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default zgtrfs;
