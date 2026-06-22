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
import dsptrf from '../../dsptrf/lib/base.js';
import dsptrs from '../../dsptrs/lib/base.js';
import dspcon from '../../dspcon/lib/base.js';
import dsprfs from '../../dsprfs/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Solves a real symmetric indefinite system of linear equations A_X = B where A is stored in packed format, using the diagonal pivoting factorization A = U_D_U^T or A = L_D_L^T, and provides an estimate of the condition number and error bounds on the solution.
*
* @private
* @param {string} fact - 'factored' if AFP and IPIV contain the factorization, 'not-factored' to compute it
* @param {string} uplo - 'upper' if upper triangle of A stored, 'lower' if lower triangle
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AP - symmetric matrix A in packed storage (length N*(N+1)/2)
* @param {integer} strideAP - stride for AP
* @param {NonNegativeInteger} offsetAP - starting index for AP
* @param {Float64Array} AFP - factored form of A in packed storage (output if FACT='not-factored', input if FACT='factored')
* @param {integer} strideAFP - stride for AFP
* @param {NonNegativeInteger} offsetAFP - starting index for AFP
* @param {Int32Array} IPIV - pivot indices (output if FACT='not-factored', input if FACT='factored')
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
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
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is zero (singular), N+1 if rcond < machine epsilon
*/
function dspsvx( fact, uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) { // eslint-disable-line max-len, max-params
	var nofact;
	var anorm;
	var info;
	var nAP;

	info = 0;
	nofact = ( fact === 'not-factored' );

	// Quick return if N = 0
	if ( N === 0 ) {
		return 0;
	}

	if ( nofact ) {
		// Copy AP to AFP and compute the factorization A = U*D*U^T or A = L*D*L^T
		nAP = ( N * ( N + 1 ) / 2 )|0;
		dcopy( nAP, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP );
		info = dsptrf( uplo, N, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV );

		// Return if factorization failed (singular)
		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return info;
		}
	}

	// Compute the norm of the matrix A (infinity-norm; for symmetric = one-norm)
	anorm = dlansp( 'inf-norm', uplo, N, AP, strideAP, offsetAP, WORK, strideWORK, offsetWORK );

	// Compute the reciprocal of the condition number of A
	dspcon( uplo, N, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK );

	// Copy B to X
	dlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve the system A*X = B
	dsptrs( uplo, N, nrhs, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, X, strideX1, strideX2, offsetX );

	// Improve the solution and compute error bounds
	dsprfs( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK );

	// Set INFO = N + 1 if the matrix is singular to working precision
	if ( rcond[ 0 ] < EPS ) {
		info = N + 1;
	}

	return info;
}


// EXPORTS //

export default dspsvx;
