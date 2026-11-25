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
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a real system A*X = B where A is general band, with equilibration, condition estimation, and error bounds.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} fact - specifies whether or not the factored form of the matrix A is supplied on entry, and if not, whether the matrix A should be equilibrated before it is factored. `'factored'`: On entry, AFB and IPIV contain the factored form of A. If `equed !== 'none'`, the matrix A has been equilibrated with scaling factors given by R and C. AB, AFB, and IPIV are not modified. `'not-factored'`: The matrix A will be copied to AFB and factored. `'equilibrate'`: The matrix A will be equilibrated if necessary, then copied to AFB and factored.
* @param {string} trans - specifies the form of the system of equations. `'no-transpose'`: A * X = B (No transpose) `'transpose'`: A**T * X = B (Transpose) `'conjugate-transpose'`: A**H * X = B (Transpose)
* @param {NonNegativeInteger} N - the number of linear equations, i.e., the order of the matrix A.
* @param {NonNegativeInteger} kl - the number of subdiagonals within the band of A.
* @param {NonNegativeInteger} ku - the number of superdiagonals within the band of A.
* @param {NonNegativeInteger} nrhs - the number of right hand sides, i.e., the number of columns of the matrices B and X.
* @param {Float64Array} AB - on entry, the matrix A in band storage, in rows 1 to KL+KU+1. On exit, if `equed !== 'none'`, A is scaled as follows: `equed === 'row'`: A := diag(R) * A `equed === 'column'`: A := A * diag(C) `equed === 'both'`: A := diag(R) * A * diag(C).
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} AFB - if `fact === 'factored'`, then AFB is an input argument and on entry contains details of the LU factorization of the band matrix A, as computed by DGBTRF.
* @param {PositiveInteger} LDAFB - leading dimension of `AFB`
* @param {Int32Array} IPIV - if `fact === 'factored'`, then IPIV is an input argument and on entry contains the pivot indices from the factorization A = L*U as computed by DGBTRF; row i of the matrix was interchanged with row IPIV(i) (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Array} equed - specifies the form of equilibration that was done. `'none'`: No equilibration (always true if `fact === 'not-factored'`). `'row'`: Row equilibration, i.e., A has been premultiplied by diag(R). `'column'`: Column equilibration, i.e., A has been postmultiplied by diag(C). `'both'`: Both row and column equilibration, i.e., A has been replaced by diag(R) * A * diag(C). EQUED is an input argument if `fact === 'factored'`; otherwise, it is an output argument.
* @param {Float64Array} r - the row scale factors for A.
* @param {integer} strideR - stride length for `r`
* @param {Float64Array} c - the column scale factors for A.
* @param {integer} strideC - stride length for `c`
* @param {Float64Array} B - on entry, the right hand side matrix B. On exit, if `equed === 'none'`, B is not modified; if `trans === 'no-transpose'` and `equed === 'row'` or `equed === 'both'`, B is overwritten by diag(R)*B; if `trans === 'transpose'` or `trans === 'conjugate-transpose'` and `equed === 'column'` or `equed === 'both'`, B is overwritten by diag(C)*B.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} X - if INFO = 0 or INFO = N+1, the N-by-NRHS solution matrix X to the original system of equations.
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} rcond - output (length-1 array): the estimate of the reciprocal condition number of the matrix A after equilibration (if done)
* @param {Float64Array} FERR - the estimated forward error bound for each solution vector X(j) (the j-th column of the solution matrix X).
* @param {integer} strideFERR - stride length for `FERR`
* @param {Float64Array} BERR - the componentwise relative backward error of each solution vector X(j) (i.e., the smallest relative change in any element of A or B that makes X(j) an exact solution).
* @param {integer} strideBERR - stride length for `BERR`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `max( 1, 3 * N )` elements
* @param {(Int32Array|null)} IWORK - caller-provided workspace of at least `N` elements
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
* @throws {TypeError} fourteenth argument is invalid (rejected when `fact === "factored" && !( ( ( equed[ 0 ] === "row" || equed[ 0 ] === "both" ) || ( equed[ 0 ] === "column" || equed[ 0 ] === "both" ) ) || equed[ 0 ] === "none" )`)
* @throws {RangeError} twentieth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} twentieth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {RangeError} twenty-second argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} twenty-second argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} status code (INFO)
*/
function dgbsvx( order, fact, trans, N, kl, ku, nrhs, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, equed, r, strideR, c, strideC, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, IWORK ) { // eslint-disable-line max-len, max-params

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
	if ( fact === 'factored' && !( ( ( equed[ 0 ] === 'row' || equed[ 0 ] === 'both' ) || ( equed[ 0 ] === 'column' || equed[ 0 ] === 'both' ) ) || equed[ 0 ] === 'none' ) ) {
		throw new TypeError( format( 'invalid argument. Fourteenth argument is invalid (rejected when `fact === "factored" && !( ( ( equed[ 0 ] === "row" || equed[ 0 ] === "both" ) || ( equed[ 0 ] === "column" || equed[ 0 ] === "both" ) ) || equed[ 0 ] === "none" )`). Value: `%s`.', equed[ 0 ] ) );
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
		const minWork = Math.max( 1, 3*N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	return base( fact, trans, N, kl, ku, nrhs, AB, sab1, sab2, 0, AFB, safb1, safb2, 0, IPIV, strideIPIV, oipiv, equed, r, strideR, or, c, strideC, oc, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgbsvx;
