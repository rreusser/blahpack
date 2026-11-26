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
import base from './base.js';


// VARIABLES //

const NB = 32; // block size of the blocked callees (ILAENV(1) stand-in)
const TSIZE = 65 * 64; // ( NBMAX + 1 ) * NBMAX, the T part of the zunmqr/zunmlq/zunmbr optimum


// FUNCTIONS //

/**
* Returns the optimal complex WORK size for `zgelss`: the reference's `MAXWRK`.
*
* ## Notes
*
* -   Each ILAENV block size is NB = 32, and each callee's workspace query is replaced by the optimum the JS callee states: `zgeqrf` `N*NB`, `zgelqf` `M*NB`, `zgebrd` `(M+N)*NB`, `zunmqr`/`zunmlq`/`zunmbr` `nw*NB + TSIZE`, and `zungbr` `LDWORK*NB` (at least `min(M,N)`).
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @returns {integer} workspace size (in complex elements)
*/
function computeWorkSize( M, N, nrhs ) {
	let maxwrk, minwrk, mm;

	const minmn = Math.min( M, N );
	if ( minmn === 0 ) {
		return 1;
	}
	const mnthr = Math.floor( 1.6 * minmn ); // ILAENV(6,...) truncates
	const lwunm = ( nrhs * NB ) + TSIZE; // zunmqr/zunmlq/zunmbr optimum (nw = NRHS)
	mm = M;
	maxwrk = 1;
	if ( M >= N ) {
		if ( M >= mnthr ) {
			// Path 1a: zgeqrf, zunmqr
			mm = N;
			maxwrk = max( maxwrk, N + ( N * NB ) );
			maxwrk = max( maxwrk, N + ( nrhs * NB ) );
		}
		// Path 1: zgebrd, zunmbr, zungbr('P',N,N,N)
		maxwrk = max( maxwrk, ( 2 * N ) + ( ( mm + N ) * NB ) );
		maxwrk = max( maxwrk, ( 2 * N ) + lwunm );
		maxwrk = max( maxwrk, ( 2 * N ) + max( N, ( N - 1 ) * NB ) );
		maxwrk = max( maxwrk, N * nrhs );
		minwrk = ( 2 * N ) + max( nrhs, M );
	} else {
		minwrk = ( 2 * M ) + max( nrhs, N );
		if ( N >= mnthr ) {
			// Path 2a: zgelqf, zgebrd(M,M), zunmbr, zungbr('P',M,M,M), zunmlq
			maxwrk = M + ( M * NB );
			maxwrk = max( maxwrk, ( 3 * M ) + ( M * M ) + ( 2 * M * NB ) );
			maxwrk = max( maxwrk, ( 3 * M ) + ( M * M ) + lwunm );
			maxwrk = max( maxwrk, ( 3 * M ) + ( M * M ) + max( M, ( M - 1 ) * NB ) );
			if ( nrhs > 1 ) {
				maxwrk = max( maxwrk, ( M * M ) + M + ( M * nrhs ) );
			} else {
				maxwrk = max( maxwrk, ( M * M ) + ( 2 * M ) );
			}
			maxwrk = max( maxwrk, M + lwunm );
		} else {
			// Path 2b: zgebrd, zunmbr, zungbr('P',M,N,M)
			maxwrk = ( 2 * M ) + ( ( M + N ) * NB );
			maxwrk = max( maxwrk, ( 2 * M ) + lwunm );
			maxwrk = max( maxwrk, ( 2 * M ) + ( M * NB ) );
			maxwrk = max( maxwrk, N * nrhs );
		}
	}
	return max( minwrk, maxwrk );
}


// MAIN //

/**
* Solves overdetermined or underdetermined systems for general matrices.
*
* minimize 2-norm(|| b - A*x ||)
*
* using the singular value decomposition (SVD) of A. A is an M-by-N matrix
* which may be rank-deficient.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
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
* @param {(Complex128Array|null)} WORK - complex workspace of at least the reference's MINWRK (`2*N + max(nrhs,M)` for `M >= N`, `2*M + max(nrhs,N)` for `M < N`); for optimum performance the reference's MAXWRK, which enables the LQ-first path (N >> M) and the blocked callees (NB = 32); if `null`, MAXWRK elements are allocated
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
	let minRWork, sa1, sa2, sb1, sb2;

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
		WORK = new Complex128Array( computeWorkSize( M, N, nrhs ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		minRWork = max( 1, 5 * Math.min( M, N ) );
		RWORK = new Float64Array( minRWork );
	}
	return base( M, N, nrhs, A, sa1, sa2, 0, B, sb1, sb2, 0, S, strideS, os, rcond, rank, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default zgelss;
