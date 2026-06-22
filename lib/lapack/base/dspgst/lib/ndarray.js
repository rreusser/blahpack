
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a real symmetric-definite generalized eigenproblem to standard form using packed storage.
*
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} uplo - specifies whether upper or lower triangle is stored ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} AP - symmetric matrix A in packed storage
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} BP - triangular factor from Cholesky factorization of B in packed storage
* @param {integer} strideBP - stride length for `BP`
* @param {NonNegativeInteger} offsetBP - starting index for `BP`
* @throws {TypeError} Second argument must be a valid matrix triangle
* @returns {integer} status code (0 = success)
*/
function dspgst( itype, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( itype, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP ); // eslint-disable-line max-len
}


// EXPORTS //

export default dspgst;
