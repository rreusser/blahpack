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
import base from './base.js';


// MAIN //

/**
* Reduces a real M-by-N (M <= N) upper trapezoidal matrix `A` to upper triangular form via RZ factorization (blocked driver).
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {Float64Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAU - output array of scalar factors of the elementary reflectors (length `M`)
* @param {integer} strideTAU - stride length for `TAU`
* @param {(Float64Array|null)} WORK - workspace of length at least `max(1,M)` (`1` when `M = N`; for optimal performance at least `M*NB`, which enables the blocked path), or `null` to allocate the optimal size
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `N < M`)
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} `M` must be a nonnegative integer
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} `N` must be greater than or equal to `M`
* @throws {RangeError} `LDA` must satisfy the layout constraint
* @returns {integer} status code (0 = success)
*/
function dtzrzf( order, M, N, A, LDA, TAU, strideTAU, WORK ) {
	let sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < M ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `N < M`). Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	const ot = stride2offset( M, strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		// Allocate the optimal WORK (the reference's LWKOPT = M*NB), which enables the blocked path
		const NB = 32;
		WORK = new Float64Array( Math.max( 1, M * NB ) );
	}
	return base( M, N, A, sa1, sa2, 0, TAU, strideTAU, ot, WORK, 1, 0 );
}


// EXPORTS //

export default dtzrzf;
