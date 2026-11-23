/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs aggressive early deflation for the complex QR algorithm (recursive).
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {boolean} wantt - whether the full Schur form `T` is required
* @param {boolean} wantz - whether the matrix of Schur vectors `Z` is required
* @param {NonNegativeInteger} N - order of `H` and `Z`
* @param {integer} ktop - first index in the active block of `H`
* @param {NonNegativeInteger} kbot - last index in the active block of `H`
* @param {NonNegativeInteger} nw - deflation window size
* @param {Complex128Array} H - input matrix
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {integer} iloz - first row of `Z` to which transformations are applied
* @param {integer} ihiz - last row of `Z` to which transformations are applied
* @param {Complex128Array} Z - input matrix
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Int32Array} ns - input/output (length-1 array): number of unconverged eigenvalues
* @param {Int32Array} nd - input/output (length-1 array): number of deflated eigenvalues
* @param {Complex128Array} SH - approximate eigenvalues
* @param {integer} strideSH - stride length for `SH`
* @param {Complex128Array} V - workspace matrix
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {integer} nh - number of columns of `T` and `WV`
* @param {Complex128Array} T - workspace matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {integer} nv - number of rows of `WV`
* @param {Complex128Array} WV - workspace matrix
* @param {PositiveInteger} LDWV - leading dimension of `WV`
* @param {(Complex128Array|null)} WORK - workspace array (length `>= max(1, 2*nw)`); `null` requests internal allocation
* @throws {TypeError} first argument must be a valid order
* @returns {Complex128Array} `WV`
*/
function zlaqr3( order, wantt, wantz, N, ktop, kbot, nw, H, LDH, iloz, ihiz, Z, LDZ, ns, nd, SH, strideSH, V, LDV, nh, T, LDT, nv, WV, LDWV, WORK ) {

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const sv1 = ( order === 'column-major' ) ? 1 : LDV;
	const sv2 = ( order === 'column-major' ) ? LDV : 1;
	const st1 = ( order === 'column-major' ) ? 1 : LDT;
	const st2 = ( order === 'column-major' ) ? LDT : 1;
	const swv1 = ( order === 'column-major' ) ? 1 : LDWV;
	const swv2 = ( order === 'column-major' ) ? LDWV : 1;
	const osh = stride2offset( kbot, strideSH );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2*nw ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'column-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'row-major' && LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( order === 'column-major' && LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( order === 'row-major' && LDV < max( 1, nw ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument must be greater than or equal to max(1,nw). Value: `%d`.', LDV ) );
	}
	if ( order === 'column-major' && LDV < max( 1, nw ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument must be greater than or equal to max(1,nw). Value: `%d`.', LDV ) );
	}
	if ( order === 'row-major' && LDT < max( 1, nw ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-second argument must be greater than or equal to max(1,nw). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' && LDT < max( 1, nw ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-second argument must be greater than or equal to max(1,nw). Value: `%d`.', LDT ) );
	}
	if ( order === 'row-major' && LDWV < max( 1, nw ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fifth argument must be greater than or equal to max(1,nw). Value: `%d`.', LDWV ) );
	}
	if ( order === 'column-major' && LDWV < max( 1, nw ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fifth argument must be greater than or equal to max(1,nw). Value: `%d`.', LDWV ) );
	}
	return base( wantt, wantz, N, ktop, kbot, nw, H, sh1, sh2, 0, iloz, ihiz, Z, sz1, sz2, 0, ns, nd, SH, strideSH, osh, V, sv1, sv2, 0, nh, T, st1, st2, 0, nv, WV, swv1, swv2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zlaqr3;
