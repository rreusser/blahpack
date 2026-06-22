
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} N - N
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} JPVT - JPVT
* @param {integer} strideJPVT - strideJPVT
* @param {Float64Array} TAU - TAU
* @param {integer} strideTAU - strideTAU
* @returns {integer} info status code
*/
function dgeqp3( M, N, A, LDA, JPVT, strideJPVT, TAU, strideTAU ) { // eslint-disable-line max-len, max-params
	var ojpvt;
	var otau;
	var sa1;
	var sa2;

	sa1 = 1;
	sa2 = LDA;
	ojpvt = stride2offset( N, strideJPVT );
	otau = stride2offset( N, strideTAU );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	return base( M, N, A, sa1, sa2, 0, JPVT, strideJPVT, ojpvt, TAU, strideTAU, otau );
}


// EXPORTS //

export default dgeqp3;
