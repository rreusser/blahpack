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
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlanht from '../../zlanht/lib/base.js';
import zpttrf from '../../zpttrf/lib/base.js';
import zpttrs from '../../zpttrs/lib/base.js';
import zptcon from '../../zptcon/lib/base.js';
import zptrfs from '../../zptrfs/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Solves a complex Hermitian positive definite tridiagonal system A*X = B, and provides an estimate of the condition number and error bounds on the solution.
*
* ## Notes
*
* -   Uses the L_D_L^H factorization computed by `zpttrf`.
* -   If `fact` is `'not-factored'`, the routine factors the matrix and copies D to DF and E to EF.
* -   If `fact` is `'factored'`, DF and EF must already contain the factorization from `zpttrf`.
* -   On return, `rcond[0]` contains the reciprocal condition number.
* -   Returns INFO = 0 on success, INFO = k if D(k) <= 0 during factorization, INFO = N+1 if rcond < machine epsilon.
* -   D, DF are real (Float64Array). E, EF are complex (Complex128Array) with strides/offsets in complex elements.
* -   B, X are complex (Complex128Array) with strides/offsets in complex elements.
* -   WORK is complex (Complex128Array) with stride/offset in complex elements.
* -   RWORK, FERR, BERR, rcond are real (Float64Array).
*
* @private
* @param {string} fact - `'not-factored'` to compute factorization, `'factored'` if already factored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} d - diagonal elements of A (length N, real, not modified)
* @param {integer} strideD - stride for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Complex128Array} e - off-diagonal elements of A (length N-1, complex, not modified)
* @param {integer} strideE - stride for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @param {Float64Array} DF - factored diagonal (output if fact='not-factored', input if 'factored')
* @param {integer} strideDF - stride for `DF`
* @param {NonNegativeInteger} offsetDF - starting index for `DF`
* @param {Complex128Array} EF - factored off-diagonal (output if fact='not-factored', input if 'factored')
* @param {integer} strideEF - stride for `EF` (in complex elements)
* @param {NonNegativeInteger} offsetEF - starting index for `EF` (in complex elements)
* @param {Complex128Array} B - right-hand side matrix (N-by-NRHS, column-major, complex)
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @param {Complex128Array} X - solution matrix (N-by-NRHS, column-major, complex, output)
* @param {integer} strideX1 - stride of the first dimension of `X` (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of `X` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
* @param {Float64Array} rcond - single-element array for reciprocal condition number (output)
* @param {Float64Array} FERR - forward error bounds (length NRHS, output)
* @param {integer} strideFERR - stride for `FERR`
* @param {NonNegativeInteger} offsetFERR - starting index for `FERR`
* @param {Float64Array} BERR - backward error bounds (length NRHS, output)
* @param {integer} strideBERR - stride for `BERR`
* @param {NonNegativeInteger} offsetBERR - starting index for `BERR`
* @param {Complex128Array} WORK - complex workspace array (length at least N)
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length at least N)
* @param {integer} strideRWork - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {integer} info - 0 if successful, k>0 if D(k)<=0 (not positive definite), N+1 if rcond < machine epsilon
*/
function zptsvx( fact, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
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
		// Copy D to DF (real) and E to EF (complex), then compute factorization:
		dcopy( N, d, strideD, offsetD, DF, strideDF, offsetDF );
		if ( N > 1 ) {
			zcopy( N - 1, e, strideE, offsetE, EF, strideEF, offsetEF );
		}
		info = zpttrf( N, DF, strideDF, offsetDF, EF, strideEF, offsetEF );

		// Return if factorization failed (not positive definite):
		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return info;
		}
	}

	// Compute the 1-norm of the original matrix A:
	anorm = zlanht( 'one-norm', N, d, strideD, offsetD, e, strideE, offsetE );

	// Compute the reciprocal condition number:
	zptcon( N, DF, strideDF, offsetDF, EF, strideEF, offsetEF, anorm, rcond, RWORK, strideRWork, offsetRWork );

	// Copy B to X:
	zlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve the system A*X = B using the factored form:
	zpttrs( 'lower', N, nrhs, DF, strideDF, offsetDF, EF, strideEF, offsetEF, X, strideX1, strideX2, offsetX );

	// Improve the solution and compute error bounds:
	zptrfs( 'lower', N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	// Set INFO = N + 1 if the matrix is singular to working precision:
	if ( rcond[ 0 ] < EPS ) {
		info = N + 1;
	}

	return info;
}


// EXPORTS //

export default zptsvx;
