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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex Hermitian indefinite system of linear equations A_X = B.
_ using the diagonal pivoting factorization A = U_D_U^H or A = L_D*L^H,
* and provides an estimate of the condition number and error bounds.
*
* NOTE: HERMITIAN (not symmetric). Uses conjugate transpose.
*
* @param {string} fact - 'not-factored' or 'factored'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of RHS columns
* @param {Complex128Array} A - Hermitian matrix A
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
* @param {Complex128Array} WORK - caller-owned complex workspace of at least `max(1,2*N)` elements from `offsetWork` (never allocated here)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - offset for WORK
* @param {Float64Array} RWORK - caller-owned real workspace of at least `N` elements from `offsetRWork` (never allocated here)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - offset for RWORK
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @throws {RangeError} if WORK or RWORK is too small
* @returns {integer} info - 0 on success, k>0 if singular, N+1 if ill-conditioned
*/
function zhesvx( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
	var minWork;
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	// Zero-dimensional quick return MUST precede the workspace-size assertions:
	// an empty matrix requires no workspace.
	if ( N === 0 ) {
		return base( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ); // eslint-disable-line max-len
	}
	// Caller owns WORK/RWORK; assert they are large enough so an under-sized
	// buffer is a loud RangeError, not a silent NaN from an out-of-bounds read.
	// WORK needs max(1,2*N) complex elements (zhecon/zherfs); zhetrf self-
	// allocates its blocked workspace. RWORK needs N real elements.
	minWork = Math.max( 1, 2 * N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( !RWORK || ( RWORK.length - offsetRWork ) < N ) {
		throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
	}
	return base( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhesvx;
