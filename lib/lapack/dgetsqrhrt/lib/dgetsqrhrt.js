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
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Computes a column-blocked QR factorization of a real `M`-by-`N` matrix `A` (with `M >= N`) via TSQR followed by Householder reconstruction.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {integer} mb1 - TSQR row block size (`mb1 > N`)
* @param {integer} nb1 - TSQR column block size (`nb1 >= 1`)
* @param {integer} nb2 - HRT (output) block size (`nb2 >= 1`)
* @param {Float64Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} T - output `nb2`-by-`N` matrix of upper triangular block reflectors
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {(Float64Array|null)} WORK - workspace array
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `N < 0 || M < N`)
* @throws {RangeError} fourth argument is invalid (rejected when `mb1 <= N`)
* @throws {RangeError} fifth argument is invalid (rejected when `nb1 < 1`)
* @throws {RangeError} sixth argument is invalid (rejected when `nb2 < 1`)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, min( nb2, N ) )` (column-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} `LDA` must be valid for the chosen order
* @throws {RangeError} `LDT` must be valid for the chosen order
* @returns {integer} status code (`0` = success)
*/
function dgetsqrhrt( order, M, N, mb1, nb1, nb2, A, LDA, T, LDT, WORK ) {
	let sa1, sa2, st1, st2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || M < N ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `N < 0 || M < N`). Value: `%d`.', N ) );
	}
	if ( mb1 <= N ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `mb1 <= N`). Value: `%d`.', mb1 ) );
	}
	if ( nb1 < 1 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument is invalid (rejected when `nb1 < 1`). Value: `%d`.', nb1 ) );
	}
	if ( nb2 < 1 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `nb2 < 1`). Value: `%d`.', nb2 ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' && ( LDT < max( 1, min( nb2, N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', min( nb2, N ), LDT ) );
	}
	if ( order === 'row-major' && ( LDT < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDT ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		st1 = 1;
		st2 = LDT;
	} else {
		sa1 = LDA;
		sa2 = 1;
		st1 = LDT;
		st2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const nb1local = Math.min( nb1, N );
		const numAllRowBlocks = Math.max( 1, Math.ceil( ( M - N ) / ( mb1 - N ) ) );
		const lwt = numAllRowBlocks * N * nb1local;
		const lw2 = nb1local * Math.max( nb1local, N - nb1local );
		const minWork = lwt + N * N + Math.max( lw2, N );
		WORK = new Float64Array( minWork );
	}
	return strided( M, N, mb1, nb1, nb2, A, sa1, sa2, 0, T, st1, st2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dgetsqrhrt;
