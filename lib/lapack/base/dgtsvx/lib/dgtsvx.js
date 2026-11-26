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
import ndarray from './ndarray.js';


// MAIN //

/**
* Computes the solution to system of linear equations A·X = B for general tridiagonal matrices.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('not-factored'|'factored')} fact - specifies whether or not the factored form of A has been supplied on entry. `'factored'`: DLF, DF, DUF, DU2, and IPIV contain the factored form of A; DL, D, DU, DLF, DF, DUF, DU2 and IPIV will not be modified. `'not-factored'`: The matrix will be copied to DLF, DF, and DUF and factored.
* @param {TransposeOperation} trans - specifies the form of the system of equations: `'no-transpose'`: A * X = B (No transpose) `'transpose'`: A**T * X = B (Transpose)
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {NonNegativeInteger} nrhs - the number of right hand sides, i.e., the number of columns of the matrix B.
* @param {Float64Array} DL - the (n-1) subdiagonal elements of A.
* @param {integer} strideDL - stride length for `DL`
* @param {Float64Array} d - the n diagonal elements of A.
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} DU - the (n-1) superdiagonal elements of A.
* @param {integer} strideDU - stride length for `DU`
* @param {Float64Array} DLF - if `fact === 'factored'`, then DLF is an input argument and on entry contains the (n-1) multipliers that define the matrix L from the LU factorization of A as computed by DGTTRF.
* @param {integer} strideDLF - stride length for `DLF`
* @param {Float64Array} DF - if `fact === 'factored'`, then DF is an input argument and on entry contains the n diagonal elements of the upper triangular matrix U from the LU factorization of A.
* @param {integer} strideDF - stride length for `DF`
* @param {Float64Array} DUF - if `fact === 'factored'`, then DUF is an input argument and on entry contains the (n-1) elements of the first superdiagonal of U.
* @param {integer} strideDUF - stride length for `DUF`
* @param {Float64Array} DU2 - if `fact === 'factored'`, then DU2 is an input argument and on entry contains the (n-2) elements of the second superdiagonal of U.
* @param {integer} strideDU2 - stride length for `DU2`
* @param {Int32Array} IPIV - if `fact === 'factored'`, then IPIV is an input argument and on entry contains the pivot indices from the LU factorization of A as computed by DGTTRF (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Float64Array} B - the N-by-NRHS right hand side matrix B.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} X - if INFO = 0 or INFO = N+1, the N-by-NRHS solution matrix X.
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} rcond - the estimate of the reciprocal condition number of the matrix A.
* @param {Float64Array} FERR - the estimated forward error bound for each solution vector X(j) (the j-th column of the solution matrix X).
* @param {integer} strideFERR - stride length for `FERR`
* @param {Float64Array} BERR - the componentwise relative backward error of each solution vector X(j) (i.e., the smallest relative change in any element of A or B that makes X(j) an exact solution).
* @param {integer} strideBERR - stride length for `BERR`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `3 * N` elements
* @param {(Int32Array|null)} IWORK - caller-provided workspace of at least `N` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "factored", "not-factored"
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} twenty-third argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} twenty-third argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {RangeError} twenty-fifth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} twenty-fifth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dgtsvx( order, fact, trans, N, nrhs, DL, strideDL, d, strideD, DU, strideDU, DLF, strideDLF, DF, strideDF, DUF, strideDUF, DU2, strideDU2, IPIV, strideIPIV, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( fact !== 'factored' && fact !== 'not-factored' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "factored", "not-factored". Value: `%s`.', fact ) );
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
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-third argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-third argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	if ( order === 'column-major' && ( LDX < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDX ) );
	}
	if ( order === 'row-major' && ( LDX < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDX ) );
	}
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	const odl = stride2offset( N - 1, strideDL );
	const od = stride2offset( N, strideD );
	const odu = stride2offset( N - 1, strideDU );
	const odlf = stride2offset( N - 1, strideDLF );
	const odf = stride2offset( N, strideDF );
	const oduf = stride2offset( N - 1, strideDUF );
	const odu2 = stride2offset( N - 2, strideDU2 );
	const oipiv = stride2offset( N, strideIPIV );
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = 3 * N;
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	return ndarray( fact, trans, N, nrhs, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, DLF, strideDLF, odlf, DF, strideDF, odf, DUF, strideDUF, oduf, DU2, strideDU2, odu2, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgtsvx;
