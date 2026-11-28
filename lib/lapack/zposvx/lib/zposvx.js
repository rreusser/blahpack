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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ndarray from './ndarray.js';


// MAIN //

/**
* Computes the solution to system of linear equations A·X = B for positive definite matrices.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('not-factored'|'equilibrate'|'factored')} fact - specifies whether or not the factored form of the matrix A is supplied on entry, and if not, whether the matrix A should be equilibrated before it is factored. `'factored'`: On entry, AF contains the factored form of A. If `equed === 'yes'`, the matrix A has been equilibrated with scaling factors given by S. A and AF will not be modified. `'not-factored'`: The matrix A will be copied to AF and factored. `'equilibrate'`: The matrix A will be equilibrated if necessary, then copied to AF and factored.
* @param {MatrixTriangle} uplo - `'upper'`: Upper triangle of A is stored; `'lower'`: Lower triangle of A is stored.
* @param {NonNegativeInteger} N - the number of linear equations, i.e., the order of the matrix A.
* @param {NonNegativeInteger} nrhs - the number of right hand sides, i.e., the number of columns of the matrices B and X.
* @param {Complex128Array} A - on entry, the Hermitian matrix A, except if `fact === 'factored'` and `equed === 'yes'`, then A must contain the equilibrated matrix diag(S)*A*diag(S). On exit, if `fact === 'equilibrate'` and `equed === 'yes'`, A is overwritten by diag(S)*A*diag(S).
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} AF - if `fact === 'factored'`, then AF is an input argument and on entry contains the triangular factor U or L from the Cholesky factorization A = U**H *U or A = L*L**H, in the same storage format as A.
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @param {Array<string>} equed - specifies the form of equilibration that was done. `'none'`: No equilibration (always true if `fact === 'not-factored'`). `'yes'`: Equilibration was done, i.e., A has been replaced by diag(S) * A * diag(S). EQUED is an input argument if `fact === 'factored'`; otherwise, it is an output argument.
* @param {Float64Array} s - the scale factors for A; not accessed if `equed === 'none'`.
* @param {integer} strideS - stride length for `s`
* @param {Complex128Array} B - on entry, the N-by-NRHS righthand side matrix B. On exit, if `equed === 'none'`, B is not modified; if `equed === 'yes'`, B is overwritten by diag(S) * B.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} X - if INFO = 0 or INFO = N+1, the N-by-NRHS solution matrix X to the original system of equations.
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} rcond - the estimate of the reciprocal condition number of the matrix A after equilibration (if done).
* @param {Float64Array} FERR - the estimated forward error bound for each solution vector X(j) (the j-th column of the solution matrix X).
* @param {integer} strideFERR - stride length for `FERR`
* @param {Float64Array} BERR - the componentwise relative backward error of each solution vector X(j) (i.e., the smallest relative change in any element of A or B that makes X(j) an exact solution).
* @param {integer} strideBERR - stride length for `BERR`
* @param {(Complex128Array|null)} WORK - caller-provided workspace of at least `2 * N` elements
* @param {(Float64Array|null)} RWORK - caller-provided workspace of at least `N` elements
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
function zposvx( order, fact, uplo, N, nrhs, A, LDA, AF, LDAF, equed, s, strideS, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, RWORK ) { // eslint-disable-line max-len, max-params

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
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return ndarray( fact, uplo, N, nrhs, A, sa1, sa2, 0, AF, saf1, saf2, 0, equed, s, strideS, os, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zposvx;
