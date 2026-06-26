

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* CABS1 = |Re(z)| + |Im(z)|.
*
* @param {Float64Array} v - interleaved view
* @param {integer} idx - Float64 index
* @returns {number} result
*/
function zlaqr1( N, H, strideH1, strideH2, offsetH, s1, s2, v, strideV, offsetV ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, H, strideH1, strideH2, offsetH, s1, s2, v, strideV, offsetV ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaqr1;
