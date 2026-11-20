/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Copies a triangular matrix from Rectangular Full Packed (RFP) format to standard packed format (TP).
*
* @param {string} transr - specifies whether `ARF` is in normal or transposed format (`'no-transpose'` or `'transpose'`)
* @param {string} uplo - specifies whether the matrix is upper or lower triangular (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} ARF - input array in RFP format
* @param {integer} strideARF - stride length for `ARF`
* @param {Float64Array} AP - output array in standard packed format
* @param {integer} strideAP - stride length for `AP`
* @throws {TypeError} first argument must be one of the following: "no-transpose", "transpose"
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} status code (0 = success)
*/
function dtfttp( transr, uplo, N, ARF, strideARF, AP, strideAP ) {
	if ( transr !== 'no-transpose' && transr !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', transr ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const oarf = stride2offset( N * ( N + 1 ) / 2, strideARF );
	const oap = stride2offset( N * ( N + 1 ) / 2, strideAP );
	return base( transr, uplo, N, ARF, strideARF, oarf, AP, strideAP, oap );
}


// EXPORTS //

export default dtfttp;
