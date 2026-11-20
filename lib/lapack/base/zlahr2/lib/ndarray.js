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
* Reduces the first nb columns of a complex general rectangular matrix to upper trapezoidal form.
*
* @param {NonNegativeInteger} N - number of rows
* @param {NonNegativeInteger} K - offset for the reduction
* @param {NonNegativeInteger} nb - number of columns to reduce
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {NonNegativeInteger} offsetA - offset into A
* @param {Complex128Array} tau - output array of scalar factors
* @param {integer} strideTAU - stride of tau
* @param {NonNegativeInteger} offsetTAU - offset into tau
* @param {Complex128Array} T - output upper triangular factor
* @param {integer} strideT1 - first stride of T
* @param {integer} strideT2 - second stride of T
* @param {NonNegativeInteger} offsetT - offset into T
* @param {Complex128Array} Y - output matrix
* @param {integer} strideY1 - first stride of Y
* @param {integer} strideY2 - second stride of Y
* @param {NonNegativeInteger} offsetY - offset into Y
* @returns {Complex128Array}
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
		return Y;
	}
	return base( N, K, nb, A, strideA1, strideA2, offsetA, tau, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT, Y, strideY1, strideY2, offsetY );
}


// EXPORTS //

export default zlahr2;
