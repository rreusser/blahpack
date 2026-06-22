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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlanhp from '../../zlanhp/lib/base.js';
import zlaqhp from '../../zlaqhp/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import zppcon from '../../zppcon/lib/base.js';
import zppequ from '../../zppequ/lib/base.js';
import zpprfs from '../../zpprfs/lib/base.js';
import zpptrf from '../../zpptrf/lib/base.js';
import zpptrs from '../../zpptrs/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );
var SMLNUM = dlamch( 'safe-minimum' );
var BIGNUM = 1.0 / SMLNUM;


// MAIN //

/**
* Solves a complex Hermitian positive definite system A*X = B where A is stored in packed format, optionally equilibrating, factoring, estimating the condition number, and computing error bounds.
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
* @param {Complex128Array} AP - Hermitian positive definite matrix in packed storage (length N*(N+1)/2)
* @param {integer} strideAP - stride for AP (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for AP (in complex elements)
* @param {Complex128Array} AFP - factored form in packed storage (output if fact!='factored')
* @param {integer} strideAFP - stride for AFP (in complex elements)
* @param {NonNegativeInteger} offsetAFP - starting index for AFP (in complex elements)
* @param {Array} equed - single-element array: on input if fact='factored', on output otherwise ('none' or 'yes')
* @param {Float64Array} S - scaling factors (length N; output if fact='equilibrate', input if fact='factored' and equed='yes')
* @param {integer} strideS - stride for S
* @param {NonNegativeInteger} offsetS - starting index for S
* @param {Complex128Array} B - right-hand side matrix (column-major, N-by-NRHS, in complex elements)
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128Array} X - solution matrix (column-major, N-by-NRHS, output, in complex elements)
* @param {integer} strideX1 - stride of the first dimension of X (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for X (in complex elements)
* @param {Float64Array} rcond - single-element array for reciprocal condition number (output)
* @param {Float64Array} FERR - forward error bounds array (length NRHS, output)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - starting index for FERR
* @param {Float64Array} BERR - backward error bounds array (length NRHS, output)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - starting index for BERR
* @param {Complex128Array} WORK - complex workspace array (length at least 2*N)
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length at least N)
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @returns {integer} info - 0 if successful, k>0 if leading minor of order k is not positive definite (from zpptrf), N+1 if rcond < machine epsilon
*/
function zppsvx( fact, uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, equed, S, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
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
	var Bv;
	var Xv;
	var sB;
	var oB;
	var sX;
	var oX;
	var bi;
	var xi;
	var si;
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

	// Reinterpret complex arrays as Float64 views for element-wise real scaling
	Bv = reinterpret( B, 0 );
	Xv = reinterpret( X, 0 );
	sB = strideB1 * 2;
	oB = offsetB * 2;
	sX = strideX1 * 2;
	oX = offsetX * 2;

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
		res = zppequ( uplo, N, AP, strideAP, offsetAP, S, strideS, offsetS );
		if ( res.info === 0 ) {
			// Equilibrate the matrix
			equed[ 0 ] = zlaqhp( uplo, N, AP, strideAP, offsetAP, S, strideS, offsetS, res.scond, res.amax );
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
				si = S[ offsetS + ( i * strideS ) ];
				bi = oB + ( i * sB ) + ( j * strideB2 * 2 );
				Bv[ bi ] *= si;
				Bv[ bi + 1 ] *= si;
			}
		}
	}

	if ( nofact || equil ) {
		// Copy AP to AFP and compute the Cholesky factorization
		nAP = ( N * ( N + 1 ) / 2 ) | 0;
		zcopy( nAP, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP );
		info = zpptrf( uplo, N, AFP, strideAFP, offsetAFP );

		// Return if factorization failed (not positive definite)
		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return info;
		}
	}

	// Compute the norm of the matrix A (infinity-norm)
	anorm = zlanhp( 'inf-norm', uplo, N, AP, strideAP, offsetAP, RWORK, strideRWORK, offsetRWORK );

	// Compute the reciprocal of the condition number of A
	zppcon( uplo, N, AFP, strideAFP, offsetAFP, anorm, rcond, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK );

	// Copy B to X
	zlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve the system A*X = B using the Cholesky factorization
	zpptrs( uplo, N, nrhs, AFP, strideAFP, offsetAFP, X, strideX1, strideX2, offsetX );

	// Improve the solution and compute error bounds
	zpprfs( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK );

	// If equilibration was done, scale the solution and error bounds
	if ( rcequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < N; i++ ) {
				si = S[ offsetS + ( i * strideS ) ];
				xi = oX + ( i * sX ) + ( j * strideX2 * 2 );
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

export default zppsvx;
