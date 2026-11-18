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
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {boolean} wantt - wantt
* @param {boolean} wantz - wantz
* @param {NonNegativeInteger} N - N
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Float64Array} H - H
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Float64Array} WR - WR
* @param {integer} strideWR - strideWR
* @param {Float64Array} WI - WI
* @param {integer} strideWI - strideWI
* @param {integer} iloz - iloz
* @param {integer} ihiz - ihiz
* @param {Float64Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Float64Array} WORK - WORK
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dlaqr0( order, wantt, wantz, N, ilo, ihi, H, LDH, WR, strideWR, WI, strideWI, iloz, ihiz, Z, LDZ, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const owr = stride2offset( N, strideWR );
	const owi = stride2offset( N, strideWI );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'column-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'row-major' && LDZ < max( 1, ihi ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,ihi). Value: `%d`.', LDZ ) );
	}
	if ( order === 'column-major' && LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	return base( wantt, wantz, N, ilo, ihi, H, sh1, sh2, 0, WR, strideWR, owr, WI, strideWI, owi, iloz, ihiz, Z, sz1, sz2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqr0;
