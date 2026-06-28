

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Copies a complex triangular matrix from standard packed format (TP) to full format (TR).
*
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - input packed triangular matrix
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Complex128Array} A - output matrix in full format
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code
*/
function ztpttr( uplo, N, AP, strideAP, offsetAP, A, strideA1, strideA2, offsetA ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, AP, strideAP, offsetAP, A, strideA1, strideA2, offsetA ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztpttr;
