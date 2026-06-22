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
import dpoequ from '../../dpoequ/lib/base.js';
import dlaqsy from '../../dlaqsy/lib/base.js';
import dpotrf from '../../dpotrf/lib/base.js';
import dpotrs from '../../dpotrs/lib/base.js';
import dporfs from '../../dporfs/lib/base.js';
import dpocon from '../../dpocon/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlansy from '../../dlansy/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );
var SMLNUM = dlamch( 'safe-minimum' );
var BIGNUM = 1.0 / SMLNUM;


// MAIN //

/**
* Expert driver for solving a real symmetric positive definite system of.
* linear equations A_X = B, using the Cholesky factorization A = U^T_U or
* A = L*L^T. Provides equilibration, condition estimation, iterative
* refinement, and error bounds.
*
* FACT controls whether to factor, equilibrate+factor, or use pre-factored:
*   'not-factored' - factor A, no equilibration
*   'equilibrate' - equilibrate if needed, then factor
*   'factored' - use pre-factored AF (and pre-computed S if equilibrated)
*
* UPLO specifies whether the upper or lower triangle of A is stored:
*   'upper' - upper triangle
*   'lower' - lower triangle
*
* EQUED (input if FACT='factored', output otherwise):
*   'none' - no equilibration
*   'yes' - equilibration was done (A replaced by diag(S)_A_diag(S))
*
* Returns { info, equed, rcond } where:
*   info: 0=success, i (1-based)=leading minor not positive definite, N+1=singular to working precision
*   equed: equilibration type applied
*   rcond: reciprocal condition number estimate
*
* @private
* @param {string} fact - 'not-factored', 'equilibrate', or 'factored'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - N-by-N symmetric positive definite matrix (may be equilibrated on exit)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} AF - N-by-N factored matrix (output)
* @param {integer} strideAF1 - stride of the first dimension of AF
* @param {integer} strideAF2 - stride of the second dimension of AF
* @param {NonNegativeInteger} offsetAF - index offset for AF
* @param {string} equed - equilibration type (input if FACT='factored')
* @param {Float64Array} s - scaling factors (input if FACT='factored' and equed='yes', output if FACT='equilibrate')
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - index offset for s
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
* @param {Float64Array} WORK - workspace array of length at least 3*N
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - index offset for WORK
* @param {Int32Array} IWORK - integer workspace array of length N
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - index offset for IWORK
* @returns {Object} result with info, equed, rcond
*/
function dposvx( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, equed, s, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) {
	var nofact;
	var rcequ;
	var equil;
	var scond;
	var anorm;
	var RCOND;
	var smax;
	var smin;
	var info;
	var db;
	var dx;
	var eq;
	var i;
	var j;

	nofact = ( fact === 'not-factored' );
	equil = ( fact === 'equilibrate' );

	if ( nofact || equil ) {
		equed = 'none';
		rcequ = false;
	} else {
		rcequ = ( equed === 'yes' );
		if ( rcequ ) {
			smin = BIGNUM;
			smax = 0.0;
			for ( j = 0; j < N; j++ ) {
				smin = Math.min( smin, s[ offsetS + ( j * strideS ) ] );
				smax = Math.max( smax, s[ offsetS + ( j * strideS ) ] );
			}
			if ( N > 0 ) {
				scond = Math.max( smin, SMLNUM ) / Math.min( smax, BIGNUM );
			} else {
				scond = 1.0;
			}
		}
	}

	// Quick return if possible
	if ( N === 0 || nrhs === 0 ) {
		return {
			'info': 0,
			'equed': equed,
			'rcond': 1.0
		};
	}

	// Equilibrate if requested
	if ( equil ) {
		eq = dpoequ( N, A, strideA1, strideA2, offsetA, s, strideS, offsetS );

		if ( eq.info === 0 ) {
			// Equilibrate the matrix
			equed = dlaqsy( uplo, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, eq.scond, eq.amax );
			rcequ = ( equed === 'yes' );
			if ( rcequ ) {
				scond = eq.scond;
			}
		}
	}

	// Scale the right-hand side
	if ( rcequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			db = offsetB + ( j * strideB2 );
			for ( i = 0; i < N; i++ ) {
				B[ db + ( i * strideB1 ) ] = s[ offsetS + ( i * strideS ) ] * B[ db + ( i * strideB1 ) ];
			}
		}
	}

	if ( nofact || equil ) {
		// Copy A to AF and compute the Cholesky factorization
		dlacpy( uplo, N, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF );
		info = dpotrf( uplo, N, AF, strideAF1, strideAF2, offsetAF );

		if ( info > 0 ) {
			return {
				'info': info,
				'equed': equed,
				'rcond': 0.0
			};
		}
	}

	// Compute the norm of the original matrix A
	anorm = dlansy( 'one-norm', uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK );

	// Compute the reciprocal of the condition number
	RCOND = new Float64Array( 1 );
	dpocon( uplo, N, AF, strideAF1, strideAF2, offsetAF, anorm, RCOND, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK );

	// Copy B to X and solve the system
	dlacpy( 'full', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );
	dpotrs( uplo, N, nrhs, AF, strideAF1, strideAF2, offsetAF, X, strideX1, strideX2, offsetX );

	// Use iterative refinement to improve the computed solution
	dporfs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR );

	// Transform the solution matrix X to a solution of the original system
	if ( rcequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			dx = offsetX + ( j * strideX2 );
			for ( i = 0; i < N; i++ ) {
				X[ dx + ( i * strideX1 ) ] = s[ offsetS + ( i * strideS ) ] * X[ dx + ( i * strideX1 ) ];
			}
		}
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] = FERR[ offsetFERR + ( j * strideFERR ) ] / scond;
		}
	}

	// Set INFO = N+1 if the matrix is singular to working precision
	info = 0;
	if ( RCOND[ 0 ] < EPS ) {
		info = N + 1;
	}

	return {
		'info': info,
		'equed': equed,
		'rcond': RCOND[ 0 ]
	};
}


// EXPORTS //

export default dposvx;
