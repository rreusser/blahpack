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
import ndarray from './ndarray.js';


// MAIN //

/**
* Computes a blocked Tall-Skinny QR (TSQR) factorization of a real `M`-by-`N` matrix `A` (with `M >= N`).
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {integer} mb - row block size (`mb >= 1`)
* @param {integer} nb - column block size (`1 <= nb <= N` when `N > 0`)
* @param {Float64Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} T - output matrix of upper triangular block reflector factors
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {(Float64Array|null)} WORK - workspace array of length at least `nb*N`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `N < 0 || M < N`)
* @throws {RangeError} fourth argument is invalid (rejected when `mb < 1`)
* @throws {RangeError} fifth argument is invalid (rejected when `nb < 1 || ( nb > N && N > 0 )`)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} ninth argument must be greater than or equal to `nb` (column-major)
* @throws {RangeError} `LDA` must be valid for the chosen order
* @returns {integer} status code (`0` = success)
*/
function dlatsqr( order, M, N, mb, nb, A, LDA, T, LDT, WORK ) {
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
	if ( mb < 1 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `mb < 1`). Value: `%d`.', mb ) );
	}
	if ( nb < 1 || ( nb > N && N > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument is invalid (rejected when `nb < 1 || ( nb > N && N > 0 )`). Value: `%d`.', nb ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' && ( LDT < nb ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to %d. Value: `%d`.', nb, LDT ) );
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
		const minWork = nb * N;
		WORK = new Float64Array( minWork );
	}
	return ndarray( M, N, mb, nb, A, sa1, sa2, 0, T, st1, st2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dlatsqr;
