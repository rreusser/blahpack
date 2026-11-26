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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// VARIABLES //

const NB = 32; // block size of the blocked callees (ILAENV(1) stand-in)
const TSIZE = 65 * 64; // ( NBMAX + 1 ) * NBMAX, the T part of the dormqr/dormlq/dormbr optimum


// FUNCTIONS //

/**
* Returns the optimal WORK size for `dgelss`: the reference's `MAXWRK`.
*
* ## Notes
*
* -   Each callee's workspace query is replaced by the optimum the JS callee states with `NB = 32`: `dgeqrf` `N*NB`, `dgelqf` `M*NB`, `dgebrd` `(M+N)*NB`, `dormqr`/`dormlq`/`dormbr` `nw*NB + TSIZE`, and `dorgbr` `LDWORK*NB` (at least `min(M,N)`).
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @returns {integer} workspace size
*/
function computeWorkSize( M, N, nrhs ) {
	let maxwrk, bdspac, minwrk, mm;

	const minmn = ( M < N ) ? M : N;
	if ( minmn === 0 ) {
		return 1;
	}
	const mnthr = Math.floor( 1.6 * minmn ); // ILAENV(6,...) truncates
	const lworm = ( nrhs * NB ) + TSIZE; // dormqr/dormlq/dormbr optimum (nw = NRHS)
	mm = M;
	maxwrk = 1;
	if ( M >= N ) {
		if ( M >= mnthr ) {
			// Path 1a: dgeqrf, dormqr
			mm = N;
			maxwrk = max( maxwrk, N + ( N * NB ) );
			maxwrk = max( maxwrk, N + lworm );
		}
		// Path 1: dgebrd, dormbr, dorgbr('P',N,N,N), dbdsqr
		bdspac = max( 1, 5 * N );
		maxwrk = max( maxwrk, ( 3 * N ) + ( ( mm + N ) * NB ) );
		maxwrk = max( maxwrk, ( 3 * N ) + lworm );
		maxwrk = max( maxwrk, ( 3 * N ) + max( N, ( N - 1 ) * NB ) );
		maxwrk = max( maxwrk, bdspac );
		maxwrk = max( maxwrk, N * nrhs );
		minwrk = max( max( ( 3 * N ) + mm, ( 3 * N ) + nrhs ), bdspac );
	} else {
		bdspac = max( 1, 5 * M );
		minwrk = max( max( ( 3 * M ) + nrhs, ( 3 * M ) + N ), bdspac );
		if ( N >= mnthr ) {
			// Path 2a: dgelqf, dgebrd(M,M), dormbr, dorgbr('P',M,M,M), dbdsqr, dormlq
			maxwrk = M + ( M * NB );
			maxwrk = max( maxwrk, ( M * M ) + ( 4 * M ) + ( 2 * M * NB ) );
			maxwrk = max( maxwrk, ( M * M ) + ( 4 * M ) + lworm );
			maxwrk = max( maxwrk, ( M * M ) + ( 4 * M ) + max( M, ( M - 1 ) * NB ) );
			maxwrk = max( maxwrk, ( M * M ) + M + bdspac );
			if ( nrhs > 1 ) {
				maxwrk = max( maxwrk, ( M * M ) + M + ( M * nrhs ) );
			} else {
				maxwrk = max( maxwrk, ( M * M ) + ( 2 * M ) );
			}
			maxwrk = max( maxwrk, M + lworm );
		} else {
			// Path 2b: dgebrd, dormbr, dorgbr('P',M,N,M), dbdsqr
			maxwrk = ( 3 * M ) + ( ( M + N ) * NB );
			maxwrk = max( maxwrk, ( 3 * M ) + lworm );
			maxwrk = max( maxwrk, ( 3 * M ) + ( M * NB ) );
			maxwrk = max( maxwrk, bdspac );
			maxwrk = max( maxwrk, N * nrhs );
		}
	}
	return max( minwrk, maxwrk );
}


// MAIN //

/**
* Solves overdetermined or underdetermined systems for general matrices.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} S - input array
* @param {integer} strideS - `S` stride length
* @param {number} rcond - used to determine the effective rank of A.
* @param {Int32Array} rank - output array; rank[0] set to the effective rank of A
* @param {(Float64Array|null)} WORK - workspace of length at least the reference's MINWRK (`max(3*N+MM, 3*N+nrhs, 5*N)` for `M >= N`, `MM = N` when `M >= 1.6*N` and `M` otherwise; `max(3*M+nrhs, 3*M+N, 5*M)` for `M < N`); for optimum performance the reference's MAXWRK, which enables the blocked callees (NB = 32); if `null`, MAXWRK elements are allocated
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, max( M, N ) )` (column-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @returns {integer} info - 0 if successful, >0 if DBDSQR did not converge
*/
function dgelss( order, M, N, nrhs, A, LDA, B, LDB, S, strideS, rcond, rank, WORK ) {
	let sa1, sa2, sb1, sb2, W;

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
	const os = stride2offset( min( M, N ), strideS );

	// LAPACKE convenience: allocate WORK when the caller passes `null`.
	if ( WORK === null || WORK === void 0 ) {
		W = new Float64Array( computeWorkSize( M, N, nrhs ) );
	} else {
		W = WORK;
	}
	return base( M, N, nrhs, A, sa1, sa2, 0, B, sb1, sb2, 0, S, strideS, os, rcond, rank, W, 1, 0 );
}


// EXPORTS //

export default dgelss;
