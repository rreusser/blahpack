/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Sets a scalar multiple of the first column of the product `(H - s1*I)*(H - s2*I)` for a complex upper Hessenberg matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - order of the matrix H (2 or 3)
* @param {Complex128Array} H - upper Hessenberg matrix
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Complex128} s1 - first shift
* @param {Complex128} s2 - second shift
* @param {Complex128Array} v - output vector (length `N`)
* @param {integer} strideV - `v` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} fourth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {Complex128Array}
*/
function zlaqr1( order, N, H, LDH, s1, s2, v, strideV ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;

	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	const ov = stride2offset( N, strideV );
	return base( N, H, sh1, sh2, 0, s1, s2, v, strideV, ov );
}


// EXPORTS //

export default zlaqr1;
