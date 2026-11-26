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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import ndarray from './ndarray.js';
import { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes the solution to system of linear equations A·X = B for symmetric matrices.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('not-factored'|'factored')} fact - specifies whether or not the factored form of A has been supplied on entry. `'factored'`: On entry, AF and IPIV contain the factored form of A. A, AF and IPIV will not be modified. `'not-factored'`: The matrix A will be copied to AF and factored.
* @param {MatrixTriangle} uplo - `'upper'`: Upper triangle of A is stored; `'lower'`: Lower triangle of A is stored.
* @param {NonNegativeInteger} N - the number of linear equations, i.e., the order of the matrix A.
* @param {NonNegativeInteger} nrhs - the number of right hand sides, i.e., the number of columns of the matrices B and X.
* @param {Complex128Array} A - the symmetric matrix A.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} AF - if `fact === 'factored'`, then AF is an input argument and on entry contains the block diagonal matrix D and the multipliers used to obtain the factor U or L from the factorization A = U*D*U**T or A = L*D*L**T as computed by ZSYTRF.
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @param {Int32Array} IPIV - if `fact === 'factored'`, then IPIV is an input argument and on entry contains details of the interchanges and the block structure of D, as determined by ZSYTRF (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Complex128Array} B - the N-by-NRHS right hand side matrix B.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} X - if INFO = 0 or INFO = N+1, the N-by-NRHS solution matrix X.
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} rcond - the estimate of the reciprocal condition number of the matrix A.
* @param {Float64Array} FERR - the estimated forward error bound for each solution vector X(j) (the j-th column of the solution matrix X).
* @param {integer} strideFERR - stride length for `FERR`
* @param {Float64Array} BERR - the componentwise relative backward error of each solution vector X(j) (i.e., the smallest relative change in any element of A or B that makes X(j) an exact solution).
* @param {integer} strideBERR - stride length for `BERR`
* @param {(Complex128Array|null)} WORK - caller-owned complex workspace, or
* `null` to allocate the reference's optimal size (`max(1,2*N)` complex elements, and
* `N*NB` when `fact` is `'not-factored'`, with `NB = 64` the zsytrf block size from `ilaenv`)
* @param {(Float64Array|null)} RWORK - caller-owned real workspace, or `null`
* to auto-allocate at the minimum required size (`max(1,N)` elements)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "factored", "not-factored"
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {RangeError} fifteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} fifteenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function zsysvx( order, fact, uplo, N, nrhs, A, LDA, AF, LDAF, IPIV, strideIPIV, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, RWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( fact !== 'factored' && fact !== 'not-factored' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "factored", "not-factored". Value: `%s`.', fact ) );
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
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	if ( order === 'column-major' && ( LDX < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDX ) );
	}
	if ( order === 'row-major' && ( LDX < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDX ) );
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
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );

	// The wrapper is the single sanctioned allocation site (base/ndarray never
	// allocate): allocate a complex WORK of the reference's optimal size and a
	// real RWORK when the caller passes `null`.
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( computeOptimalWorkSize( fact, uplo, N ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( max( 1, N ) );
	}
	return ndarray( fact, uplo, N, nrhs, A, sa1, sa2, 0, AF, saf1, saf2, 0, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zsysvx;
