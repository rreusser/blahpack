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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlanhb from '../../zlanhb/lib/base.js';
import zlaqhb from '../../zlaqhb/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import zpbcon from '../../zpbcon/lib/base.js';
import zpbequ from '../../zpbequ/lib/base.js';
import zpbrfs from '../../zpbrfs/lib/base.js';
import zpbtrf from '../../zpbtrf/lib/base.js';
import zpbtrs from '../../zpbtrs/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );
var SMLNUM = dlamch( 'safe-minimum' );
var BIGNUM = 1.0 / SMLNUM;


// MAIN //

/**
* Solves a complex Hermitian positive definite banded system A*X = B, optionally equilibrating, factoring, estimating the condition number, and computing error bounds.
*
* ## Notes
*
* -   On exit, `equed` is written to `equed[0]` as a string ('none' or 'yes').
* -   `rcond` is a single-element Float64Array for the reciprocal condition number.
* -   When `fact` is `'equilibrate'`, the routine may modify AB, S, and B.
* -   AB, AFB, B, X, and WORK are Complex128Array with strides/offsets in complex elements.
* -   RWORK, S, FERR, BERR are Float64Array.
*
* @private
* @param {string} fact - `'not-factored'`, `'factored'`, or `'equilibrate'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of superdiagonals (upper) or subdiagonals (lower) of band matrix
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AB - Hermitian positive definite band matrix in band storage, (KD+1)-by-N
* @param {integer} strideAB1 - stride of the first dimension of `AB` (complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (complex elements)
* @param {Complex128Array} AFB - factored form in band storage (output if fact!='factored')
* @param {integer} strideAFB1 - stride of the first dimension of `AFB` (complex elements)
* @param {integer} strideAFB2 - stride of the second dimension of `AFB` (complex elements)
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB` (complex elements)
* @param {Array} equed - single-element array: on input if fact='factored', on output otherwise ('none' or 'yes')
* @param {Float64Array} S - scaling factors (length N; output if fact='equilibrate', input if fact='factored' and equed='yes')
* @param {integer} strideS - stride for S
* @param {NonNegativeInteger} offsetS - starting index for S
* @param {Complex128Array} B - right-hand side matrix (column-major, N-by-NRHS)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} X - solution matrix (column-major, N-by-NRHS, output)
* @param {integer} strideX1 - stride of the first dimension of X (complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (complex elements)
* @param {NonNegativeInteger} offsetX - starting index for X (complex elements)
* @param {Float64Array} rcond - single-element array for reciprocal condition number (output)
* @param {Float64Array} FERR - forward error bounds array (length NRHS, output)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - starting index for FERR
* @param {Float64Array} BERR - backward error bounds array (length NRHS, output)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - starting index for BERR
* @param {Complex128Array} WORK - complex workspace array (length at least 2*N)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace array (length at least N)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} info - 0 if successful, k>0 if leading minor of order k is not positive definite, N+1 if rcond < machine epsilon
*/
function zpbsvx( fact, uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, equed, S, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
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
	var Bv;
	var Xv;
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
		res = zpbequ( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, S, strideS, offsetS );
		if ( res.info === 0 ) {
			// Equilibrate the matrix
			equed[ 0 ] = zlaqhb( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, S, strideS, offsetS, res.scond, res.amax );
			rcequ = ( equed[ 0 ] === 'yes' );
			if ( rcequ ) {
				scond = res.scond;
			}
		}
	}

	// Scale the right-hand side if equilibration was applied
	// B is Complex128Array, S is real: B(i,j) *= S(i) means scale both re and im
	if ( rcequ ) {
		Bv = reinterpret( B, 0 );
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < N; i++ ) {
				si = S[ offsetS + ( i * strideS ) ];
				bi = ( offsetB + ( i * strideB1 ) + ( j * strideB2 ) ) * 2;
				Bv[ bi ] *= si;
				Bv[ bi + 1 ] *= si;
			}
		}
	}

	if ( nofact || equil ) {
		// Copy AB to AFB and compute the Cholesky factorization
		if ( upper ) {
			// For upper band storage, copy column by column
			for ( j = 0; j < N; j++ ) {
				j1 = ( j - kd > 0 ) ? j - kd : 0;
				ncol = j - j1 + 1;
				zcopy( ncol, AB, strideAB1, offsetAB + ( ( kd - j + j1 ) * strideAB1 ) + ( j * strideAB2 ), AFB, strideAFB1, offsetAFB + ( ( kd - j + j1 ) * strideAFB1 ) + ( j * strideAFB2 ) );
			}
		} else {
			// For lower band storage, copy column by column
			for ( j = 0; j < N; j++ ) {
				ncol = ( ( j + kd < N ) ? ( j + kd ) : ( N - 1 ) ) - j + 1;
				zcopy( ncol, AB, strideAB1, offsetAB + ( j * strideAB2 ), AFB, strideAFB1, offsetAFB + ( j * strideAFB2 ) );
			}
		}

		info = zpbtrf( uplo, N, kd, AFB, strideAFB1, strideAFB2, offsetAFB );

		// Return if factorization failed (not positive definite)
		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return info;
		}
	}

	// Compute the norm of the matrix A (one-norm for Hermitian = infinity-norm)
	anorm = zlanhb( 'one-norm', uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, RWORK, strideRWork, offsetRWork );

	// Compute the reciprocal of the condition number of A
	zpbcon( uplo, N, kd, AFB, strideAFB1, strideAFB2, offsetAFB, anorm, rcond, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	// Copy B to X
	zlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve the system A*X = B using the Cholesky factorization
	zpbtrs( uplo, N, kd, nrhs, AFB, strideAFB1, strideAFB2, offsetAFB, X, strideX1, strideX2, offsetX );

	// Improve the solution and compute error bounds
	zpbrfs( uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	// If equilibration was done, scale the solution and error bounds
	if ( rcequ ) {
		Xv = reinterpret( X, 0 );
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < N; i++ ) {
				si = S[ offsetS + ( i * strideS ) ];
				xi = ( offsetX + ( i * strideX1 ) + ( j * strideX2 ) ) * 2;
				Xv[ xi ] *= si;
				Xv[ xi + 1 ] *= si;
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

export default zpbsvx;
