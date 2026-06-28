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

/* eslint-disable max-len, max-params */

// MODULES //

import dlacpy from '../../dlacpy/lib/base.js';
import dlansy from '../../dlansy/lib/base.js';
import dsytrf from '../../dsytrf/lib/base.js';
import dsytrs from '../../dsytrs/lib/base.js';
import dsycon from '../../dsycon/lib/base.js';
import dsyrfs from '../../dsyrfs/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var NB = 64; // Block size (hardcoded; Fortran uses ILAENV)
var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Solves a real symmetric indefinite system of linear equations A_X = B using.
_ the diagonal pivoting factorization A = U_D_U^T or A = L_D*L^T, and provides
* an estimate of the condition number and error bounds on the solution.
*
* @private
* @param {string} fact - 'factored' if AF and IPIV contain the factorization, 'not-factored' to compute it
* @param {string} uplo - 'upper' if upper triangle of A stored, 'lower' if lower triangle
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - symmetric matrix A (column-major, only triangle specified by uplo stored)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} AF - factored form of A (output if FACT='not-factored', input if FACT='factored')
* @param {integer} strideAF1 - stride of the first dimension of AF
* @param {integer} strideAF2 - stride of the second dimension of AF
* @param {NonNegativeInteger} offsetAF - starting index for AF
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
* @param {Float64Array} WORK - workspace array (length at least max(1, 3*N))
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - length of WORK (-1 for workspace query)
* @param {Int32Array} IWORK - integer workspace array (length at least N)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is zero (singular), N+1 if rcond < machine epsilon
*/
function dsysvx( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, lwork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	var lwkopt;
	var nofact;
	var lquery;
	var anorm;
	var info;

	info = 0;
	nofact = ( fact === 'not-factored' );
	lquery = ( lwork === -1 );

	// Compute optimal workspace size
	lwkopt = Math.max( 1, 3 * N );
	if ( nofact ) {
		lwkopt = Math.max( lwkopt, N * NB );
	}

	// Store optimal workspace in WORK[0] for queries
	if ( lquery || info === 0 ) {
		WORK[ offsetWork ] = lwkopt;
	}

	if ( lquery ) {
		return 0;
	}

	// Quick return if N = 0
	if ( N === 0 ) {
		return 0;
	}

	if ( nofact ) {
		// Compute the factorization A = U*D*U^T or A = L*D*L^T
		// First copy A to AF
		dlacpy( uplo, N, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF );
		info = dsytrf( uplo, N, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV );

		// Return if factorization failed (singular)
		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return info;
		}
	}

	// Compute the norm of the matrix A
	anorm = dlansy( 'inf-norm', uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork );

	// Compute the reciprocal of the condition number of A
	dsycon( uplo, N, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );

	// Copy B to X
	dlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve the system A*X = B
	dsytrs( uplo, N, nrhs, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, X, strideX1, strideX2, offsetX );

	// Improve the solution and compute error bounds
	dsyrfs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );

	// Set INFO = N + 1 if the matrix is singular to working precision
	if ( rcond[ 0 ] < EPS ) {
		info = N + 1;
	}

	WORK[ offsetWork ] = lwkopt;

	return info;
}


// EXPORTS //

export default dsysvx;
