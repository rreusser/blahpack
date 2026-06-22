

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * CABS1(z) = |Re(z)| + |Im(z)|.
 *
 *
 * @param {Float64Array} v - interleaved Float64 view
 * @param {integer} idx - Float64 index
 * @returns {number} result
 */
function zlahqr( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, W, strideW, offsetW, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, W, strideW, offsetW, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlahqr;
