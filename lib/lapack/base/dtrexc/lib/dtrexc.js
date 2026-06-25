
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} compq - compq
* @param {NonNegativeInteger} N - N
* @param {Float64Array} T - T
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} Q - Q
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {integer} ifst - ifst
* @param {integer} ilst - ilst
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @returns {Object} { info, ifst, ilst }
*/
function dtrexc( compq, N, T, LDT, Q, LDQ, ifst, ilst, WORK, strideWORK ) { // eslint-disable-line max-len, max-params
	var owork;
	var sq1;
	var sq2;
	var st1;
	var st2;

	st1 = 1;
	st2 = LDT;
	sq1 = 1;
	sq2 = LDQ;
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
	}
	if ( LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	if ( compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `compq` value. Value: `%s`.', compq ) );
	}
	return base( compq, N, T, st1, st2, 0, Q, sq1, sq2, 0, ifst, ilst, WORK, strideWORK, owork );
}


// EXPORTS //

export default dtrexc;
