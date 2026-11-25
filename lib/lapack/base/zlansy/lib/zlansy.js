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
* Returns the value of the 1-norm, or the Frobenius norm, or the infinity norm, or the element of largest absolute value of a complex symmetric matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} norm - specifies the value to be returned in ZLANSY as described above.
* @param {string} uplo - specifies whether the upper or lower triangular part of the symmetric matrix A is to be referenced. `'upper'`: Upper triangular part of A is referenced `'lower'`: Lower triangular part of A is referenced.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Complex128Array} A - the symmetric matrix A.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {(Float64Array|null)} WORK - caller-provided workspace
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @returns {number} output array
*/
function zlansy( order, norm, uplo, N, A, LDA, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	if ( WORK === null || WORK === void 0 ) {
		const minWork = N;
		WORK = new Float64Array( minWork );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( norm !== 'max' && norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid norm. Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	return base( norm, uplo, N, A, sa1, sa2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zlansy;
