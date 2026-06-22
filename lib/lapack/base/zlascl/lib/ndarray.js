/**
 * Multiplies a complex matrix by a real scalar CTO/CFROM, handling overflow.
 * carefully via iterative scaling.
 *
 *
 * @param {string} type - `'general'`, `'lower'`, `'upper'`, `'upper-hessenberg'`, `'lower-band'`, `'upper-band'`, or `'band'`
 * @param {integer} kl - lower bandwidth (for banded types)
 * @param {integer} ku - upper bandwidth (for banded types)
 * @param {number} cfrom - scale denominator (must be nonzero)
 * @param {number} cto - scale numerator
 * @param {NonNegativeInteger} M - rows
 * @param {NonNegativeInteger} N - columns
 * @param {Complex128Array} A - complex matrix
 * @param {integer} strideA1 - first dimension stride (in complex elements)
 * @param {integer} strideA2 - second dimension stride (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @returns {integer} 0 on success
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Multiplies a complex matrix by a real scalar CTO/CFROM, handling overflow.
*
* @param {string} type - `'general'`, `'lower'`, `'upper'`, `'upper-hessenberg'`, `'lower-band'`, `'upper-band'`, or `'band'`
* @param {integer} kl - lower bandwidth (for banded types)
* @param {integer} ku - upper bandwidth (for banded types)
* @param {number} cfrom - scale denominator (must be nonzero)
* @param {number} cto - scale numerator
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Complex128Array} A - complex matrix
* @param {integer} strideA1 - first dimension stride (in complex elements)
* @param {integer} strideA2 - second dimension stride (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @throws {TypeError} first argument must be a valid matrix type
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @returns {integer} 0 on success
*/
function zlascl( type, kl, ku, cfrom, cto, M, N, A, strideA1, strideA2, offsetA ) {
	if ( type !== 'general' && type !== 'lower' && type !== 'upper' && type !== 'upper-hessenberg' && type !== 'lower-band' && type !== 'upper-band' && type !== 'band' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix type. Value: `%s`.', type ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( type, kl, ku, cfrom, cto, M, N, A, strideA1, strideA2, offsetA );
}


// EXPORTS //

export default zlascl;
