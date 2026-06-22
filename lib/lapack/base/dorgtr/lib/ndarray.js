/**
 * Generates an orthogonal matrix Q which is defined as the product of N-1.
 * elementary reflectors of order N, as returned by DSYTRD.
 *
 * ## Notes
 *
 * -   If UPLO = 'U', Q is defined as a product of reflectors:
 * `Q = H(n-1)*...*H(2) * H(1)`
 *
 * -   If UPLO = 'L', Q is defined as a product of reflectors:
 * `Q = H(1)*H(2)*... * H(n-1)`
 *
 *
 * @param {string} uplo - specifies whether the upper or lower triangle was used in DSYTRD (`'upper'` or `'lower'`)
 * @param {NonNegativeInteger} N - order of the matrix Q
 * @param {Float64Array} A - on entry, contains the reflectors from DSYTRD; on exit, the orthogonal matrix Q
 * @param {integer} strideA1 - stride of the first dimension of `A`
 * @param {integer} strideA2 - stride of the second dimension of `A`
 * @param {NonNegativeInteger} offsetA - starting index for `A`
 * @param {Float64Array} TAU - scalar factors of the reflectors from DSYTRD (length N-1)
 * @param {integer} strideTAU - stride length for `TAU`
 * @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
 * @param {Float64Array} WORK - workspace array
 * @param {integer} strideWORK - stride length for `WORK`
 * @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} status code (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates an orthogonal matrix Q which is defined as the product of N-1.
*
* @param {string} uplo - specifies whether the upper or lower triangle was used in DSYTRD (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix Q
* @param {Float64Array} A - on entry, contains the reflectors from DSYTRD; on exit, the orthogonal matrix Q
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} TAU - scalar factors of the reflectors from DSYTRD (length N-1)
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dorgtr( uplo, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base(uplo, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default dorgtr;
