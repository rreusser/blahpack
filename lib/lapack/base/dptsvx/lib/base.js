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
import dlanst from '../../dlanst/lib/base.js';
import dpttrf from '../../dpttrf/lib/base.js';
import dpttrs from '../../dpttrs/lib/base.js';
import dptcon from '../../dptcon/lib/base.js';
import dptrfs from '../../dptrfs/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Solves a real symmetric positive definite tridiagonal system A_X = B, and provides an estimate of the condition number and error bounds on the solution.
*
* ## Notes
*
* -   Uses the L_D_L^T factorization computed by `dpttrf`.
* -   If `fact` is `'not-factored'`, the routine factors the matrix and copies D to DF and E to EF.
* -   If `fact` is `'factored'`, DF and EF must already contain the factorization from `dpttrf`.
* -   On return, `rcond[0]` contains the reciprocal condition number.
* -   Returns INFO = 0 on success, INFO = k if D(k) <= 0 during factorization, INFO = N+1 if rcond < machine epsilon.
*
* @private
* @param {string} fact - `'not-factored'` to compute factorization, `'factored'` if already factored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} d - diagonal elements of A (length N, not modified)
* @param {integer} strideD - stride for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - off-diagonal elements of A (length N-1, not modified)
* @param {integer} strideE - stride for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} DF - factored diagonal (output if fact='not-factored', input if 'factored')
* @param {integer} strideDF - stride for `DF`
* @param {NonNegativeInteger} offsetDF - starting index for `DF`
* @param {Float64Array} EF - factored off-diagonal (output if fact='not-factored', input if 'factored')
* @param {integer} strideEF - stride for `EF`
* @param {NonNegativeInteger} offsetEF - starting index for `EF`
* @param {Float64Array} B - right-hand side matrix (N-by-NRHS, column-major)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} X - solution matrix (N-by-NRHS, column-major, output)
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} rcond - single-element array for reciprocal condition number (output)
* @param {Float64Array} FERR - forward error bounds (length NRHS, output)
* @param {integer} strideFERR - stride for `FERR`
* @param {NonNegativeInteger} offsetFERR - starting index for `FERR`
* @param {Float64Array} BERR - backward error bounds (length NRHS, output)
* @param {integer} strideBERR - stride for `BERR`
* @param {NonNegativeInteger} offsetBERR - starting index for `BERR`
* @param {Float64Array} WORK - workspace array (length at least 2*N)
* @param {integer} strideWORK - stride for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} info - 0 if successful, k>0 if D(k)<=0 (not positive definite), N+1 if rcond < machine epsilon
*/
function dptsvx( fact, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	var nofact;
	var anorm;
	var info;

	info = 0;
	nofact = ( fact === 'not-factored' );

	// Quick return if N = 0:
	if ( N === 0 ) {
		return 0;
	}

	if ( nofact ) {
		// Copy D to DF and E to EF, then compute factorization:
		dcopy( N, d, strideD, offsetD, DF, strideDF, offsetDF );
		if ( N > 1 ) {
			dcopy( N - 1, e, strideE, offsetE, EF, strideEF, offsetEF );
		}
		info = dpttrf( N, DF, strideDF, offsetDF, EF, strideEF, offsetEF );

		// Return if factorization failed (not positive definite):
		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return info;
		}
	}

	// Compute the 1-norm of the original matrix A:
	anorm = dlanst( 'one-norm', N, d, strideD, offsetD, e, strideE, offsetE );

	// Compute the reciprocal condition number:
	dptcon( N, DF, strideDF, offsetDF, EF, strideEF, offsetEF, anorm, rcond, WORK, strideWORK, offsetWORK );

	// Copy B to X:
	dlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve the system A_X = B using the factored form:
	dpttrs( N, nrhs, DF, strideDF, offsetDF, EF, strideEF, offsetEF, X, strideX1, strideX2, offsetX );

	// Improve the solution and compute error bounds:
	dptrfs( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK );

	// Set INFO = N + 1 if the matrix is singular to working precision:
	if ( rcond[ 0 ] < EPS ) {
		info = N + 1;
	}

	return info;
}


// EXPORTS //

export default dptsvx;
