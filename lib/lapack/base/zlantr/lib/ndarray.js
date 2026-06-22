

// MODULES //

import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Computes the value of a matrix norm for a complex triangular or trapezoidal matrix.
 *
 * Supports norms: `'max'`, `'one-norm'`, `'inf-norm'`, `'frobenius'`.
 *
 *
 * @param {string} norm - norm type: `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {string} diag - `'unit'` or `'non-unit'`
 * @param {NonNegativeInteger} M - rows
 * @param {NonNegativeInteger} N - columns
 * @param {Complex128Array} A - complex matrix
 * @param {integer} strideA1 - first dimension stride (in complex elements)
 * @param {integer} strideA2 - second dimension stride (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @param {Float64Array} WORK - workspace (length >= M for `'inf-norm'`, real)
 * @param {integer} strideWORK - stride for WORK
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK
 * @throws {TypeError} Second argument must be a valid matrix triangle
 * @throws {TypeError} Third argument must be a valid diagonal type
 * @returns {number} norm value
 */
function zlantr( norm, uplo, diag, M, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( norm, uplo, diag, M, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlantr;
