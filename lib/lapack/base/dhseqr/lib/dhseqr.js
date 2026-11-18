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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} job - job
* @param {string} compz - compz
* @param {NonNegativeInteger} N - N
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Float64Array} H - H
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Float64Array} WR - WR
* @param {integer} strideWR - strideWR
* @param {Float64Array} WI - WI
* @param {integer} strideWI - strideWI
* @param {Float64Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {(Float64Array|null)} [work=null] - caller-provided workspace, or `null` to auto-allocate
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dhseqr( order, job, compz, N, ilo, ihi, H, LDH, WR, strideWR, WI, strideWI, Z, LDZ, work ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const owr = stride2offset( N, strideWR );
	const owi = stride2offset( N, strideWI );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument violates the reference leading-dimension rule (rejected when `LDH.LT.MAX( 1, N )`). Value: `%d`.', LDH ) );
	}
	if ( LDZ < 1 || ( ( ( compz === 'initialize' ) || ( compz === 'update' ) ) && LDZ < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (rejected when `LDZ.LT.1 .OR. ( WANTZ .AND. LDZ.LT.MAX( 1, N ) )`). Value: `%d`.', LDZ ) );
	}
	if ( job !== 'eigenvalues' && job !== 'schur' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `job` value. Value: `%s`.', job ) );
	}
	if ( compz !== 'none' && compz !== 'initialize' && compz !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `compz` value. Value: `%s`.', compz ) );
	}
	if ( work === null || work === undefined ) {
		// Auto-allocate the minimum caller-owned workspace. `max(1,N)` is the
		// documented minimum LWORK for the dlaqr0 path and produces correct
		// results (a larger buffer only improves dlaqr0 performance). This
		// replaces the former `lwork = -1` workspace query, which no longer
		// exists under the caller-owns-WORK convention.
		work = new Float64Array( max( 1, N ) );
	}
	return base( job, compz, N, ilo, ihi, H, sh1, sh2, 0, WR, strideWR, owr, WI, strideWI, owi, Z, sz1, sz2, 0, work, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dhseqr;
