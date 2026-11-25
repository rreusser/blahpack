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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Multiplies a real M-by-N matrix by the real scalar CTO/CFROM, doing the multiplication safely with respect to overflow and underflow via iterative scaling.
*
* @param {('general'|'lower'|'upper'|'upper-hessenberg'|'lower-band'|'upper-band'|'band')} type - one of `'general'`, `'lower'`, `'upper'`, `'upper-hessenberg'`, `'lower-band'`, `'upper-band'`, or `'band'`
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
* @throws {TypeError} first argument must be one of the following: "lower-band", "general", "upper-hessenberg", "lower", "upper-band", "upper", "band"
* @throws {RangeError} second argument is invalid (rejected when `( type === "general" ? 0 : ( type === "lower" ? 1 : ( type === "upper" ? 2 : ( type === "upper-hessenberg" ? 3 : ( type === "lower-band" ? 4 : ( type === "upper-band" ? 5 : 6 ) ) ) ) ) ) >= 4 && ( kl < 0 || kl > max( M - 1, 0 ) )`)
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @returns {integer} info status code (0 on success)
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlascl from '@rreusser/blahpack/lapack/base/dlascl';
*
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
*
* var info = dlascl.ndarray( 'general', 0, 0, 2.0, 1.0, 2, 2, A, 1, 2, 0 );
* // returns 0
* // A => <Float64Array>[ 0.5, 1.0, 1.5, 2.0 ]
*/
function dlascl( type, kl, ku, cfrom, cto, M, N, A, strideA1, strideA2, offsetA ) {
	if ( type !== 'lower-band' && type !== 'general' && type !== 'upper-hessenberg' && type !== 'lower' && type !== 'upper-band' && type !== 'upper' && type !== 'band' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "lower-band", "general", "upper-hessenberg", "lower", "upper-band", "upper", "band". Value: `%s`.', type ) );
	}
	if ( ( type === 'general' ? 0 : ( type === 'lower' ? 1 : ( type === 'upper' ? 2 : ( type === 'upper-hessenberg' ? 3 : ( type === 'lower-band' ? 4 : ( type === 'upper-band' ? 5 : 6 ) ) ) ) ) ) >= 4 && ( kl < 0 || kl > max( M - 1, 0 ) ) ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `( type === "general" ? 0 : ( type === "lower" ? 1 : ( type === "upper" ? 2 : ( type === "upper-hessenberg" ? 3 : ( type === "lower-band" ? 4 : ( type === "upper-band" ? 5 : 6 ) ) ) ) ) ) >= 4 && ( kl < 0 || kl > max( M - 1, 0 ) )`). Value: `%d`.', kl ) );
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
