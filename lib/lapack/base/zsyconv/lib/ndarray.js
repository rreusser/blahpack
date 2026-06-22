

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Converts a complex symmetric matrix given by `zsytrf` (Bunch-Kaufman
 * factorization) to L and D and vice-versa. Extracts (or reinserts) the
 * off-diagonal elements of the block-diagonal factor D into a separate
 * array E, and applies (or reverts) the permutations stored in IPIV.
 *
 * ## Notes
 *
 * -   WAY='C' (convert): extracts off-diagonal of D into E, zeroes them in A,
 *     then applies permutations from IPIV to the triangular factor rows/columns.
 * -   WAY='R' (revert): reverses the permutations, then reinserts E back into A.
 * -   IPIV uses 0-based indices. Negative IPIV[i] indicates a 2x2 pivot block.
 *     `~IPIV[i]` gives the 0-based row/column index of the interchange.
 * -   A and E are Complex128Array; strides and offsets are in complex elements.
 *     Internally uses Float64 views with doubled strides/offsets.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {string} way - `'convert'` or `'revert'`
 * @param {NonNegativeInteger} N - order of the matrix
 * @param {Complex128Array} A - input/output matrix (column-major via strides)
 * @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
 * @param {Int32Array} IPIV - pivot indices from zsytrf (0-based)
 * @param {integer} strideIPIV - stride length for `IPIV`
 * @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
 * @param {Complex128Array} E - array to store off-diagonal elements of D
 * @param {integer} strideE - stride length for `E` (complex elements)
 * @param {NonNegativeInteger} offsetE - starting index for `E` (complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} status code (0 = success)
 */
function zsyconv( uplo, way, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, E, strideE, offsetE ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, way, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, E, strideE, offsetE ); // eslint-disable-line max-len
}


// EXPORTS //

export default zsyconv;
