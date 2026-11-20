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
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {boolean} ltranl - ltranl
* @param {boolean} ltranr - ltranr
* @param {integer} isgn - isgn
* @param {NonNegativeInteger} n1 - n1
* @param {NonNegativeInteger} n2 - n2
* @param {Float64Array} TL - TL
* @param {PositiveInteger} LDTL - leading dimension of `TL`
* @param {Float64Array} TR - TR
* @param {PositiveInteger} LDTR - leading dimension of `TR`
* @param {Float64Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} scale - scale
* @param {Float64Array} X - X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} xnorm - xnorm
* @throws {TypeError} first argument must be a valid order
* @returns {integer} info status code
*/
function dlasy2( order, ltranl, ltranr, isgn, n1, n2, TL, LDTL, TR, LDTR, B, LDB, scale, X, LDX, xnorm ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const stl1 = ( order === 'column-major' ) ? 1 : LDTL;
	const stl2 = ( order === 'column-major' ) ? LDTL : 1;
	const str1 = ( order === 'column-major' ) ? 1 : LDTR;
	const str2 = ( order === 'column-major' ) ? LDTR : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	return base( ltranl, ltranr, isgn, n1, n2, TL, stl1, stl2, 0, TR, str1, str2, 0, B, sb1, sb2, 0, scale, X, sx1, sx2, 0, xnorm ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlasy2;
