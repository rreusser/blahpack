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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Estimate reciprocal condition number of a complex Hermitian matrix using rook-pivoted factorization.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {MatrixTriangle} uplo - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} IPIV - input array
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {number} anorm - the 1-norm of the original matrix A.
* @param {Float64Array} rcond - the reciprocal of the condition number of the matrix A, computed as RCOND = 1/(ANORM * AINVNM), where AINVNM is an estimate of the 1-norm of inv(A) computed in this routine.
* @param {(Complex128Array|null)} WORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} eighth argument is invalid (rejected when `anorm < 0`)
* @returns {integer} status code (0 = success)
*/
function zheconRook( order, uplo, N, A, LDA, IPIV, strideIPIV, anorm, rcond, WORK ) { // eslint-disable-line max-len, max-params
	let sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( anorm < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument is invalid (rejected when `anorm < 0`). Value: `%s`.', anorm ) );
	}
	const offsetIPIV = stride2offset( N, strideIPIV );
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2*N ) );
	}
	return strided( uplo, N, A, sa1, sa2, 0, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zheconRook;
