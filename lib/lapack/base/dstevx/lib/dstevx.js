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
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobz - jobz
* @param {string} range - range
* @param {NonNegativeInteger} N - N
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Float64Array} e - e
* @param {integer} strideE - strideE
* @param {number} vl - vl
* @param {number} vu - vu
* @param {integer} il - il
* @param {integer} iu - iu
* @param {number} abstol - abstol
* @param {Int32Array} M - M
* @param {Float64Array} w - w
* @param {integer} strideW - strideW
* @param {Float64Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Float64Array} WORK - WORK
* @param {Int32Array} IWORK - IWORK
* @param {Int32Array} IFAIL - IFAIL
* @param {integer} strideIFAIL - strideIFAIL
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dstevx( order, jobz, range, N, d, strideD, e, strideE, vl, vu, il, iu, abstol, M, w, strideW, Z, LDZ, WORK, IWORK, IFAIL, strideIFAIL ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N, strideE );
	const ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 5 * N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, 5 * N );
		IWORK = new Int32Array( minIwork );
	}
	const oifail = stride2offset( N, strideIFAIL );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDZ < 1 || ( ( jobz === 'compute-vectors' ) && LDZ < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument violates the reference leading-dimension rule (column-major: rejected when `LDZ.LT.1 .OR. ( WANTZ .AND. LDZ.LT.N )`). Value: `%d`.', LDZ ) );
	}
	if ( order === 'row-major' && ( LDZ < 1 || ( ( jobz === 'compute-vectors' ) && LDZ < max( 1, ( range === 'index' ) ? iu - il + 1 : N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument violates the reference leading-dimension rule (row-major: must also cover the ( range === "index" ) ? iu - il + 1 : N columns). Value: `%d`.', LDZ ) );
	}
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobz` value. Value: `%s`.', jobz ) );
	}
	if ( range !== 'all' && range !== 'value' && range !== 'index' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `range` value. Value: `%s`.', range ) );
	}
	return base( jobz, range, N, d, strideD, od, e, strideE, oe, vl, vu, il, iu, abstol, M, w, strideW, ow, Z, sz1, sz2, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, strideIFAIL, oifail ); // eslint-disable-line max-len
}


// EXPORTS //

export default dstevx;
