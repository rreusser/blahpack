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
import base from './base.js';


// MAIN //

/**
* Computes a column-blocked QR factorization of a real `M`-by-`N` matrix `A` (with `M >= N`) via TSQR followed by Householder reconstruction.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb1 - TSQR row block size (`mb1 > N`)
* @param {PositiveInteger} nb1 - TSQR column block size (`nb1 >= 1`)
* @param {PositiveInteger} nb2 - HRT (output) block size (`nb2 >= 1`)
* @param {Float64Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} T - output `nb2`-by-`N` matrix of upper triangular block reflectors
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} WORK - workspace array
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer satisfying `M >= N`
* @throws {RangeError} fourth argument must be a positive integer satisfying `mb1 > N` (when `N > 0`)
* @throws {RangeError} fifth argument must be a positive integer
* @throws {RangeError} sixth argument must be a positive integer
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
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer satisfying `M >= N`. Value: `%d`.', N ) );
	}
	if ( mb1 < 1 || ( N > 0 && mb1 <= N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a positive integer satisfying `mb1 > N` (when `N > 0`). Value: `%d`.', mb1 ) );
	}
	if ( nb1 < 1 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a positive integer. Value: `%d`.', nb1 ) );
	}
	if ( nb2 < 1 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a positive integer. Value: `%d`.', nb2 ) );
	}
	const nb2local = ( nb2 < N ) ? nb2 : N;
	if ( order === 'column-major' ) {
		if ( LDA < max( 1, M ) ) {
			throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
		}
		if ( LDT < max( 1, nb2local ) ) {
			throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,min(nb2,N)). Value: `%d`.', LDT ) );
		}
		sa1 = 1;
		sa2 = LDA;
		st1 = 1;
		st2 = LDT;
	} else {
		if ( LDA < max( 1, N ) ) {
			throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
		}
		if ( LDT < max( 1, N ) ) {
			throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
		}
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
	return base( M, N, mb1, nb1, nb2, A, sa1, sa2, 0, T, st1, st2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dgetsqrhrt;
