
/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces the first nb columns of a complex general rectangular matrix to upper trapezoidal form.
*
* @param {integer} N - number of rows
* @param {integer} K - offset for the reduction
* @param {integer} nb - number of columns to reduce
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {integer} offsetA - offset into A
* @param {Complex128Array} tau - output array of scalar factors
* @param {integer} strideTAU - stride of tau
* @param {integer} offsetTAU - offset into tau
* @param {Complex128Array} T - output upper triangular factor
* @param {integer} strideT1 - first stride of T
* @param {integer} strideT2 - second stride of T
* @param {integer} offsetT - offset into T
* @param {Complex128Array} Y - output matrix
* @param {integer} strideY1 - first stride of Y
* @param {integer} strideY2 - second stride of Y
* @param {integer} offsetY - offset into Y
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function zlahr2( N, K, nb, A, strideA1, strideA2, offsetA, tau, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT, Y, strideY1, strideY2, offsetY ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( nb < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nb ) );
	}
	if ( N === 0 ) {
		return;
	}
	return base( N, K, nb, A, strideA1, strideA2, offsetA, tau, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT, Y, strideY1, strideY2, offsetY );
}


// EXPORTS //

export default zlahr2;
