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
* Improves the computed solution to a system of linear equations when the coefficient matrix is Hermitian positive definite and tridiagonal, and provides error bounds and backward error estimates for the solution.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {MatrixTriangle} uplo - specifies whether the superdiagonal or the subdiagonal of the tridiagonal matrix A is stored and the form of the factorization: `'upper'`: E is the superdiagonal of A, and A = U**H*D*U; `'lower'`: E is the subdiagonal of A, and A = L*D*L**H. (The two forms are equivalent if A is real.)
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {NonNegativeInteger} nrhs - the number of right hand sides, i.e., the number of columns of the matrix B.
* @param {Float64Array} d - the n real diagonal elements of the tridiagonal matrix A.
* @param {integer} strideD - stride length for `d`
* @param {Complex128Array} e - the (n-1) off-diagonal elements of the tridiagonal matrix A (see UPLO).
* @param {integer} strideE - stride length for `e`
* @param {Float64Array} DF - the n diagonal elements of the diagonal matrix D from the factorization computed by ZPTTRF.
* @param {integer} strideDF - stride length for `DF`
* @param {Complex128Array} EF - the (n-1) off-diagonal elements of the unit bidiagonal factor U or L from the factorization computed by ZPTTRF (see UPLO).
* @param {integer} strideEF - stride length for `EF`
* @param {Complex128Array} B - the right hand side matrix B.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} X - on entry, the solution matrix X, as computed by ZPTTRS. On exit, the improved solution matrix X.
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} FERR - the forward error bound for each solution vector X(j) (the j-th column of the solution matrix X).
* @param {integer} strideFERR - stride length for `FERR`
* @param {Float64Array} BERR - the componentwise relative backward error of each solution vector X(j) (i.e., the smallest relative change in any element of A or B that makes X(j) an exact solution).
* @param {integer} strideBERR - stride length for `BERR`
* @param {(Complex128Array|null)} WORK - caller-provided workspace of at least `N` elements
* @param {(Float64Array|null)} RWORK - caller-provided workspace of at least `N` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fourteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} fourteenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {RangeError} sixteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} sixteenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function zptrfs( order, uplo, N, nrhs, d, strideD, e, strideE, DF, strideDF, EF, strideEF, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, RWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
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
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	const odf = stride2offset( N, strideDF );
	const oef = stride2offset( N - 1, strideEF );
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return ndarray( uplo, N, nrhs, d, strideD, od, e, strideE, oe, DF, strideDF, odf, EF, strideEF, oef, B, sb1, sb2, 0, X, sx1, sx2, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zptrfs;
