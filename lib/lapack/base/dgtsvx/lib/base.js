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

import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dgttrf from '../../dgttrf/lib/base.js';
import dgttrs from '../../dgttrs/lib/base.js';
import dlangt from '../../dlangt/lib/base.js';
import dgtcon from '../../dgtcon/lib/base.js';
import dgtrfs from '../../dgtrfs/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'Epsilon' );


// MAIN //

/**
* Uses the LU factorization to compute the solution to a real system of.
* linear equations A_X = B, A^T_X = B, or A^H*X = B, where A is a
* tridiagonal matrix of order N and X and B are N-by-NRHS matrices.
*
* Error bounds on the solution and a condition estimate are also provided.
*
* @private
* @param {string} fact - 'not-factored' or 'factored'
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {Float64Array} DL - sub-diagonal of A (length N-1)
* @param {integer} strideDL - stride for DL
* @param {NonNegativeInteger} offsetDL - offset for DL
* @param {Float64Array} d - diagonal of A (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Float64Array} DU - super-diagonal of A (length N-1)
* @param {integer} strideDU - stride for DU
* @param {NonNegativeInteger} offsetDU - offset for DU
* @param {Float64Array} DLF - factored sub-diagonal (length N-1), input if fact='factored', output if fact='not-factored'
* @param {integer} strideDLF - stride for DLF
* @param {NonNegativeInteger} offsetDLF - offset for DLF
* @param {Float64Array} DF - factored diagonal (length N), input if fact='factored', output if fact='not-factored'
* @param {integer} strideDF - stride for DF
* @param {NonNegativeInteger} offsetDF - offset for DF
* @param {Float64Array} DUF - factored super-diagonal (length N-1), input if fact='factored', output if fact='not-factored'
* @param {integer} strideDUF - stride for DUF
* @param {NonNegativeInteger} offsetDUF - offset for DUF
* @param {Float64Array} DU2 - second superdiagonal fill-in (length N-2), input if fact='factored', output if fact='not-factored'
* @param {integer} strideDU2 - stride for DU2
* @param {NonNegativeInteger} offsetDU2 - offset for DU2
* @param {Int32Array} IPIV - pivot indices (length N), 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - offset for IPIV
* @param {Float64Array} B - right hand side matrix (N x NRHS)
* @param {integer} strideB1 - row stride of B
* @param {integer} strideB2 - column stride of B
* @param {NonNegativeInteger} offsetB - offset for B
* @param {Float64Array} X - solution matrix (N x NRHS), output
* @param {integer} strideX1 - row stride of X
* @param {integer} strideX2 - column stride of X
* @param {NonNegativeInteger} offsetX - offset for X
* @param {Float64Array} rcond - output: rcond[0] is the reciprocal condition number
* @param {Float64Array} FERR - output: forward error bound for each RHS
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - offset for FERR
* @param {Float64Array} BERR - output: backward error for each RHS
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - offset for BERR
* @param {Float64Array} WORK - workspace of length at least 3*N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - offset for WORK
* @param {Int32Array} IWORK - integer workspace of length at least N
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - offset for IWORK
* @returns {integer} info - 0 if successful, >0 if singular, N+1 if ill-conditioned
*/
function dgtsvx( fact, trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) {
	var normStr;
	var nofact;
	var notran;
	var anorm;
	var info;

	info = 0;
	nofact = ( fact === 'not-factored' );
	notran = ( trans === 'no-transpose' );

	if ( nofact ) {
		// Copy DL, D, DU to DLF, DF, DUF
		dcopy( N, d, strideD, offsetD, DF, strideDF, offsetDF );
		if ( N > 1 ) {
			dcopy( N - 1, DL, strideDL, offsetDL, DLF, strideDLF, offsetDLF );
			dcopy( N - 1, DU, strideDU, offsetDU, DUF, strideDUF, offsetDUF );
		}

		// Compute LU factorization
		info = dgttrf( N, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV );

		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return info;
		}
	}

	// Compute the norm of A for condition estimation
	if ( notran ) {
		normStr = 'one-norm';
	} else {
		normStr = 'inf-norm';
	}
	anorm = dlangt( normStr, N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU );

	// Estimate condition number
	dgtcon( normStr, N, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );

	// Copy B to X
	dlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve the system
	dgttrs( trans, N, nrhs, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, X, strideX1, strideX2, offsetX );

	// Iterative refinement
	dgtrfs( trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );

	// Check if condition is too poor
	if ( rcond[ 0 ] < EPS ) {
		info = N + 1;
	}

	return info;
}


// EXPORTS //

export default dgtsvx;
