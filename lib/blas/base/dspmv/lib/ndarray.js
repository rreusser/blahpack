/**
 * Performs the matrix-vector operation `y = alpha*A*x + beta*y`.
 *
 * `A` is an `N` by `N` symmetric matrix supplied in packed form, `x` and `y`
 * are `N`-element vectors, and `alpha` and `beta` are scalars.
 *
 *
 * @param {string} uplo - specifies whether upper or lower triangle is stored
 * @param {NonNegativeInteger} N - order of the matrix `A`
 * @param {number} alpha - scalar multiplier for `A*x`
 * @param {Float64Array} AP - packed symmetric matrix
 * @param {integer} strideAP - stride length for `AP`
 * @param {NonNegativeInteger} offsetAP - starting index for `AP`
 * @param {Float64Array} x - input vector
 * @param {integer} strideX - stride length for `x`
 * @param {NonNegativeInteger} offsetX - starting index for `x`
 * @param {number} beta - scalar multiplier for `y`
 * @param {Float64Array} y - input/output vector
 * @param {integer} strideY - stride length for `y`
 * @param {NonNegativeInteger} offsetY - starting index for `y`
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {Float64Array} `y`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the matrix-vector operation `y = alpha*A*x + beta*y` where `A` is an.
* `N` by `N` symmetric matrix supplied in packed form, `x` and `y` are
* `N`-element vectors, and `alpha` and `beta` are scalars.
*
* @param {string} uplo - specifies whether upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {number} alpha - scalar constant
* @param {Float64Array} AP - packed symmetric matrix
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} x - input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} beta - scalar constant
* @param {Float64Array} y - output vector
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be non-zero
* @throws {RangeError} twelfth argument must be non-zero
* @returns {Float64Array} `y`
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var AP = new Float64Array( [ 1, 2, 5, 3, 6, 8 ] );
* var x = new Float64Array( [ 1, 1, 1 ] );
* var y = new Float64Array( [ 0, 0, 0 ] );
*
* dspmv( 'upper', 3, 1.0, AP, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
* // y => <Float64Array>[ 6, 13, 17 ]
*/
function dspmv( uplo, N, alpha, AP, strideAP, offsetAP, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( strideY === 0 ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be non-zero. Value: `%d`.', strideY ) );
	}
	if ( N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return y;
	}
	if ( strideAP === 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be non-zero. Value: `%d`.', strideAP ) );
	}
	return base( uplo, N, alpha, AP, strideAP, offsetAP, x, strideX, offsetX, beta, y, strideY, offsetY );
}


// EXPORTS //

export default dspmv;
