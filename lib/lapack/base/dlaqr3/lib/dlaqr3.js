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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {boolean} wantt - wantt
* @param {boolean} wantz - wantz
* @param {NonNegativeInteger} N - N
* @param {integer} ktop - ktop
* @param {integer} kbot - kbot
* @param {integer} nw - nw
* @param {Float64Array} H - H
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {integer} iloz - iloz
* @param {integer} ihiz - ihiz
* @param {Float64Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Float64Array} SR - SR
* @param {integer} strideSR - strideSR
* @param {Float64Array} SI - SI
* @param {integer} strideSI - strideSI
* @param {Float64Array} V - V
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {integer} nh - nh
* @param {Float64Array} T - T
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {integer} nv - nv
* @param {Float64Array} WV - WV
* @param {PositiveInteger} LDWV - leading dimension of `WV`
* @param {Float64Array} WORK - WORK
* @param {integer} strideWork - strideWork
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} { ns, nd }
*/
function dlaqr3( wantt, wantz, N, ktop, kbot, nw, H, LDH, iloz, ihiz, Z, LDZ, SR, strideSR, SI, strideSI, V, LDV, nh, T, LDT, nv, WV, LDWV, WORK, strideWork ) { // eslint-disable-line max-len, max-params

	const sh1 = 1;
	const sh2 = LDH;
	const sz1 = 1;
	const sz2 = LDZ;
	const sv1 = 1;
	const sv2 = LDV;
	const st1 = 1;
	const st2 = LDT;
	const swv1 = 1;
	const swv2 = LDWV;
	const osr = stride2offset( N, strideSR );
	const osi = stride2offset( N, strideSI );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, nw );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	const owork = stride2offset( N, strideWork );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( LDV < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDV ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
	}
	if ( LDWV < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fourth argument must be greater than or equal to max(1,N). Value: `%d`.', LDWV ) );
	}
	return base( wantt, wantz, N, ktop, kbot, nw, H, sh1, sh2, 0, iloz, ihiz, Z, sz1, sz2, 0, SR, strideSR, osr, SI, strideSI, osi, V, sv1, sv2, 0, nh, T, st1, st2, 0, nv, WV, swv1, swv2, 0, WORK, strideWork, owork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqr3;
