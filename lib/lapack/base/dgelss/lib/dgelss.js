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
import ndarray from './ndarray.js';
import { computeWorkSize } from './base.js';


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
* @param {(Float64Array|null)} WORK - workspace of length at least the reference's MINWRK (`max(3*N+MM, 3*N+nrhs, 5*N)` for `M >= N`, `MM = N` when `M >= 1.6*N` and `M` otherwise; `max(3*M+nrhs, 3*M+N, 5*M)` for `M < N`); for optimum performance the reference's MAXWRK, which lets the blocked callees use their ILAENV block size; if `null`, MAXWRK elements are allocated
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
	return ndarray( M, N, nrhs, A, sa1, sa2, 0, B, sb1, sb2, 0, S, strideS, os, rcond, rank, W, 1, 0 );
}


// EXPORTS //

export default dgelss;
