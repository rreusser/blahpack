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

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses the LU factorization to compute the solution to a complex system of.
* linear equations A_X = B, A^T_X = B, or A^H_X = B, where A is a
* tridiagonal matrix of order N and X and B are N-by-NRHS matrices.
*
* Error bounds on the solution and a condition estimate are also provided.
*
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
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @param {Float64Array} RWORK - real workspace of length at least N
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @throws {TypeError} Second argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 if singular, N+1 if ill-conditioned
*/
function zgtsvx( fact, trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( fact, trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgtsvx;
