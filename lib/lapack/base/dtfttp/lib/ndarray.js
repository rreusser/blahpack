
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Copy a triangular matrix from Rectangular Full Packed (RFP) format to standard packed format (TP).
*
* @param {string} transr - specifies whether `ARF` is in normal or transposed format (`'no-transpose'` or `'transpose'`)
* @param {string} uplo - specifies whether the matrix is upper or lower triangular (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} ARF - input array in RFP format
* @param {integer} strideARF - stride length for `ARF`
* @param {NonNegativeInteger} offsetARF - starting index for `ARF`
* @param {Float64Array} AP - output array in standard packed format
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @throws {TypeError} First argument must be a valid transpose operation
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dtfttp( transr, uplo, N, ARF, strideARF, offsetARF, AP, strideAP, offsetAP ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( transr ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', transr ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( transr, uplo, N, ARF, strideARF, offsetARF, AP, strideAP, offsetAP ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtfttp;
