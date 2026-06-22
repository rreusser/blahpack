/**
 * Applies a modified Givens plane rotation.
 *
 * The modified Givens rotation matrix `H` is determined by the `param` array.
 * `param[0]` is `DFLAG` which determines the form of `H`:
 *
 * ```text
 * DFLAG=-1:            DFLAG=0:             DFLAG=1:             DFLAG=-2:
 * (DH11  DH12)         (1     DH12)         (DH11  1   )         (1  0)
 * (DH21  DH22)         (DH21  1   )         (-1    DH22)         (0  1)
 * ```
 *
 * `param[1]` = `DH11`, `param[2]` = `DH21`, `param[3]` = `DH12`,
 * `param[4]` = `DH22`.
 *
 *
 * @param {NonNegativeInteger} N - number of indexed elements
 * @param {Float64Array} x - first input array
 * @param {integer} strideX - `x` stride length
 * @param {NonNegativeInteger} offsetX - starting index for `x`
 * @param {Float64Array} y - second input array
 * @param {integer} strideY - `y` stride length
 * @param {NonNegativeInteger} offsetY - starting index for `y`
 * @param {Float64Array} param - parameters for the modified Givens transformation
 * @param {integer} strideParam - `param` stride length
 * @param {NonNegativeInteger} offsetParam - starting index for `param`
 * @returns {Float64Array} `y`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a modified Givens plane rotation.
*
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - first input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} y - second input array
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {Float64Array} param - parameters for the modified Givens transformation
* @param {integer} strideParam - `param` stride length
* @param {NonNegativeInteger} offsetParam - starting index for `param`
* @returns {Float64Array} `y`
*/
function drotm( N, x, strideX, offsetX, y, strideY, offsetY, param, strideParam, offsetParam ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX, y, strideY, offsetY, param, strideParam, offsetParam );
}


// EXPORTS //

export default drotm;
