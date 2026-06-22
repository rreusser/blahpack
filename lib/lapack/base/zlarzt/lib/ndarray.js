/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Forms the triangular factor T of a complex block reflector.
*
* @param {string} direct - direction of reflector application (`'backward'`)
* @param {string} storev - storage of reflector vectors (`'rowwise'`)
* @param {NonNegativeInteger} N - order of the block reflector
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Complex128Array} V - matrix of reflector vectors
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Complex128Array} TAU - array of scalar factors
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Complex128Array} T - output triangular matrix
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @throws {TypeError} first argument must be a valid direction
* @throws {TypeError} second argument must be a valid storage direction
* @returns {void}
*/
function zlarzt( direct, storev, N, K, V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT ) {
	if ( direct !== 'backward' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid direction. Value: `%s`.', direct ) );
	}
	if ( storev !== 'rowwise' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid storage direction. Value: `%s`.', storev ) );
	}
	if ( N === 0 ) {
		return;
	}
	return base( direct, storev, N, K, V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT );
}


// EXPORTS //

export default zlarzt;
