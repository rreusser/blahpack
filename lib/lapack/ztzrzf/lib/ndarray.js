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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a complex M-by-N (M <= N) upper trapezoidal matrix `A` to upper triangular form via unitary RZ factorization (blocked driver).
*
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A` (must satisfy `N >= M`)
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} TAU - output array of scalar factors of the elementary reflectors (length `M`)
* @param {integer} strideTAU - stride length for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @param {Complex128Array} WORK - workspace of length at least `max(1,M)` (`1` when `M = N`); for optimal performance at least `M*NB`, which enables the blocked path
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument is invalid (rejected when `N < M`)
* @throws {RangeError} `M` must be a nonnegative integer
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} `N` must be greater than or equal to `M`
* @returns {integer} status code (0 = success)
*/
function ztzrzf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < M ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `N < M`). Value: `%d`.', N ) );
	}
	if ( M > 0 ) {
		const minWork = ( M === N ) ? 1 : Math.max( 1, M );
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default ztzrzf;
