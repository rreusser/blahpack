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

import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zgttrf from '../../zgttrf/lib/base.js';
import zgttrs from '../../zgttrs/lib/base.js';
import zlangt from '../../zlangt/lib/base.js';
import zgtcon from '../../zgtcon/lib/base.js';
import zgtrfs from '../../zgtrfs/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'Epsilon' );


// MAIN //

/**
* Uses the LU factorization to compute the solution to a complex system of.
* linear equations A_X = B, A^T_X = B, or A^H_X = B, where A is a
* tridiagonal matrix of order N and X and B are N-by-NRHS matrices.
*
* Error bounds on the solution and a condition estimate are also provided.
*
* @private
* @param {string} fact - 'not-factored' or 'factored'
* @param {string} trans - 'no-transpose', 'transpose', or 'conjugate-transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {Complex128Array} DL - sub-diagonal of A (length N-1)
* @param {integer} strideDL - stride for DL (in complex elements)
* @param {NonNegativeInteger} offsetDL - starting index for DL (in complex elements)
* @param {Complex128Array} d - diagonal of A (length N)
* @param {integer} strideD - stride for d (in complex elements)
* @param {NonNegativeInteger} offsetD - starting index for d (in complex elements)
* @param {Complex128Array} DU - super-diagonal of A (length N-1)
* @param {integer} strideDU - stride for DU (in complex elements)
* @param {NonNegativeInteger} offsetDU - starting index for DU (in complex elements)
* @param {Complex128Array} DLF - factored sub-diagonal (length N-1), input if fact='factored', output if fact='not-factored'
* @param {integer} strideDLF - stride for DLF (in complex elements)
* @param {NonNegativeInteger} offsetDLF - starting index for DLF (in complex elements)
* @param {Complex128Array} DF - factored diagonal (length N), input if fact='factored', output if fact='not-factored'
* @param {integer} strideDF - stride for DF (in complex elements)
* @param {NonNegativeInteger} offsetDF - starting index for DF (in complex elements)
* @param {Complex128Array} DUF - factored super-diagonal (length N-1), input if fact='factored', output if fact='not-factored'
* @param {integer} strideDUF - stride for DUF (in complex elements)
* @param {NonNegativeInteger} offsetDUF - starting index for DUF (in complex elements)
* @param {Complex128Array} DU2 - second superdiagonal fill-in (length N-2), input if fact='factored', output if fact='not-factored'
* @param {integer} strideDU2 - stride for DU2 (in complex elements)
* @param {NonNegativeInteger} offsetDU2 - starting index for DU2 (in complex elements)
* @param {Int32Array} IPIV - pivot indices (length N), 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Complex128Array} B - right hand side matrix (N x NRHS)
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128Array} X - solution matrix (N x NRHS), output
* @param {integer} strideX1 - stride of the first dimension of X (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for X (in complex elements)
* @param {Float64Array} rcond - output: rcond[0] is the reciprocal condition number
* @param {Float64Array} FERR - output: forward error bound for each RHS (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - starting index for FERR
* @param {Float64Array} BERR - output: backward error for each RHS (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - starting index for BERR
* @param {Complex128Array} WORK - workspace of length at least 2*N complex elements
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @param {Float64Array} RWORK - real workspace of length at least N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} info - 0 if successful, >0 if singular, N+1 if ill-conditioned
*/
function zgtsvx( fact, trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
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
		zcopy( N, d, strideD, offsetD, DF, strideDF, offsetDF );
		if ( N > 1 ) {
			zcopy( N - 1, DL, strideDL, offsetDL, DLF, strideDLF, offsetDLF );
			zcopy( N - 1, DU, strideDU, offsetDU, DUF, strideDUF, offsetDUF );
		}

		// Compute LU factorization
		info = zgttrf( N, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV );

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
	anorm = zlangt( normStr, N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU );

	// Estimate condition number
	zgtcon( normStr, N, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWork, offsetWork );

	// Copy B to X
	zlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve the system
	zgttrs( trans, N, nrhs, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, X, strideX1, strideX2, offsetX );

	// Iterative refinement
	zgtrfs( trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	// Check if condition is too poor
	if ( rcond[ 0 ] < EPS ) {
		info = N + 1;
	}

	return info;
}


// EXPORTS //

export default zgtsvx;
