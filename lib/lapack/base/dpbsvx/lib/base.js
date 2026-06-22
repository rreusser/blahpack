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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlansb from '../../dlansb/lib/base.js';
import dlaqsb from '../../dlaqsb/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dpbcon from '../../dpbcon/lib/base.js';
import dpbequ from '../../dpbequ/lib/base.js';
import dpbrfs from '../../dpbrfs/lib/base.js';
import dpbtrf from '../../dpbtrf/lib/base.js';
import dpbtrs from '../../dpbtrs/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );
var SMLNUM = dlamch( 'safe-minimum' );
var BIGNUM = 1.0 / SMLNUM;


// MAIN //

/**
* Solves a real symmetric positive definite banded system A*X = B, optionally equilibrating, factoring, estimating the condition number, and computing error bounds.
*
* ## Notes
*
* -   On exit, `equed` is written to `equed[0]` as a string ('none' or 'yes').
* -   `rcond` is a single-element Float64Array for the reciprocal condition number.
* -   When `fact` is `'equilibrate'`, the routine may modify AB, S, and B.
*
* @private
* @param {string} fact - `'not-factored'`, `'factored'`, or `'equilibrate'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of superdiagonals (upper) or subdiagonals (lower) of band matrix
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AB - symmetric positive definite band matrix in band storage, (KD+1)-by-N
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} AFB - factored form in band storage (output if fact!='factored')
* @param {integer} strideAFB1 - stride of the first dimension of `AFB`
* @param {integer} strideAFB2 - stride of the second dimension of `AFB`
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB`
* @param {Array} equed - single-element array: on input if fact='factored', on output otherwise ('none' or 'yes')
* @param {Float64Array} S - scaling factors (length N; output if fact='equilibrate', input if fact='factored' and equed='yes')
* @param {integer} strideS - stride for S
* @param {NonNegativeInteger} offsetS - starting index for S
* @param {Float64Array} B - right-hand side matrix (column-major, N-by-NRHS)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} X - solution matrix (column-major, N-by-NRHS, output)
* @param {integer} strideX1 - stride of the first dimension of X
* @param {integer} strideX2 - stride of the second dimension of X
* @param {NonNegativeInteger} offsetX - starting index for X
* @param {Float64Array} rcond - single-element array for reciprocal condition number (output)
* @param {Float64Array} FERR - forward error bounds array (length NRHS, output)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - starting index for FERR
* @param {Float64Array} BERR - backward error bounds array (length NRHS, output)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - starting index for BERR
* @param {Float64Array} WORK - workspace array (length at least 3*N)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {Int32Array} IWORK - integer workspace array (length at least N)
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @returns {integer} info - 0 if successful, k>0 if leading minor of order k is not positive definite, N+1 if rcond < machine epsilon
*/
function dpbsvx( fact, uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, equed, S, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) { // eslint-disable-line max-len, max-params
	var nofact;
	var rcequ;
	var equil;
	var upper;
	var scond;
	var anorm;
	var smin;
	var smax;
	var info;
	var ncol;
	var val;
	var res;
	var si;
	var bi;
	var xi;
	var j1;
	var i;
	var j;

	info = 0;
	nofact = ( fact === 'not-factored' );
	equil = ( fact === 'equilibrate' );
	upper = ( uplo === 'upper' );

	if ( nofact || equil ) {
		equed[ 0 ] = 'none';
		rcequ = false;
	} else {
		rcequ = ( equed[ 0 ] === 'yes' );
	}

	// Quick return if N = 0
	if ( N === 0 ) {
		return 0;
	}

	// If FACT='F' and EQUED='Y', compute SCOND from S
	if ( rcequ ) {
		smin = BIGNUM;
		smax = 0.0;
		for ( j = 0; j < N; j++ ) {
			val = S[ offsetS + ( j * strideS ) ];
			if ( val < smin ) {
				smin = val;
			}
			if ( val > smax ) {
				smax = val;
			}
		}
		scond = Math.max( smin, SMLNUM ) / Math.min( smax, BIGNUM );
	}

	// Equilibrate if requested
	if ( equil ) {
		// Compute row/column scaling factors
		res = dpbequ( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, S, strideS, offsetS );
		if ( res.info === 0 ) {
			// Equilibrate the matrix
			equed[ 0 ] = dlaqsb( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, S, strideS, offsetS, res.scond, res.amax );
			rcequ = ( equed[ 0 ] === 'yes' );
			if ( rcequ ) {
				scond = res.scond;
			}
		}
	}

	// Scale the right-hand side if equilibration was applied
	if ( rcequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < N; i++ ) {
				si = offsetS + ( i * strideS );
				bi = offsetB + ( i * strideB1 ) + ( j * strideB2 );
				B[ bi ] *= S[ si ];
			}
		}
	}

	if ( nofact || equil ) {
		// Copy AB to AFB and compute the Cholesky factorization
		if ( upper ) {
			// For upper band storage, copy column by column
			// For column j (0-based), rows from max(0, kd-j) to kd
			for ( j = 0; j < N; j++ ) {
				j1 = ( j - kd > 0 ) ? j - kd : 0;

				// Number of elements in this column: j - j1 + 1

				// They are stored in rows kd-(j-j1) through kd (0-based)
				ncol = j - j1 + 1;
				dcopy( ncol, AB, strideAB1, offsetAB + ( ( kd - j + j1 ) * strideAB1 ) + ( j * strideAB2 ), AFB, strideAFB1, offsetAFB + ( ( kd - j + j1 ) * strideAFB1 ) + ( j * strideAFB2 ));
			}
		} else {
			// For lower band storage, copy column by column
			// For column j (0-based), rows from 0 to min(kd, N-1-j)
			for ( j = 0; j < N; j++ ) {
				ncol = ( ( j + kd < N ) ? ( j + kd ) : ( N - 1 ) ) - j + 1;
				dcopy( ncol, AB, strideAB1, offsetAB + ( j * strideAB2 ), AFB, strideAFB1, offsetAFB + ( j * strideAFB2 ));
			}
		}

		info = dpbtrf( uplo, N, kd, AFB, strideAFB1, strideAFB2, offsetAFB );

		// Return if factorization failed (not positive definite)
		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return info;
		}
	}

	// Compute the norm of the matrix A (one-norm for symmetric = infinity-norm)
	anorm = dlansb( 'one-norm', uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, WORK, strideWORK, offsetWORK );

	// Compute the reciprocal of the condition number of A
	dpbcon( uplo, N, kd, AFB, strideAFB1, strideAFB2, offsetAFB, anorm, rcond, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK );

	// Copy B to X
	dlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve the system A*X = B using the Cholesky factorization
	dpbtrs( uplo, N, kd, nrhs, AFB, strideAFB1, strideAFB2, offsetAFB, X, strideX1, strideX2, offsetX );

	// Improve the solution and compute error bounds
	dpbrfs( uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK );

	// If equilibration was done, scale the solution and error bounds
	if ( rcequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < N; i++ ) {
				si = offsetS + ( i * strideS );
				xi = offsetX + ( i * strideX1 ) + ( j * strideX2 );
				X[ xi ] *= S[ si ];
			}
		}
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] /= scond;
		}
	}

	// Set INFO = N + 1 if the matrix is singular to working precision
	if ( rcond[ 0 ] < EPS ) {
		info = N + 1;
	}

	return info;
}


// EXPORTS //

export default dpbsvx;
