/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Forms the triangular factor T of a block reflector `H = I - V*T*V^T`.
*
* @param {string} direct - direction (`'backward'`)
* @param {string} storev - storage direction (`'rowwise'`)
* @param {NonNegativeInteger} N - order of the block reflector
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Float64Array} V - matrix of reflector vectors
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Float64Array} TAU - array of scalar factors
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} T - output lower triangular matrix
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @throws {TypeError} first argument must be a valid direction
* @throws {TypeError} second argument must be a valid storage direction
* @returns {void}
*/
function dlarzt( direct, storev, N, K, V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT ) {
	if ( direct !== 'backward' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid direction. Value: `%s`.', direct ) );
	}
	if ( storev !== 'rowwise' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid storage direction. Value: `%s`.', storev ) );
	}
	return base( direct, storev, N, K, V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT );
}


// EXPORTS //

export default dlarzt;
