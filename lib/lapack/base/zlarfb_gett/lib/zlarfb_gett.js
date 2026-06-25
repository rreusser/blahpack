
/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a complex Householder block reflector to a triangular-pentagonal matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} ident - specifies the operation type
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} K - number of superdiagonals
* @param {Complex128Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} WORK - output matrix
* @param {PositiveInteger} LDWORK - leading dimension of `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} dimension arguments must be non-negative
* @throws {RangeError} leading dimensions must be sufficiently large
* @returns {Complex128Array} `A`
*/
function zlarfb_gett( order, ident, M, N, K, T, LDT, A, LDA, B, LDB, WORK, LDWORK ) { // eslint-disable-line max-len, max-params
	var swork1;
	var swork2;
	var st1;
	var st2;
	var sa1;
	var sa2;
	var sb1;
	var sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( ident !== 'identity' && ident !== 'not-identity' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be `\'identity\'` or `\'not-identity\'`. Value: `%s`.', ident ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'row-major' && LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' && LDT < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDT ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDB ) );
	}
	if ( order === 'row-major' && LDWORK < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDWORK ) );
	}
	if ( order === 'column-major' && LDWORK < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDWORK ) );
	}
	if ( order === 'column-major' ) {
		st1 = 1;
		st2 = LDT;
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		swork1 = 1;
		swork2 = LDWORK;
	} else {
		st1 = LDT;
		st2 = 1;
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		swork1 = LDWORK;
		swork2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( 1 ); // TODO: set correct size
	}
	return base( ident, M, N, K, T, st1, st2, 0, A, sa1, sa2, 0, B, sb1, sb2, 0, WORK, swork1, swork2, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlarfb_gett;
