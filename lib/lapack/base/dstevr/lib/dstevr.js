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
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
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
* @param {Int32Array} m - output (length-1 array): the total number of eigenvalues found
* @param {Float64Array} w - w
* @param {integer} strideW - strideW
* @param {Float64Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Int32Array} ISUPPZ - ISUPPZ
* @param {integer} strideISUPPZ - strideISUPPZ
* @param {(Float64Array|null)} WORK - WORK
* @param {(Int32Array|null)} IWORK - IWORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "all", "index", "value"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} tenth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`)
* @throws {RangeError} eleventh argument is invalid (rejected when `range !== "value" && range === "index" && ( il < 1 || il > max( 1, N ) )`)
* @throws {RangeError} twelfth argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`)
* @throws {RangeError} eighteenth argument is invalid (column-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`)
* @throws {RangeError} eighteenth argument is invalid (row-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < max( 1, range === "index" ? iu - il + 1 : N ) )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} status code (0 = success)
*/
function dstevr( order, jobz, range, N, d, strideD, e, strideE, vl, vu, il, iu, abstol, m, w, strideW, Z, LDZ, ISUPPZ, strideISUPPZ, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobz ) );
	}
	if ( range !== 'all' && range !== 'index' && range !== 'value' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "all", "index", "value". Value: `%s`.', range ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( range === 'value' && ( N > 0 && vu <= vl ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`). Value: `%s`.', vu ) );
	}
	if ( range !== 'value' && range === 'index' && ( il < 1 || il > max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument is invalid (rejected when `range !== "value" && range === "index" && ( il < 1 || il > max( 1, N ) )`). Value: `%d`.', il ) );
	}
	if ( range !== 'value' && range === 'index' && ( iu < min( N, il ) || iu > N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`). Value: `%d`.', iu ) );
	}
	if ( order === 'column-major' && ( LDZ < 1 || ( jobz === 'compute-vectors' && LDZ < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument is invalid (column-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`). Value: `%d`.', LDZ ) );
	}
	if ( order === 'row-major' && ( LDZ < 1 || ( jobz === 'compute-vectors' && LDZ < max( 1, range === 'index' ? iu - il + 1 : N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument is invalid (row-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < max( 1, range === "index" ? iu - il + 1 : N ) )`). Value: `%d`.', LDZ ) );
	}
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const od = stride2offset( N, strideD );
	const oe = stride2offset( max( 1, N - 1 ), strideE );
	const ow = stride2offset( N, strideW );
	const oisuppz = stride2offset( N, strideISUPPZ );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 20 * N);
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, 10 * N);
		IWORK = new Int32Array( minIwork );
	}
	return base( jobz, range, N, d, strideD, od, e, strideE, oe, vl, vu, il, iu, abstol, m, w, strideW, ow, Z, sz1, sz2, 0, ISUPPZ, strideISUPPZ, oisuppz, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dstevr;
