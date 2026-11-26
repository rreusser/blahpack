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
import ndarray from './ndarray.js';


// MAIN //

/**
* Computes the solution to system of linear equations A·X = B for general matrices.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('not-factored'|'equilibrate'|'factored')} fact - specifies whether or not the factored form of the matrix A is supplied on entry, and if not, whether the matrix A should be equilibrated before it is factored. `'factored'`: On entry, AF and IPIV contain the factored form of A. If `equed !== 'none'`, the matrix A has been equilibrated with scaling factors given by R and C. A, AF, and IPIV are not modified. `'not-factored'`: The matrix A will be copied to AF and factored. `'equilibrate'`: The matrix A will be equilibrated if necessary, then copied to AF and factored.
* @param {TransposeOperation} trans - specifies the form of the system of equations: `'no-transpose'`: A * X = B (No transpose) `'transpose'`: A**T * X = B (Transpose) `'conjugate-transpose'`: A**H * X = B (Conjugate transpose)
* @param {NonNegativeInteger} N - the number of linear equations, i.e., the order of the matrix A.
* @param {NonNegativeInteger} nrhs - the number of right hand sides, i.e., the number of columns of the matrices B and X.
* @param {Complex128Array} A - on entry, the N-by-N matrix A. On exit, if `equed !== 'none'`, A is scaled as follows: `equed === 'row'`: A := diag(R) * A `equed === 'column'`: A := A * diag(C) `equed === 'both'`: A := diag(R) * A * diag(C).
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} AF - if `fact === 'factored'`, then AF is an input argument and on entry contains the factors L and U from the factorization A = P*L*U as computed by ZGETRF.
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @param {Int32Array} IPIV - if `fact === 'factored'`, then IPIV is an input argument and on entry contains the pivot indices from the factorization A = P*L*U as computed by ZGETRF; row i of the matrix was interchanged with row IPIV(i) (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Array<string>} equed - specifies the form of equilibration that was done. `'none'`: No equilibration (always true if `fact === 'not-factored'`). `'row'`: Row equilibration, i.e., A has been premultiplied by diag(R). `'column'`: Column equilibration, i.e., A has been postmultiplied by diag(C). `'both'`: Both row and column equilibration, i.e., A has been replaced by diag(R) * A * diag(C). EQUED is an input argument if `fact === 'factored'`; otherwise, it is an output argument.
* @param {Float64Array} r - the row scale factors for A.
* @param {integer} strideR - stride length for `r`
* @param {Float64Array} c - the column scale factors for A.
* @param {integer} strideC - stride length for `c`
* @param {Complex128Array} B - on entry, the N-by-NRHS right hand side matrix B. On exit, if `equed === 'none'`, B is not modified; if `trans === 'no-transpose'` and `equed === 'row'` or `equed === 'both'`, B is overwritten by diag(R)*B; if `trans === 'transpose'` or `trans === 'conjugate-transpose'` and `equed === 'column'` or `equed === 'both'`, B is overwritten by diag(C)*B.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} X - if INFO = 0 or INFO = N+1, the N-by-NRHS solution matrix X to the original system of equations.
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} rcond - output (length-1 array): the estimate of the reciprocal condition number of the matrix A after equilibration (if done)
* @param {Float64Array} FERR - the estimated forward error bound for each solution vector X(j) (the j-th column of the solution matrix X).
* @param {integer} strideFERR - stride length for `FERR`
* @param {Float64Array} BERR - the componentwise relative backward error of each solution vector X(j) (i.e., the smallest relative change in any element of A or B that makes X(j) an exact solution).
* @param {integer} strideBERR - stride length for `BERR`
* @param {(Complex128Array|null)} WORK - caller-provided workspace of at least `2 * N` elements
* @param {(Float64Array|null)} RWORK - caller-provided workspace of at least `max( 1, 2 * N )` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "equilibrate", "factored", "not-factored"
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )`
* @throws {TypeError} twelfth argument is invalid (rejected when `fact === "factored" && !( ( ( equed[ 0 ] === "row" || equed[ 0 ] === "both" ) || ( equed[ 0 ] === "column" || equed[ 0 ] === "both" ) ) || equed[ 0 ] === "none" )`)
* @throws {RangeError} eighteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} eighteenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {RangeError} twentieth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} twentieth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} status code (INFO)
*/
function zgesvx( order, fact, trans, N, nrhs, A, LDA, AF, LDAF, IPIV, strideIPIV, equed, r, strideR, c, strideC, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, RWORK ) { // eslint-disable-line max-len, max-params

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
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAF ) );
	}
	if ( fact === 'factored' && !( ( ( equed[ 0 ] === 'row' || equed[ 0 ] === 'both' ) || ( equed[ 0 ] === 'column' || equed[ 0 ] === 'both' ) ) || equed[ 0 ] === 'none' ) ) {
		throw new TypeError( format( 'invalid argument. Twelfth argument is invalid (rejected when `fact === "factored" && !( ( ( equed[ 0 ] === "row" || equed[ 0 ] === "both" ) || ( equed[ 0 ] === "column" || equed[ 0 ] === "both" ) ) || equed[ 0 ] === "none" )`). Value: `%s`.', equed[ 0 ] ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	if ( order === 'column-major' && ( LDX < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDX ) );
	}
	if ( order === 'row-major' && ( LDX < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDX ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const saf1 = ( order === 'column-major' ) ? 1 : LDAF;
	const saf2 = ( order === 'column-major' ) ? LDAF : 1;
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
		const minRwork = Math.max( 1, Math.max( 1, 2 * N) );
		RWORK = new Float64Array( minRwork );
	}
	return ndarray( fact, trans, N, nrhs, A, sa1, sa2, 0, AF, saf1, saf2, 0, IPIV, strideIPIV, oipiv, equed, r, strideR, or, c, strideC, oc, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgesvx;
