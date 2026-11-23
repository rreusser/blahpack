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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses the Cholesky factorization to compute the solution to a real system of linear equations `A * X = B`, where `A` is an N-by-N symmetric positive definite matrix, and provides error bounds and a condition estimate.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} fact - 'not-factored', 'equilibrate', or 'factored'
* @param {string} uplo - specifies whether the upper or lower triangle of `A` is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} A - input/output symmetric matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} AF - input/output Cholesky factor of `A`
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @param {Array} equed - equilibration type ('none' or 'yes'); input if `fact` is 'factored'
* @param {Float64Array} s - scale factors for `A`
* @param {integer} strideS - stride length for `s`
* @param {Float64Array} B - input/output right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} X - output solution matrix
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} rcond - output array; on return, `rcond[0]` is the reciprocal condition number estimate
* @param {Float64Array} FERR - output forward error bounds
* @param {integer} strideFERR - stride length for `FERR`
* @param {Float64Array} BERR - output backward error bounds
* @param {integer} strideBERR - stride length for `BERR`
* @param {(Float64Array|null)} WORK - workspace of length at least `3*N` (allocated if `null`)
* @param {(Int32Array|null)} IWORK - integer workspace of length at least `N` (allocated if `null`)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "equilibrate", "factored", "not-factored"
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )`
* @throws {TypeError} tenth argument is invalid (rejected when `fact === "factored" && !( ( equed[ 0 ] === "yes" ) || equed[ 0 ] === "none" )`)
* @throws {RangeError} fourteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} fourteenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {RangeError} sixteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} sixteenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} status code (INFO)
*/
function dposvx( order, fact, uplo, N, nrhs, A, LDA, AF, LDAF, equed, s, strideS, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, IWORK ) { // eslint-disable-line max-len, max-params
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
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAF ) );
	}
	if ( fact === 'factored' && !( ( equed[ 0 ] === 'yes' ) || equed[ 0 ] === 'none' ) ) {
		throw new TypeError( format( 'invalid argument. Tenth argument is invalid (rejected when `fact === "factored" && !( ( equed[ 0 ] === "yes" ) || equed[ 0 ] === "none" )`). Value: `%s`.', equed[ 0 ] ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	if ( order === 'column-major' && ( LDX < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDX ) );
	}
	if ( order === 'row-major' && ( LDX < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDX ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const saf1 = ( order === 'column-major' ) ? 1 : LDAF;
	const saf2 = ( order === 'column-major' ) ? LDAF : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	const os = stride2offset( N, strideS );
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( max( 1, 3 * N ) );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		IWORK = new Int32Array( max( 1, N ) );
	}
	return base( fact, uplo, N, nrhs, A, sa1, sa2, 0, AF, saf1, saf2, 0, equed, s, strideS, os, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dposvx;
