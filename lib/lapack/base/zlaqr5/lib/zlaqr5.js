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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs a single small-bulge multishift QR sweep on a complex upper Hessenberg matrix.
*
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
* @param {integer} ihiz - upper row index for accumulating Z (1-based)
* @param {Complex128Array} Z - Schur vectors; updated when `wantz` is true
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Complex128Array} V - workspace of bulge data (`3 x nshfts/2`)
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Complex128Array} U - accumulator workspace (`(2*nshfts+1) x (2*nshfts+1)`)
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {NonNegativeInteger} nv - number of rows of the horizontal workspace `WV`
* @param {Complex128Array} WV - vertical workspace
* @param {PositiveInteger} LDWV - leading dimension of `WV`
* @param {NonNegativeInteger} nh - number of columns of the horizontal workspace `WH`
* @param {Complex128Array} WH - horizontal workspace
* @param {PositiveInteger} LDWH - leading dimension of `WH`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function zlaqr5( wantt, wantz, kacc22, N, ktop, kbot, nshfts, s, strideS, H, LDH, iloz, ihiz, Z, LDZ, V, LDV, U, LDU, nv, WV, LDWV, nh, WH, LDWH ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	const os = stride2offset( nshfts, strideS );
	return base( wantt, wantz, kacc22, N, ktop, kbot, nshfts, s, strideS, os, H, 1, LDH, 0, iloz, ihiz, Z, 1, LDZ, 0, V, 1, LDV, 0, U, 1, LDU, 0, nv, WV, 1, LDWV, 0, nh, WH, 1, LDWH, 0 );
}


// EXPORTS //

export default zlaqr5;
