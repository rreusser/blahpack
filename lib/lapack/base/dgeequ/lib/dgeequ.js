

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
* @param {Float64Array} r - r
* @param {integer} strideR - strideR
* @param {Float64Array} c - c
* @param {integer} strideC - strideC
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} result with info, rowcnd, colcnd, amax
*/
function dgeequ( M, N, A, LDA, r, strideR, c, strideC ) { // eslint-disable-line max-len, max-params
	var sa1;
	var sa2;
	var oc;
	var or;

	sa1 = 1;
	sa2 = LDA;
	or = stride2offset( N, strideR );
	oc = stride2offset( N, strideC );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	return base( M, N, A, sa1, sa2, 0, r, strideR, or, c, strideC, oc );
}


// EXPORTS //

export default dgeequ;
