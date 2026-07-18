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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
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
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Complex128Array} A - M-by-N matrix, overwritten on exit
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - on entry, M-by-NRHS RHS matrix; on exit, the
* N-by-NRHS solution matrix (its leading extent must be `max(M,N)`)
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} S - output array of singular values in decreasing order (length min(M,N))
* @param {integer} strideS - stride length for `S`
* @param {number} rcond - used to determine the effective rank of A
* @param {Array} rank - output array; rank[0] set to the effective rank of A
* @param {(Complex128Array|null)} WORK - caller-owned complex workspace, or
* `null` to auto-allocate at the minimum required size (`computeWorkSize(M,N,nrhs)`)
* @param {integer} strideWork - stride length for WORK (in complex elements)
* @param {(Float64Array|null)} RWORK - caller-owned real workspace, or `null`
* to auto-allocate at the minimum required size (`max(1, 5*min(M,N))`)
* @param {integer} strideRWork - stride length for RWORK
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 if ZBDSQR did not converge
*/
function zgelss( M, N, nrhs, A, LDA, B, LDB, S, strideS, rcond, rank, WORK, strideWork, RWORK, strideRWork ) { // eslint-disable-line max-len, max-params
	let minRWork, minWork, orwork, owork;

	const sa1 = 1;
	const sa2 = LDA;
	const sb1 = 1;
	const sb2 = LDB;
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, max( M, N ) ) ) {
		// B holds the RHS on entry and the solution on exit; the min-norm
		// solution (M<N) has N rows, so B's leading extent is max(M,N), NOT M.
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,max(M,N)). Value: `%d`.', LDB ) );
	}
	const os = stride2offset( N, strideS );

	// The wrapper is the single sanctioned allocation site (base/ndarray never
	// allocate): allocate a complex WORK and a real RWORK when the caller
	// passes `null`.
	if ( WORK === null || WORK === void 0 ) {
		minWork = computeWorkSize( M, N, nrhs );
		WORK = new Complex128Array( minWork );
		strideWork = 1;
		owork = 0;
	} else {
		owork = stride2offset( N, strideWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		minRWork = max( 1, 5 * Math.min( M, N ) );
		RWORK = new Float64Array( minRWork );
		strideRWork = 1;
		orwork = 0;
	} else {
		orwork = stride2offset( N, strideRWork );
	}
	return base( M, N, nrhs, A, sa1, sa2, 0, B, sb1, sb2, 0, S, strideS, os, rcond, rank, WORK, strideWork, owork, RWORK, strideRWork, orwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgelss;
