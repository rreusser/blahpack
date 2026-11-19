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
* Recursively computes a QR factorization of a real `M`-by-`N` matrix using the compact WY representation of `Q`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {integer} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {Float64Array} A - input/output matrix; on exit contains `R` and `V`
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} T - output upper triangular factor of the block reflector
* @param {PositiveInteger} LDT - leading dimension of `T`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument is invalid (rejected when `M < N`)
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )`
* @returns {integer} status code (`0` = success)
*/
function dgeqrt3( order, M, N, A, LDA, T, LDT ) {
	let sa1, sa2, st1, st2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < N ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `M < N`). Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDT ) );
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
	return base( M, N, A, sa1, sa2, 0, T, st1, st2, 0 );
}


// EXPORTS //

export default dgeqrt3;
