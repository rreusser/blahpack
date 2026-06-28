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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlangb from '../../dlangb/lib/base.js';
import dlantb from '../../dlantb/lib/base.js';
import dlaqgb from '../../dlaqgb/lib/base.js';
import dgbequ from '../../dgbequ/lib/base.js';
import dgbcon from '../../dgbcon/lib/base.js';
import dgbrfs from '../../dgbrfs/lib/base.js';
import dgbtrf from '../../dgbtrf/lib/base.js';
import dgbtrs from '../../dgbtrs/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Solves a real system of linear equations `A * X = B` where A is a general band matrix, with equilibration, condition estimation, and error bounds.
*
* @private
* @param {string} fact - 'not-factored', 'equilibrate', or 'factored'
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AB - band matrix in band storage ((KL+KU+1) x N)
* @param {integer} strideAB1 - stride of first dimension of AB
* @param {integer} strideAB2 - stride of second dimension of AB
* @param {NonNegativeInteger} offsetAB - index offset for AB
* @param {Float64Array} AFB - factored band matrix ((2*KL+KU+1) x N, output)
* @param {integer} strideAFB1 - stride of first dimension of AFB
* @param {integer} strideAFB2 - stride of second dimension of AFB
* @param {NonNegativeInteger} offsetAFB - index offset for AFB
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
* @param {Float64Array} B - N-by-NRHS right-hand side (may be scaled on exit)
* @param {integer} strideB1 - stride of first dimension of B
* @param {integer} strideB2 - stride of second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {Float64Array} X - N-by-NRHS solution matrix (output)
* @param {integer} strideX1 - stride of first dimension of X
* @param {integer} strideX2 - stride of second dimension of X
* @param {NonNegativeInteger} offsetX - index offset for X
* @param {Float64Array} FERR - forward error bounds (output, length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - index offset for FERR
* @param {Float64Array} BERR - backward error bounds (output, length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - index offset for BERR
* @param {Float64Array} WORK - real workspace (length >= 3*N)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - index offset for WORK
* @param {Int32Array} IWORK - integer workspace (length >= N)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - index offset for IWORK
* @returns {Object} result with info, equed, rcond, rpvgrw
*/
function dgbsvx( fact, trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, equed, r, strideR, offsetR, c, strideC, offsetC, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) {
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
	var eq;
	var j1;
	var j2;
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
		eq = dgbequ( N, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, r, strideR, offsetR, c, strideC, offsetC );
		rowcnd = eq.rowcnd;
		colcnd = eq.colcnd;

		if ( eq.info === 0 ) {
			// Equilibrate the matrix
			equed = dlaqgb( N, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, eq.amax );
			rowequ = ( equed === 'row' || equed === 'both' );
			colequ = ( equed === 'column' || equed === 'both' );
		}
	}

	// Scale the right-hand side
	if ( notran ) {
		if ( rowequ ) {
			for ( j = 0; j < nrhs; j++ ) {
				for ( i = 0; i < N; i++ ) {
					B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] *= r[ offsetR + ( i * strideR ) ];
				}
			}
		}
	} else if ( colequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < N; i++ ) {
				B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] *= c[ offsetC + ( i * strideC ) ];
			}
		}
	}

	if ( nofact || equil ) {
		// Copy AB to AFB: for each column j, copy the band entries
		// Fortran: DO 70 J = 1, N; J1 = MAX(J-KU, 1); J2 = MIN(J+KL, N)
		//   CALL DCOPY(J2-J1+1, AB(KU+1-J+J1, J), 1, AFB(KL+KU+1-J+J1, J), 1)
		for ( j = 0; j < N; j++ ) {
			j1 = ( j - ku > 0 ) ? j - ku : 0;         // 0-based MAX(J-KU, 1)-1
			j2 = ( j + kl < N - 1 ) ? j + kl : N - 1; // 0-based MIN(J+KL, N)-1
			dcopy( j2 - j1 + 1, AB, strideAB1, offsetAB + ( ( ku - j + j1 ) * strideAB1 ) + ( j * strideAB2 ), AFB, strideAFB1, offsetAFB + ( ( kl + ku - j + j1 ) * strideAFB1 ) + ( j * strideAFB2 ) );
		}

		// Compute the LU factorization
		info = dgbtrf( N, N, kl, ku, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV );

		if ( info > 0 ) {
			// Compute the reciprocal pivot growth factor of leading rank-deficient columns
			anorm = computeSingularAnorm( AB, strideAB1, strideAB2, offsetAB, N, kl, ku, info );

			rpvgrw = dlantb( 'max', 'upper', 'non-unit', info, Math.min( info - 1, kl + ku ), AFB, strideAFB1, strideAFB2, offsetAFB + ( Math.max( 0, kl + ku + 1 - info ) * strideAFB1 ), WORK, strideWork, offsetWork );
			if ( rpvgrw === 0.0 ) {
				rpvgrw = 1.0;
			} else {
				rpvgrw = anorm / rpvgrw;
			}
			WORK[ offsetWork ] = rpvgrw;
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
	anorm = dlangb( norm, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, WORK, strideWork, offsetWork );
	rpvgrw = dlantb( 'max', 'upper', 'non-unit', N, kl + ku, AFB, strideAFB1, strideAFB2, offsetAFB, WORK, strideWork, offsetWork );
	if ( rpvgrw === 0.0 ) {
		rpvgrw = 1.0;
	} else {
		rpvgrw = dlangb( 'max', N, kl, ku, AB, strideAB1, strideAB2, offsetAB, WORK, strideWork, offsetWork ) / rpvgrw;
	}

	// Compute the reciprocal of the condition number
	RCOND = new Float64Array( 1 );
	dgbcon( norm, N, kl, ku, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, anorm, RCOND, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );
	rcond = RCOND[ 0 ];

	// Compute the solution matrix X
	dlacpy( 'full', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );
	dgbtrs( trans, N, kl, ku, nrhs, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, X, strideX1, strideX2, offsetX );

	// Use iterative refinement to improve the solution
	dgbrfs( trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );

	// Transform the solution matrix X to a solution of the original system
	if ( notran ) {
		if ( colequ ) {
			for ( j = 0; j < nrhs; j++ ) {
				for ( i = 0; i < N; i++ ) {
					X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] *= c[ offsetC + ( i * strideC ) ];
				}
			}
			for ( j = 0; j < nrhs; j++ ) {
				FERR[ offsetFERR + ( j * strideFERR ) ] /= colcnd;
			}
		}
	} else if ( rowequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < N; i++ ) {
				X[ offsetX + ( i * strideX1 ) + ( j * strideX2 ) ] *= r[ offsetR + ( i * strideR ) ];
			}
		}
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] /= rowcnd;
		}
	}

	// Set INFO = N+1 if the matrix is singular to working precision
	info = 0;
	if ( rcond < EPS ) {
		info = N + 1;
	}

	WORK[ offsetWork ] = rpvgrw;
	return {
		'info': info,
		'equed': equed,
		'rcond': rcond,
		'rpvgrw': rpvgrw
	};
}

