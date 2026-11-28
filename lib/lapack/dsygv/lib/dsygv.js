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
import strided from './strided.js';
import { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes all the eigenvalues, and optionally, the eigenvectors of a real generalized symmetric-definite eigenproblem, of the form A·x=λ·B·x, A·Bx=λ·x, or B·A·x=λ·x.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {integer} itype - specifies the problem type to be solved: = 1: A*x = (lambda)*B*x = 2: A*B*x = (lambda)*x = 3: B*A*x = (lambda)*x.
* @param {('no-vectors'|'compute-vectors')} jobz - `'no-vectors'`: Compute eigenvalues only; `'compute-vectors'`: Compute eigenvalues and eigenvectors.
* @param {MatrixTriangle} uplo - `'upper'`: Upper triangles of A and B are stored; `'lower'`: Lower triangles of A and B are stored.
* @param {NonNegativeInteger} N - the order of the matrices A and B.
* @param {Float64Array} A - on entry, the symmetric matrix A. On exit, if `jobz === 'compute-vectors'`, then if INFO = 0, A contains the matrix Z of eigenvectors.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - on entry, the symmetric positive definite matrix B. On exit, if INFO <= N, the part of B containing the matrix is overwritten by the triangular factor U or L from the Cholesky factorization B = U**T*U or B = L*L**T.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} w - if INFO = 0, the eigenvalues in ascending order.
* @param {integer} strideW - stride length for `w`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `max( 1, 3 * N - 1 )` elements; if `null`, a workspace of the reference's optimal size (LWKOPT, with the DSYTRD block size from `ilaenv`) is allocated
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument is invalid (rejected when `itype < 1 || itype > 3`)
* @throws {TypeError} third argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} fourth argument must be a valid matrix triangle
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )`
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dsygv( order, itype, jobz, uplo, N, A, LDA, B, LDB, w, strideW, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( itype < 1 || itype > 3 ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `itype < 1 || itype > 3`). Value: `%d`.', itype ) );
	}
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobz ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( computeOptimalWorkSize( uplo, N ) );
	}
	return strided( itype, jobz, uplo, N, A, sa1, sa2, 0, B, sb1, sb2, 0, w, strideW, ow, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsygv;
