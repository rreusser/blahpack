
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the Hermitian packed rank-2 update `A := alpha*x*y**H + conj(alpha)*y*x**H + A`.
*
* `alpha` is a complex scalar, `x` and `y` are `N` element complex vectors,
* and `A` is an `N` by `N` Hermitian matrix supplied in packed form.
*
* @param {string} uplo - specifies whether upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128} alpha - complex scalar constant
* @param {Complex128Array} x - first input vector
* @param {integer} strideX - `x` stride length (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} y - second input vector
* @param {integer} strideY - `y` stride length (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @param {Complex128Array} AP - packed Hermitian matrix
* @param {integer} strideAP - `AP` stride length (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} `AP`
*/
function zhpr2( uplo, N, alpha, x, strideX, offsetX, y, strideY, offsetY, AP, strideAP, offsetAP ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( strideY === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideY ) );
	}
	if ( strideAP === 0 ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be non-zero. Value: `%d`.', strideAP ) );
	}
	return base( uplo, N, alpha, x, strideX, offsetX, y, strideY, offsetY, AP, strideAP, offsetAP ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhpr2;
