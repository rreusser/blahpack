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
* @param {string} order - storage layout ('row-major' or 'column-major')
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
* @param {Int32Array} m - output (length-1 array): the total number of eigenvalues found
* @param {Float64Array} w - w
* @param {integer} strideW - strideW
* @param {Complex128Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Int32Array} ISUPPZ - ISUPPZ
* @param {integer} strideISUPPZ - strideISUPPZ
* @param {(Complex128Array|null)} WORK - complex workspace of at least `max(1,2*N)` elements, or `null` to allocate internally
* @param {(Float64Array|null)} RWORK - real workspace of at least `max(1,24*N)` elements, or `null` to allocate internally
* @param {(Int32Array|null)} IWORK - integer workspace of at least `max(1,10*N)` elements, or `null` to allocate internally
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zheevr( order, jobz, range, uplo, N, A, LDA, vl, vu, il, iu, abstol, m, w, strideW, Z, LDZ, ISUPPZ, strideISUPPZ, WORK, RWORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const ow = stride2offset( N, strideW );
	const oisuppz = stride2offset( N, strideISUPPZ );

	// The wrapper is the single sanctioned allocation site (base/ndarray never
	// allocate): allocate a complex WORK, a real RWORK, and an integer IWORK
	// when the caller passes `null`.
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( Math.max( 1, 2 * N ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( Math.max( 1, 24 * N ) );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		IWORK = new Int32Array( Math.max( 1, 10 * N ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument violates the reference leading-dimension rule (rejected when `LDA.LT.MAX( 1, N )`). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && ( LDZ < 1 || ( ( jobz === 'compute-vectors' ) && LDZ < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument violates the reference leading-dimension rule (column-major: rejected when `LDZ.LT.1 .OR. ( WANTZ .AND. LDZ.LT.N )`). Value: `%d`.', LDZ ) );
	}
	if ( order === 'row-major' && ( LDZ < 1 || ( ( jobz === 'compute-vectors' ) && LDZ < max( 1, ( range === 'index' ) ? iu - il + 1 : N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument violates the reference leading-dimension rule (row-major: must also cover the ( range === "index" ) ? iu - il + 1 : N columns). Value: `%d`.', LDZ ) );
	}
	if ( jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobz` value. Value: `%s`.', jobz ) );
	}
	if ( range !== 'all' && range !== 'value' && range !== 'index' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `range` value. Value: `%s`.', range ) );
	}
	return base( jobz, range, uplo, N, A, sa1, sa2, 0, vl, vu, il, iu, abstol, m, w, strideW, ow, Z, sz1, sz2, 0, ISUPPZ, strideISUPPZ, oisuppz, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zheevr;
