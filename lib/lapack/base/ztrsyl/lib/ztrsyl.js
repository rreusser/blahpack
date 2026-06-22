

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} trana - trana
* @param {string} tranb - tranb
* @param {integer} isgn - isgn
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} C - C
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} scale - scale
* @returns {integer} info status code
*/
function ztrsyl( trana, tranb, isgn, M, N, A, LDA, B, LDB, C, LDC, scale ) { // eslint-disable-line max-len, max-params
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;

	sa1 = 1;
	sa2 = LDA;
	sb1 = 1;
	sb2 = LDB;
	sc1 = 1;
	sc2 = LDC;
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDB ) );
	}
	if ( LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( trana !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `trana` value. Value: `%s`.', trana ) );
	}
	if ( tranb !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `tranb` value. Value: `%s`.', tranb ) );
	}
	return base( trana, tranb, isgn, M, N, A, sa1, sa2, 0, B, sb1, sb2, 0, C, sc1, sc2, 0, scale );
}


// EXPORTS //

export default ztrsyl;
