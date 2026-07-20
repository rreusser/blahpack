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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues and (optionally) the Schur factorization of a complex upper Hessenberg matrix using the multishift QR algorithm.
*
* @param {boolean} wantt - whether the full Schur form T is required
* @param {boolean} wantz - whether the Schur vectors Z are required
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ilo - lower index of the active submatrix (1-based)
* @param {integer} ihi - upper index of the active submatrix (1-based)
* @param {Complex128Array} H - upper Hessenberg matrix; overwritten
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Complex128Array} w - output eigenvalues (length `N`)
* @param {integer} strideW - `w` stride length
* @param {integer} iloz - lower row index for accumulating Z (1-based)
* @param {integer} ihiz - upper row index for accumulating Z (1-based)
* @param {Complex128Array} Z - Schur vectors; updated when `wantz` is true
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {(Complex128Array|null)} WORK - workspace (>= `N` complex elements); auto-allocated when `null`
* @param {integer} strideWork - `WORK` stride length
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zlaqr0( wantt, wantz, N, ilo, ihi, H, LDH, w, strideW, iloz, ihiz, Z, LDZ, WORK, strideWork ) {
	const sh1 = 1;
	const sh2 = LDH;
	const sz1 = 1;
	const sz2 = LDZ;

	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, N ) );
		strideWork = 1;
	}
	const ow = stride2offset( N, strideW );
	const owork = stride2offset( N, strideWork );
	return base( wantt, wantz, N, ilo, ihi, H, sh1, sh2, 0, w, strideW, ow, iloz, ihiz, Z, sz1, sz2, 0, WORK, strideWork, owork );
}


// EXPORTS //

export default zlaqr0;