/**
* Computes the max absolute element over the first `ncols` columns of a band matrix AB.
*
* @private
* @param {Float64Array} AB - band matrix
* @param {integer} strideAB1 - first dim stride
* @param {integer} strideAB2 - second dim stride
* @param {NonNegativeInteger} offsetAB - offset
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} kl - subdiagonals
* @param {NonNegativeInteger} ku - superdiagonals
* @param {NonNegativeInteger} ncols - number of columns to scan
* @returns {number} max abs element
*/
function computeSingularAnorm( AB, strideAB1, strideAB2, offsetAB, N, kl, ku, ncols ) {
	var anorm = 0.0;
	var temp;
	var lo;
	var hi;
	var i;
	var j;

	for ( j = 0; j < ncols; j++ ) {
		// Fortran 1-based: I from MAX(KU+2-J,1) to MIN(N+KU+1-J, KL+KU+1)
		// 0-based: i from max(ku+1-j, 1)-1 to min(N+ku-j, kl+ku+1)-1
		lo = ( ( ku + 1 - j > 1 ) ? ku + 1 - j : 1 ) - 1;
		hi = ( ( N + ku - j < kl + ku + 1 ) ? N + ku - j : kl + ku + 1 );
		for ( i = lo; i < hi; i++ ) {
			temp = Math.abs( AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] );
			if ( temp > anorm || temp !== temp ) {
				anorm = temp;
			}
		}
	}
	return anorm;
}


// EXPORTS //

export default dgbsvx;
