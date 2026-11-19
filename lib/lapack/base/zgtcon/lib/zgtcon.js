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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} norm - norm
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} DL - DL
* @param {integer} strideDL - strideDL
* @param {Complex128Array} d - d
* @param {integer} strideD - strideD
* @param {Complex128Array} DU - DU
* @param {integer} strideDU - strideDU
* @param {Complex128Array} DU2 - DU2
* @param {integer} strideDU2 - strideDU2
* @param {Int32Array} IPIV - IPIV
* @param {integer} strideIPIV - strideIPIV
* @param {number} anorm - anorm
* @param {Float64Array} rcond - rcond
* @param {(Complex128Array|null)} WORK - WORK
* @throws {TypeError} first argument must be one of the following: "inf-norm", "one-norm", "one-norm"
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} thirteenth argument is invalid (rejected when `anorm < 0`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function zgtcon( norm, N, DL, strideDL, d, strideD, DU, strideDU, DU2, strideDU2, IPIV, strideIPIV, anorm, rcond, WORK ) { // eslint-disable-line max-len, max-params

	if ( norm !== 'inf-norm' && norm !== 'one-norm' && norm !== 'one-norm' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "inf-norm", "one-norm", "one-norm". Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( anorm < 0 ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument is invalid (rejected when `anorm < 0`). Value: `%s`.', anorm ) );
	}
	const odl = stride2offset( N, strideDL );
	const od = stride2offset( N, strideD );
	const odu = stride2offset( N, strideDU );
	const odu2 = stride2offset( N, strideDU2 );
	const oipiv = stride2offset( N, strideIPIV );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	return base( norm, N, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, DU2, strideDU2, odu2, IPIV, strideIPIV, oipiv, anorm, rcond, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgtcon;
