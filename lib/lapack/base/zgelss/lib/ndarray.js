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

import format from '@stdlib/string/format/lib/index.js';
import base, { computeWorkSize } from './base.js';


// MAIN //

/**
* Computes the minimum norm solution to a complex linear least squares problem:.
*
* minimize 2-norm(|| b - A*x ||)
*
* using the singular value decomposition (SVD) of A. A is an M-by-N matrix
* which may be rank-deficient.
*
* Several right hand side vectors b and solution vectors x can be handled
* in a single call; they are stored as the columns of the M-by-NRHS right
* hand side matrix B and the N-by-NRHS solution matrix X.
*
* The effective rank of A is determined by treating as zero those singular
* values which are less than RCOND times the largest singular value.
*
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Complex128Array} A - M-by-N matrix, overwritten on exit
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - on entry, M-by-NRHS (or max(M,N)-by-NRHS) RHS matrix;
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Float64Array} S - output array of singular values in decreasing order (length min(M,N))
* @param {integer} strideS - stride length for S
* @param {NonNegativeInteger} offsetS - starting index for S
* @param {number} rcond - used to determine the effective rank of A.
* @param {Array} rank - output array; rank[0] set to the effective rank of A
* @param {Complex128Array} WORK - caller-owned complex workspace of at least
* `computeWorkSize(M,N,nrhs)` complex elements from `offsetWork` (never allocated here)
* @param {integer} strideWork - stride length for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @param {Float64Array} RWORK - caller-owned real workspace of at least
* `max(1, 5*min(M,N))` elements from `offsetRWork` (never allocated here)
* @param {integer} strideRWork - stride length for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @throws {RangeError} if WORK or RWORK is too small
* @returns {integer} info - 0 if successful, >0 if ZBDSQR did not converge
*/
function zgelss( M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, S, strideS, offsetS, rcond, rank, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
	var minRWork;
	var minWork;

	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	// Zero-dimensional quick return MUST precede the workspace-size assertions:
	// an empty matrix requires no workspace.
	if ( M === 0 || N === 0 ) {
		rank[ 0 ] = 0;
		return 0;
	}
	// Caller owns WORK/RWORK; assert they are large enough so an under-sized
	// buffer is a loud RangeError, not a silent NaN from an out-of-bounds read.
	minWork = computeWorkSize( M, N, nrhs );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	minRWork = Math.max( 1, 5 * Math.min( M, N ) );
	if ( !RWORK || ( RWORK.length - offsetRWork ) < minRWork ) {
		throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', minRWork, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
	}
	return base( M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, S, strideS, offsetS, rcond, rank, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgelss;
