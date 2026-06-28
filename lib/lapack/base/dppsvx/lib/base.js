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

/* eslint-disable max-len, max-params */

// MODULES //

import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlansp from '../../dlansp/lib/base.js';
import dlaqsp from '../../dlaqsp/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dppcon from '../../dppcon/lib/base.js';
import dppequ from '../../dppequ/lib/base.js';
import dpprfs from '../../dpprfs/lib/base.js';
import dpptrf from '../../dpptrf/lib/base.js';
import dpptrs from '../../dpptrs/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );
var SMLNUM = dlamch( 'safe-minimum' );
var BIGNUM = 1.0 / SMLNUM;


// MAIN //

/**
* Solves a real symmetric positive definite system A*X = B where A is stored in packed format, optionally equilibrating, factoring, estimating the condition number, and computing error bounds.
*
* ## Notes
*
* -   On exit, `equed` is written to `equed[0]` as a string ('none' or 'yes').
* -   `rcond` is a single-element Float64Array for the reciprocal condition number.
* -   When `fact` is `'equilibrate'`, the routine may modify AP, S, and B.
*
* @private
* @param {string} fact - `'not-factored'`, `'factored'`, or `'equilibrate'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AP - symmetric positive definite matrix in packed storage (length N*(N+1)/2)
* @param {integer} strideAP - stride for AP
* @param {NonNegativeInteger} offsetAP - starting index for AP
* @param {Float64Array} AFP - factored form in packed storage (output if fact!='factored')
* @param {integer} strideAFP - stride for AFP
* @param {NonNegativeInteger} offsetAFP - starting index for AFP
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
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Int32Array} IWORK - integer workspace array (length at least N)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @returns {integer} info - 0 if successful, k>0 if leading minor of order k is not positive definite (from dpptrf), N+1 if rcond < machine epsilon
*/
function dppsvx( fact, uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, equed, S, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	var nofact;
	var rcequ;
	var equil;
	var scond;
	var anorm;
	var smin;
	var smax;
	var info;
	var nAP;
	var val;
	var res;
	var si;
	var bi;
	var xi;
	var i;
	var j;

	info = 0;
	nofact = ( fact === 'not-factored' );
	equil = ( fact === 'equilibrate' );

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
		res = dppequ( uplo, N, AP, strideAP, offsetAP, S, strideS, offsetS );
		if ( res.info === 0 ) {
			// Equilibrate the matrix
			equed[ 0 ] = dlaqsp( uplo, N, AP, strideAP, offsetAP, S, strideS, offsetS, res.scond, res.amax );
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
		// Copy AP to AFP and compute the Cholesky factorization
		nAP = ( N * ( N + 1 ) / 2 ) | 0;
		dcopy( nAP, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP );
		info = dpptrf( uplo, N, AFP, strideAFP, offsetAFP );

		// Return if factorization failed (not positive definite)
		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return info;
		}
	}

	// Compute the norm of the matrix A (infinity-norm)
	anorm = dlansp( 'inf-norm', uplo, N, AP, strideAP, offsetAP, WORK, strideWork, offsetWork );

	// Compute the reciprocal of the condition number of A
	dppcon( uplo, N, AFP, strideAFP, offsetAFP, anorm, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );

	// Copy B to X
	dlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve the system A*X = B using the Cholesky factorization
	dpptrs( uplo, N, nrhs, AFP, strideAFP, offsetAFP, X, strideX1, strideX2, offsetX );

	// Improve the solution and compute error bounds
	dpprfs( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );

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

export default dppsvx;
