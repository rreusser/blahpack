
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a contribution to the reciprocal Dif-estimate using the LU factorization computed by zgetc2.
*
* @param {integer} ijob - method flag: 2 uses zgecon approximation; otherwise local look-ahead
* @param {NonNegativeInteger} N - order of the matrix Z
* @param {Complex128Array} Z - LU-factored N-by-N matrix from zgetc2
* @param {integer} strideZ1 - stride of the first dimension of `Z` (in complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (in complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (in complex elements)
* @param {Complex128Array} RHS - right-hand side vector (overwritten with solution)
* @param {integer} strideRHS - stride for `RHS` (in complex elements)
* @param {NonNegativeInteger} offsetRHS - starting index for `RHS` (in complex elements)
* @param {number} rdsum - input sum of squares contribution
* @param {number} rdscal - input scaling factor
* @param {Int32Array} IPIV - row pivot indices from zgetc2, 0-based
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Int32Array} JPIV - column pivot indices from zgetc2, 0-based
* @param {integer} strideJPIV - stride for `JPIV`
* @param {NonNegativeInteger} offsetJPIV - starting index for `JPIV`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} object with `rdsum` and `rdscal` properties
*/
function zlatdf( ijob, N, Z, strideZ1, strideZ2, offsetZ, RHS, strideRHS, offsetRHS, rdsum, rdscal, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( ijob, N, Z, strideZ1, strideZ2, offsetZ, RHS, strideRHS, offsetRHS, rdsum, rdscal, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlatdf;
