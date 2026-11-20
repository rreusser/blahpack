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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs a single small-bulge multishift QR sweep on a complex upper Hessenberg matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {boolean} wantt - whether the full Schur form is being computed
* @param {boolean} wantz - whether the Schur vectors are being accumulated
* @param {integer} kacc22 - accumulation strategy (0, 1, or 2)
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ktop - first row/column of the active block (1-based)
* @param {integer} kbot - last row/column of the active block (1-based)
* @param {NonNegativeInteger} nshfts - number of simultaneous shifts (even)
* @param {Complex128Array} s - shifts (length `nshfts`)
* @param {integer} strideS - `s` stride length
* @param {Complex128Array} H - upper Hessenberg matrix; overwritten
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {integer} iloz - lower row index for accumulating Z (1-based)
* @param {NonNegativeInteger} ihiz - upper row index for accumulating Z (1-based)
* @param {Complex128Array} Z - Schur vectors; updated when `wantz` is true
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Complex128Array} V - workspace of bulge data (`3 x nshfts/2`)
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Complex128Array} U - accumulator workspace (`(2*nshfts+1) x (2*nshfts+1)`)
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {integer} nv - number of rows of the horizontal workspace `WV`
* @param {Complex128Array} WV - vertical workspace
* @param {PositiveInteger} LDWV - leading dimension of `WV`
* @param {NonNegativeInteger} nh - number of columns of the horizontal workspace `WH`
* @param {Complex128Array} WH - horizontal workspace
* @param {PositiveInteger} LDWH - leading dimension of `WH`
* @throws {TypeError} first argument must be a valid order
* @returns {Complex128Array}
*/
function zlaqr5( order, wantt, wantz, kacc22, N, ktop, kbot, nshfts, s, strideS, H, LDH, iloz, ihiz, Z, LDZ, V, LDV, U, LDU, nv, WV, LDWV, nh, WH, LDWH ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const sv1 = ( order === 'column-major' ) ? 1 : LDV;
	const sv2 = ( order === 'column-major' ) ? LDV : 1;
	const su1 = ( order === 'column-major' ) ? 1 : LDU;
	const su2 = ( order === 'column-major' ) ? LDU : 1;
	const swv1 = ( order === 'column-major' ) ? 1 : LDWV;
	const swv2 = ( order === 'column-major' ) ? LDWV : 1;
	const swh1 = ( order === 'column-major' ) ? 1 : LDWH;
	const swh2 = ( order === 'column-major' ) ? LDWH : 1;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'column-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'row-major' && LDZ < max( 1, ihiz ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,ihiz). Value: `%d`.', LDZ ) );
	}
	if ( order === 'column-major' && LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	const os = stride2offset( nshfts, strideS );
	return base( wantt, wantz, kacc22, N, ktop, kbot, nshfts, s, strideS, os, H, sh1, sh2, 0, iloz, ihiz, Z, sz1, sz2, 0, V, sv1, sv2, 0, U, su1, su2, 0, nv, WV, swv1, swv2, 0, nh, WH, swh1, swh2, 0 );
}


// EXPORTS //

export default zlaqr5;
