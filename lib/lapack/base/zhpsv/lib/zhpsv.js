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
import base from './base.js';


// MAIN //

/**
* Computes the solution to a complex system of linear equations `A * X = B` where A is Hermitian in packed storage.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - specifies whether the upper or lower triangular part of the Hermitian matrix A is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns in B
* @param {Complex128Array} AP - Hermitian matrix A in packed storage
* @param {Int32Array} IPIV - output pivot indices, length N
* @param {integer} strideIPIV - stride for `IPIV`
* @param {Complex128Array} B - input/output N-by-NRHS matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function zhpsv( order, uplo, N, nrhs, AP, IPIV, strideIPIV, B, LDB ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1; // eslint-disable-line max-len
	const oipiv = stride2offset( N, strideIPIV );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'row-major' && LDB < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	return base( uplo, N, nrhs, AP, 1, 0, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhpsv;
