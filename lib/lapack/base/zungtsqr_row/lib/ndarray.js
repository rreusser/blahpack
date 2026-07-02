/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates an `M`-by-`N` complex matrix `Q` with orthonormal columns from the output of `zlatsqr`.
*
* @param {NonNegativeInteger} M - number of rows of `A` (`M >= 0`)
* @param {NonNegativeInteger} N - number of columns of `A` (`M >= N >= 0`)
* @param {PositiveInteger} mb - row block size used by `zlatsqr` (`mb > N`)
* @param {PositiveInteger} nb - column block size used by `zlatsqr` (`nb >= 1`)
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} T - block reflector factors produced by `zlatsqr`
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer with `M >= N`
* @throws {RangeError} third argument must be a positive integer
* @throws {RangeError} fourth argument must satisfy `1 <= nb <= N` when `N > 0`
* @returns {integer} status code (`0` = success)
*/
function zungtsqr_row( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || M < N ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer satisfying `M >= N`. Value: `%d`.', N ) );
	}
	if ( mb < 1 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a positive integer. Value: `%d`.', mb ) );
	}
	if ( nb < 1 || ( nb > N && N > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must satisfy `1 <= nb <= N` when `N > 0`. Value: `%d`.', nb ) );
	}
	return base( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zungtsqr_row;
