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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeequ from '../../zgeequ/lib/base.js';
import zlaqge from '../../zlaqge/lib/base.js';
import zgetrf from '../../zgetrf/lib/base.js';
import zgetrs from '../../zgetrs/lib/base.js';
import zgerfs from '../../zgerfs/lib/base.js';
import zgecon from '../../zgecon/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zlantr from '../../zlantr/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Expert driver for solving a complex system of linear equations A*X = B.
* using the LU factorization. Provides equilibration, condition estimation,
* iterative refinement, and error bounds.
*
* FACT controls whether to factor, equilibrate+factor, or use pre-factored:
*   'not-factored' - factor A, no equilibration
*   'equilibrate' - equilibrate if needed, then factor
*   'factored' - use pre-factored AF and IPIV (and pre-computed R,C if equilibrated)
*
* TRANS specifies the system:
*   'no-transpose' - A _ X = B
_   'transpose' - A^T _ X = B
*   'conjugate-transpose' - A^H * X = B
*
* EQUED (input if FACT='factored', output otherwise):
*   'none' - no equilibration
*   'row' - row equilibration (A premultiplied by diag(R))
*   'column' - column equilibration (A postmultiplied by diag(C))
*   'both' - both row and column equilibration
*
* Returns { info, equed, rcond, rpvgrw } where:
*   info: 0=success, i (1-based)=U(i,i) is zero, N+1=singular to working precision
*   equed: equilibration type applied
*   rcond: reciprocal condition number estimate
*   rpvgrw: reciprocal pivot growth factor
*
* @private
* @param {string} fact - 'not-factored', 'equilibrate', or 'factored'
* @param {string} trans - 'no-transpose', 'transpose', or 'conjugate-transpose'
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - N-by-N complex matrix (may be equilibrated on exit)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Complex128Array} AF - N-by-N factored matrix (output)
* @param {integer} strideAF1 - stride of the first dimension of AF (complex elements)
* @param {integer} strideAF2 - stride of the second dimension of AF (complex elements)
* @param {NonNegativeInteger} offsetAF - index offset for AF (complex elements)
* @param {Int32Array} IPIV - pivot indices (0-based, output)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {string} equed - equilibration type (input if FACT='factored')
* @param {Float64Array} r - row scale factors
* @param {integer} strideR - stride for r
* @param {NonNegativeInteger} offsetR - index offset for r
* @param {Float64Array} c - column scale factors
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - index offset for c
* @param {Complex128Array} B - N-by-NRHS right-hand side (may be scaled on exit)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (complex elements)
* @param {Complex128Array} X - N-by-NRHS solution matrix (output)
* @param {integer} strideX1 - stride of the first dimension of X (complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (complex elements)
* @param {NonNegativeInteger} offsetX - index offset for X (complex elements)
* @param {Float64Array} FERR - forward error bounds (output, length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - index offset for FERR
* @param {Float64Array} BERR - backward error bounds (output, length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - index offset for BERR
* @param {Complex128Array} WORK - complex workspace of length >= 2*N
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - index offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of length >= 2*N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - index offset for RWORK
* @returns {Object} result with info, equed, rcond, rpvgrw
*/
function zgesvx( fact, trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, equed, r, strideR, offsetR, c, strideC, offsetC, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var rpvgrw;
	var rowequ;
	var colequ;
	var nofact;
	var notran;
	var colcnd;
	var rowcnd;
	var equil;
	var rcond;
	var anorm;
	var RCOND;
	var norm;
	var info;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var Bv;
	var Xv;
	var oB;
	var oX;
	var ri;
	var ci;
	var ia;
	var eq;
	var i;
	var j;

	nofact = ( fact === 'not-factored' );
	equil = ( fact === 'equilibrate' );
	notran = ( trans === 'no-transpose' );

	if ( nofact || equil ) {
		equed = 'none';
		rowequ = false;
		colequ = false;
	} else {
		rowequ = ( equed === 'row' || equed === 'both' );
		colequ = ( equed === 'column' || equed === 'both' );
	}

	// Quick return if possible
	if ( N === 0 || nrhs === 0 ) {
		return {
			'info': 0,
			'equed': equed,
			'rcond': 1.0,
			'rpvgrw': 1.0
		};
	}

	// Equilibrate if requested
	if ( equil ) {
		eq = zgeequ( N, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC );
		rowcnd = eq.rowcnd;
		colcnd = eq.colcnd;

		if ( eq.info === 0 ) {
			// Equilibrate the matrix
			equed = zlaqge( N, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, eq.amax );
			rowequ = ( equed === 'row' || equed === 'both' );
			colequ = ( equed === 'column' || equed === 'both' );
		}
	}

	// Get Float64 views for element-level scaling
	Bv = reinterpret( B, 0 );
	Xv = reinterpret( X, 0 );
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	oB = offsetB * 2;
	oX = offsetX * 2;

	// Scale the right-hand side
	if ( notran ) {
		if ( rowequ ) {
			for ( j = 0; j < nrhs; j++ ) {
				for ( i = 0; i < N; i++ ) {
					ri = r[ offsetR + ( i * strideR ) ];
					ia = oB + ( i * sb1 ) + ( j * sb2 );
					Bv[ ia ] = ri * Bv[ ia ];         // real part
					Bv[ ia + 1 ] = ri * Bv[ ia + 1 ]; // imag part
				}
			}
		}
	} else if ( colequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < N; i++ ) {
				ci = c[ offsetC + ( i * strideC ) ];
				ia = oB + ( i * sb1 ) + ( j * sb2 );
				Bv[ ia ] = ci * Bv[ ia ];         // real part
				Bv[ ia + 1 ] = ci * Bv[ ia + 1 ]; // imag part
			}
		}
	}

	if ( nofact || equil ) {
		// Copy A to AF
		zlacpy( 'full', N, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF );

		// Compute the LU factorization
		info = zgetrf( N, N, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV );

		if ( info > 0 ) {
			// Compute reciprocal pivot growth factor of leading rank-deficient columns
			rpvgrw = zlantr( 'max', 'upper', 'non-unit', info, info, AF, strideAF1, strideAF2, offsetAF, RWORK, strideRWork, offsetRWork );
			if ( rpvgrw === 0.0 ) {
				rpvgrw = 1.0;
			} else {
				rpvgrw = zlange( 'max', N, info, A, strideA1, strideA2, offsetA, RWORK, strideRWork, offsetRWork ) / rpvgrw;
			}
			return {
				'info': info,
				'equed': equed,
				'rcond': 0.0,
				'rpvgrw': rpvgrw
			};
		}
	}

	// Compute the norm of A and the reciprocal pivot growth factor
	if ( notran ) {
		norm = 'one-norm';
	} else {
		norm = 'inf-norm';
	}
	anorm = zlange( norm, N, N, A, strideA1, strideA2, offsetA, RWORK, strideRWork, offsetRWork );
	rpvgrw = zlantr( 'max', 'upper', 'non-unit', N, N, AF, strideAF1, strideAF2, offsetAF, RWORK, strideRWork, offsetRWork );
	if ( rpvgrw === 0.0 ) {
		rpvgrw = 1.0;
	} else {
		rpvgrw = zlange( 'max', N, N, A, strideA1, strideA2, offsetA, RWORK, strideRWork, offsetRWork ) / rpvgrw;
	}

	// Compute the reciprocal of the condition number
	RCOND = new Float64Array( 1 );
	zgecon( norm, N, AF, strideAF1, strideAF2, offsetAF, anorm, RCOND, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );
	rcond = RCOND[ 0 ];

	// Compute the solution matrix X
	zlacpy( 'full', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	zgetrs( trans, N, nrhs, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, X, strideX1, strideX2, offsetX );

	// Use iterative refinement to improve the solution
	zgerfs( trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	// Transform the solution matrix X to a solution of the original system
	if ( notran ) {
		if ( colequ ) {
			for ( j = 0; j < nrhs; j++ ) {
				for ( i = 0; i < N; i++ ) {
					ci = c[ offsetC + ( i * strideC ) ];
					ia = oX + ( i * sx1 ) + ( j * sx2 );
					Xv[ ia ] = ci * Xv[ ia ];         // real part
					Xv[ ia + 1 ] = ci * Xv[ ia + 1 ]; // imag part
				}
			}
			for ( j = 0; j < nrhs; j++ ) {
				FERR[ offsetFERR + ( j * strideFERR ) ] = FERR[ offsetFERR + ( j * strideFERR ) ] / colcnd;
			}
		}
	} else if ( rowequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < N; i++ ) {
				ri = r[ offsetR + ( i * strideR ) ];
				ia = oX + ( i * sx1 ) + ( j * sx2 );
				Xv[ ia ] = ri * Xv[ ia ];         // real part
				Xv[ ia + 1 ] = ri * Xv[ ia + 1 ]; // imag part
			}
		}
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] = FERR[ offsetFERR + ( j * strideFERR ) ] / rowcnd;
		}
	}

	// Set INFO = N+1 if the matrix is singular to working precision
	info = 0;
	if ( rcond < EPS ) {
		info = N + 1;
	}

	return {
		'info': info,
		'equed': equed,
		'rcond': rcond,
		'rpvgrw': rpvgrw
	};
}


// EXPORTS //

export default zgesvx;
