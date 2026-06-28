
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Copy a triangular matrix from standard packed format (TP) to Rectangular Full Packed format (RFP).
*
* @param {string} transr - specifies whether `ARF` is in normal or transposed format (`'no-transpose'` or `'transpose'`)
* @param {string} uplo - specifies whether the matrix is upper or lower triangular (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} AP - input array in standard packed format
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} ARF - output array in RFP format
* @param {integer} strideARF - stride length for `ARF`
* @param {NonNegativeInteger} offsetARF - starting index for `ARF`
* @throws {TypeError} First argument must be a valid transpose operation
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dtpttf( transr, uplo, N, AP, strideAP, offsetAP, ARF, strideARF, offsetARF ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( transr ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', transr ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( transr, uplo, N, AP, strideAP, offsetAP, ARF, strideARF, offsetARF ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtpttf;
