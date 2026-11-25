/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates all or part of the unitary matrix Q from a QL factorization determined by cgeqlf (unblocked algorithm).
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - the number of rows of the matrix Q.
* @param {NonNegativeInteger} N - the number of columns of the matrix Q.
* @param {NonNegativeInteger} K - the number of elementary reflectors whose product defines the matrix Q.
* @param {Complex128Array} A - on entry, the (n-k+i)-th column must contain the vector which defines the elementary reflector H(i), for i = 1,2,...,k, as returned by ZGEQLF in the last k columns of its array argument A. On exit, the m-by-n matrix Q.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAU - tAU(i) must contain the scalar factor of the elementary reflector H(i), as returned by ZGEQLF.
* @param {integer} strideTAU - stride length for `TAU`
* @param {(Complex128Array|null)} WORK - caller-provided workspace of at least `N` elements
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `N < 0 || N > M`)
* @throws {RangeError} fourth argument is invalid (rejected when `K < 0 || K > N`)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {integer} info status code
*/
function zung2l( order, M, N, K, A, LDA, TAU, strideTAU, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || N > M ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `N < 0 || N > M`). Value: `%d`.', N ) );
	}
	if ( K < 0 || K > N ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `K < 0 || K > N`). Value: `%d`.', K ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const otau = stride2offset( N, strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N );
		WORK = new Complex128Array( minWork );
	}
	return base( M, N, K, A, sa1, sa2, 0, TAU, strideTAU, otau, WORK, 1, 0 );
}


// EXPORTS //

export default zung2l;
