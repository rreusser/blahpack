
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the inverse of A real symmetric positive definite matrix in Rectangular Full Packed format.
*
* @param {string} transr - specifies the operation type
* @param {string} uplo - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input array
* @param {integer} strideA - strideA length for `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @throws {TypeError} Second argument must be A valid matrix triangle
* @returns {integer} status code (0 = success)
*/
function dpftri( transr, uplo, N, A, strideA, offsetA ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be A valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be A nonnegative integer. Value: `%d`.', N ) );
	}
	return base( transr, uplo, N, A, strideA, offsetA );
}


// EXPORTS //

export default dpftri;
