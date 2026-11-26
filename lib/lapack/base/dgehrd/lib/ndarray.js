/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
 * Reduces a real general matrix to upper Hessenberg form using blocked algorithm.
 *
 *
 * @param {integer} N - order of the matrix
 * @param {integer} ilo - lower index of the balanced matrix
 * @param {integer} ihi - upper index of the balanced matrix
 * @param {Float64Array} A - input/output matrix
 * @param {integer} strideA1 - first stride of A
 * @param {integer} strideA2 - second stride of A
 * @param {integer} offsetA - offset into A
 * @param {Float64Array} TAU - output array of scalar factors
 * @param {integer} strideTAU - stride of TAU
 * @param {integer} offsetTAU - offset into TAU
 * @param {Float64Array} WORK - workspace array; length at least `max( 1, N )` (`N*NB + 4160` enables the blocked path)
 * @param {integer} strideWork - stride of WORK
 * @param {integer} offsetWork - offset into WORK
 * @returns {integer} info value
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduce a general matrix to upper Hessenberg form (blocked).
*
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ilo - it is assumed that A is already upper triangular in rows and columns 1:ILO-1 and IHI+1:N.
* @param {integer} ihi - it is assumed that A is already upper triangular in rows and columns 1:ILO-1 and IHI+1:N.
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} TAU - input array
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} WORK - workspace array; length at least `max( 1, N )`. For optimum performance it should hold `N*NB + TSIZE` elements (TSIZE = 4160), which enables the blocked path
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`)
* @throws {RangeError} third argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`)
* @returns {integer} status code (0 = success)
*/
function dgehrd( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let need;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ilo < 1 || ilo > max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`). Value: `%d`.', ilo ) );
	}
	if ( ihi < min( ilo, N ) || ihi > N ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`). Value: `%d`.', ihi ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	// Caller owns the workspace; assert it holds the reference's minimum
	// max( 1, N ). base.js sizes its block from the length it is given
	// (shrinking NB, or falling back to the unblocked dgehd2), as DGEHRD does.
	need = max( 1, N );
	if ( !WORK || ( WORK.length - offsetWork ) < need ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base(N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dgehrd;
