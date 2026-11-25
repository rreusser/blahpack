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
* Generates an M-by-N real matrix Q with orthonormal rows from elementary reflectors returned by DGERQF.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows of Q (0 <= M <= N)
* @param {NonNegativeInteger} N - number of columns of Q (N >= M)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= M)
* @param {Float64Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride length for `TAU`
* @param {(Float64Array|null)} WORK - workspace
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `N < M`)
* @throws {RangeError} fourth argument is invalid (rejected when `K < 0 || K > M`)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {integer} info status code
*/
function dorgrq( order, M, N, K, A, LDA, TAU, strideTAU, WORK ) {
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
	if ( K < 0 || K > M ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `K < 0 || K > M`). Value: `%d`.', K ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	const ot = stride2offset( K, strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		// Blocked path (NB = 32 in base.js, used when NB < K) needs the
		// reference IWS = LDWORK*NB workspace; otherwise LWORK >= max(1,M):
		const minWork = ( K > 32 ) ? M * 32 : max( 1, M );
		WORK = new Float64Array( minWork );
	}
	return base( M, N, K, A, sa1, sa2, 0, TAU, strideTAU, ot, WORK, 1, 0 );
}


// EXPORTS //

export default dorgrq;
