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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a complex general matrix to upper Hessenberg form using blocked algorithm.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {integer} ilo - lower index of the balanced matrix
* @param {integer} ihi - upper index of the balanced matrix
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {NonNegativeInteger} offsetA - offset into A
* @param {Complex128Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride of TAU
* @param {NonNegativeInteger} offsetTAU - offset into TAU
* @param {Complex128Array} WORK - workspace array; length at least `max( 1, N )`. For optimum performance it should hold `N*NB + TSIZE` elements (TSIZE = 4160), which enables the blocked path
* @param {integer} strideWork - stride of WORK
* @param {NonNegativeInteger} offsetWork - offset into WORK
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`)
* @throws {RangeError} third argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`)
* @returns {integer} info value
*/
function zgehrd( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
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
	// (shrinking NB, or falling back to the unblocked zgehd2), as ZGEHRD does.
	need = max( 1, N );
	if ( !WORK || ( WORK.length - offsetWork ) < need ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base(N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zgehrd;
