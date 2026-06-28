
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
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return;
	}
	return base(N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zgehrd;
