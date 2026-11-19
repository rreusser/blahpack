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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex system A*X = B where A is general band, with equilibration, condition estimation, and error bounds.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} fact - fact
* @param {string} trans - trans
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} kl - kl
* @param {NonNegativeInteger} ku - ku
* @param {NonNegativeInteger} nrhs - nrhs
* @param {Complex128Array} AB - AB
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Complex128Array} AFB - AFB
* @param {PositiveInteger} LDAFB - leading dimension of `AFB`
* @param {Int32Array} IPIV - IPIV
* @param {integer} strideIPIV - strideIPIV
* @param {Array} equed - equed
* @param {Float64Array} r - r
* @param {integer} strideR - strideR
* @param {Float64Array} c - c
* @param {integer} strideC - strideC
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} X - X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} rcond - output (length-1 array): the estimate of the reciprocal condition number of the matrix A after equilibration (if done)
* @param {Float64Array} FERR - FERR
* @param {integer} strideFERR - strideFERR
* @param {Float64Array} BERR - BERR
* @param {integer} strideBERR - strideBERR
* @param {(Complex128Array|null)} WORK - WORK
* @param {(Float64Array|null)} RWORK - RWORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "equilibrate", "factored", "not-factored"
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be greater than or equal to `kl + ku + 1` (column-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `2 * kl + ku + 1` (column-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {TypeError} fourteenth argument is invalid (rejected when `fact === "factored" && !( ( ( fact === "not-factored" || fact === "equilibrate" ? false : equed[ 0 ] === "row" || equed[ 0 ] === "both" ) || ( fact === "not-factored" || fact === "equilibrate" ? false : equed[ 0 ] === "column" || equed[ 0 ] === "both" ) ) || equed[ 0 ] === "none" )`)
* @throws {RangeError} twentieth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} twentieth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {RangeError} twenty-second argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} twenty-second argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} result with `info`, `equed`, `rpvgrw`
*/
function zgbsvx( order, fact, trans, N, kl, ku, nrhs, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, equed, r, strideR, c, strideC, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, RWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( fact !== 'equilibrate' && fact !== 'factored' && fact !== 'not-factored' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "equilibrate", "factored", "not-factored". Value: `%s`.', fact ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kl < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', kl ) );
	}
	if ( ku < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', ku ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && ( LDAB < kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to %d. Value: `%d`.', kl + ku + 1, LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAB ) );
	}
	if ( order === 'column-major' && ( LDAFB < 2 * kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to %d. Value: `%d`.', 2 * kl + ku + 1, LDAFB ) );
	}
	if ( order === 'row-major' && ( LDAFB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAFB ) );
	}
	if ( fact === 'factored' && !( ( ( fact === 'not-factored' || fact === 'equilibrate' ? false : equed[ 0 ] === 'row' || equed[ 0 ] === 'both' ) || ( fact === 'not-factored' || fact === 'equilibrate' ? false : equed[ 0 ] === 'column' || equed[ 0 ] === 'both' ) ) || equed[ 0 ] === 'none' ) ) {
		throw new TypeError( format( 'invalid argument. Fourteenth argument is invalid (rejected when `fact === "factored" && !( ( ( fact === "not-factored" || fact === "equilibrate" ? false : equed[ 0 ] === "row" || equed[ 0 ] === "both" ) || ( fact === "not-factored" || fact === "equilibrate" ? false : equed[ 0 ] === "column" || equed[ 0 ] === "both" ) ) || equed[ 0 ] === "none" )`). Value: `%s`.', equed[ 0 ] ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	if ( order === 'column-major' && ( LDX < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-second argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDX ) );
	}
	if ( order === 'row-major' && ( LDX < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-second argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDX ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const safb1 = ( order === 'column-major' ) ? 1 : LDAFB;
	const safb2 = ( order === 'column-major' ) ? LDAFB : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	const oipiv = stride2offset( N, strideIPIV );
	const or = stride2offset( N, strideR );
	const oc = stride2offset( N, strideC );
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, Math.max( 1, N) );
		RWORK = new Float64Array( minRwork );
	}
	return base( fact, trans, N, kl, ku, nrhs, AB, sab1, sab2, 0, AFB, safb1, safb2, 0, IPIV, strideIPIV, oipiv, equed, r, strideR, or, c, strideC, oc, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgbsvx;
