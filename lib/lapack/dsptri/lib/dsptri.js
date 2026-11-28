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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Computes the inverse of a real symmetric matrix stored in packed format.
*
* The routine uses the factorization `A = U * D * U^T` or
* `A = L * D * L^T` computed by `dsptrf`.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {MatrixTriangle} uplo - specifies whether the upper or lower triangular part of `A` is packed ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed symmetric matrix containing the factorization from dsptrf, length N*(N+1)/2
* @param {Int32Array} IPIV - pivot index array from dsptrf, length N
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {(Float64Array|null)} WORK - workspace of length at least `N` (allocated internally when `null`)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is zero (1-based)
*/
function dsptri( order, uplo, N, AP, IPIV, strideIPIV, WORK ) {

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' ) {
		throw new TypeError( format( 'invalid argument. First argument must be \'column-major\'; packed storage is LAPACK column-major packed. Value: `%s`.', order ) );
	}
	const oipiv = stride2offset( N, strideIPIV );
	const W = ( WORK === null || WORK === void 0 ) ? new Float64Array( N ) : WORK;
	return strided( uplo, N, AP, 1, 0, IPIV, strideIPIV, oipiv, W, 1, 0 );
}


// EXPORTS //

export default dsptri;
