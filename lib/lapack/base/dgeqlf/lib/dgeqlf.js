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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';
import ilaenv from '../../ilaenv/lib/base.js';


// MAIN //

/**
* Computes a QL factorization of a real general matrix.
*
* If `WORK` is `null`, the optimal workspace, `max(1,N*NB)` elements (with
* `NB` from `ilaenv`), is allocated internally, which enables the blocked path; for batched usage,
* prefer passing a reusable caller-provided buffer.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride length for `TAU`
* @param {(Float64Array|null)} WORK - workspace of length at least `max(1,N)` (for optimal performance at least `N*NB`, which enables the blocked path), or `null` to allocate the optimal size
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {integer} status code (0 = success)
*/
function dgeqlf( order, M, N, A, LDA, TAU, strideTAU, WORK ) { // eslint-disable-line max-len, max-params
	let sa1, sa2;

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
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( max( 1, N * ilaenv( 1, 'DGEQLF', ' ', M, N, -1, -1 ) ) );
	}
	return base( M, N, A, sa1, sa2, 0, TAU, strideTAU, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dgeqlf;
