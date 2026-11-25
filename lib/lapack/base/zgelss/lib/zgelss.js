/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base, { computeWorkSize } from './base.js';


// MAIN //

/**
* Solves overdetermined or underdetermined systems for general matrices.
*
* minimize 2-norm(|| b - A*x ||)
*
* using the singular value decomposition (SVD) of A. A is an M-by-N matrix
* which may be rank-deficient.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
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
* @param {Int32Array} rank - output array; rank[0] set to the effective rank of A
* @param {(Complex128Array|null)} WORK - caller-owned complex workspace, or
* `null` to auto-allocate at the minimum required size (`computeWorkSize(M,N,nrhs)`)
* @param {(Float64Array|null)} RWORK - caller-owned real workspace, or `null`
* to auto-allocate at the minimum required size (`max(1, 5*min(M,N))`)
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, max( M, N ) )` (column-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @returns {integer} info - 0 if successful, >0 if ZBDSQR did not converge
*/
function zgelss( order, M, N, nrhs, A, LDA, B, LDB, S, strideS, rcond, rank, WORK, RWORK ) {
	let minRWork, minWork, sa1, sa2, sb1, sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, max( M, N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', max( M, N ), LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}

	// B holds the RHS on entry and the solution on exit; the min-norm
	// solution (M<N) has N rows, so B is max(M,N)-by-nrhs, NOT M-by-nrhs.
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
	}
	const os = stride2offset( Math.min( M, N ), strideS );

	// The wrapper is the single sanctioned allocation site (base/ndarray never
	// allocate): allocate a complex WORK and a real RWORK when the caller
	// passes `null`.
	if ( WORK === null || WORK === void 0 ) {
		minWork = computeWorkSize( M, N, nrhs );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		minRWork = max( 1, 5 * Math.min( M, N ) );
		RWORK = new Float64Array( minRWork );
	}
	return base( M, N, nrhs, A, sa1, sa2, 0, B, sb1, sb2, 0, S, strideS, os, rcond, rank, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default zgelss;
