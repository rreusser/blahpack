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
* Multiplies a real M-by-N matrix by the real scalar CTO/CFROM, doing the multiplication safely with respect to overflow and underflow via iterative scaling.
*
* @param {string} type - one of `'general'`, `'lower'`, `'upper'`, `'upper-hessenberg'`, `'lower-band'`, `'upper-band'`, or `'band'`
* @param {integer} kl - lower bandwidth (for banded types)
* @param {integer} ku - upper bandwidth (for banded types)
* @param {number} cfrom - scale denominator (must be nonzero)
* @param {number} cto - scale numerator
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Float64Array} A - matrix
* @param {integer} strideA1 - first dimension stride
* @param {integer} strideA2 - second dimension stride
* @param {NonNegativeInteger} offsetA - starting index for A
* @throws {TypeError} first argument must be a valid matrix type
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @returns {integer} info status code (0 on success)
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
*
* var info = dlascl( 'general', 0, 0, 2.0, 1.0, 2, 2, A, 1, 2, 0 );
* // returns 0
* // A => <Float64Array>[ 0.5, 1.0, 1.5, 2.0 ]
*/
function dlascl( type, kl, ku, cfrom, cto, M, N, A, strideA1, strideA2, offsetA ) {
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

export default dlascl;
