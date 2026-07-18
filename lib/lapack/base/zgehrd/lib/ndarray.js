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
* Reduces a complex general matrix to upper Hessenberg form using blocked algorithm.
*
* @param {integer} N - order of the matrix
* @param {integer} ilo - lower index of the balanced matrix
* @param {integer} ihi - upper index of the balanced matrix
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {integer} offsetA - offset into A
* @param {Complex128Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride of TAU
* @param {integer} offsetTAU - offset into TAU
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWork - stride of WORK
* @param {integer} offsetWork - offset into WORK
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info value
*/
function zgehrd( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let need, NB;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return;
	}
	// Caller owns the workspace; assert it is large enough so an under-sized (or
	// non-array) buffer is a loud RangeError, not a silent NaN from an
	// out-of-bounds read. base.js uses a fixed block size NB=32 with the T
	// factors stored at LDT=65 (NBMAX+1). The blocked path (NB < NH) needs the
	// N-by-NB panel (N*NB) plus the NB-column T block (LDT*NB); otherwise the
	// unblocked zgehd2 path needs only N. Sub-diagonal blocks (NH<=1) touch no
	// workspace.
	const NH = ihi - ilo + 1;
	if ( NH > 1 ) {
		NB = 32;
		need = ( NB < NH ) ? ( ( N * NB ) + ( 65 * NB ) ) : N;
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	return base(N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zgehrd;
