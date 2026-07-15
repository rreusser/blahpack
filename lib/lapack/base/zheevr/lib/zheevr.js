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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} jobz - jobz
* @param {string} range - range
* @param {string} uplo - uplo
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {number} vl - vl
* @param {number} vu - vu
* @param {integer} il - il
* @param {integer} iu - iu
* @param {number} abstol - abstol
* @param {Object} out - out
* @param {Float64Array} w - w
* @param {integer} strideW - strideW
* @param {Complex128Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Int32Array} ISUPPZ - ISUPPZ
* @param {integer} strideISUPPZ - strideISUPPZ
* @param {(Complex128Array|null)} WORK - complex workspace of at least `max(1,2*N)` elements, or `null` to allocate internally
* @param {integer} strideWork - strideWork
* @param {(Float64Array|null)} RWORK - real workspace of at least `max(1,24*N)` elements, or `null` to allocate internally
* @param {integer} strideRWork - strideRWork
* @param {(Int32Array|null)} IWORK - integer workspace of at least `max(1,10*N)` elements, or `null` to allocate internally
* @param {integer} strideIWork - strideIWork
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zheevr( jobz, range, uplo, N, A, LDA, vl, vu, il, iu, abstol, out, w, strideW, Z, LDZ, ISUPPZ, strideISUPPZ, WORK, strideWork, RWORK, strideRWork, IWORK, strideIWork ) { // eslint-disable-line max-len, max-params
	var oisuppz;
	var oiwork;
	var orwork;
	var owork;
	var sa1;
	var sa2;
	var sz1;
	var sz2;
	var ow;

	sa1 = 1;
	sa2 = LDA;
	sz1 = 1;
	sz2 = LDZ;
	ow = stride2offset( N, strideW );
	oisuppz = stride2offset( N, strideISUPPZ );

	// The wrapper is the single sanctioned allocation site (base/ndarray never
	// allocate): allocate a complex WORK, a real RWORK, and an integer IWORK
	// when the caller passes `null`.
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( Math.max( 1, 2 * N ) );
		strideWork = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( Math.max( 1, 24 * N ) );
		strideRWork = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		IWORK = new Int32Array( Math.max( 1, 10 * N ) );
		strideIWork = 1;
	}
	owork = stride2offset( N, strideWork );
	orwork = stride2offset( N, strideRWork );
	oiwork = stride2offset( N, strideIWork );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `jobz` value. Value: `%s`.', jobz ) );
	}
	if ( range !== 'all' && range !== 'value' && range !== 'index' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `range` value. Value: `%s`.', range ) );
	}
	return base( jobz, range, uplo, N, A, sa1, sa2, 0, vl, vu, il, iu, abstol, out, w, strideW, ow, Z, sz1, sz2, 0, ISUPPZ, strideISUPPZ, oisuppz, WORK, strideWork, owork, RWORK, strideRWork, orwork, IWORK, strideIWork, oiwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zheevr;
