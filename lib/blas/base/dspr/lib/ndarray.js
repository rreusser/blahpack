
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the symmetric rank-1 update `A := alpha*x*x^T + A`.
*
* `alpha` is a scalar, `x` is an `N`-element vector, and `A` is an `N` by `N`
* symmetric matrix supplied in packed form.
*
* @param {string} uplo - specifies whether upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {number} alpha - scalar constant
* @param {Float64Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} AP - packed symmetric matrix
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Float64Array} `AP`
*/
function dspr( uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( strideAP === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideAP ) );
	}
	return base( uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP ); // eslint-disable-line max-len
}


// EXPORTS //

export default dspr;
