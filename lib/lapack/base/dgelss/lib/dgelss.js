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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './base.js';


// VARIABLES //

// Hardcoded LAPACK block size (replaces ILAENV(1,'DGEBRD','...') queries):
var NB = 32;


// FUNCTIONS //

/**
* Returns the minimum WORK size required by `dgelss`.
*
* ## Notes
*
* -   Mirrors `MAXWRK` from LAPACK reference `dgelss.f` and is safe across
*     all code paths (QR-pre, LQ-pre + workspace copy, direct bidiag).
*
* -   Includes headroom for the block size `NB=32`.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} workspace size
*/
function computeWorkSize( M, N, nrhs ) {
	var bdspac;
	var minmn;
	var mnthr;
	var wsize;
	var mm;

	minmn = ( M < N ) ? M : N;
	if ( minmn === 0 ) {
		return 1;
	}
	mnthr = Math.round( 1.6 * minmn );
	mm = M;
	wsize = 1;
	bdspac = max( 1, 5 * minmn );

	if ( M >= N ) {
		if ( M >= mnthr ) {
			mm = N;

			// QR path: TAU + max(N*NB for QR, N*NB for ORMQR):
			wsize = max( wsize, N + ( N * NB ) );
		}

		// Bidiagonal reduction workspace:
		wsize = max( wsize, ( 3 * N ) + ( max( mm, N ) * NB ) );
		wsize = max( wsize, ( 3 * N ) + nrhs );
		wsize = max( wsize, bdspac );
		wsize = max( wsize, N * nrhs );
	} else {
		bdspac = max( 1, 5 * M );
		if ( N >= mnthr ) {
			// LQ path with workspace copy of L:
			wsize = M + ( M * NB );
			wsize = max( wsize, ( M * M ) + ( 4 * M ) + ( M * NB ) );
			wsize = max( wsize, ( M * M ) + M + bdspac );
			wsize = max( wsize, ( M * M ) + M + ( M * nrhs ) );
			wsize = max( wsize, M + ( N * NB ) );
		} else {
			// Direct bidiagonal reduction:
			wsize = max( wsize, ( 3 * M ) + ( N * NB ) );
			wsize = max( wsize, ( 3 * M ) + nrhs );
			wsize = max( wsize, bdspac );
			wsize = max( wsize, N * nrhs );
		}
	}
	return wsize;
}


// MAIN //

/**
* Computes the minimum norm solution to a real linear least squares problem:.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
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
* @param {Array} rank - output array; rank[0] set to the effective rank of A
* @param {(Float64Array|null)} WORK - caller-provided workspace; if `null`,
* the routine allocates a buffer at the minimum required size as a LAPACKE
* convenience.
* @param {integer} strideWork - `WORK` stride length
* @param {integer} lwork - length of WORK array (ignored when WORK is null)
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max(1,N)` (row-major) or `max(1,M)` (column-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max(1,N)` (row-major) or `max(1,M)` (column-major)
* @returns {integer} info - 0 if successful, >0 if DBDSQR did not converge
*/
function dgelss( order, M, N, nrhs, A, LDA, B, LDB, S, strideS, rcond, rank, WORK, strideWork, lwork ) {
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var os;
	var ow;
	var sw;
	var lw;
	var W;

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
	if ( order === 'row-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,M). Value: `%d`.', LDB ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
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
	os = stride2offset( N, strideS );

	// LAPACKE convenience: allocate WORK when the caller passes `null`.
	if ( WORK === null ) {
		lw = computeWorkSize( M, N, nrhs );
		W = new Float64Array( lw );
		sw = 1;
		ow = 0;
	} else {
		W = WORK;
		sw = strideWork;
		lw = lwork;
		ow = stride2offset( lw, strideWork );
	}
	return base( M, N, nrhs, A, sa1, sa2, 0, B, sb1, sb2, 0, S, strideS, os, rcond, rank, W, sw, ow, lw );
}


// EXPORTS //

export default dgelss;
