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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues and (optionally) the Schur factorization of a complex upper Hessenberg matrix using the multishift QR algorithm.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {boolean} wantt - whether the full Schur form T is required
* @param {boolean} wantz - whether the Schur vectors Z are required
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ilo - lower index of the active submatrix (1-based)
* @param {NonNegativeInteger} ihi - upper index of the active submatrix (1-based)
* @param {Complex128Array} H - upper Hessenberg matrix; overwritten
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Complex128Array} w - output eigenvalues (length `N`)
* @param {integer} strideW - `w` stride length
* @param {integer} iloz - lower row index for accumulating Z (1-based)
* @param {integer} ihiz - upper row index for accumulating Z (1-based)
* @param {Complex128Array} Z - Schur vectors; updated when `wantz` is true
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {(Complex128Array|null)} WORK - workspace (>= `N` complex elements); auto-allocated when `null`
* @throws {TypeError} first argument must be a valid order
* @returns {integer} info status code
*/
function zlaqr4( order, wantt, wantz, N, ilo, ihi, H, LDH, w, strideW, iloz, ihiz, Z, LDZ, WORK ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;

	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'column-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		// See ndarray.js: zlaqr2's blocked zgehrd/zunmhr need `33*JW + 2080` once the window `JW > 32`.
		const jwmax = Math.min( Math.floor( ( N - 1 ) / 3 ), ( ihi - ilo ) + 1 );
		WORK = new Complex128Array( max( max( 1, N ), ( jwmax > 32 ) ? ( 33 * jwmax ) + 2080 : 0 ) );
	}
	const ow = stride2offset( N, strideW );
	return base( wantt, wantz, N, ilo, ihi, H, sh1, sh2, 0, w, strideW, ow, iloz, ihiz, Z, sz1, sz2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zlaqr4;
