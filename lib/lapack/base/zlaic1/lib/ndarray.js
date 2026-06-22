
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies one step of incremental condition estimation for complex matrices.
*
* @param {string} job - specifies whether to estimate the largest or smallest singular value (`largest-singular-value` or `smallest-singular-value`)
* @param {NonNegativeInteger} j - length of X and W
* @param {Complex128Array} x - input vector x
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {number} sest - estimated singular value of L
* @param {Complex128Array} w - input vector w
* @param {integer} strideW - stride for `w` (in complex elements)
* @param {NonNegativeInteger} offsetW - starting index for `w` (in complex elements)
* @param {Complex128} gamma - diagonal element gamma
* @param {Float64Array} sestpr - output: `sestpr[0]` receives the updated singular value estimate
* @param {Float64Array} s - output: `s[0]` and `s[1]` receive the real and imaginary parts of sine
* @param {Float64Array} c - output: `c[0]` and `c[1]` receive the real and imaginary parts of cosine
* @throws {TypeError} first argument must be a valid job string
* @returns {void}
*/
function zlaic1( job, j, x, strideX, offsetX, sest, w, strideW, offsetW, gamma, sestpr, s, c ) { // eslint-disable-line max-len, max-params
	if ( job !== 'largest-singular-value' && job !== 'smallest-singular-value' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job string. Value: `%s`.', job ) ); // eslint-disable-line max-len
	}
	return base( job, j, x, strideX, offsetX, sest, w, strideW, offsetW, gamma, sestpr, s, c ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaic1;
