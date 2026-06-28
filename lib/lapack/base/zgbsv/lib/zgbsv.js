
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} kl - kl
* @param {NonNegativeInteger} ku - ku
* @param {NonNegativeInteger} nrhs - nrhs
* @param {Complex128Array} AB - AB
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Int32Array} IPIV - IPIV
* @param {integer} strideIPIV - strideIPIV
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zgbsv( N, kl, ku, nrhs, AB, LDAB, IPIV, strideIPIV, B, LDB ) { // eslint-disable-line max-len, max-params
	var oipiv;
	var sab1;
	var sab2;
	var sb1;
	var sb2;

	sab1 = 1;
	sab2 = LDAB;
	sb1 = 1;
	sb2 = LDB;
	oipiv = stride2offset( N, strideIPIV );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	return base( N, kl, ku, nrhs, AB, sab1, sab2, 0, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0 );
}


// EXPORTS //

export default zgbsv;
