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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Solves a real symmetric positive definite banded system A*X = B, with optional equilibration, condition estimation, and error bounds.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('not-factored'|'equilibrate'|'factored')} fact - 'not-factored', 'factored', or 'equilibrate'
* @param {MatrixTriangle} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super/subdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} AB - band matrix in band storage, dimension (LDAB, N)
* @param {PositiveInteger} LDAB - leading dimension of AB
* @param {Float64Array} AFB - factored band matrix
* @param {PositiveInteger} LDAFB - leading dimension of AFB
* @param {Array<string>} equed - single-element array for equilibration status
* @param {Float64Array} S - scaling factors, length N
* @param {integer} strideS - stride for S
* @param {Float64Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Float64Array} X - solution matrix (output)
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Float64Array} rcond - single-element array for reciprocal condition number
* @param {Float64Array} FERR - forward error bounds (output)
* @param {integer} strideFERR - stride for FERR
* @param {Float64Array} BERR - backward error bounds (output)
* @param {integer} strideBERR - stride for BERR
* @param {(Float64Array|null)} WORK - workspace array
* @param {(Int32Array|null)} IWORK - integer workspace array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "equilibrate", "factored", "not-factored"
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `kd + 1` (column-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} tenth argument must be greater than or equal to `kd + 1` (column-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {TypeError} eleventh argument is invalid (rejected when `fact === "factored" && !( ( equed[ 0 ] === "yes" ) || equed[ 0 ] === "none" )`)
* @throws {RangeError} fifteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} fifteenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {RangeError} seventeenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} seventeenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info
*/
function dpbsvx( order, fact, uplo, N, kd, nrhs, AB, LDAB, AFB, LDAFB, equed, S, strideS, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, IWORK ) {

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( fact !== 'equilibrate' && fact !== 'factored' && fact !== 'not-factored' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "equilibrate", "factored", "not-factored". Value: `%s`.', fact ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && ( LDAB < kd + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to %d. Value: `%d`.', kd + 1, LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAB ) );
	}
	if ( order === 'column-major' && ( LDAFB < kd + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to %d. Value: `%d`.', kd + 1, LDAFB ) );
	}
	if ( order === 'row-major' && ( LDAFB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAFB ) );
	}
	if ( fact === 'factored' && !( ( equed[ 0 ] === 'yes' ) || equed[ 0 ] === 'none' ) ) {
		throw new TypeError( format( 'invalid argument. Eleventh argument is invalid (rejected when `fact === "factored" && !( ( equed[ 0 ] === "yes" ) || equed[ 0 ] === "none" )`). Value: `%s`.', equed[ 0 ] ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	if ( order === 'column-major' && ( LDX < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDX ) );
	}
	if ( order === 'row-major' && ( LDX < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDX ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const safb1 = ( order === 'column-major' ) ? 1 : LDAFB;
	const safb2 = ( order === 'column-major' ) ? LDAFB : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	const os = stride2offset( N, strideS );
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 3 * N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	return strided( fact, uplo, N, kd, nrhs, AB, sab1, sab2, 0, AFB, safb1, safb2, 0, equed, S, strideS, os, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dpbsvx;
