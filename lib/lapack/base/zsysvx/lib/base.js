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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlansy from '../../zlansy/lib/base.js';
import zsytrf from '../../zsytrf/lib/base.js';
import zsytrs from '../../zsytrs/lib/base.js';
import zsycon from '../../zsycon/lib/base.js';
import zsyrfs from '../../zsyrfs/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Solves a complex symmetric indefinite system of linear equations A_X = B.
_ using the diagonal pivoting factorization A = U_D_U^T or A = L_D*L^T,
* and provides an estimate of the condition number and error bounds.
*
* NOTE: SYMMETRIC (not Hermitian). No conjugation.
*
* @private
* @param {string} fact - 'not-factored' or 'factored'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of RHS columns
* @param {Complex128Array} A - symmetric matrix A
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {NonNegativeInteger} offsetA - offset into A
* @param {Complex128Array} AF - factored form of A
* @param {integer} strideAF1 - first stride of AF
* @param {integer} strideAF2 - second stride of AF
* @param {NonNegativeInteger} offsetAF - offset into AF
* @param {Int32Array} IPIV - pivot indices
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - offset for IPIV
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - first stride of B
* @param {integer} strideB2 - second stride of B
* @param {NonNegativeInteger} offsetB - offset into B
* @param {Complex128Array} X - solution matrix (output)
* @param {integer} strideX1 - first stride of X
* @param {integer} strideX2 - second stride of X
* @param {NonNegativeInteger} offsetX - offset into X
* @param {Float64Array} rcond - single-element array for reciprocal condition number
* @param {Float64Array} FERR - forward error bounds (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - offset for FERR
* @param {Float64Array} BERR - backward error bounds (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - offset for BERR
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - offset for WORK
* @param {integer} lwork - length of WORK
* @param {Float64Array} RWORK - real workspace (length N)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - offset for RWORK
* @returns {integer} info - 0 on success, k>0 if singular, N+1 if ill-conditioned
*/
function zsysvx( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line no-unused-vars
	var nofact;
	var anorm;
	var info;
	var rw;

	info = 0;
	nofact = ( fact === 'not-factored' );

	if ( N === 0 ) {
		return 0;
	}

	if ( nofact ) {
		// Copy A to AF
		zlacpy( uplo, N, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF );
		info = zsytrf( uplo, N, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV );

		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return info;
		}
	}

	// Compute infinity-norm of A
	rw = new Float64Array( N );
	anorm = zlansy( 'inf-norm', uplo, N, A, strideA1, strideA2, offsetA, rw, 1, 0 );

	// Estimate reciprocal condition number
	zsycon( uplo, N, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWork, offsetWork );

	// Copy B to X
	zlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve A*X = B
	zsytrs( uplo, N, nrhs, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, X, strideX1, strideX2, offsetX );

	// Iterative refinement
	zsyrfs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	// Check condition
	if ( rcond[ 0 ] < EPS ) {
		info = N + 1;
	}

	return info;
}


// EXPORTS //

export default zsysvx;
