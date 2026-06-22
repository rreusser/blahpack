/**
 * Generates a real elementary reflector H of order N, such that.
 *
 * `H*( alpha ) = ( beta )`,   `H__T*H = I`.
 * (   x   )   (   0  )
 *
 * `H = I - tau*( 1 )*( 1 v**T )`
 * ( v )
 *
 *
 * @param {NonNegativeInteger} N - order of the reflector
 * @param {Float64Array} alpha - scalar, overwritten with beta on exit
 * @param {NonNegativeInteger} offsetAlpha - index into alpha array
 * @param {Float64Array} x - vector, overwritten with v on exit
 * @param {integer} strideX - stride for x
 * @param {NonNegativeInteger} offsetX - starting index for x
 * @param {Float64Array} tau - output scalar
 * @param {NonNegativeInteger} offsetTau - index into tau array
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates a real elementary reflector H of order N, such that.
*
* @param {NonNegativeInteger} N - order of the reflector
* @param {Float64Array} alpha - scalar, overwritten with beta on exit
* @param {NonNegativeInteger} offsetAlpha - index into alpha array
* @param {Float64Array} x - vector, overwritten with v on exit
* @param {integer} strideX - stride for x
* @param {NonNegativeInteger} offsetX - starting index for x
* @param {Float64Array} tau - output scalar
* @param {NonNegativeInteger} offsetTau - index into tau array
* @throws {RangeError} first argument must be a nonnegative integer
*/
function dlarfg( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return;
	}
	return base( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau );
}


// EXPORTS //

export default dlarfg;
