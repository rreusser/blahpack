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

import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlansp from '../../zlansp/lib/base.js';
import zsptrf from '../../zsptrf/lib/base.js';
import zsptrs from '../../zsptrs/lib/base.js';
import zspcon from '../../zspcon/lib/base.js';
import zsprfs from '../../zsprfs/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Solves a complex symmetric indefinite system of linear equations A_X = B where A is stored in packed format, using the diagonal pivoting factorization A = U_D_U^T or A = L_D_L^T, and provides an estimate of the condition number and error bounds on the solution.
*
* @private
* @param {string} fact - 'factored' if AFP and IPIV contain the factorization, 'not-factored' to compute it
* @param {string} uplo - 'upper' if upper triangle of A stored, 'lower' if lower triangle
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AP - symmetric matrix A in packed storage (length N*(N+1)/2)
* @param {integer} strideAP - stride for AP (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for AP (in complex elements)
* @param {Complex128Array} AFP - factored form of A in packed storage (output if FACT='not-factored', input if FACT='factored')
* @param {integer} strideAFP - stride for AFP (in complex elements)
* @param {NonNegativeInteger} offsetAFP - starting index for AFP (in complex elements)
* @param {Int32Array} IPIV - pivot indices (output if FACT='not-factored', input if FACT='factored')
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Complex128Array} B - right-hand side matrix (column-major, N-by-NRHS)
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128Array} X - solution matrix (column-major, N-by-NRHS, output)
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
* @param {Complex128Array} WORK - workspace array (length at least 2*N complex elements)
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length at least N)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is zero (singular), N+1 if rcond < machine epsilon
*/
function zspsvx( fact, uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
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
		zcopy( nAP, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP );
		info = zsptrf( uplo, N, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV );

		// Return if factorization failed (singular)
		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return info;
		}
	}

	// Compute the infinity-norm of the matrix A (for symmetric, inf-norm = one-norm)
	anorm = zlansp( 'inf-norm', uplo, N, AP, strideAP, offsetAP, RWORK, strideRWork, offsetRWork );

	// Compute the reciprocal of the condition number of A
	zspcon( uplo, N, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWork, offsetWork );

	// Copy B to X
	zlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve the system A*X = B
	zsptrs( uplo, N, nrhs, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, X, strideX1, strideX2, offsetX );

	// Improve the solution and compute error bounds
	zsprfs( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	// Set INFO = N + 1 if the matrix is singular to working precision
	if ( rcond[ 0 ] < EPS ) {
		info = N + 1;
	}

	return info;
}


// EXPORTS //

export default zspsvx;
