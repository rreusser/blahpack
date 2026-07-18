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
* Converts a double precision matrix `A` to a single precision matrix `SA`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input double-precision matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} SA - output matrix receiving single-precision rounded values
* @param {PositiveInteger} LDSA - leading dimension of `SA`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max(1,M)` (column-major) or `max(1,N)` (row-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max(1,M)` (column-major) or `max(1,N)` (row-major)
* @returns {integer} status code (`0` on success, `1` if any element exceeds single precision range)
*/
function dlag2s( order, M, N, A, LDA, SA, LDSA ) {
	let sa1, sa2, ss1, ss2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' ) {
		if ( LDA < max( 1, M ) ) {
			throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
		}
		if ( LDSA < max( 1, M ) ) {
			throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDSA ) );
		}
		sa1 = 1;
		sa2 = LDA;
		ss1 = 1;
		ss2 = LDSA;
	} else {
		if ( LDA < max( 1, N ) ) {
			throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
		}
		if ( LDSA < max( 1, N ) ) {
			throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDSA ) );
		}
		sa1 = LDA;
		sa2 = 1;
		ss1 = LDSA;
		ss2 = 1;
	}
	return base( M, N, A, sa1, sa2, 0, SA, ss1, ss2, 0 );
}


// EXPORTS //

export default dlag2s;
