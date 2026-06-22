/**
 * Generate a complex elementary reflector H of order N, such that.
 *
 * `H^H*( alpha ) = ( beta )`,   `H^H*H = I`.
 * (   x   )   (   0  )
 *
 * where alpha and beta are scalars, with beta real, and x is an
 * (N-1)-element complex vector.
 *
 * H is represented in the form
 *
 * `H = I - tau*( 1 )*( 1 v^H )`
 * ( v )
 *
 *
 * @param {NonNegativeInteger} N - order of the reflector
 * @param {Complex128Array} alpha - complex scalar, overwritten with beta
 * @param {NonNegativeInteger} offsetAlpha - starting index for alpha (in complex elements)
 * @param {Complex128Array} x - complex vector, overwritten with v
 * @param {integer} strideX - stride for x (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
 * @param {Complex128Array} tau - output complex scalar
 * @param {NonNegativeInteger} offsetTau - starting index for tau (in complex elements)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generate a complex elementary reflector H of order N, such that.
*
* @param {NonNegativeInteger} N - order of the reflector
* @param {Complex128Array} alpha - complex scalar, overwritten with beta
* @param {NonNegativeInteger} offsetAlpha - starting index for alpha (in complex elements)
* @param {Complex128Array} x - complex vector, overwritten with v
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @param {Complex128Array} tau - output complex scalar
* @param {NonNegativeInteger} offsetTau - starting index for tau (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
*/
function zlarfg( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return;
	}
	return base( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau );
}


// EXPORTS //

export default zlarfg;
