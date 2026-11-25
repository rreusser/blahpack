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
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the value of the 1-norm, or the Frobenius norm, or the infinity norm, or the element of largest absolute value of a trapezoidal or triangular matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} norm - specifies the value to be returned in ZLANTR as described above.
* @param {string} uplo - specifies whether the matrix A is upper or lower trapezoidal. `'upper'`: Upper trapezoidal `'lower'`: Lower trapezoidal Note that A is triangular instead of trapezoidal if M = N.
* @param {string} diag - specifies whether or not the matrix A has unit diagonal. `'non-unit'`: Non-unit diagonal `'unit'`: Unit diagonal.
* @param {NonNegativeInteger} M - the number of rows of the matrix A.
* @param {NonNegativeInteger} N - the number of columns of the matrix A.
* @param {Complex128Array} A - the trapezoidal matrix A (A is triangular if M = N).
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {(Float64Array|null)} WORK - caller-provided workspace
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @returns {number} output array
*/
function zlantr( order, norm, uplo, diag, M, N, A, LDA, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	if ( WORK === null || WORK === void 0 ) {
		const minWork = M;
		WORK = new Float64Array( minWork );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( norm !== 'max' && norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid norm. Value: `%s`.', norm ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	return base( norm, uplo, diag, M, N, A, sa1, sa2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zlantr;
