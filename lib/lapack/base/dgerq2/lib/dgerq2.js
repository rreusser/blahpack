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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the RQ factorization of a general rectangular matrix using an unblocked algorithm.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - the number of rows of the matrix A.
* @param {NonNegativeInteger} N - the number of columns of the matrix A.
* @param {Float64Array} A - on entry, the m by n matrix A. On exit, if m <= n, the upper triangle of the subarray A(1:m,n-m+1:n) contains the m by m upper triangular matrix R; if m >= n, the elements on and above the (m-n)-th subdiagonal contain the m by n upper trapezoidal matrix R; the remaining elements, with the array TAU, represent the orthogonal matrix Q as a product of elementary reflectors (see Further Details).
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAU - the scalar factors of the elementary reflectors (see Further Details).
* @param {integer} strideTAU - stride length for `TAU`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `M` elements
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {integer} info status code
*/
function dgerq2( order, M, N, A, LDA, TAU, strideTAU, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
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
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const otau = stride2offset( min( M, N ), strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, M );
		WORK = new Float64Array( minWork );
	}
	return base( M, N, A, sa1, sa2, 0, TAU, strideTAU, otau, WORK, 1, 0 );
}


// EXPORTS //

export default dgerq2;
