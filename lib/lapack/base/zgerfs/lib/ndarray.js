/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a complex system of linear equations and.
* provides error bounds and backward error estimates for the solution.
*
* Uses the LU factorization computed by zgetrf. WORK and RWORK are provided
* by the caller.
*
* IPIV must contain 0-based pivot indices (as produced by zgetrf).
*
* For TRANS:
*   'no-transpose' - A _ X = B
_   'transpose' - A^T _ X = B
*   'conjugate-transpose' - A^H * X = B
*
* Note: In zgerfs, when NOTRAN, the transposed solve uses 'conjugate-transpose'
* (A^H), not 'transpose' (A^T), because the forward error bound estimation
* requires the adjoint for complex matrices.
*
* @param {string} trans - specifies the form of the system
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - original N-by-N complex matrix
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Complex128Array} AF - LU-factored N-by-N complex matrix (from zgetrf)
* @param {integer} strideAF1 - stride of the first dimension of AF (complex elements)
* @param {integer} strideAF2 - stride of the second dimension of AF (complex elements)
* @param {NonNegativeInteger} offsetAF - index offset for AF (complex elements)
* @param {Int32Array} IPIV - pivot indices from zgetrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (complex elements)
* @param {Complex128Array} X - solution matrix (improved on exit)
* @param {integer} strideX1 - stride of the first dimension of X (complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (complex elements)
* @param {NonNegativeInteger} offsetX - index offset for X (complex elements)
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - index offset for FERR
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - index offset for BERR
* @param {Complex128Array} WORK - workspace of length >= 2*N complex elements
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - index offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of length >= N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - index offset for RWORK
* @throws {TypeError} first argument must be a valid transpose operation
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*/
function zgerfs( trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	// Caller owns the workspaces; assert they are sufficiently large arrays so
	// an under-sized (or non-array) buffer is a loud RangeError, not a silent
	// NaN from an out-of-bounds read. WORK holds 2*N complex elements and RWORK
	// holds N reals (N === 0 is a quick return that references no workspace).
	if ( N > 0 ) {
		if ( !WORK || ( WORK.length - offsetWork ) < ( 2 * N ) ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', 2 * N, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		if ( !RWORK || ( RWORK.length - offsetRWork ) < N ) {
			throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	return base( trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgerfs;
