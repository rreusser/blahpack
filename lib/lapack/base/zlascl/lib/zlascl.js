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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Multiplies a complex matrix by a real scalar CTO/CFROM, handling overflow.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('general'|'lower'|'upper'|'upper-hessenberg'|'lower-band'|'upper-band'|'band')} type - `'general'`, `'lower'`, `'upper'`, `'upper-hessenberg'`, `'lower-band'`, `'upper-band'`, or `'band'`
* @param {integer} kl - lower bandwidth (for banded types)
* @param {integer} ku - upper bandwidth (for banded types)
* @param {number} cfrom - scale denominator (must be nonzero)
* @param {number} cto - scale numerator
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "lower-band", "general", "upper-hessenberg", "lower", "upper-band", "upper", "band"
* @throws {RangeError} third argument is invalid (rejected when `( type === "general" ? 0 : ( type === "lower" ? 1 : ( type === "upper" ? 2 : ( type === "upper-hessenberg" ? 3 : ( type === "lower-band" ? 4 : ( type === "upper-band" ? 5 : ( type === "band" ? 6 : - 1 ) ) ) ) ) ) ) >= 4 && ( kl < 0 || kl > max( M - 1, 0 ) )`)
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} tenth argument is invalid (column-major: rejected when `( type === "general" ? 0 : ( type === "lower" ? 1 : ( type === "upper" ? 2 : ( type === "upper-hessenberg" ? 3 : ( type === "lower-band" ? 4 : ( type === "upper-band" ? 5 : ( type === "band" ? 6 : - 1 ) ) ) ) ) ) ) <= 3 && LDA < max( 1, M )`)
* @throws {RangeError} tenth argument is invalid (row-major: rejected when `( type === "general" ? 0 : ( type === "lower" ? 1 : ( type === "upper" ? 2 : ( type === "upper-hessenberg" ? 3 : ( type === "lower-band" ? 4 : ( type === "upper-band" ? 5 : ( type === "band" ? 6 : - 1 ) ) ) ) ) ) ) <= 3 && LDA < max( 1, N )`)
* @returns {integer} info status code
*/
function zlascl( order, type, kl, ku, cfrom, cto, M, N, A, LDA ) {
	let sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( type !== 'lower-band' && type !== 'general' && type !== 'upper-hessenberg' && type !== 'lower' && type !== 'upper-band' && type !== 'upper' && type !== 'band' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "lower-band", "general", "upper-hessenberg", "lower", "upper-band", "upper", "band". Value: `%s`.', type ) );
	}
	if ( ( type === 'general' ? 0 : ( type === 'lower' ? 1 : ( type === 'upper' ? 2 : ( type === 'upper-hessenberg' ? 3 : ( type === 'lower-band' ? 4 : ( type === 'upper-band' ? 5 : 6 ) ) ) ) ) ) >= 4 && ( kl < 0 || kl > max( M - 1, 0 ) ) ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `( type === "general" ? 0 : ( type === "lower" ? 1 : ( type === "upper" ? 2 : ( type === "upper-hessenberg" ? 3 : ( type === "lower-band" ? 4 : ( type === "upper-band" ? 5 : 6 ) ) ) ) ) ) >= 4 && ( kl < 0 || kl > max( M - 1, 0 ) )`). Value: `%d`.', kl ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( order === 'column-major' && ( ( type === 'general' ? 0 : ( type === 'lower' ? 1 : ( type === 'upper' ? 2 : ( type === 'upper-hessenberg' ? 3 : ( type === 'lower-band' ? 4 : ( type === 'upper-band' ? 5 : 6 ) ) ) ) ) ) <= 3 && LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (column-major: rejected when `( type === "general" ? 0 : ( type === "lower" ? 1 : ( type === "upper" ? 2 : ( type === "upper-hessenberg" ? 3 : ( type === "lower-band" ? 4 : ( type === "upper-band" ? 5 : 6 ) ) ) ) ) ) <= 3 && LDA < max( 1, M )`). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && ( ( type === 'general' ? 0 : ( type === 'lower' ? 1 : ( type === 'upper' ? 2 : ( type === 'upper-hessenberg' ? 3 : ( type === 'lower-band' ? 4 : ( type === 'upper-band' ? 5 : 6 ) ) ) ) ) ) <= 3 && LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (row-major: rejected when `( type === "general" ? 0 : ( type === "lower" ? 1 : ( type === "upper" ? 2 : ( type === "upper-hessenberg" ? 3 : ( type === "lower-band" ? 4 : ( type === "upper-band" ? 5 : 6 ) ) ) ) ) ) <= 3 && LDA < max( 1, N )`). Value: `%d`.', LDA ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	return base( type, kl, ku, cfrom, cto, M, N, A, sa1, sa2, 0 );
}


// EXPORTS //

export default zlascl;
