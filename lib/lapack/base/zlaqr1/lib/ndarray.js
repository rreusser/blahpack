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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Sets a scalar multiple of the first column of the product of 2-by-2 or.
* 3-by-3 matrix (H - s1_I)_(H - s2*I), scaling to avoid overflows and
* most underflows.
*
* This is used to determine the initial shift vector in the QR algorithm.
* H is an upper Hessenberg matrix, and s1, s2 are complex shifts.
*
* @param {NonNegativeInteger} N - order of the matrix H (must be 2 or 3)
* @param {Complex128Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H` (complex elements)
* @param {integer} strideH2 - stride of the second dimension of `H` (complex elements)
* @param {NonNegativeInteger} offsetH - starting index for `H` (complex elements)
* @param {Complex128} s1 - first shift
* @param {Complex128} s2 - second shift
* @param {Complex128Array} v - output array of length N
* @param {integer} strideV - stride length for `v` (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for `v` (complex elements)
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function zlaqr1( N, H, strideH1, strideH2, offsetH, s1, s2, v, strideV, offsetV ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, H, strideH1, strideH2, offsetH, s1, s2, v, strideV, offsetV ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaqr1;
