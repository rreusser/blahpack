
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the largest absolute value of any element of a complex Hermitian matrix supplied in packed storage.
*
* ## Notes
*
* -   The diagonal elements of a Hermitian matrix are real; only their real
*     part is used in the max-norm and Frobenius-norm calculations.
*
* -   The off-diagonal elements are complex; their complex modulus is used.
*
* @param {string} norm - specifies the norm: `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed Hermitian matrix, length >= `N*(N+1)/2`
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Float64Array} WORK - workspace array, length >= `N`
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} norm value
*/
function zlanhp( norm, uplo, N, AP, strideAP, offsetAP, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( norm, uplo, N, AP, strideAP, offsetAP, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlanhp;
