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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the largest absolute value of any element of a complex symmetric matrix supplied in packed storage.
*
* @param {Layout} order - storage layout
* @param {('one-norm'|'max'|'inf-norm'|'frobenius')} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {MatrixTriangle} uplo - specifies whether the upper or lower triangular part is packed ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed symmetric matrix, length >= N*(N+1)/2
* @param {(Float64Array|null)} WORK - workspace array, length >= N
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "one-norm", "max", "inf-norm", "frobenius"
* @throws {TypeError} third argument must be a valid matrix triangle
* @returns {number} norm value
*/
function zlansp( order, norm, uplo, N, AP, WORK ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( norm !== 'one-norm' && norm !== 'max' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "one-norm", "max", "inf-norm", "frobenius". Value: `%s`.', norm ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = N;
		WORK = new Float64Array( minWork );
	}
	if ( order === 'row-major' ) {
		throw new TypeError( format( 'invalid argument. First argument must be \'column-major\'; packed storage is LAPACK column-major packed. Value: `%s`.', order ) );
	}
	return base( norm, uplo, N, AP, 1, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zlansp;
