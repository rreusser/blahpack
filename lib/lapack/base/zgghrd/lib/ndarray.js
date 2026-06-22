/**
 * Reduce a pair of complex matrices (A, B) to generalized upper Hessenberg.
 * form using unitary `transformations: Q^H*A*Z = H`, `Q^H*B*Z = T`,
 * where H is upper Hessenberg, T is upper triangular, and Q and Z are
 * unitary.
 *
 * A, B, Q, Z are Complex128Arrays. Strides and offsets are in complex elements.
 *
 *
 * @param {string} compq - `'none'`, `'initialize'`, or `'update'`
 * @param {string} compz - `'none'`, `'initialize'`, or `'update'`
 * @param {NonNegativeInteger} N - order of the matrices A and B
 * @param {integer} ilo - ilo (1-based)
 * @param {integer} ihi - ihi (1-based)
 * @param {Complex128Array} A - input/output matrix A
 * @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
 * @param {Complex128Array} B - input/output matrix B
 * @param {integer} strideB1 - stride of the first dimension of `B` (complex elements)
 * @param {integer} strideB2 - stride of the second dimension of `B` (complex elements)
 * @param {NonNegativeInteger} offsetB - starting index for `B` (complex elements)
 * @param {Complex128Array} Q - input/output matrix Q
 * @param {integer} strideQ1 - stride of the first dimension of `Q` (complex elements)
 * @param {integer} strideQ2 - stride of the second dimension of `Q` (complex elements)
 * @param {NonNegativeInteger} offsetQ - starting index for `Q` (complex elements)
 * @param {Complex128Array} Z - input/output matrix Z
 * @param {integer} strideZ1 - stride of the first dimension of `Z` (complex elements)
 * @param {integer} strideZ2 - stride of the second dimension of `Z` (complex elements)
 * @param {NonNegativeInteger} offsetZ - starting index for `Z` (complex elements)
 * @returns {integer} status code (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduce a pair of complex matrices (A, B) to generalized upper Hessenberg.
*
* @param {string} compq - `'none'`, `'initialize'`, or `'update'`
* @param {string} compz - `'none'`, `'initialize'`, or `'update'`
* @param {NonNegativeInteger} N - order of the matrices A and B
* @param {integer} ilo - ilo (1-based)
* @param {integer} ihi - ihi (1-based)
* @param {Complex128Array} A - input/output matrix A
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} B - input/output matrix B
* @param {integer} strideB1 - stride of the first dimension of `B` (complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (complex elements)
* @param {Complex128Array} Q - input/output matrix Q
* @param {integer} strideQ1 - stride of the first dimension of `Q` (complex elements)
* @param {integer} strideQ2 - stride of the second dimension of `Q` (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for `Q` (complex elements)
* @param {Complex128Array} Z - input/output matrix Z
* @param {integer} strideZ1 - stride of the first dimension of `Z` (complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (complex elements)
* @throws {TypeError} first argument must be a valid `compq` value
* @throws {TypeError} second argument must be a valid `compz` value
* @returns {integer} status code (0 = success)
*/
function zgghrd( compq, compz, N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ ) {
	if ( compq !== 'none' && compq !== 'update' && compq !== 'initialize' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `compq` value. Value: `%s`.', compq ) );
	}
	if ( compz !== 'none' && compz !== 'update' && compz !== 'initialize' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `compz` value. Value: `%s`.', compz ) );
	}
	return base( compq, compz, N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ );
}


// EXPORTS //

export default zgghrd;
