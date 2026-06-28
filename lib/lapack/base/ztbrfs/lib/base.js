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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import ztbmv from '../../../../blas/base/ztbmv/lib/base.js';
import ztbsv from '../../../../blas/base/ztbsv/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );
var CNEGONE = new Complex128( -1.0, 0.0 );


// FUNCTIONS //

/**
* Computes CABS1 value: |re(z)| + |im(z)|.
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
* Provides error bounds and backward error estimates for the solution to a system of linear equations with a complex triangular band coefficient matrix.
*
* The solution matrix X must be computed by ztbtrs or some other means before entering this routine. This routine does not do iterative refinement because doing so cannot improve the backward error.
*
* For TRANS: `no-transpose` solves `A * X = B`, `transpose` solves `A^T * X = B`, `conjugate-transpose` solves `A^H * X = B`.
*
* @private
* @param {string} uplo - specifies whether A is upper or lower triangular
* @param {string} trans - specifies the form of the system of equations
* @param {string} diag - specifies whether A is unit triangular
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} kd - number of super/sub-diagonals of A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AB - triangular band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB (complex elements)
* @param {integer} strideAB2 - stride of the second dimension of AB (complex elements)
* @param {NonNegativeInteger} offsetAB - index offset for AB (complex elements)
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (complex elements)
* @param {Complex128Array} X - solution matrix
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
function ztbrfs( uplo, trans, diag, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var notran;
	var nounit;
	var transn;
	var transt;
	var lstres;
	var upper;
	var ISAVE;
	var WORKv;
	var safe1;
	var safe2;
	var KASE;
	var imax;
	var ABv;
	var EST;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var oAB;
	var Bv;
	var Xv;
	var sw;
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

	upper = ( uplo === 'upper' );
	notran = ( trans === 'no-transpose' );
	nounit = ( diag === 'non-unit' );

	if ( notran ) {
		transn = 'no-transpose';
		transt = 'conjugate-transpose';
	} else {
		transn = 'conjugate-transpose';
		transt = 'no-transpose';
	}

	// NZ = maximum number of nonzero elements in each row of A, plus 1
	nz = kd + 2;
	safe1 = nz * SAFMIN;
	safe2 = safe1 / EPS;

	// Get Float64 views for element access
	WORKv = reinterpret( WORK, 0 );
	ABv = reinterpret( AB, 0 );
	Bv = reinterpret( B, 0 );
	Xv = reinterpret( X, 0 );

	// Double-based strides and offsets
	sa1 = strideAB1 * 2;
	sa2 = strideAB2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	sw = strideWork * 2;
	oAB = offsetAB * 2;
	oB = offsetB * 2;
	oX = offsetX * 2;
	oW = offsetWork * 2;

	// Allocate state arrays for zlacn2
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	ISAVE = new Int32Array( 3 );

	// Process each right-hand side
	for ( j = 0; j < nrhs; j++ ) {
		// Compute residual R = B - op(A) * X by first copying X(:,j) into WORK(0:N-1)...
		zcopy( N, X, strideX1, offsetX + ( j * strideX2 ), WORK, strideWork, offsetWork );

		// Compute WORK = op(A) * X(:,j) via ztbmv...
		ztbmv( uplo, trans, diag, N, kd, AB, strideAB1, strideAB2, offsetAB, WORK, strideWork, offsetWork );

		// Subtract B(:,j) so WORK = op(A)*X - B...
		zaxpy( N, CNEGONE, B, strideB1, offsetB + ( j * strideB2 ), WORK, strideWork, offsetWork );

		// Initialize RWORK(i) = CABS1(B(i,j)) for backward error computation
		for ( i = 0; i < N; i++ ) {
			RWORK[ offsetRWork + ( i * strideRWork ) ] = cabs1( Bv, oB + ( i * sb1 ) + ( j * sb2 ) );
		}

		if ( notran ) {
			// Compute abs(A)*abs(X) + abs(B)
			if ( upper ) {
				if ( nounit ) {
					for ( k = 0; k < N; k++ ) {
						xk = cabs1( Xv, oX + ( k * sx1 ) + ( j * sx2 ) );
						imax = k;
						for ( i = Math.max( 0, k - kd ); i <= imax; i++ ) {
							RWORK[ offsetRWork + ( i * strideRWork ) ] += cabs1( ABv, oAB + ( ( kd + i - k ) * sa1 ) + ( k * sa2 ) ) * xk;
						}
					}
				} else {
					for ( k = 0; k < N; k++ ) {
						xk = cabs1( Xv, oX + ( k * sx1 ) + ( j * sx2 ) );
						for ( i = Math.max( 0, k - kd ); i <= k - 1; i++ ) {
							RWORK[ offsetRWork + ( i * strideRWork ) ] += cabs1( ABv, oAB + ( ( kd + i - k ) * sa1 ) + ( k * sa2 ) ) * xk;
						}
						RWORK[ offsetRWork + ( k * strideRWork ) ] += xk;
					}
				}
			} else if ( nounit ) {
				for ( k = 0; k < N; k++ ) {
					xk = cabs1( Xv, oX + ( k * sx1 ) + ( j * sx2 ) );
					imax = Math.min( N - 1, k + kd );
					for ( i = k; i <= imax; i++ ) {
						RWORK[ offsetRWork + ( i * strideRWork ) ] += cabs1( ABv, oAB + ( ( i - k ) * sa1 ) + ( k * sa2 ) ) * xk;
					}
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					xk = cabs1( Xv, oX + ( k * sx1 ) + ( j * sx2 ) );
					imax = Math.min( N - 1, k + kd );
					for ( i = k + 1; i <= imax; i++ ) {
						RWORK[ offsetRWork + ( i * strideRWork ) ] += cabs1( ABv, oAB + ( ( i - k ) * sa1 ) + ( k * sa2 ) ) * xk;
					}
					RWORK[ offsetRWork + ( k * strideRWork ) ] += xk;
				}
			}
		} else if ( upper ) {
			// Compute abs(A**H)*abs(X) + abs(B) for upper triangular
			if ( nounit ) {
				for ( k = 0; k < N; k++ ) {
					s = 0.0;
					for ( i = Math.max( 0, k - kd ); i <= k; i++ ) {
						s += cabs1( ABv, oAB + ( ( kd + i - k ) * sa1 ) + ( k * sa2 ) ) * cabs1( Xv, oX + ( i * sx1 ) + ( j * sx2 ) );
					}
					RWORK[ offsetRWork + ( k * strideRWork ) ] += s;
				}
			} else {
				for ( k = 0; k < N; k++ ) {
					s = cabs1( Xv, oX + ( k * sx1 ) + ( j * sx2 ) );
					for ( i = Math.max( 0, k - kd ); i <= k - 1; i++ ) {
						s += cabs1( ABv, oAB + ( ( kd + i - k ) * sa1 ) + ( k * sa2 ) ) * cabs1( Xv, oX + ( i * sx1 ) + ( j * sx2 ) );
					}
					RWORK[ offsetRWork + ( k * strideRWork ) ] += s;
				}
			}
		} else if ( nounit ) {
			// Compute abs(A**H)*abs(X) + abs(B) for lower non-unit
			for ( k = 0; k < N; k++ ) {
				s = 0.0;
				imax = Math.min( N - 1, k + kd );
				for ( i = k; i <= imax; i++ ) {
					s += cabs1( ABv, oAB + ( ( i - k ) * sa1 ) + ( k * sa2 ) ) * cabs1( Xv, oX + ( i * sx1 ) + ( j * sx2 ) );
				}
				RWORK[ offsetRWork + ( k * strideRWork ) ] += s;
			}
		} else {
			// Compute abs(A**H)*abs(X) + abs(B) for lower unit
			for ( k = 0; k < N; k++ ) {
				s = cabs1( Xv, oX + ( k * sx1 ) + ( j * sx2 ) );
				imax = Math.min( N - 1, k + kd );
				for ( i = k + 1; i <= imax; i++ ) {
					s += cabs1( ABv, oAB + ( ( i - k ) * sa1 ) + ( k * sa2 ) ) * cabs1( Xv, oX + ( i * sx1 ) + ( j * sx2 ) );
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

		// Bound error from formula using zlacn2 to estimate the infinity-norm of inv(op(A)) * diag(W)
		for ( i = 0; i < N; i++ ) {
			if ( RWORK[ offsetRWork + ( i * strideRWork ) ] > safe2 ) {
				RWORK[ offsetRWork + ( i * strideRWork ) ] = cabs1( WORKv, oW + ( i * sw ) ) + ( nz * EPS * RWORK[ offsetRWork + ( i * strideRWork ) ] );
			} else {
				RWORK[ offsetRWork + ( i * strideRWork ) ] = cabs1( WORKv, oW + ( i * sw ) ) + ( nz * EPS * RWORK[ offsetRWork + ( i * strideRWork ) ] ) + safe1;
			}
		}

		KASE[ 0 ] = 0;

		// Reverse communication loop for zlacn2
		while ( true ) {
			EST[ 0 ] = FERR[ offsetFERR + ( j * strideFERR ) ];
			zlacn2( N, WORK, strideWork, offsetWork + ( N * strideWork ), WORK, strideWork, offsetWork, EST, KASE, ISAVE, 1, 0 );
			FERR[ offsetFERR + ( j * strideFERR ) ] = EST[ 0 ];

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === 1 ) {
				// Multiply by diag(W)*inv(op(A)**H)
				ztbsv( uplo, transt, diag, N, kd, AB, strideAB1, strideAB2, offsetAB, WORK, strideWork, offsetWork );
				for ( i = 0; i < N; i++ ) {
					WORKv[ oW + ( i * sw ) ] = RWORK[ offsetRWork + ( i * strideRWork ) ] * WORKv[ oW + ( i * sw ) ];
					WORKv[ oW + ( i * sw ) + 1 ] = RWORK[ offsetRWork + ( i * strideRWork ) ] * WORKv[ oW + ( i * sw ) + 1 ];
				}
			} else {
				// Multiply by inv(op(A))*diag(W)
				for ( i = 0; i < N; i++ ) {
					WORKv[ oW + ( i * sw ) ] = RWORK[ offsetRWork + ( i * strideRWork ) ] * WORKv[ oW + ( i * sw ) ];
					WORKv[ oW + ( i * sw ) + 1 ] = RWORK[ offsetRWork + ( i * strideRWork ) ] * WORKv[ oW + ( i * sw ) + 1 ];
				}
				ztbsv( uplo, transn, diag, N, kd, AB, strideAB1, strideAB2, offsetAB, WORK, strideWork, offsetWork );
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

export default ztbrfs;
