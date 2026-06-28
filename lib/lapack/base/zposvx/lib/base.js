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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpoequ from '../../zpoequ/lib/base.js';
import zlaqhe from '../../zlaqhe/lib/base.js';
import zpotrf from '../../zpotrf/lib/base.js';
import zpotrs from '../../zpotrs/lib/base.js';
import zporfs from '../../zporfs/lib/base.js';
import zpocon from '../../zpocon/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlanhe from '../../zlanhe/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );
var SMLNUM = dlamch( 'safe-minimum' );
var BIGNUM = 1.0 / SMLNUM;


// MAIN //

/**
* Expert driver for solving a complex Hermitian positive definite system of.
* linear equations A_X = B, using the Cholesky factorization A = U^H_U or
* A = L*L^H. Provides equilibration, condition estimation, iterative
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
* @param {Complex128Array} A - N-by-N Hermitian positive definite matrix (may be equilibrated on exit)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Complex128Array} AF - N-by-N factored matrix (output)
* @param {integer} strideAF1 - stride of the first dimension of AF (complex elements)
* @param {integer} strideAF2 - stride of the second dimension of AF (complex elements)
* @param {NonNegativeInteger} offsetAF - index offset for AF (complex elements)
* @param {string} equed - equilibration type (input if FACT='factored')
* @param {Float64Array} s - scaling factors (input if FACT='factored' and equed='yes', output if FACT='equilibrate')
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - index offset for s
* @param {Complex128Array} B - N-by-NRHS right-hand side (may be scaled on exit)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (complex elements)
* @param {Complex128Array} X - N-by-NRHS solution matrix (output)
* @param {integer} strideX1 - stride of the first dimension of X (complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (complex elements)
* @param {NonNegativeInteger} offsetX - index offset for X (complex elements)
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} FERR - forward error bounds (output, length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - index offset for FERR
* @param {Float64Array} BERR - backward error bounds (output, length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - index offset for BERR
* @param {Complex128Array} WORK - workspace of length 2*N (complex)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - index offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of length N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - index offset for RWORK
* @returns {Object} result with info, equed, rcond
*/
function zposvx( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, equed, s, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var nofact;
	var rcequ;
	var equil;
	var scond;
	var anorm;
	var smax;
	var smin;
	var info;
	var Bv;
	var Xv;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var oB;
	var oX;
	var db;
	var dx;
	var eq;
	var si;
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
		rcond[ 0 ] = 1.0;
		return { 'info': 0, 'equed': equed, 'rcond': 1.0 };
	}

	// Equilibrate if requested
	if ( equil ) {
		eq = zpoequ( N, A, strideA1, strideA2, offsetA, s, strideS, offsetS );

		if ( eq.info === 0 ) {
			// Equilibrate the matrix
			equed = zlaqhe( uplo, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, eq.scond, eq.amax );
			rcequ = ( equed === 'yes' );
			if ( rcequ ) {
				scond = eq.scond;
			}
		}
	}

	// Scale the right-hand side: B(i,j) = S(i) * B(i,j)
	if ( rcequ ) {
		Bv = reinterpret( B, 0 );
		sb1 = strideB1 * 2;
		sb2 = strideB2 * 2;
		oB = offsetB * 2;
		for ( j = 0; j < nrhs; j++ ) {
			db = oB + ( j * sb2 );
			for ( i = 0; i < N; i++ ) {
				si = s[ offsetS + ( i * strideS ) ];
				Bv[ db + ( i * sb1 ) ] = si * Bv[ db + ( i * sb1 ) ];
				Bv[ db + ( i * sb1 ) + 1 ] = si * Bv[ db + ( i * sb1 ) + 1 ];
			}
		}
	}

	if ( nofact || equil ) {
		// Copy A to AF and compute the Cholesky factorization
		zlacpy( uplo, N, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF );
		info = zpotrf( uplo, N, AF, strideAF1, strideAF2, offsetAF );

		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return { 'info': info, 'equed': equed, 'rcond': 0.0 };
		}
	}

	// Compute the norm of the original matrix A
	anorm = zlanhe( 'one-norm', uplo, N, A, strideA1, strideA2, offsetA, RWORK, strideRWork, offsetRWork );

	// Compute the reciprocal of the condition number
	zpocon( uplo, N, AF, strideAF1, strideAF2, offsetAF, anorm, rcond, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	// Copy B to X and solve the system
	zlacpy( 'full', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );
	zpotrs( uplo, N, nrhs, AF, strideAF1, strideAF2, offsetAF, X, strideX1, strideX2, offsetX );

	// Use iterative refinement to improve the computed solution
	zporfs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	// Transform the solution matrix X to a solution of the original system
	if ( rcequ ) {
		Xv = reinterpret( X, 0 );
		sx1 = strideX1 * 2;
		sx2 = strideX2 * 2;
		oX = offsetX * 2;
		for ( j = 0; j < nrhs; j++ ) {
			dx = oX + ( j * sx2 );
			for ( i = 0; i < N; i++ ) {
				si = s[ offsetS + ( i * strideS ) ];
				Xv[ dx + ( i * sx1 ) ] = si * Xv[ dx + ( i * sx1 ) ];
				Xv[ dx + ( i * sx1 ) + 1 ] = si * Xv[ dx + ( i * sx1 ) + 1 ];
			}
		}
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] = FERR[ offsetFERR + ( j * strideFERR ) ] / scond;
		}
	}

	// Set INFO = N+1 if the matrix is singular to working precision
	info = 0;
	if ( rcond[ 0 ] < EPS ) {
		info = N + 1;
	}

	return { 'info': info, 'equed': equed, 'rcond': rcond[ 0 ] };
}


// EXPORTS //

export default zposvx;
