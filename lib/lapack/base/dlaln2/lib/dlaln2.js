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
* @param {boolean} ltrans - ltrans
* @param {integer} na - na
* @param {integer} nw - nw
* @param {number} smin - smin
* @param {number} ca - ca
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {number} d1 - d1
* @param {number} d2 - d2
* @param {Float64Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {number} wr - wr
* @param {number} wi - wi
* @param {Float64Array} X - X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @throws {TypeError} first argument must be a valid order
* @returns {Object} result with properties: info (0=exact, 1=perturbed), scale, xnorm
*/
function dlaln2( order, ltrans, na, nw, smin, ca, A, LDA, d1, d2, B, LDB, wr, wi, X, LDX ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	return base( ltrans, na, nw, smin, ca, A, sa1, sa2, 0, d1, d2, B, sb1, sb2, 0, wr, wi, X, sx1, sx2, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaln2;
