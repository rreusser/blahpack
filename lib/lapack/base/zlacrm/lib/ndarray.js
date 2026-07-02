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
* Multiplies a complex M-by-N matrix `A` by a real N-by-N matrix `B` and stores the result in a complex M-by-N matrix `C`.
*
* @param {NonNegativeInteger} M - number of rows of `A` and `C`
* @param {NonNegativeInteger} N - number of columns of `A`, `C`, and the order of `B`
* @param {Complex128Array} A - input complex matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Float64Array} B - input real matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} C - output complex matrix
* @param {integer} strideC1 - stride of the first dimension of `C` (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of `C` (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for `C` (in complex elements)
* @param {Float64Array} RWORK - real workspace of length at least `2*M*N`
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {Complex128Array} `C`
*/
function zlacrm( M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, RWORK, strideRWork, offsetRWork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return C;
	}
	return base( M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, RWORK, strideRWork, offsetRWork );
}


// EXPORTS //

export default zlacrm;
