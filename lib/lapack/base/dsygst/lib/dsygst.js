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
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a real symmetric-definite generalized eigenproblem to standard form.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {integer} itype - = 1: compute inv(U**T)*A*inv(U) or inv(L)*A*inv(L**T); = 2 or 3: compute U*A*U**T or L**T*A*L.
* @param {string} uplo - `'upper'`: Upper triangle of A is stored and B is factored as U**T*U; `'lower'`: Lower triangle of A is stored and B is factored as L*L**T.
* @param {NonNegativeInteger} N - the order of the matrices A and B.
* @param {Float64Array} A - on entry, the symmetric matrix A. On exit, if INFO = 0, the transformed matrix, stored in the same format as A.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - the triangular factor from the Cholesky factorization of B, as returned by DPOTRF.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument is invalid (rejected when `itype < 1 || itype > 3`)
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dsygst( order, itype, uplo, N, A, LDA, B, LDB ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( itype < 1 || itype > 3 ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `itype < 1 || itype > 3`). Value: `%d`.', itype ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	return base( itype, uplo, N, A, sa1, sa2, 0, B, sb1, sb2, 0 );
}


// EXPORTS //

export default dsygst;
