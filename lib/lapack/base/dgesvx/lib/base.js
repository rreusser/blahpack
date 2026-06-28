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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import dgeequ from '../../dgeequ/lib/base.js';
import dlaqge from '../../dlaqge/lib/base.js';
import dgetrf from '../../dgetrf/lib/base.js';
import dgetrs from '../../dgetrs/lib/base.js';
import dgerfs from '../../dgerfs/lib/base.js';
import dgecon from '../../dgecon/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlantr from '../../dlantr/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Expert driver for solving a real system of linear equations A*X = B,.
* using the LU factorization. Provides equilibration, condition estimation,
* iterative refinement, and error bounds.
*
* FACT controls whether to factor, equilibrate+factor, or use pre-factored:
*   'N' - factor A, no equilibration
*   'E' - equilibrate if needed, then factor
*   'F' - use pre-factored AF and IPIV (and pre-computed R,C if equilibrated)
*
* TRANS specifies the system:
*   'N' - A _ X = B
_   'T' or 'C' - A^T _ X = B
*
* EQUED (input if FACT='F', output otherwise):
*   'N' - no equilibration
*   'R' - row equilibration (A premultiplied by diag(R))
*   'C' - column equilibration (A postmultiplied by diag(C))
*   'B' - both row and column equilibration
*
* Returns { info, equed, rcond, rpvgrw } where:
*   info: 0=success, i (1-based)=U(i,i) is zero, N+1=singular to working precision
*   equed: equilibration type applied
*   rcond: reciprocal condition number estimate
*   rpvgrw: reciprocal pivot growth factor
*
* @private
* @param {string} fact - `'not-factored'`, `'equilibrate'`, or `'factored'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - N-by-N matrix (may be equilibrated on exit)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} AF - N-by-N factored matrix (output)
* @param {integer} strideAF1 - stride of the first dimension of AF
* @param {integer} strideAF2 - stride of the second dimension of AF
* @param {NonNegativeInteger} offsetAF - index offset for AF
* @param {Int32Array} IPIV - pivot indices (0-based, output)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {string} equed - equilibration type (input if FACT=`'factored'`)
* @param {Float64Array} r - row scale factors
* @param {integer} strideR - stride for r
* @param {NonNegativeInteger} offsetR - index offset for r
* @param {Float64Array} c - column scale factors
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - index offset for c
* @param {Float64Array} B - N-by-NRHS right-hand side (may be scaled on exit)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {Float64Array} X - N-by-NRHS solution matrix (output)
* @param {integer} strideX1 - stride of the first dimension of X
* @param {integer} strideX2 - stride of the second dimension of X
* @param {NonNegativeInteger} offsetX - index offset for X
* @param {Float64Array} FERR - forward error bounds (output, length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - index offset for FERR
* @param {Float64Array} BERR - backward error bounds (output, length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - index offset for BERR
* @param {Float64Array} WORK - workspace array (length >= max(1, 4*N))
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - index offset for WORK
* @param {Int32Array} IWORK - integer workspace array (length >= N)
* @param {integer} strideIwork - stride for IWORK
* @param {NonNegativeInteger} offsetIwork - index offset for IWORK
* @returns {Object} result with info, equed, rcond, rpvgrw
*/
function dgesvx( fact, trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, equed, r, strideR, offsetR, c, strideC, offsetC, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIwork, offsetIwork ) { // eslint-disable-line max-params
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
	var db;
	var dx;
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
		return { 'info': 0, 'equed': equed, 'rcond': 1.0, 'rpvgrw': 1.0 };
	}

	// Equilibrate if requested
	if ( equil ) {
		eq = dgeequ( N, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC );
		rowcnd = eq.rowcnd;
		colcnd = eq.colcnd;

		if ( eq.info === 0 ) {
			// Equilibrate the matrix
			equed = dlaqge( N, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, eq.amax );
			rowequ = ( equed === 'row' || equed === 'both' );
			colequ = ( equed === 'column' || equed === 'both' );
		}
	}

	// Scale the right-hand side
	if ( notran ) {
		if ( rowequ ) {
			for ( j = 0; j < nrhs; j++ ) {
				db = offsetB + ( j * strideB2 );
				for ( i = 0; i < N; i++ ) {
					B[ db + ( i * strideB1 ) ] = r[ offsetR + ( i * strideR ) ] * B[ db + ( i * strideB1 ) ];
				}
			}
		}
	} else if ( colequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			db = offsetB + ( j * strideB2 );
			for ( i = 0; i < N; i++ ) {
				B[ db + ( i * strideB1 ) ] = c[ offsetC + ( i * strideC ) ] * B[ db + ( i * strideB1 ) ];
			}
		}
	}

	if ( nofact || equil ) {
		// Copy A to AF
		dlacpy( 'full', N, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF );

		// Compute the LU factorization
		info = dgetrf( N, N, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV );

		if ( info > 0 ) {
			// Compute reciprocal pivot growth factor of leading rank-deficient columns
			rpvgrw = dlantr( 'max', 'upper', 'non-unit', info, info, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, offsetWork );
			if ( rpvgrw === 0.0 ) {
				rpvgrw = 1.0;
			} else {
				rpvgrw = dlange( 'max', N, info, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) / rpvgrw;
			}
			return { 'info': info, 'equed': equed, 'rcond': 0.0, 'rpvgrw': rpvgrw };
		}
	}

	// Compute the norm of A and the reciprocal pivot growth factor
	if ( notran ) {
		norm = 'one-norm';
	} else {
		norm = 'inf-norm';
	}
	anorm = dlange( norm, N, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork );
	rpvgrw = dlantr( 'max', 'upper', 'non-unit', N, N, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, offsetWork );
	if ( rpvgrw === 0.0 ) {
		rpvgrw = 1.0;
	} else {
		rpvgrw = dlange( 'max', N, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) / rpvgrw;
	}

	// Compute the reciprocal of the condition number
	RCOND = new Float64Array( 1 );
	dgecon( norm, N, AF, strideAF1, strideAF2, offsetAF, anorm, RCOND, WORK, strideWork, offsetWork, IWORK, strideIwork, offsetIwork );
	rcond = RCOND[ 0 ];

	// Compute the solution matrix X
	dlacpy( 'full', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	dgetrs( trans, N, nrhs, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, X, strideX1, strideX2, offsetX );

	// Use iterative refinement to improve the solution
	dgerfs( trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIwork, offsetIwork );

	// Transform the solution matrix X to a solution of the original system
	if ( notran ) {
		if ( colequ ) {
			for ( j = 0; j < nrhs; j++ ) {
				dx = offsetX + ( j * strideX2 );
				for ( i = 0; i < N; i++ ) {
					X[ dx + ( i * strideX1 ) ] = c[ offsetC + ( i * strideC ) ] * X[ dx + ( i * strideX1 ) ];
				}
			}
			for ( j = 0; j < nrhs; j++ ) {
				FERR[ offsetFERR + ( j * strideFERR ) ] = FERR[ offsetFERR + ( j * strideFERR ) ] / colcnd;
			}
		}
	} else if ( rowequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			dx = offsetX + ( j * strideX2 );
			for ( i = 0; i < N; i++ ) {
				X[ dx + ( i * strideX1 ) ] = r[ offsetR + ( i * strideR ) ] * X[ dx + ( i * strideX1 ) ];
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

	return { 'info': info, 'equed': equed, 'rcond': rcond, 'rpvgrw': rpvgrw };
}


// EXPORTS //

export default dgesvx;
