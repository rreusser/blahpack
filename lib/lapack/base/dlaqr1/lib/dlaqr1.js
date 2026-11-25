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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Sets a scalar multiple of the first column of the product.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - order of the matrix H.
* @param {Float64Array} H - the 2-by-2 or 3-by-3 matrix H in (*).
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {number} sr1 - the shifts in (*).
* @param {number} si1 - the shifts in (*).
* @param {number} sr2 - the shifts in (*).
* @param {number} si2 - the shifts in (*).
* @param {Float64Array} v - a scalar multiple of the first column of the matrix K in (*).
* @param {integer} strideV - stride length for `v`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} fourth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {Float64Array} `v`
*/
function dlaqr1( order, N, H, LDH, sr1, si1, sr2, si2, v, strideV ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	const ov = stride2offset( N, strideV );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	return base( N, H, sh1, sh2, 0, sr1, si1, sr2, si2, v, strideV, ov );
}


// EXPORTS //

export default dlaqr1;
