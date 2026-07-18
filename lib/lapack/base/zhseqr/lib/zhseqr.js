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
* @param {string} job - job
* @param {string} compz - compz
* @param {NonNegativeInteger} N - N
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Complex128Array} H - H
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Complex128Array} w - w
* @param {integer} strideW - strideW
* @param {Complex128Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {(Complex128Array|null)} [WORK=null] - caller-provided workspace (minimum `max(1,N)` complex elements), or `null` to auto-allocate
* @param {integer} [strideWork=1] - stride for `WORK` (complex elements)
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zhseqr( job, compz, N, ilo, ihi, H, LDH, w, strideW, Z, LDZ, WORK, strideWork ) { // eslint-disable-line max-len, max-params

	const sh1 = 1;
	const sh2 = LDH;
	const sz1 = 1;
	const sz2 = LDZ;
	const ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		// Sole allocation site: max(1,N) complex elements is sufficient (the
		// reference notes LWORK >= max(1,N) delivers very good performance).
		WORK = new Complex128Array( max( 1, N ) );
		strideWork = 1;
	}
	const owork = stride2offset( WORK.length, strideWork );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( job !== 'schur' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `job` value. Value: `%s`.', job ) );
	}
	if ( compz !== 'initialize' && compz !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `compz` value. Value: `%s`.', compz ) );
	}
	return base( job, compz, N, ilo, ihi, H, sh1, sh2, 0, w, strideW, ow, Z, sz1, sz2, 0, WORK, strideWork, owork, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhseqr;
